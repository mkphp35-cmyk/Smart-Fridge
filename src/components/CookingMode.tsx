import React, { useState, useEffect } from "react";
import { Recipe } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CookingModeProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (recipe) {
      setCurrentStep(0);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [recipe]);

  if (!recipe) return null;

  const handleNext = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = recipe.steps[currentStep];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
    <Dialog open={!!recipe} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
          <DialogDescription>Step {currentStep + 1} of {recipe.steps.length}</DialogDescription>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </DialogHeader>

        <div className="flex-grow relative overflow-hidden flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center max-w-2xl"
            >
              <p className="text-4xl md:text-5xl font-medium leading-tight text-foreground">
                {recipe.steps[currentStep]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t bg-muted/10 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="w-32"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <Button 
            variant={isSpeaking ? "secondary" : "default"}
            size="icon" 
            className="w-16 h-16 rounded-full shadow-lg"
            onClick={toggleSpeech}
          >
            {isSpeaking ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </Button>

          {currentStep < recipe.steps.length - 1 ? (
            <Button 
              size="lg" 
              onClick={handleNext}
              className="w-32"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={onClose}
              className="w-32 bg-green-600 hover:bg-green-700 text-white"
            >
              Finish
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
