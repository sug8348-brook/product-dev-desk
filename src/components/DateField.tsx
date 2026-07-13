type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
};

function toDateInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export function DateField({ value, onChange, ariaLabel, className }: DateFieldProps) {
  return (
    <input
      type="date"
      className={className}
      value={toDateInputValue(value)}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
    />
  );
}
