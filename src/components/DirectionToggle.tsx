
import React from 'react';

interface DirectionToggleProps {
  mode: string;
  setMode: (mode: string) => void;
}

export function DirectionToggle({ mode, setMode }: DirectionToggleProps) {
  const btns = [
    { id: 'tr_en', label: '🇹🇷→🇬🇧' },
    { id: 'en_tr', label: '🇬🇧→🇹🇷' },
    { id: 'random', label: '🔀' }
  ];

  return (
    <div className="flex gap-4">
      {btns.map(b => (
        <button
          key={b.id}
          onClick={() => setMode(b.id)}
          title={b.label}
          className={`px-8 py-3 rounded-full text-xl transition backdrop-blur-sm hover:scale-105 ${
            mode === b.id
              ? 'bg-bordeaux text-white shadow-lg ring-2 ring-white/30'
              : 'text-bordeaux hover:bg-bordeaux/10 border-2 border-bordeaux/30'
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
