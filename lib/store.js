import { cloneState, initialState } from "./board-state";
import { boardThemes } from "./board-themes";

let store = cloneState(initialState);

export function getState() {
  return cloneState(store);
}

export function saveState(nextState) {
  store = cloneState(nextState);
  return getState();
}

export function createBoard(title) {
  const newBoard = {
    id: `board-${Date.now()}`,
    title,
    background: boardThemes[0].background,
    lists: []
  };

  store = {
    ...store,
    activeBoardId: newBoard.id,
    boards: [...store.boards, newBoard]
  };

  return getState();
}
