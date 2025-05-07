
import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Star, Search } from "lucide-react";

interface Card {
  id: string;
  word: string;
  translation: string;
  category?: string;
  isFavorite?: boolean;
}

interface VocabularyListProps {
  cards: Card[];
  onToggleFavorite?: (cardId: string) => void;
}

export function VocabularyList({ cards, onToggleFavorite }: VocabularyListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  
  const filteredCards = cards.filter(card => {
    // Apply search filter
    const matchesSearch = searchTerm === "" || 
      card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.translation.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply favorites filter
    const matchesFavorites = filter === "all" || (filter === "favorites" && card.isFavorite);
    
    return matchesSearch && matchesFavorites;
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-eggwhite/5 rounded-xl backdrop-blur-sm border border-eggwhite/10 p-6">
      <h2 className="text-2xl font-bold text-bordeaux mb-6">Vocabulary List</h2>
      
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-9 pr-4"
            placeholder="Search words or translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <ToggleGroup type="single" value={filter} onValueChange={(value) => {
          if (value) setFilter(value as "all" | "favorites");
        }}>
          <ToggleGroupItem value="all" aria-label="Show all cards">All</ToggleGroupItem>
          <ToggleGroupItem value="favorites" aria-label="Show favorites">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-3">
        Showing {filteredCards.length} of {cards.length} cards
      </p>
      
      {/* Table with cards */}
      <div className="overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-bordeaux/70">Turkish</TableHead>
              <TableHead className="text-bordeaux/70">English</TableHead>
              {onToggleFavorite && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="text-bordeaux font-medium">{card.word}</TableCell>
                  <TableCell className="text-bordeaux/80">{card.translation}</TableCell>
                  {onToggleFavorite && (
                    <TableCell>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={() => onToggleFavorite(card.id)}
                        className="h-8 w-8"
                      >
                        <Star
                          size={18}
                          className={card.isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                          }
                        />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={onToggleFavorite ? 3 : 2} className="text-center py-8 text-muted-foreground">
                  No cards found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
