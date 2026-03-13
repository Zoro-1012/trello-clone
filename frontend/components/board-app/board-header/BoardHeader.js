"use client";

import clsx from "clsx";
import { ChevronDown, Filter, Paintbrush } from "lucide-react";

export default function BoardHeader({
  board,
  filterPanelOpen,
  onToggleThemePanel,
  onToggleFilterPanel,
  onResetFilters
}) {
  return (
    <header className="board-header">
      <div>
        <p className="eyebrow">Board Overview</p>
        <h2>{board.title}</h2>
      </div>
      <div className="header-actions">
        <button className="secondary-action" onClick={onToggleThemePanel}>
          <Paintbrush size={15} />
          Background
        </button>
        <button className="secondary-action" onClick={onToggleFilterPanel}>
          <Filter size={15} />
          Filters
          <ChevronDown size={15} className={clsx("dropdown-icon", filterPanelOpen && "open")} />
        </button>
        <button className="secondary-action" onClick={onResetFilters}>
          Reset filters
        </button>
      </div>
    </header>
  );
}
