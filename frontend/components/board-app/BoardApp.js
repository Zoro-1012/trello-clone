"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { boardThemes } from "../../../shared/board-themes";
import { initialState } from "../../../shared/board-state";
import BoardHeader from "./board-header/BoardHeader";
import CardDetailModal from "./card-detail-modal/CardDetailModal";
import FilterPanel from "./filter-panel/FilterPanel";
import {
  emptyFilters,
  getBoard,
  matchesFilters,
  moveItem,
  toggleInArray
} from "./helpers";
import ListColumn from "./list-column/ListColumn";
import MemberPanel from "./member-panel/MemberPanel";
import ProfilePanel from "./profile-panel/ProfilePanel";
import Sidebar from "./sidebar/Sidebar";
import ThemePanel from "./theme-panel/ThemePanel";
import Topbar from "./topbar/Topbar";

export default function BoardApp() {
  const [state, setState] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [listDrafts, setListDrafts] = useState({});
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [memberPanelOpen, setMemberPanelOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [customBackground, setCustomBackground] = useState("#0079bf");
  const [isSaving, setIsSaving] = useState(false);
  const [dragState, setDragState] = useState(null);
  const fileInputRef = useRef(null);
  const suppressCardOpenUntilRef = useRef(0);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    async function loadState() {
      try {
        const response = await fetch("/api/board", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load board: ${response.status}`);
        }
        const data = await response.json();
        startTransition(() => setState(data));
      } catch {
        startTransition(() => setState(structuredClone(initialState)));
      }
    }

    loadState();
  }, []);

  async function persist(nextState) {
    setIsSaving(true);
    startTransition(() => setState(nextState));
    try {
      const response = await fetch("/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      });
      if (!response.ok) {
        throw new Error(`Failed to save board: ${response.status}`);
      }
      const data = await response.json();
      startTransition(() => {
        setState(data);
        setIsSaving(false);
      });
    } catch {
      startTransition(() => {
        setState(nextState);
        setIsSaving(false);
      });
    }
  }

  if (!state) {
    return <main className="loading-screen">Loading board...</main>;
  }

  const board = getBoard(state);
  const visibleBoard = {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => matchesFilters(card, { ...filters, search: deferredSearch }))
    }))
  };

  const selectedCard = board.lists
    .flatMap((list) => list.cards.map((card) => ({ ...card, listId: list.id })))
    .find((card) => card.id === selectedCardId);

  const activeTeam = state.teams.find((team) => team.id === state.activeTeamId) || state.teams[0];
  const profileMember = state.profile || { id: "profile-1", initials: "ME", name: "My Profile", color: "#38bdf8" };
  const teamMembers = (activeTeam?.memberIds || [])
    .map((memberId) =>
      memberId === profileMember.id ? profileMember : state.members.find((member) => member.id === memberId)
    )
    .filter(Boolean);
  const labelMap = Object.fromEntries(state.labels.map((label) => [label.id, label]));
  const memberMap = Object.fromEntries(
    [...state.members, profileMember].map((member) => [member.id, member])
  );
  const isFiltered =
    Boolean(deferredSearch) ||
    filters.labelIds.length > 0 ||
    filters.memberIds.length > 0 ||
    filters.due !== "all" ||
    filters.showArchived;

  function updateBoard(updater) {
    const nextState = structuredClone(state);
    updater(nextState);
    return persist(nextState);
  }

  function updateCard(cardId, updater) {
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      for (const list of activeBoard.lists) {
        const card = list.cards.find((item) => item.id === cardId);
        if (card) {
          updater(card, list);
          break;
        }
      }
    });
  }

  function addActivity(card, text) {
    card.activity = [text, ...(card.activity || [])];
  }

  async function handleCreateBoard() {
    if (!newBoardTitle.trim()) {
      return;
    }
    try {
      const response = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newBoardTitle.trim() })
      });
      if (!response.ok) {
        throw new Error(`Failed to create board: ${response.status}`);
      }
      const data = await response.json();
      startTransition(() => {
        setState(data);
        setNewBoardTitle("");
      });
    } catch {
      updateBoard((draft) => {
        const boardId = `board-${Date.now()}`;
        draft.activeBoardId = boardId;
        draft.boards.push({
          id: boardId,
          title: newBoardTitle.trim(),
          background: boardThemes[0].background,
          lists: []
        });
      });
      setNewBoardTitle("");
    }
  }

  function handleBoardSwitch(boardId) {
    updateBoard((draft) => {
      draft.activeBoardId = boardId;
    });
  }

  function handleTeamSwitch(teamId) {
    updateBoard((draft) => {
      draft.activeTeamId = teamId;
    });
  }

  function createList() {
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.lists.push({
        id: `list-${Date.now()}`,
        title: `New List ${activeBoard.lists.length + 1}`,
        cards: []
      });
    });
  }

  function updateListTitle(listId, title) {
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      const list = activeBoard.lists.find((item) => item.id === listId);
      if (list) {
        list.title = title;
      }
    });
  }

  function deleteList(listId) {
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.lists = activeBoard.lists.filter((list) => list.id !== listId);
    });
  }

  function createCard(listId) {
    const title = (listDrafts[listId] || "").trim() || "Untitled card";
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      const list = activeBoard.lists.find((item) => item.id === listId);
      if (!list) {
        return;
      }
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

  function deleteCard(cardId) {
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      for (const list of activeBoard.lists) {
        list.cards = list.cards.filter((card) => card.id !== cardId);
      }
    });
    setSelectedCardId("");
  }

  function onNativeDragStart(nextDragState) {
    suppressCardOpenUntilRef.current = Date.now() + 250;
    setDragState(nextDragState);
  }

  function onNativeDragEnd() {
    suppressCardOpenUntilRef.current = Date.now() + 250;
    setDragState(null);
  }

  function reorderLists(sourceIndex, destinationIndex) {
    if (isFiltered || sourceIndex === destinationIndex) {
      return;
    }
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.lists = moveItem(activeBoard.lists, sourceIndex, destinationIndex);
    });
  }

  function moveCardBetweenLists(sourceListId, destinationListId, sourceIndex, destinationIndex) {
    if (isFiltered) {
      return;
    }
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      const sourceList = activeBoard.lists.find((list) => list.id === sourceListId);
      const destinationList = activeBoard.lists.find((list) => list.id === destinationListId);

      if (!sourceList || !destinationList) {
        return;
      }

      if (sourceList.id === destinationList.id) {
        const adjustedIndex =
          sourceIndex < destinationIndex ? destinationIndex - 1 : destinationIndex;

        if (sourceIndex === adjustedIndex) {
          return;
        }
        sourceList.cards = moveItem(sourceList.cards, sourceIndex, adjustedIndex);
        addActivity(sourceList.cards[adjustedIndex], "Card reordered");
        return;
      }

      const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
      if (!movedCard) {
        return;
      }
      const safeIndex = Math.max(0, Math.min(destinationIndex, destinationList.cards.length));
      destinationList.cards.splice(safeIndex, 0, movedCard);
      addActivity(movedCard, `Moved to ${destinationList.title}`);
    });
  }

  function applyTheme(background) {
    updateBoard((draft) => {
      const activeBoard = getBoard(draft);
      activeBoard.background = background;
    });
  }

  function addMember() {
    updateBoard((draft) => {
      const activeDraftTeam = draft.teams.find((team) => team.id === draft.activeTeamId);
      const memberId = `member-${Date.now()}`;
      draft.members.push({
        id: memberId,
        name: `New Member ${draft.members.length + 1}`,
        initials: `N${draft.members.length + 1}`.slice(0, 2).toUpperCase(),
        color: "#38bdf8"
      });
      if (activeDraftTeam) {
        activeDraftTeam.memberIds.push(memberId);
      }
    });
  }

  function updateMember(memberId, updater) {
    updateBoard((draft) => {
      if (draft.profile?.id === memberId) {
        updater(draft.profile);
        return;
      }
      const member = draft.members.find((item) => item.id === memberId);
      if (member) {
        updater(member);
      }
    });
  }

  function removeMember(memberId) {
    updateBoard((draft) => {
      draft.members = draft.members.filter((member) => member.id !== memberId);
      for (const team of draft.teams) {
        team.memberIds = team.memberIds.filter((entry) => entry !== memberId);
      }
      for (const boardEntry of draft.boards) {
        for (const list of boardEntry.lists) {
          for (const card of list.cards) {
            card.memberIds = card.memberIds.filter((entry) => entry !== memberId);
          }
        }
      }
    });
  }

  function handleAttachmentUrl() {
    if (!selectedCard || !attachmentUrl.trim()) {
      return;
    }
    updateCard(selectedCard.id, (card) => {
      card.attachments = [
        {
          id: `attachment-${Date.now()}`,
          name: attachmentUrl.replace(/^https?:\/\//, ""),
          url: attachmentUrl.trim(),
          mimeType: "text/uri-list",
          size: null,
          createdAt: new Date().toISOString()
        },
        ...(card.attachments || [])
      ];
      addActivity(card, "Attachment added");
    });
    setAttachmentUrl("");
  }

  function handleFileAttachment(event) {
    const file = event.target.files?.[0];
    if (!selectedCard || !file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateCard(selectedCard.id, (card) => {
        card.attachments = [
          {
            id: `attachment-${Date.now()}`,
            name: file.name,
            url: String(reader.result),
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            createdAt: new Date().toISOString()
          },
          ...(card.attachments || [])
        ];
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
      card.comments = [
        ...(card.comments || []),
        {
          id: `comment-${Date.now()}`,
          author: profileMember.name,
          text: newComment.trim(),
          createdAt: new Date().toISOString()
        }
      ];
      addActivity(card, "Comment added");
    });
    setNewComment("");
  }

  return (
    <main className="app-shell">
      <Topbar
        filters={filters}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        profileMember={profileMember}
        onProfileOpen={() => setProfilePanelOpen(true)}
      />

      <div className="content-shell">
        <Sidebar
          boards={state.boards}
          teams={state.teams}
          activeTeam={activeTeam}
          teamMembers={teamMembers}
          board={board}
          newBoardTitle={newBoardTitle}
          onNewBoardTitleChange={setNewBoardTitle}
          onCreateBoard={handleCreateBoard}
          onBoardSwitch={handleBoardSwitch}
          onTeamSwitch={handleTeamSwitch}
          onAddMember={addMember}
          onOpenMemberPanel={() => setMemberPanelOpen(true)}
        />

        <section className="board-stage" style={{ backgroundImage: board.background }}>
          <BoardHeader
            board={board}
            filterPanelOpen={filterPanelOpen}
            onToggleThemePanel={() => setThemePanelOpen((open) => !open)}
            onToggleFilterPanel={() => setFilterPanelOpen((open) => !open)}
            onResetFilters={() => setFilters(emptyFilters)}
          />

          {themePanelOpen ? (
            <ThemePanel
              boardThemes={boardThemes}
              customBackground={customBackground}
              onCustomBackgroundChange={setCustomBackground}
              onApplyTheme={applyTheme}
              onApplyCustomColor={() =>
                applyTheme(`linear-gradient(180deg, ${customBackground} 0%, ${customBackground} 100%)`)
              }
              onClose={() => setThemePanelOpen(false)}
            />
          ) : null}

          {filterPanelOpen ? (
            <FilterPanel
              labels={state.labels}
              members={teamMembers}
              filters={filters}
              onToggleLabel={(labelId) =>
                setFilters((current) => ({
                  ...current,
                  labelIds: toggleInArray(current.labelIds, labelId)
                }))
              }
              onToggleMember={(memberId) =>
                setFilters((current) => ({
                  ...current,
                  memberIds: toggleInArray(current.memberIds, memberId)
                }))
              }
              onDueChange={(due) => setFilters((current) => ({ ...current, due }))}
              onShowArchivedChange={(showArchived) =>
                setFilters((current) => ({ ...current, showArchived }))
              }
            />
          ) : null}

          {isFiltered ? <p className="filter-hint">Clear active filters to reorder lists and cards.</p> : null}

          <div className="lists-scroller">
            {visibleBoard.lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                board={board}
                labelMap={labelMap}
                memberMap={memberMap}
                listDraft={listDrafts[list.id] || ""}
                onListTitleChange={updateListTitle}
                onListDelete={deleteList}
                onListDraftChange={(listId, value) =>
                  setListDrafts((current) => ({ ...current, [listId]: value }))
                }
                onCreateCard={createCard}
                onSelectCard={setSelectedCardId}
                dragState={dragState}
                isFiltered={isFiltered}
                suppressCardOpenUntilRef={suppressCardOpenUntilRef}
                onNativeDragStart={onNativeDragStart}
                onNativeDragEnd={onNativeDragEnd}
                reorderLists={reorderLists}
                moveCardBetweenLists={moveCardBetweenLists}
              />
            ))}

            <button className="new-list-column" onClick={createList}>
              Add another list
            </button>
          </div>
        </section>
      </div>

      <CardDetailModal
        selectedCard={selectedCard}
        labels={state.labels}
        members={teamMembers}
        newComment={newComment}
        attachmentUrl={attachmentUrl}
        fileInputRef={fileInputRef}
        onClose={() => setSelectedCardId("")}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
        onNewCommentChange={setNewComment}
        onAttachmentUrlChange={setAttachmentUrl}
        onAttachmentUrlSubmit={handleAttachmentUrl}
        onFileAttachment={handleFileAttachment}
        onSubmitComment={submitComment}
        addActivity={addActivity}
      />

      <MemberPanel
        open={memberPanelOpen}
        members={teamMembers.filter((member) => member.id !== profileMember.id)}
        onClose={() => setMemberPanelOpen(false)}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onRemoveMember={removeMember}
      />

      <ProfilePanel
        open={profilePanelOpen}
        profileMember={profileMember}
        state={state}
        board={board}
        onUpdateProfileName={(name) =>
          updateMember(profileMember.id, (member) => {
            member.name = name;
            const initials = name
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            member.initials = initials || member.initials;
          })
        }
        onClose={() => setProfilePanelOpen(false)}
      />

      {isSaving ? <div className="saving-indicator">Syncing changes...</div> : null}
    </main>
  );
}
