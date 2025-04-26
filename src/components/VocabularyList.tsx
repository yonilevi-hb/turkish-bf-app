
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Card {
  id: string;
  word: string;
  translation: string;
}

interface VocabularyListProps {
  cards: Card[];
}

export function VocabularyList({ cards }: VocabularyListProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-eggwhite/5 rounded-xl backdrop-blur-sm border border-eggwhite/10 p-6">
      <h2 className="text-2xl font-bold text-bordeaux mb-6">Vocabulary List</h2>
      <div className="overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-bordeaux/70">Hebrew</TableHead>
              <TableHead className="text-bordeaux/70">English</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="text-bordeaux font-medium">{card.word}</TableCell>
                <TableCell className="text-bordeaux/80">{card.translation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
