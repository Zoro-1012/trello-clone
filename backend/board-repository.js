import { prisma, hasDatabaseUrl } from "./prisma.js";
import {
  cloneState,
  defaultLabels,
  defaultMembers,
  defaultProfile,
  defaultTeams,
  initialState
} from "../shared/board-state.js";
import { getState, saveState } from "./store.js";

function normalizeState(state) {
  const profile = state.profile || defaultProfile;
  const members = state.members || [];
  const teams =
    state.teams ||
    [
      {
        id: "team-1",
        name: "Team",
        memberIds: members.map((member) => member.id)
      }
    ];

  return {
    activeBoardId: state.activeBoardId || state.boards[0]?.id || "",
    activeTeamId: state.activeTeamId || teams[0]?.id || "",
    profile,
    members,
    teams: teams.map((team) => ({
      ...team,
      memberIds: team.memberIds || []
    })),
    labels: state.labels || [],
    boards: (state.boards || []).map((board) => ({
      ...board,
      lists: (board.lists || []).map((list) => ({
        ...list,
        cards: (list.cards || []).map((card) => ({
          ...card,
          labelIds: card.labelIds || [],
          memberIds: card.memberIds || [],
          checklist: card.checklist || [],
          comments: card.comments || [],
          attachments: card.attachments || [],
          activity: card.activity || [],
          cover: card.cover || "",
          description: card.description || "",
          dueDate: card.dueDate || ""
        }))
      }))
    }))
  };
}

function serializeDbState(data, config) {
  const boards = data.boards
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((board) => ({
      id: board.id,
      title: board.title,
      background: board.background,
      lists: board.lists
        .sort((a, b) => a.position - b.position)
        .map((list) => ({
          id: list.id,
          title: list.title,
          cards: list.cards
            .sort((a, b) => a.position - b.position)
            .map((card) => ({
              id: card.id,
              title: card.title,
              description: card.description,
              labelIds: card.labels.map((item) => item.labelId),
              dueDate: card.dueDate ? card.dueDate.toISOString() : "",
              memberIds: card.members.map((item) => item.memberId),
              archived: card.archived,
              checklist: card.checklist
                .sort((a, b) => a.position - b.position)
                .map((item) => ({
                  id: item.id,
                  text: item.text,
                  completed: item.completed
                })),
              comments: card.comments
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((comment) => ({
                  id: comment.id,
                  author: comment.author,
                  text: comment.text,
                  createdAt: comment.createdAt.toISOString()
                })),
              attachments: card.attachments
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((attachment) => ({
                  id: attachment.id,
                  name: attachment.name,
                  url: attachment.url,
                  mimeType: attachment.mimeType,
                  size: attachment.size,
                  createdAt: attachment.createdAt.toISOString()
                })),
              cover: card.cover || "",
              activity: card.activities
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((item) => item.action)
            }))
        }))
    }));

  return normalizeState({
    activeBoardId: config?.activeBoardId || boards[0]?.id || "",
    activeTeamId: config?.activeTeamId || data.teams[0]?.id || "",
    profile: data.profile
      ? {
          id: data.profile.id,
          name: data.profile.name,
          initials: data.profile.initials,
          color: data.profile.color
        }
      : defaultProfile,
    members: data.members.map((member) => ({
      id: member.id,
      name: member.name,
      initials: member.initials,
      color: member.color
    })),
    teams: data.teams.map((team) => ({
      id: team.id,
      name: team.name,
      memberIds: team.members
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((entry) => entry.memberId)
    })),
    labels: data.labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color
    })),
    boards
  });
}

async function loadFromDb() {
  const [profile, config, members, labels, teams, boards] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.appConfig.findUnique({ where: { id: "app-config" } }),
    prisma.member.findMany(),
    prisma.label.findMany(),
    prisma.team.findMany({
      include: {
        members: true
      }
    }),
    prisma.board.findMany({
      include: {
        lists: {
          include: {
            cards: {
              include: {
                labels: true,
                members: true,
                checklist: true,
                comments: true,
                attachments: true,
                activities: true
              }
            }
          }
        }
      }
    })
  ]);

  return serializeDbState({ profile, members, labels, teams, boards }, config);
}

async function seedDbIfEmpty() {
  const boardCount = await prisma.board.count();
  if (boardCount > 0) {
    return;
  }
  await writeToDb(initialState);
}

export async function readBoardState() {
  if (!hasDatabaseUrl()) {
    return getState();
  }

  try {
    await seedDbIfEmpty();
    return await loadFromDb();
  } catch {
    return getState();
  }
}

export async function writeBoardState(nextState) {
  const normalized = normalizeState(cloneState(nextState));
  saveState(normalized);

  if (!hasDatabaseUrl()) {
    return normalized;
  }

  try {
    await writeToDb(normalized);
    return await loadFromDb();
  } catch {
    return normalized;
  }
}

