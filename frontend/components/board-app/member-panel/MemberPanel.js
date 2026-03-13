"use client";

import { Plus } from "lucide-react";
import Modal from "../modal/Modal";

export default function MemberPanel({
  open,
  members,
  onClose,
  onAddMember,
  onUpdateMember,
  onRemoveMember
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <h3 className="panel-title">Manage Team Members</h3>
        <button className="secondary-action" onClick={onAddMember}>
          <Plus size={15} />
          Add member
        </button>
      </div>
      <div className="member-editor-list">
        {members.map((member) => (
          <div key={member.id} className="member-editor-row">
            <span className="member-editor-avatar" style={{ backgroundColor: member.color }}>
              {member.initials}
            </span>
            <input
              value={member.name}
              onChange={(event) =>
                onUpdateMember(member.id, (entry) => {
                  entry.name = event.target.value;
                })
              }
              placeholder="Member name"
            />
            <input
              value={member.initials}
              maxLength={3}
              onChange={(event) =>
                onUpdateMember(member.id, (entry) => {
                  entry.initials = event.target.value.toUpperCase();
                })
              }
              placeholder="INI"
            />
            <input
              type="color"
              value={member.color}
              onChange={(event) =>
                onUpdateMember(member.id, (entry) => {
                  entry.color = event.target.value;
                })
              }
            />
            <button className="danger-action" onClick={() => onRemoveMember(member.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
