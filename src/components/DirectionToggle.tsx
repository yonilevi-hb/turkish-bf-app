
interface DirectionToggleProps {
  mode: string;
  setMode: (mode: string) => void;
}

export function DirectionToggle({ mode, setMode }: DirectionToggleProps) {
  const btns = [
    { id: 'he_en', label: '🇮🇱→🇺🇸' },
    { id: 'en_he', label: '🇺🇸→🇮🇱' },
    { id: 'random', label: '🔀' }
  ];

  return (
    <div className="flex gap-3">
      {btns.map(b => (
        <button
          key={b.id}
          onClick={() => setMode(b.id)}
          title={b.label}
          className={`px-4 py-2 rounded-md text-base transition backdrop-blur-sm ${
            mode === b.id
              ? 'bg-bordeaux/80 text-eggwhite shadow-lg'
              : 'text-bordeaux hover:bg-bordeaux/10 border border-bordeaux/10'
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