export async function createBoardRecord(title) {
  const draft = getState();
  draft.activeBoardId = `board-${Date.now()}`;
  draft.boards.push({
    id: draft.activeBoardId,
    title,
    background: initialState.boards[0].background,
    lists: []
  });
  return writeBoardState(draft);
}

async function writeToDb(nextState) {
  await prisma.$transaction(async (tx) => {
    await tx.appConfig.deleteMany();
    await tx.profile.deleteMany();
    await tx.activityLog.deleteMany();
    await tx.comment.deleteMany();
    await tx.attachment.deleteMany();
    await tx.checklistItem.deleteMany();
    await tx.cardMember.deleteMany();
    await tx.cardLabel.deleteMany();
    await tx.card.deleteMany();
    await tx.list.deleteMany();
    await tx.board.deleteMany();
    await tx.teamMember.deleteMany();
    await tx.team.deleteMany();
    await tx.member.deleteMany();
    await tx.label.deleteMany();

    await tx.profile.create({
      data: {
        id: nextState.profile?.id || defaultProfile.id,
        name: nextState.profile?.name || defaultProfile.name,
        initials: nextState.profile?.initials || defaultProfile.initials,
        color: nextState.profile?.color || defaultProfile.color
      }
    });

    await tx.appConfig.create({
      data: {
        id: "app-config",
        activeBoardId: nextState.activeBoardId || null,
        activeTeamId: nextState.activeTeamId || null
      }
    });

    await tx.member.createMany({
      data: (nextState.members.length ? nextState.members : defaultMembers).map((member) => ({
        id: member.id,
        name: member.name,
        initials: member.initials,
        color: member.color
      }))
    });

    for (const team of nextState.teams?.length ? nextState.teams : defaultTeams) {
      await tx.team.create({
        data: {
          id: team.id,
          name: team.name
        }
      });

      if (team.memberIds?.length) {
        await tx.teamMember.createMany({
          data: team.memberIds.map((memberId) => ({
            teamId: team.id,
            memberId
          }))
        });
      }
    }

    await tx.label.createMany({
      data: (nextState.labels.length ? nextState.labels : defaultLabels).map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color
      }))
    });

    for (const board of nextState.boards) {
      await tx.board.create({
        data: {
          id: board.id,
          title: board.title,
          background: board.background
        }
      });

      for (const [listIndex, list] of board.lists.entries()) {
        await tx.list.create({
          data: {
            id: list.id,
            title: list.title,
            position: listIndex,
            boardId: board.id
          }
        });

        for (const [cardIndex, card] of list.cards.entries()) {
          await tx.card.create({
            data: {
              id: card.id,
              title: card.title,
              description: card.description || "",
              position: cardIndex,
              archived: Boolean(card.archived),
              dueDate: card.dueDate ? new Date(card.dueDate) : null,
              cover: card.cover || null,
              listId: list.id
            }
          });

          if (card.labelIds?.length) {
            await tx.cardLabel.createMany({
              data: card.labelIds.map((labelId) => ({
                cardId: card.id,
                labelId
              }))
            });
          }

          if (card.memberIds?.length) {
            await tx.cardMember.createMany({
              data: card.memberIds.map((memberId) => ({
                cardId: card.id,
                memberId
              }))
            });
          }

          if (card.checklist?.length) {
            await tx.checklistItem.createMany({
              data: card.checklist.map((item, index) => ({
                id: item.id,
                text: item.text,
                completed: Boolean(item.completed),
                position: index,
                cardId: card.id
              }))
            });
          }

          if (card.comments?.length) {
            await tx.comment.createMany({
              data: card.comments.map((comment) => ({
                id: comment.id,
                text: comment.text,
                author: comment.author || "Sneh",
                cardId: card.id,
                createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date()
              }))
            });
          }

          if (card.attachments?.length) {
            await tx.attachment.createMany({
              data: card.attachments.map((attachment) => ({
                id: attachment.id,
                name: attachment.name,
                url: attachment.url,
                mimeType: attachment.mimeType || null,
                size: attachment.size ?? null,
                cardId: card.id,
                createdAt: attachment.createdAt ? new Date(attachment.createdAt) : new Date()
              }))
            });
          }

          if (card.activity?.length) {
            await tx.activityLog.createMany({
              data: card.activity.map((action, index) => ({
                id: `${card.id}-activity-${index}-${action.slice(0, 12).replace(/\s+/g, "-").toLowerCase()}`,
                action,
                cardId: card.id,
                createdAt: new Date(Date.now() - index * 1000)
              }))
            });
          }
        }
      }
    }
  });
}
