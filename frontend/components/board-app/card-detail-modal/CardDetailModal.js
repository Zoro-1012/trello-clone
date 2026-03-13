"use client";

import clsx from "clsx";
import { Link2 } from "lucide-react";
import Modal from "../modal/Modal";
import { formatAttachmentSize, toggleInArray } from "../helpers";

export default function CardDetailModal({
  selectedCard,
  labels,
  members,
  newComment,
  attachmentUrl,
  fileInputRef,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onNewCommentChange,
  onAttachmentUrlChange,
  onAttachmentUrlSubmit,
  onFileAttachment,
  onSubmitComment,
  addActivity
}) {
  if (!selectedCard) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="detail-header">
        <input
          value={selectedCard.title}
          onChange={(event) =>
            onUpdateCard(selectedCard.id, (card) => {
              card.title = event.target.value;
            })
          }
        />
        <div className="detail-actions">
          <button
            className="secondary-action"
            onClick={() =>
              onUpdateCard(selectedCard.id, (card) => {
                card.archived = !card.archived;
                addActivity(card, card.archived ? "Card archived" : "Card restored");
              })
            }
          >
            {selectedCard.archived ? "Restore" : "Archive"}
          </button>
          <button className="danger-action" onClick={() => onDeleteCard(selectedCard.id)}>
            Delete
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-main">
          <div className="detail-section">
            <div className="detail-section-title">Description</div>
            <textarea
              value={selectedCard.description}
              onChange={(event) =>
                onUpdateCard(selectedCard.id, (card) => {
                  card.description = event.target.value;
                })
              }
              placeholder="Add a richer card description..."
            />
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Checklist</div>
            <div className="checklist-list">
              {selectedCard.checklist.map((item) => (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() =>
                      onUpdateCard(selectedCard.id, (card) => {
                        const currentItem = card.checklist.find((entry) => entry.id === item.id);
                        currentItem.completed = !currentItem.completed;
                        addActivity(card, "Checklist updated");
                      })
                    }
                  />
                  <input
                    value={item.text}
                    onChange={(event) =>
                      onUpdateCard(selectedCard.id, (card) => {
                        const currentItem = card.checklist.find((entry) => entry.id === item.id);
                        currentItem.text = event.target.value;
                      })
                    }
                  />
                </label>
              ))}
              <button
                className="secondary-action"
                onClick={() =>
                  onUpdateCard(selectedCard.id, (card) => {
                    card.checklist.push({
                      id: `item-${Date.now()}`,
                      text: "New checklist item",
                      completed: false
                    });
                    addActivity(card, "Checklist item added");
                  })
                }
              >
                Add checklist item
              </button>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Attachments</div>
            <div className="attachment-inputs">
              <div className="inline-input">
                <Link2 size={14} />
                <input
                  value={attachmentUrl}
                  onChange={(event) => onAttachmentUrlChange(event.target.value)}
                  placeholder="Paste attachment URL"
                />
              </div>
              <button className="secondary-action" onClick={onAttachmentUrlSubmit}>
                Add link
              </button>
              <button className="secondary-action" onClick={() => fileInputRef.current?.click()}>
                Upload file
              </button>
              <input ref={fileInputRef} hidden type="file" onChange={onFileAttachment} />
            </div>
            <div className="attachment-list">
              {(selectedCard.attachments || []).map((attachment) => (
                <div key={attachment.id} className="attachment-row">
                  <a href={attachment.url} target="_blank" rel="noreferrer">
                    {attachment.name}
                  </a>
                  <div className="attachment-meta">
                    <span>{formatAttachmentSize(attachment.size)}</span>
                    <button
                      className="text-action"
                      onClick={() =>
                        onUpdateCard(selectedCard.id, (card) => {
                          card.attachments = card.attachments.filter((entry) => entry.id !== attachment.id);
                          addActivity(card, "Attachment removed");
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Comments</div>
            <div className="comment-box">
              <textarea
                value={newComment}
                onChange={(event) => onNewCommentChange(event.target.value)}
                placeholder="Write a comment..."
              />
              <button className="secondary-action" onClick={onSubmitComment}>
                Add comment
              </button>
            </div>
          </div>
        </section>

        <aside className="detail-side">
          <div className="detail-section">
            <div className="detail-section-title">Labels</div>
            <div className="chip-row">
              {labels.map((label) => (
                <button
                  key={label.id}
                  className={clsx("filter-chip", selectedCard.labelIds.includes(label.id) && "active")}
                  onClick={() =>
                    onUpdateCard(selectedCard.id, (card) => {
                      card.labelIds = toggleInArray(card.labelIds, label.id);
                      addActivity(card, "Labels updated");
                    })
                  }
                >
                  <span className="chip-dot" style={{ backgroundColor: label.color }} />
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Members</div>
            <div className="chip-row">
              {members.map((member) => (
                <button
                  key={member.id}
                  className={clsx("filter-chip", selectedCard.memberIds.includes(member.id) && "active")}
                  onClick={() =>
                    onUpdateCard(selectedCard.id, (card) => {
                      card.memberIds = toggleInArray(card.memberIds, member.id);
                      addActivity(card, "Members updated");
                    })
                  }
                >
                  {member.initials} {member.name}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Due date</div>
            <input
              type="date"
              value={selectedCard.dueDate ? selectedCard.dueDate.slice(0, 10) : ""}
              onChange={(event) =>
                onUpdateCard(selectedCard.id, (card) => {
                  card.dueDate = event.target.value ? new Date(event.target.value).toISOString() : "";
                  addActivity(card, event.target.value ? "Due date updated" : "Due date cleared");
                })
              }
            />
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Card cover</div>
            <input
              value={selectedCard.cover}
              placeholder="Paste image URL"
              onChange={(event) =>
                onUpdateCard(selectedCard.id, (card) => {
                  card.cover = event.target.value;
                })
              }
            />
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Activity</div>
            <ul className="activity-list">
              {(selectedCard.activity || []).map((entry, index) => (
                <li key={`${entry}-${index}`}>{entry}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
