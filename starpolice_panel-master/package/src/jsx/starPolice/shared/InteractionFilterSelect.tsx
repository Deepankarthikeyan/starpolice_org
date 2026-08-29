type InteractionFilterSelectOption = {
  value: string;
  label: string;
};

type InteractionFilterSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: InteractionFilterSelectOption[];
  className?: string;
  size?: "sm" | "md";
};

export function InteractionFilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  className = "",
  size = "md",
}: InteractionFilterSelectProps) {
  return (
    <div className={`spa-interaction-filter-field ${className}`.trim()}>
      <label className="form-label small text-muted mb-1" htmlFor={id}>
        {label}
      </label>
      <div className="spa-interaction-filter-select">
        <select
          id={id}
          className={`form-control spa-interaction-filter-select-input${size === "sm" ? " form-control-sm" : ""}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value || "__all__"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="spa-interaction-filter-select-icon" aria-hidden="true">
          <i className="fa fa-chevron-down" />
        </span>
      </div>
    </div>
  );
}
