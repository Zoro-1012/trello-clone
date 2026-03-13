"use client";

import Modal from "../modal/Modal";

export default function ProfilePanel({
  open,
  profileMember,
  state,
  board,
  onUpdateProfileName,
  onClose
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="profile-panel">
        <span className="profile-panel-avatar" style={{ backgroundColor: profileMember.color }}>
          {profileMember.initials}
        </span>
        <h3 className="panel-title">{profileMember.name}</h3>
        <p className="profile-copy">Default logged-in member for this workspace.</p>
        <div className="detail-section">
          <div className="detail-section-title">Profile name</div>
          <input
            value={profileMember.name}
            onChange={(event) => onUpdateProfileName(event.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="profile-stats">
          <div>
            <strong>{state.boards.length}</strong>
            <span>Boards</span>
          </div>
          <div>
            <strong>{state.members.length}</strong>
            <span>Members</span>
          </div>
          <div>
            <strong>{board.lists.reduce((count, list) => count + list.cards.length, 0)}</strong>
            <span>Cards</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
