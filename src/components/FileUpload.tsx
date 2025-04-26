
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedCard {
  word: string;
  translation: string;
}

interface FileUploadProps {
  onCardsAdd: (cards: UploadedCard[]) => void;
}

export function FileUpload({ onCardsAdd }: FileUploadProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const newCards: UploadedCard[] = rows
          .filter(row => row.trim())
          .map(row => {
            const [word, translation] = row.split('\t');
            return { word: word.trim(), translation: translation.trim() };
          })
          .filter(card => card.word && card.translation);

        if (newCards.length > 0) {
          onCardsAdd(newCards);
          toast.success(`Successfully added ${newCards.length} cards`);
        } else {
          toast.error("No valid cards found in file");
        }
      } catch (error) {
        toast.error("Error processing file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".txt,.tsv"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <Button
        onClick={() => document.getElementById('file-upload')?.click()}
        className="bg-bordeaux/80 hover:bg-bordeaux text-eggwhite"
      >
        Upload Vocabulary
      </Button>
    </div>
  );
}
