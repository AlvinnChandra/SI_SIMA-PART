const HEADING = "#101828";
const BODY = "#f3f4f6";
const ACCENT = "#EE4D2D";

export default function CheckboxFilter({ title, options = [], selected = [], onChange }) {
  const toggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold" style={{ color: HEADING }}>
        {title}
      </p>
      <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-sm"
            style={{ color: BODY }}
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              className="h-3.5 w-3.5 rounded"
              style={{ accentColor: ACCENT }}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}