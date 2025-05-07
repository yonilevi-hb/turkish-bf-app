
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
    const savedFavorites = localStorage.getItem('turkishBFAppFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('turkishBFAppFavorites', JSON.stringify(favoritedCardIds));
  }, [favoritedCardIds]);

  const isFavorite = (id: string): boolean => {
    return favoritedCardIds.includes(id);
  };

  const toggleFavorite = (id: string): void => {
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
