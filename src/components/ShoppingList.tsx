import React, { useState } from "react";
import { ShoppingItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

interface ShoppingListProps {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
}

export function ShoppingList({ items, setItems }: ShoppingListProps) {
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setItems(prev => [
        ...prev,
        { id: crypto.randomUUID(), name: newItemName.trim(), checked: false }
      ]);
      setNewItemName("");
    }
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setItems(prev => prev.filter(item => !item.checked));
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">Shopping List</CardTitle>
        {items.some(i => i.checked) && (
          <Button variant="ghost" size="sm" onClick={clearChecked} className="text-muted-foreground hover:text-destructive">
            Clear Checked
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="Add a new item..." 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            className="flex-grow"
          />
          <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Your shopping list is empty.</p>
            <p className="text-sm">Add items manually or from recipe suggestions.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <li 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${item.checked ? 'bg-muted/50' : 'bg-card border'}`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={`item-${item.id}`} 
                    checked={item.checked} 
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <label 
                    htmlFor={`item-${item.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.name}
                  </label>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


