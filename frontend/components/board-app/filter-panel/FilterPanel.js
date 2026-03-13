"use client";

import clsx from "clsx";
import { Filter } from "lucide-react";

export default function FilterPanel({
  members,
  labels,
  filters,
  onToggleLabel,
  onToggleMember,
  onDueChange,
  onShowArchivedChange
}) {
  return (
    <section className="filters-panel">
      <div className="filter-title">
        <Filter size={16} />
        <span>Search & Filter</span>
      </div>
      <div className="filter-grid">
        <div>
          <p>Labels</p>
          <div className="chip-row">
            {labels.map((label) => (
              <button
                key={label.id}
                className={clsx("filter-chip", filters.labelIds.includes(label.id) && "active")}
                onClick={() => onToggleLabel(label.id)}
              >
                <span className="chip-dot" style={{ backgroundColor: label.color }} />
                {label.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p>Members</p>
          <div className="chip-row">
            {members.map((member) => (
              <button
                key={member.id}
                className={clsx("filter-chip", filters.memberIds.includes(member.id) && "active")}
                onClick={() => onToggleMember(member.id)}
              >
                {member.initials}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p>Due Date</p>
          <select value={filters.due} onChange={(event) => onDueChange(event.target.value)}>
            <option value="all">All cards</option>
            <option value="today">Due today</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
            <option value="none">No due date</option>
          </select>
        </div>

        <label className="archive-toggle">
          <input
            type="checkbox"
            checked={filters.showArchived}
            onChange={(event) => onShowArchivedChange(event.target.checked)}
          />
          Show archived cards
        </label>
      </div>
    </section>
  );
}
