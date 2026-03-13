"use client";

import { Paintbrush, X } from "lucide-react";

export default function ThemePanel({
  boardThemes,
  customBackground,
  onCustomBackgroundChange,
  onApplyTheme,
  onApplyCustomColor,
  onClose
}) {
  return (
    <section className="filters-panel theme-panel">
      <div className="filter-title">
        <Paintbrush size={16} />
        <span>Board Background</span>
        <button className="mini-action" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div className="theme-grid">
        {boardThemes.map((theme) => (
          <button
            key={theme.id}
            className="theme-card"
            style={{ backgroundImage: theme.preview }}
            onClick={() => onApplyTheme(theme.background)}
          >
            <span>{theme.name}</span>
          </button>
        ))}
      </div>
      <div className="custom-theme-row">
        <label className="color-input-wrap">
          <span>Custom color</span>
          <input
            type="color"
            value={customBackground}
            onChange={(event) => onCustomBackgroundChange(event.target.value)}
          />
        </label>
        <button className="secondary-action" onClick={onApplyCustomColor}>
          Apply color
        </button>
      </div>
    </section>
  );
}
