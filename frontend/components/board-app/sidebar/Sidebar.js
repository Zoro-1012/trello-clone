"use client";

import clsx from "clsx";
import { LayoutPanelLeft, Plus, Users } from "lucide-react";

export default function Sidebar({
  boards,
  teams,
  activeTeam,
  teamMembers,
  board,
  newBoardTitle,
  onNewBoardTitleChange,
  onCreateBoard,
  onBoardSwitch,
  onTeamSwitch,
  onAddMember,
  onOpenMemberPanel
}) {
  return (
    <aside className="board-sidebar">
      <div className="sidebar-top">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>TaskOrbit</h1>
          <p className="sidebar-copy">A Trello-inspired planning board for product teams.</p>
        </div>
      </div>

      <section className="sidebar-section">
        <div className="sidebar-section-header">
          <LayoutPanelLeft size={16} />
          <span>Boards</span>
        </div>
        <div className="board-list">
          {boards.map((entry) => (
            <button
              key={entry.id}
              className={clsx("board-nav-item", entry.id === board.id && "active")}
              onClick={() => onBoardSwitch(entry.id)}
            >
              {entry.title}
            </button>
          ))}
        </div>
        <div className="new-board-form">
          <input
            value={newBoardTitle}
            onChange={(event) => onNewBoardTitleChange(event.target.value)}
            placeholder="Create board"
          />
          <button onClick={onCreateBoard}>Add</button>
        </div>
      </section>

      <section className="sidebar-section">
        <div className="sidebar-section-header">
          <Users size={16} />
          <span>Teams</span>
        </div>
        <div className="board-list">
          {teams.map((team) => (
            <button
              key={team.id}
              className={clsx("board-nav-item", team.id === activeTeam?.id && "active")}
              onClick={() => onTeamSwitch(team.id)}
            >
              {team.name}
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <div className="sidebar-section-header">
          <Users size={16} />
          <span>{activeTeam ? `${activeTeam.name} Members` : "Team Members"}</span>
          <button className="mini-action" onClick={onAddMember}>
            <Plus size={14} />
          </button>
          <button className="mini-action" onClick={onOpenMemberPanel}>
            Edit
          </button>
        </div>
        <div className="member-stack">
          {teamMembers.map((member) => (
            <div key={member.id} className="member-pill">
              <span style={{ backgroundColor: member.color }}>{member.initials}</span>
              {member.name}
            </div>
          ))}
          {!teamMembers.length ? <div className="empty-text">No members in this team yet.</div> : null}
        </div>
      </section>
    </aside>
  );
}
