"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState
} from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Filter,
  LayoutGrid,
  Link2,
  MessageSquare,
  Paintbrush,
  Paperclip,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Users,
  X
} from "lucide-react";
import { format, isAfter, isBefore, isToday, parseISO } from "date-fns";
import clsx from "clsx";
import { boardThemes } from "../lib/board-themes";

const emptyFilters = {
  search: "",
  labelIds: [],
  memberIds: [],
  due: "all",
  showArchived: false
};

function moveItem(items, startIndex, endIndex) {
  const updated = [...items];
  const [moved] = updated.splice(startIndex, 1);
  updated.splice(endIndex, 0, moved);
  return updated;
}

function toggleValue(items, value) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function getBoard(state) {
  return state.boards.find((board) => board.id === state.activeBoardId) || state.boards[0];
}

function matchesDueFilter(dueDate, filter) {
  if (filter === "all") {
    return true;
  }

  if (!dueDate) {
    return filter === "none";
  }

  const due = parseISO(dueDate);
  if (filter === "today") {
    return isToday(due);
  }
  if (filter === "upcoming") {
    return isAfter(due, new Date()) && !isToday(due);
  }
  if (filter === "overdue") {
    return isBefore(due, new Date()) && !isToday(due);
  }
  return true;
}

function matchesFilters(card, filters) {
  if (!filters.showArchived && card.archived) {
    return false;
  }
  if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase())) {
    return false;
  }
  if (filters.labelIds.length && !filters.labelIds.every((id) => card.labelIds.includes(id))) {
    return false;
  }
  if (filters.memberIds.length && !filters.memberIds.some((id) => card.memberIds.includes(id))) {
    return false;
  }
  if (!matchesDueFilter(card.dueDate, filters.due)) {
    return false;
  }
  return true;
}

function checklistProgress(checklist) {
  if (!checklist.length) {
    return null;
  }
  const done = checklist.filter((item) => item.completed).length;
  return `${done}/${checklist.length}`;
}

