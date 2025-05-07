
import { useState, useEffect } from 'react';

export interface FavoritesState {
  favoritedCardIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
}

export function useFavorites(): FavoritesState {
  // Initialize state from localStorage if available
  const [favoritedCardIds, setFavoritedCardIds] = useState<string[]>(() => {
    try {
      const savedFavorites = localStorage.getItem('turkishBFAppFavorites');
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
      return [];
    }
  });

  // Save to localStorage whenever favorites change - with better error handling
  useEffect(() => {
    try {
      localStorage.setItem('turkishBFAppFavorites', JSON.stringify(favoritedCardIds));
      console.log("Favorites saved:", favoritedCardIds);
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favoritedCardIds]);

  const isFavorite = (id: string): boolean => {
    return favoritedCardIds.includes(id);
  };

  const toggleFavorite = (id: string): void => {
    console.log(`Toggling favorite for card ${id}, currently ${isFavorite(id) ? 'favorited' : 'not favorited'}`);
    setFavoritedCardIds(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    );
  };

  const addFavorite = (id: string): void => {
    if (!favoritedCardIds.includes(id)) {
      setFavoritedCardIds(prev => [...prev, id]);
    }
  };

  const removeFavorite = (id: string): void => {
    setFavoritedCardIds(prev => prev.filter(cardId => cardId !== id));
  };

  return {
    favoritedCardIds,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite
  };
}
