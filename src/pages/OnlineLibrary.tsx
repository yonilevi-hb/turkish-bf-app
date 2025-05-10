
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Book, BookOpen, Plus, Download, List } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  getVocabularyCategories, 
  getWordsByCategory, 
  searchVocabulary,
  importVocabularyToDeck,
  VocabularyCategory,
  VocabularyWord
} from "@/services/vocabularyService";

export default function OnlineLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("categories");
  
  // Fetch categories with React Query
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryKey: ['vocabularyCategories'],
    queryFn: getVocabularyCategories
  });
  
  // Fetch category words with React Query
  const { 
    data: categoryWords = [], 
    isLoading: isWordsLoading,
  } = useQuery({
    queryKey: ['categoryWords', selectedCategory],
    queryFn: () => selectedCategory ? getWordsByCategory(selectedCategory) : Promise.resolve([]),
    enabled: !!selectedCategory
  });
  
  // Fetch search results with React Query
  const { 
    data: searchResults = [], 
    isLoading: isSearching,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['searchVocabulary', searchQuery],
    queryFn: () => searchVocabulary(searchQuery),
    enabled: false // Don't auto-fetch, we'll trigger manually
  });
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 2) {
        refetchSearch();
        setActiveTab("search");
      }
    }, 600);
    
    return () => clearTimeout(timer);
  }, [searchQuery, refetchSearch]);
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab("words");
  };
  
  const handleWordSelect = (wordId: string) => {
    setSelectedWords(prev => {
      const updated = new Set(prev);
      if (updated.has(wordId)) {
        updated.delete(wordId);
      } else {
        updated.add(wordId);
      }
      return updated;
    });
  };
  
  const handleImportToDeck = async () => {
    const wordsToAdd = [...selectedWords].map(id => {
      const foundInCategory = categoryWords.find(w => w.id === id);
      const foundInSearch = searchResults.find(w => w.id === id);
      return foundInCategory || foundInSearch;
    }).filter(Boolean) as VocabularyWord[];
    
    if (wordsToAdd.length > 0) {
      // In a real implementation, you would save these to your deck 
      // For now, we'll just save them to localStorage and return to the main app
      const existingData = localStorage.getItem('importedVocabulary');
      const existingWords = existingData ? JSON.parse(existingData) : [];
      
      localStorage.setItem('importedVocabulary', JSON.stringify([...existingWords, ...wordsToAdd]));
      
      toast.success(`Added ${wordsToAdd.length} words to your collection!`);
      setSelectedWords(new Set());
      
      setTimeout(() => navigate('/'), 1500);
    } else {
      toast.info("Please select words to add to your collection");
    }
  };
  
  const handleDirectImport = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast.info("Please enter a word to import");
      return;
    }
    
    toast.loading("Importing word...");
    
    const importedWord = await importVocabularyToDeck(searchQuery);
    
    if (importedWord) {
      const existingData = localStorage.getItem('importedVocabulary');
      const existingWords = existingData ? JSON.parse(existingData) : [];
      
      localStorage.setItem('importedVocabulary', JSON.stringify([...existingWords, importedWord]));
      
      toast.success(`Successfully imported "${importedWord.word}" to your collection!`);
      setSearchQuery("");
    } else {
      toast.error("Could not find that word. Please try another.");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center gap-6 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white p-4 font-['Inter']">
      <header className="flex flex-col items-center gap-4 w-full max-w-4xl pt-2">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
          >
            <span className="text-2xl md:text-3xl font-bold text-white">T</span>
          </motion.div>
          <motion.h1 
            className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            Online Library
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-md">
          <Button variant="outline" onClick={() => navigate('/')}>
            <List className="h-4 w-4 mr-2" />
            Back to App
          </Button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={handleDirectImport} disabled={!searchQuery || searchQuery.length < 2}>
            <Plus className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </header>
      
      <main className="w-full max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">
              <BookOpen className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="words" disabled={!selectedCategory}>
              <Book className="h-4 w-4 mr-2" />
              Words
            </TabsTrigger>
            <TabsTrigger value="search" disabled={searchResults.length === 0}>
              <Search className="h-4 w-4 mr-2" />
              Search Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4">
            {isCategoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col">
                      <CardHeader>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                          Contains approximately {category.wordCount} words
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          Browse Words
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="words">
            {isWordsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-1/2 mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    {selectedCategory && categories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  
                  <Button 
                    disabled={selectedWords.size === 0}
                    onClick={handleImportToDeck}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Import Selected ({selectedWords.size})
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryWords.length === 0 ? (
                    <Card className="col-span-full p-6 text-center">
                      <p className="text-muted-foreground mb-2">No words available for this category at the moment.</p>
                      <p className="text-sm">Please try another category or check back later.</p>
                    </Card>
                  ) : (
                    categoryWords.map((word) => (
                      <Card
                        key={word.id}
                        className={`cursor-pointer transition-all ${
                          selectedWords.has(word.id) 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleWordSelect(word.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center">
                            <span>{word.word}</span>
                            {selectedWords.has(word.id) && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            )}
                          </CardTitle>
                          <CardDescription className="text-lg font-medium">
                            {word.translation}
                          </CardDescription>
                        </CardHeader>
                        {word.examples && word.examples.length > 0 && (
                          <CardContent>
                            <p className="text-sm italic text-muted-foreground">
                              "{word.examples[0]}"
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="search">
            {isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-1/2 mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    Search Results
                  </h3>
                  
                  <Button 
                    disabled={selectedWords.size === 0}
                    onClick={handleImportToDeck}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Import Selected ({selectedWords.size})
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.length === 0 ? (
                    <Card className="col-span-full p-6 text-center">
                      <p className="text-muted-foreground mb-2">No results found for "{searchQuery}"</p>
                      <p className="text-sm">Try a different search term or browse the categories.</p>
                    </Card>
                  ) : (
                    searchResults.map((word) => (
                      <Card
                        key={word.id}
                        className={`cursor-pointer transition-all ${
                          selectedWords.has(word.id) 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleWordSelect(word.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center">
                            <span>{word.word}</span>
                            {selectedWords.has(word.id) && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            )}
                          </CardTitle>
                          <CardDescription className="text-lg font-medium">
                            {word.translation}
                          </CardDescription>
                        </CardHeader>
                        {word.examples && word.examples.length > 0 && (
                          <CardContent>
                            <p className="text-sm italic text-muted-foreground">
                              "{word.examples[0]}"
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
