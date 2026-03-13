"use client";

import clsx from "clsx";
import { format, parseISO } from "date-fns";
import { CalendarDays, CheckSquare, GripVertical, Paperclip, Plus, Trash2 } from "lucide-react";
import { getChecklistProgress } from "../helpers";

export default function ListColumn({
  list,
  board,
  labelMap,
  memberMap,
  listDraft,
  onListTitleChange,
  onListDelete,
  onListDraftChange,
  onCreateCard,
  onSelectCard,
  dragState,
  isFiltered,
  suppressCardOpenUntilRef,
  onNativeDragStart,
  onNativeDragEnd,
  reorderLists,
  moveCardBetweenLists
}) {
  const originalListIndex = board.lists.findIndex((entry) => entry.id === list.id);

  return (
    <article
      className={clsx("list-column", dragState?.type === "list" && dragState.id === list.id && "is-dragging")}
      draggable={!isFiltered}
      onDragStart={(event) => {
        onNativeDragStart({
          type: "list",
          id: list.id,
          index: originalListIndex
        });
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", list.id);
        }
      }}
      onDragEnd={onNativeDragEnd}
      onDragOver={(event) => {
        if (dragState?.type === "list") {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (dragState?.type === "list") {
          reorderLists(dragState.index, originalListIndex);
          onNativeDragEnd();
        }
      }}
    >
      <div className="list-header">
        <input
          value={list.title}
          onChange={(event) => onListTitleChange(list.id, event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
        />
        <button type="button" className="icon-button drag-handle-button" aria-label={`Drag ${list.title}`}>
          <GripVertical size={14} />
        </button>
        <button className="icon-button" onClick={() => onListDelete(list.id)}>
          <Trash2 size={14} />
        </button>
      </div>

      <div
        className="card-stack"
        onDragOver={(event) => {
          if (dragState?.type === "card") {
            event.preventDefault();
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (dragState?.type === "card") {
            moveCardBetweenLists(
              dragState.sourceListId,
              list.id,
              dragState.sourceIndex,
              list.cards.length
            );
            onNativeDragEnd();
          }
        }}
      >
        {list.cards.map((card, cardIndex) => {
          const originalCardIndex = board.lists
            .find((entry) => entry.id === list.id)
            ?.cards.findIndex((entry) => entry.id === card.id);
          const checklistProgress = getChecklistProgress(card.checklist || []);

          return (
            <div
              key={card.id}
              className={clsx(
                "card-drop-zone",
                dragState?.type === "card" && dragState.id === card.id && "is-dragging"
              )}
              onDragOver={(event) => {
                if (dragState?.type === "card") {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragState?.type === "card") {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const dropAfter = event.clientY > rect.top + rect.height / 2;
                  moveCardBetweenLists(
                    dragState.sourceListId,
                    list.id,
                    dragState.sourceIndex,
                    cardIndex + (dropAfter ? 1 : 0)
                  );
                  onNativeDragEnd();
                }
              }}
            >
              <div
                className="card-tile"
                draggable={!isFiltered}
                onDragStart={() =>
                  onNativeDragStart({
                    type: "card",
                    id: card.id,
                    sourceListId: list.id,
                    sourceIndex: originalCardIndex ?? cardIndex
                  })
                }
                onDragEnd={onNativeDragEnd}
                onClick={() => {
                  if (Date.now() < suppressCardOpenUntilRef.current) {
                    return;
                  }
                  onSelectCard(card.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectCard(card.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="card-drag-row">
                  <div className="card-labels">
                    {card.labelIds.map((labelId) => (
                      <span
                        key={labelId}
                        className="mini-label"
                        style={{ backgroundColor: labelMap[labelId]?.color }}
                      />
                    ))}
                  </div>
                  <div className="card-grip" aria-hidden="true">
                    <GripVertical size={14} />
                  </div>
                </div>
                {card.cover ? (
                  <div className="card-cover" style={{ backgroundImage: `url(${card.cover})` }} />
                ) : null}
                <h3>{card.title}</h3>
                {card.description ? <p className="card-description">{card.description}</p> : null}
                <div className="card-meta">
                  {card.dueDate ? (
                    <span>
                      <CalendarDays size={14} />
                      {format(parseISO(card.dueDate), "MMM d")}
                    </span>
                  ) : null}
                  {checklistProgress ? (
                    <span>
                      <CheckSquare size={14} />
                      {checklistProgress}
                    </span>
                  ) : null}
                  {card.attachments?.length ? (
                    <span>
                      <Paperclip size={14} />
                      {card.attachments.length}
                    </span>
                  ) : null}
                </div>
                <div className="card-members">
                  {card.memberIds.map((memberId) => (
                    <span key={memberId} style={{ backgroundColor: memberMap[memberId]?.color }}>
                      {memberMap[memberId]?.initials}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="new-card-box">
        <input
          value={listDraft}
          onChange={(event) => onListDraftChange(list.id, event.target.value)}
          placeholder="Enter card title"
        />
        <button className="add-card-button" onClick={() => onCreateCard(list.id)}>
          <Plus size={16} />
          Add card
        </button>
      </div>
    </article>
  );
}
