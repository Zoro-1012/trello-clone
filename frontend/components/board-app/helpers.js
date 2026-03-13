"use client";

import { isAfter, isBefore, isToday, parseISO } from "date-fns";

export const emptyFilters = {
  search: "",
  labelIds: [],
  memberIds: [],
  due: "all",
  showArchived: false
};

export function getBoard(state) {
  return state.boards.find((board) => board.id === state.activeBoardId) || state.boards[0];
}

export function moveItem(items, startIndex, endIndex) {
  const updated = [...items];
  const [item] = updated.splice(startIndex, 1);
  updated.splice(endIndex, 0, item);
  return updated;
}

export function toggleInArray(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function matchesDueFilter(dueDate, filter) {
  if (filter === "all") {
    return true;
  }

  if (!dueDate) {
    return filter === "none";
  }

  const due = parseISO(dueDate);
  if (filter === "overdue") {
    return isBefore(due, new Date()) && !isToday(due);
  }
  if (filter === "today") {
    return isToday(due);
  }
  if (filter === "upcoming") {
    return isAfter(due, new Date()) && !isToday(due);
  }
  return true;
}

export function matchesFilters(card, filters) {
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

export function getChecklistProgress(checklist) {
  if (!checklist.length) {
    return null;
  }
  const completed = checklist.filter((item) => item.completed).length;
  return `${completed}/${checklist.length}`;
}

export function formatAttachmentSize(size) {
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
