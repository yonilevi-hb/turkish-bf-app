
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { initialCards } from "@/data/cards";

export function VocabularyList() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Vocabulary List</h2>
      <div className="overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-indigo-200">Hebrew</TableHead>
              <TableHead className="text-indigo-200">English</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="text-white font-medium">{card.word}</TableCell>
                <TableCell className="text-gray-300">{card.translation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