function formatAttachmentSize(size) {
  if (!size) {
    return "";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-shell" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function BoardApp() {
  const [state, setState] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [listDrafts, setListDrafts] = useState({});
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    async function loadBoard() {
      const response = await fetch("/api/board");
      const data = await response.json();
      startTransition(() => setState(data));
    }
    loadBoard();
  }, []);

  async function persist(nextState) {
    setIsSaving(true);
    startTransition(() => setState(nextState));
    const response = await fetch("/api/board", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextState)
    });
    const data = await response.json();
    startTransition(() => {
      setState(data);
      setIsSaving(false);
    });
  }

  const board = state ? getBoard(state) : null;

  const visibleBoard = board
    ? {
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) =>
            matchesFilters(card, { ...filters, search: deferredSearch })
          )
        }))
      }
    : null;

  const selectedCard = board
    ? board.lists
        .flatMap((list) => list.cards.map((card) => ({ ...card, listId: list.id })))
        .find((card) => card.id === selectedCardId)
    : null;

  const labelMap = Object.fromEntries((state?.labels || []).map((label) => [label.id, label]));
  const memberMap = Object.fromEntries((state?.members || []).map((member) => [member.id, member]));

  const filterActive =
    Boolean(deferredSearch) ||
    filters.labelIds.length > 0 ||
    filters.memberIds.length > 0 ||
    filters.due !== "all" ||
    filters.showArchived;

  if (!state || !board || !visibleBoard) {
    return <main className="loading-screen">Loading board...</main>;
  }

  function withBoardUpdate(updater) {
    const draft = structuredClone(state);
    updater(draft);
    return persist(draft);
  }

  function addActivity(card, action) {
    card.activity = [action, ...(card.activity || [])];
  }

  function findCardInDraft(draft, cardId) {
    const activeBoard = getBoard(draft);
    for (const list of activeBoard.lists) {
      const card = list.cards.find((entry) => entry.id === cardId);
      if (card) {
        return { card, list };
      }
    }
    return null;
  }

  async function handleCreateBoard() {
    if (!newBoardTitle.trim()) {
      return;
    }
    const response = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newBoardTitle.trim() })
    });
    const data = await response.json();
    startTransition(() => {
      setState(data);
      setNewBoardTitle("");
    });
  }

  function handleBoardSwitch(boardId) {
    withBoardUpdate((draft) => {
      draft.activeBoardId = boardId;
    });
  }

  function createList() {
    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.lists.push({
        id: `list-${Date.now()}`,
        title: `List ${activeBoard.lists.length + 1}`,
        cards: []
      });
    });
  }

  function createCard(listId) {
    const title = (listDrafts[listId] || "").trim();
    if (!title) {
      return;
    }
    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      const list = activeBoard.lists.find((entry) => entry.id === listId);
      list.cards.unshift({
        id: `card-${Date.now()}`,
        title,
        description: "",
        labelIds: [],
        dueDate: "",
        memberIds: [],
        archived: false,
        checklist: [],
        comments: [],
        attachments: [],
        cover: "",
        activity: ["Card created"]
      });
    });
    setListDrafts((current) => ({ ...current, [listId]: "" }));
  }

  function updateCard(cardId, updater) {
    withBoardUpdate((draft) => {
      const match = findCardInDraft(draft, cardId);
      if (match) {
        updater(match.card, match.list);
      }
    });
  }

  function updateListTitle(listId, title) {
    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      const list = activeBoard.lists.find((entry) => entry.id === listId);
      list.title = title;
    });
  }

  function deleteList(listId) {
    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.lists = activeBoard.lists.filter((list) => list.id !== listId);
    });
  }

  function deleteCard(cardId) {
    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      for (const list of activeBoard.lists) {
        list.cards = list.cards.filter((card) => card.id !== cardId);
      }
    });
    setSelectedCardId("");
  }

  function onDragEnd(result) {
    if (!result.destination || filterActive) {
      return;
    }

    if (result.type === "COLUMN") {
      withBoardUpdate((draft) => {
        const activeBoard = getBoard(draft);
        activeBoard.lists = moveItem(activeBoard.lists, result.source.index, result.destination.index);
      });
      return;
    }

    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      const sourceList = activeBoard.lists.find((list) => list.id === result.source.droppableId);
      const destinationList = activeBoard.lists.find(
        (list) => list.id === result.destination.droppableId
      );

      if (!sourceList || !destinationList) {
        return;
      }

      if (sourceList.id === destinationList.id) {
        sourceList.cards = moveItem(sourceList.cards, result.source.index, result.destination.index);
        addActivity(sourceList.cards[result.destination.index], "Card reordered");
      } else {
        const [movedCard] = sourceList.cards.splice(result.source.index, 1);
        destinationList.cards.splice(result.destination.index, 0, movedCard);
        addActivity(movedCard, `Moved to ${destinationList.title}`);
      }
    });
  }

  function applyTheme(background) {
    withBoardUpdate((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.background = background;
    });
  }

  function handleAttachmentUrl() {
    if (!selectedCard || !attachmentUrl.trim()) {
      return;
    }

    updateCard(selectedCard.id, (card) => {
      card.attachments.unshift({
        id: `attachment-${Date.now()}`,
        name: attachmentUrl.replace(/^https?:\/\//, ""),
        url: attachmentUrl.trim(),
        mimeType: "text/uri-list",
        size: null,
        createdAt: new Date().toISOString()
      });
      addActivity(card, "Attachment added");
    });
    setAttachmentUrl("");
  }

  async function handleFileAttachment(event) {
    const file = event.target.files?.[0];
    if (!file || !selectedCard) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateCard(selectedCard.id, (card) => {
        card.attachments.unshift({
          id: `attachment-${Date.now()}`,
          name: file.name,
          url: String(reader.result),
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          createdAt: new Date().toISOString()
        });
        addActivity(card, "File attached");
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function submitComment() {
    if (!selectedCard || !newComment.trim()) {
      return;
    }
    updateCard(selectedCard.id, (card) => {
      card.comments.push({
        id: `comment-${Date.now()}`,
        author: "Sneh",
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      });
      addActivity(card, "Comment added");
    });
    setNewComment("");
  }

  return (
    <main className="trello-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="trello-logo">
            <span />
            <span />
          </div>
          <strong>TaskOrbit</strong>
        </div>
        <div className="topbar-search">
          <Search size={17} />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search cards"
          />
        </div>
        <div className="topbar-actions">
          <button className="primary-pill" onClick={handleCreateBoard}>
            Create
          </button>
          <button className="icon-pill">
            <Bell size={17} />
          </button>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className="workspace-sidebar">
          <div className="sidebar-head">
            <h1>Boards</h1>
            <button className="icon-pill small" onClick={createList}>
              <Plus size={16} />
            </button>
          </div>

          <div className="sidebar-board-list">
            {state.boards.map((entry) => (
              <button
                key={entry.id}
                className={clsx("sidebar-board-item", entry.id === board.id && "active")}
                onClick={() => handleBoardSwitch(entry.id)}
              >
                <span className="board-dot" />
                {entry.title}
              </button>
            ))}
          </div>

          <div className="new-board-box">
            <input
              value={newBoardTitle}
              onChange={(event) => setNewBoardTitle(event.target.value)}
              placeholder="New board title"
            />
            <button className="primary-pill" onClick={handleCreateBoard}>
              Add board
            </button>
          </div>

          <div className="member-area">
            <div className="section-label">
              <Users size={15} />
              Members
            </div>
            <div className="member-list">
              {state.members.map((member) => (
                <div key={member.id} className="member-chip">
                  <span style={{ backgroundColor: member.color }}>{member.initials}</span>
                  {member.name}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="board-shell" style={{ backgroundImage: board.background }}>
          <div className="board-overlay">
            <header className="board-toolbar">
              <div className="board-toolbar-left">
                <h2>{board.title}</h2>
                <button className="ghost-chip" onClick={() => setThemePanelOpen((open) => !open)}>
                  <Paintbrush size={15} />
                  Background
                </button>
              </div>
              <div className="board-toolbar-right">
                <div className="avatar-stack">
                  {state.members.slice(0, 4).map((member) => (
                    <span key={member.id} style={{ backgroundColor: member.color }}>
                      {member.initials}
                    </span>
                  ))}
                </div>
                <button className="ghost-chip">
                  <Share2 size={15} />
                  Share
                </button>
              </div>
            </header>

            {themePanelOpen ? (
              <section className="theme-panel">
                <div className="theme-header">
                  <div className="section-label">
                    <Sparkles size={15} />
                    Board background
                  </div>
                  <button className="icon-pill small" onClick={() => setThemePanelOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
                <div className="theme-grid">
                  {boardThemes.map((theme) => (
                    <button
                      key={theme.id}
                      className="theme-swatch"
                      style={{ backgroundImage: theme.preview }}
                      onClick={() => applyTheme(theme.background)}
                    >
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="filter-panel">
              <div className="section-label">
                <Filter size={15} />
                Search & Filter
              </div>
              <div className="filter-row">
                <div className="filter-group">
                  {state.labels.map((label) => (
                    <button
                      key={label.id}
                      className={clsx("tag-chip", filters.labelIds.includes(label.id) && "active")}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          labelIds: toggleValue(current.labelIds, label.id)
                        }))
                      }
                    >
                      <span className="tag-color" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </button>
                  ))}
                </div>
                <div className="filter-group">
                  {state.members.map((member) => (
                    <button
                      key={member.id}
                      className={clsx("tag-chip", filters.memberIds.includes(member.id) && "active")}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          memberIds: toggleValue(current.memberIds, member.id)
                        }))
                      }
                    >
                      {member.initials}
                    </button>
                  ))}
                </div>
                <select
                  value={filters.due}
                  onChange={(event) => setFilters((current) => ({ ...current, due: event.target.value }))}
                >
                  <option value="all">All due dates</option>
                  <option value="today">Due today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="overdue">Overdue</option>
                  <option value="none">No due date</option>
                </select>
                <label className="archive-option">
                  <input
                    type="checkbox"
                    checked={filters.showArchived}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, showArchived: event.target.checked }))
                    }
                  />
                  Show archived
                </label>
                <button className="ghost-chip" onClick={() => setFilters(emptyFilters)}>
                  Reset
                </button>
              </div>
            </section>

            {filterActive ? (
              <p className="board-note">Drag and drop is paused while filters are active.</p>
            ) : null}

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                {(provided) => (
                  <div className="board-columns" ref={provided.innerRef} {...provided.droppableProps}>
                    {visibleBoard.lists.map((list, index) => (
                      <Draggable key={list.id} draggableId={list.id} index={index}>
                        {(dragProvided) => (
                          <section
                            className="board-list"
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                          >
                            <div className="board-list-head" {...dragProvided.dragHandleProps}>
                              <input
                                value={list.title}
                                onChange={(event) => updateListTitle(list.id, event.target.value)}
                              />
                              <button className="icon-pill small" onClick={() => deleteList(list.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <Droppable droppableId={list.id} type="CARD">
                              {(dropProvided) => (
                                <div
                                  className="card-column"
                                  ref={dropProvided.innerRef}
                                  {...dropProvided.droppableProps}
                                >
                                  {list.cards.map((card, cardIndex) => {
                                    const progress = checklistProgress(card.checklist);
                                    return (
                                      <Draggable
                                        key={card.id}
                                        draggableId={card.id}
                                        index={cardIndex}
                                        isDragDisabled={filterActive}
                                      >
                                        {(cardProvided) => (
                                          <article
                                            className="card-item"
                                            ref={cardProvided.innerRef}
                                            {...cardProvided.draggableProps}
                                            {...cardProvided.dragHandleProps}
                                            onClick={() => setSelectedCardId(card.id)}
                                          >
                                            {card.cover ? (
                                              <div
                                                className="card-cover"
                                                style={{ backgroundImage: `url(${card.cover})` }}
                                              />
                                            ) : null}
                                            <div className="card-inner">
                                              <div className="mini-label-row">
                                                {card.labelIds.map((labelId) => (
                                                  <span
                                                    key={labelId}
                                                    className="mini-label"
                                                    style={{ backgroundColor: labelMap[labelId]?.color }}
                                                  />
                                                ))}
                                              </div>
                                              <h3>{card.title}</h3>
                                              {card.description ? <p>{card.description}</p> : null}
                                              <div className="card-stats">
                                                {card.dueDate ? (
                                                  <span>
                                                    <CalendarDays size={13} />
                                                    {format(parseISO(card.dueDate), "MMM d")}
                                                  </span>
                                                ) : null}
                                                {progress ? (
                                                  <span>
                                                    <CheckSquare size={13} />
                                                    {progress}
                                                  </span>
                                                ) : null}
                                                {card.attachments?.length ? (
                                                  <span>
                                                    <Paperclip size={13} />
                                                    {card.attachments.length}
                                                  </span>
                                                ) : null}
                                                {card.comments?.length ? (
                                                  <span>
                                                    <MessageSquare size={13} />
                                                    {card.comments.length}
                                                  </span>
                                                ) : null}
                                              </div>
                                              <div className="card-member-row">
                                                {card.memberIds.map((memberId) => (
                                                  <span
                                                    key={memberId}
                                                    style={{ backgroundColor: memberMap[memberId]?.color }}
                                                  >
                                                    {memberMap[memberId]?.initials}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </article>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {dropProvided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            <div className="new-card-box">
                              <input
                                value={listDrafts[list.id] || ""}
                                onChange={(event) =>
                                  setListDrafts((current) => ({
                                    ...current,
                                    [list.id]: event.target.value
                                  }))
                                }
                                placeholder="Enter a title for this card..."
                              />
                              <button className="ghost-chip add-card-chip" onClick={() => createCard(list.id)}>
                                <Plus size={15} />
                                Add a card
                              </button>
                            </div>
                          </section>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    <button className="new-list-tile" onClick={createList}>
                      <Plus size={17} />
                      Add another list
                    </button>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </section>
      </div>

      <footer className="bottom-nav">
        <button className="bottom-chip">
          <LayoutGrid size={16} />
          Inbox
        </button>
        <button className="bottom-chip">
          <CalendarDays size={16} />
          Planner
        </button>
        <button className="bottom-chip active">
          <LayoutGrid size={16} />
          Board
        </button>
      </footer>

      {selectedCard ? (
        <Modal onClose={() => setSelectedCardId("")}>
          <div className="detail-top">
            <input
              className="detail-title"
              value={selectedCard.title}
              onChange={(event) =>
                updateCard(selectedCard.id, (card) => {
                  card.title = event.target.value;
                })
              }
            />
            <div className="detail-actions">
              <button
                className="ghost-chip"
                onClick={() =>
                  updateCard(selectedCard.id, (card) => {
                    card.archived = !card.archived;
                    addActivity(card, card.archived ? "Card archived" : "Card restored");
                  })
                }
              >
                {selectedCard.archived ? "Restore" : "Archive"}
              </button>
              <button className="danger-chip" onClick={() => deleteCard(selectedCard.id)}>
                Delete
              </button>
            </div>
          </div>

          <div className="detail-layout">
            <section className="detail-main">
              <div className="detail-section">
                <div className="section-label">Description</div>
                <textarea
                  value={selectedCard.description}
                  onChange={(event) =>
                    updateCard(selectedCard.id, (card) => {
                      card.description = event.target.value;
                    })
                  }
                  placeholder="Add a more detailed description..."
                />
              </div>

              <div className="detail-section">
                <div className="section-label">
                  <CheckSquare size={15} />
                  Checklist
                </div>
                <div className="checklist-stack">
                  {selectedCard.checklist.map((item) => (
                    <label key={item.id} className="checklist-row">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          updateCard(selectedCard.id, (card) => {
                            const entry = card.checklist.find((current) => current.id === item.id);
                            entry.completed = !entry.completed;
                            addActivity(card, `Checklist item ${entry.completed ? "completed" : "reopened"}`);
                          })
                        }
                      />
                      <input
                        value={item.text}
                        onChange={(event) =>
                          updateCard(selectedCard.id, (card) => {
                            const entry = card.checklist.find((current) => current.id === item.id);
                            entry.text = event.target.value;
                          })
                        }
                      />
                    </label>
                  ))}
                  <button
                    className="ghost-chip"
                    onClick={() =>
                      updateCard(selectedCard.id, (card) => {
                        card.checklist.push({
                          id: `item-${Date.now()}`,
                          text: "New checklist item",
                          completed: false
                        });
                        addActivity(card, "Checklist item added");
                      })
                    }
                  >
                    <Plus size={15} />
                    Add checklist item
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-label">
                  <Paperclip size={15} />
                  Attachments
                </div>
                <div className="attachment-actions">
                  <div className="inline-input">
                    <Link2 size={14} />
                    <input
                      value={attachmentUrl}
                      onChange={(event) => setAttachmentUrl(event.target.value)}
                      placeholder="Paste attachment URL"
                    />
                  </div>
                  <button className="ghost-chip" onClick={handleAttachmentUrl}>
                    Add link
                  </button>
                  <button className="ghost-chip" onClick={() => fileInputRef.current?.click()}>
                    Upload file
                  </button>
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    onChange={handleFileAttachment}
                  />
                </div>
                <div className="attachment-list">
                  {selectedCard.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-row">
                      <a href={attachment.url} target="_blank" rel="noreferrer">
                        {attachment.name}
                      </a>
                      <div className="attachment-meta">
                        <span>{formatAttachmentSize(attachment.size)}</span>
                        <button
                          className="text-button"
                          onClick={() =>
                            updateCard(selectedCard.id, (card) => {
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
                  {!selectedCard.attachments.length ? <p className="empty-text">No attachments yet.</p> : null}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-label">
                  <MessageSquare size={15} />
                  Comments
                </div>
                <div className="comment-composer">
                  <textarea
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button className="primary-pill" onClick={submitComment}>
                    Add comment
                  </button>
                </div>
                <div className="comment-list">
                  {selectedCard.comments.map((comment) => (
                    <div key={comment.id} className="comment-card">
                      <div className="comment-head">
                        <strong>{comment.author}</strong>
                        <span>{format(parseISO(comment.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                  {!selectedCard.comments.length ? <p className="empty-text">No comments yet.</p> : null}
                </div>
              </div>
            </section>

            <aside className="detail-side">
              <div className="detail-section">
                <div className="section-label">
                  <Paintbrush size={15} />
                  Labels
                </div>
                <div className="pill-stack">
                  {state.labels.map((label) => (
                    <button
                      key={label.id}
                      className={clsx("tag-chip", selectedCard.labelIds.includes(label.id) && "active")}
                      onClick={() =>
                        updateCard(selectedCard.id, (card) => {
                          card.labelIds = toggleValue(card.labelIds, label.id);
                          addActivity(card, "Labels updated");
                        })
                      }
                    >
                      <span className="tag-color" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-label">
                  <Users size={15} />
                  Members
                </div>
                <div className="pill-stack">
                  {state.members.map((member) => (
                    <button
                      key={member.id}
                      className={clsx("tag-chip", selectedCard.memberIds.includes(member.id) && "active")}
                      onClick={() =>
                        updateCard(selectedCard.id, (card) => {
                          card.memberIds = toggleValue(card.memberIds, member.id);
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
                <div className="section-label">
                  <CalendarDays size={15} />
                  Due date
                </div>
                <input
                  type="date"
                  value={selectedCard.dueDate ? selectedCard.dueDate.slice(0, 10) : ""}
                  onChange={(event) =>
                    updateCard(selectedCard.id, (card) => {
                      card.dueDate = event.target.value ? new Date(event.target.value).toISOString() : "";
                      addActivity(card, event.target.value ? "Due date updated" : "Due date cleared");
                    })
                  }
                />
              </div>

              <div className="detail-section">
                <div className="section-label">Cover image</div>
                <input
                  value={selectedCard.cover}
                  onChange={(event) =>
                    updateCard(selectedCard.id, (card) => {
                      card.cover = event.target.value;
                    })
                  }
                  placeholder="Paste image URL"
                />
              </div>

              <div className="detail-section">
                <div className="section-label">Activity log</div>
                <div className="activity-feed">
                  {selectedCard.activity.map((item, index) => (
                    <div key={`${item}-${index}`} className="activity-row">
                      <span className="activity-bullet" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Modal>
      ) : null}

      {isSaving ? <div className="saving-indicator">Syncing changes...</div> : null}
    </main>
  );
}
