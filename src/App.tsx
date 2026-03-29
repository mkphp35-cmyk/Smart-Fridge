import React, { useState, useRef } from "react";
import { Camera, Upload, ChefHat, ListTodo, Search, Filter, Loader2 } from "lucide-react";
import { DietaryRestriction, Recipe, ShoppingItem } from "./types";
import { analyzeFridge } from "./services/geminiService";
import { RecipeCard } from "./components/RecipeCard";
import { CookingMode } from "./components/CookingMode";
import { ShoppingList } from "./components/ShoppingList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const DIETARY_OPTIONS: DietaryRestriction[] = [
  "Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Nut-Free"
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fridgeImage, setFridgeImage] = useState<string | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<DietaryRestriction[]>([]);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setFridgeImage(base64String);
      
      // Extract base64 data and mime type
      const mimeType = file.type;
      const base64Data = base64String.split(",")[1];

      setIsAnalyzing(true);
      try {
        const { ingredients, recipes: newRecipes } = await analyzeFridge(base64Data, mimeType, selectedDietary);
        setIdentifiedIngredients(ingredients);
        setRecipes(newRecipes);
        toast.success("Fridge analyzed successfully!");
      } catch (error) {
        toast.error("Failed to analyze fridge. Please try again.");
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleDietary = (option: DietaryRestriction) => {
    setSelectedDietary(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleAddMissingToShoppingList = (ingredients: string[]) => {
    setShoppingItems(prev => {
      const newItems = ingredients
        .filter(ing => !prev.some(p => p.name.toLowerCase() === ing.toLowerCase()))
        .map(ing => ({ id: crypto.randomUUID(), name: ing, checked: false }));
      
      if (newItems.length > 0) {
        toast.success(`Added ${newItems.length} items to shopping list!`);
        return [...prev, ...newItems];
      } else {
        toast.info("Items are already in your shopping list.");
        return prev;
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row">
      <Toaster position="top-center" />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
            <ChefHat className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Smart Fridge</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col w-full">
          <div className="px-4 pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <Search className="w-4 h-4" /> Home
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2 relative">
                <ListTodo className="w-4 h-4" /> List
                {shoppingItems.filter(i => !i.checked).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <Separator />

          <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
              <Filter className="w-4 h-4" /> Dietary Filters
            </div>
            <div className="space-y-3">
              {DIETARY_OPTIONS.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option} 
                    checked={selectedDietary.includes(option)}
                    onCheckedChange={() => toggleDietary(option)}
                  />
                  <Label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Filters are applied when analyzing your fridge photo.
            </p>
          </div>
        </Tabs>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto h-screen bg-muted/30">
        {activeTab === "home" ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Upload Section */}
            <Card className="border-dashed border-2 bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                
                {fridgeImage ? (
                  <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden mb-6 shadow-md">
                    <img src={fridgeImage} alt="Fridge contents" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" /> Retake Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <Camera className="w-10 h-10" />
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2">What's in your fridge?</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Snap a photo of your open fridge and let our AI suggest delicious recipes based on what you already have.
                </p>

                <Button 
                  size="lg" 
                  className="rounded-full px-8 shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Ingredients...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      {fridgeImage ? "Analyze New Photo" : "Upload Fridge Photo"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {identifiedIngredients.length > 0 && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" /> Identified Ingredients
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {identifiedIngredients.map((ing, i) => (
                        <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <ChefHat className="w-6 h-6 text-primary" /> Suggested Recipes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recipes.map(recipe => (
                        <RecipeCard 
                          key={recipe.id} 
                          recipe={recipe} 
                          onCookNow={setCookingRecipe}
                          onAddMissingToShoppingList={handleAddMissingToShoppingList}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <ShoppingList items={shoppingItems} setItems={setShoppingItems} />
        )}
      </main>

      {/* Cooking Mode Modal */}
      {cookingRecipe && (
        <CookingMode 
          recipe={cookingRecipe} 
          onClose={() => setCookingRecipe(null)} 
        />
      )}
    </div>
  );
}
