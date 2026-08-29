import { useRef, useState } from "react";
import { AnchoredDropdownMenu } from "../admin/AnchoredDropdownMenu";

export type InteractionSortPickerOption = {
  key: string;
  dir: "asc" | "desc";
  label: string;
};

type InteractionSortPickerProps = {
  options: InteractionSortPickerOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

function optionValue(option: InteractionSortPickerOption) {
  return `${option.key}:${option.dir}`;
}

export function InteractionSortPicker({
  options,
  value,
  onChange,
  ariaLabel = "Sort messages",
}: InteractionSortPickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => optionValue(option) === value) ?? options[0];

  const handleSelect = (option: InteractionSortPickerOption) => {
    onChange(optionValue(option));
    setOpen(false);
  };

  return (
    <div className="spa-interaction-sort-picker">
      <button
        ref={triggerRef}
        type="button"
        className={`spa-interaction-sort-trigger ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="spa-interaction-sort-trigger-icon" aria-hidden="true">
          <i className="fa fa-arrow-down-wide-short" />
        </span>
        <span className="spa-interaction-sort-trigger-text">
          <span className="spa-interaction-sort-trigger-label">Sort by</span>
          <span className="spa-interaction-sort-trigger-value">{selected.label}</span>
        </span>
        <span className="spa-interaction-sort-trigger-chevron" aria-hidden="true">
          <i className={`fa fa-angle-${open ? "up" : "down"}`} />
        </span>
      </button>

      <AnchoredDropdownMenu
        open={open}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        className="spa-interaction-sort-menu"
        ariaLabel={ariaLabel}
        minWidth={280}
      >
        {options.map((option) => {
          const isActive = optionValue(option) === value;
          return (
            <button
              key={optionValue(option)}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`spa-interaction-sort-option ${isActive ? "is-active" : ""}`}
              onClick={() => handleSelect(option)}
            >
              <span className="spa-interaction-sort-option-icon">
                <i className="fa fa-sort" aria-hidden="true" />
              </span>
              <span className="spa-interaction-sort-option-body">
                <span className="spa-interaction-sort-option-label">{option.label}</span>
              </span>
              {isActive && (
                <span className="spa-interaction-sort-option-check" aria-hidden="true">
                  <i className="fa fa-check" />
                </span>
              )}
            </button>
          );
        })}
      </AnchoredDropdownMenu>
    </div>
  );
}
