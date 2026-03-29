import React from "react";
import { Recipe } from "../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Flame, ChefHat, ShoppingCart, Play } from "lucide-react";
import { motion } from "motion/react";

interface RecipeCardProps {
  key?: React.Key;
  recipe: Recipe;
  onCookNow: (recipe: Recipe) => void;
  onAddMissingToShoppingList: (ingredients: string[]) => void;
}

export function RecipeCard({ recipe, onCookNow, onAddMissingToShoppingList }: RecipeCardProps) {
  const missingIngredients = recipe.ingredients_needed.filter(i => !i.have).map(i => i.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-bold leading-tight">{recipe.title}</CardTitle>
            <Badge variant={recipe.difficulty === "Easy" ? "default" : recipe.difficulty === "Medium" ? "secondary" : "destructive"}>
              {recipe.difficulty}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.dietary_tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.prep_time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>{recipe.calories} kcal</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> Ingredients
            </h4>
            <ul className="text-sm space-y-1">
              {recipe.ingredients_needed.map((ing, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span className={ing.have ? "text-foreground" : "text-muted-foreground line-through"}>
                    {ing.name}
                  </span>
                  {!ing.have && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Missing</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-4 border-t bg-muted/20">
          {missingIngredients.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full text-xs flex items-center gap-2"
              onClick={() => onAddMissingToShoppingList(missingIngredients)}
            >
              <ShoppingCart className="w-4 h-4" />
              Add Missing to List ({missingIngredients.length})
            </Button>
          )}
          <Button 
            className="w-full flex items-center gap-2"
            onClick={() => onCookNow(recipe)}
          >
            <Play className="w-4 h-4" />
            Cook Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
