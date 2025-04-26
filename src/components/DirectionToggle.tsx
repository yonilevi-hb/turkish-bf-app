
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
          className={`px-4 py-2 rounded-md text-base transition ${
            mode === b.id
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
