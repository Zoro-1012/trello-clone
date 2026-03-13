"use client";

import { Search, UserRound } from "lucide-react";

export default function Topbar({
  filters,
  onSearchChange,
  profileMember,
  onProfileOpen
}) {
  return (
    <div className="page-topbar">
      <div className="topbar-brand">
        <div className="topbar-logo" aria-hidden="true">
          <span />
          <span />
        </div>
        <span>Trello</span>
      </div>
      <div className="topbar-search-wrap">
        <div className="search-input page-search-input">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search cards"
          />
        </div>
      </div>
      <button className="profile-button page-profile-button" onClick={onProfileOpen}>
        <span style={{ backgroundColor: profileMember.color }}>{profileMember.initials}</span>
        <UserRound size={16} />
      </button>
    </div>
  );
}
