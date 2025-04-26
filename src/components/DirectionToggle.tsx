
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
          className={`px-6 py-2 rounded-full text-base transition backdrop-blur-sm ${
            mode === b.id
              ? 'bg-indigo-600/90 text-white shadow-lg ring-2 ring-indigo-400/30'
              : 'text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
