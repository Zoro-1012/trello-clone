import { boardThemes } from "./board-themes";

function themeBackground(themeId) {
  return boardThemes.find((theme) => theme.id === themeId)?.background || boardThemes[0].background;
}

const now = new Date();
const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const inSixDays = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

export const defaultMembers = [
  { id: "member-1", name: "Maya Chen", initials: "MC", color: "#22c55e" },
  { id: "member-2", name: "Jordan Lee", initials: "JL", color: "#f59e0b" },
  { id: "member-3", name: "Ava Singh", initials: "AS", color: "#3b82f6" },
  { id: "member-4", name: "Noah Patel", initials: "NP", color: "#ec4899" }
];

export const defaultLabels = [
  { id: "label-1", name: "Design", color: "#22c55e" },
  { id: "label-2", name: "Backend", color: "#60a5fa" },
  { id: "label-3", name: "Urgent", color: "#ef4444" },
  { id: "label-4", name: "Research", color: "#a78bfa" }
];

export const initialState = {
  activeBoardId: "board-1",
  members: defaultMembers,
  labels: defaultLabels,
  boards: [
    {
      id: "board-1",
      title: "My Trello board",
      background: themeBackground("trello-purple"),
      lists: [
        {
          id: "list-1",
          title: "Trello Starter Guide",
          cards: [
            {
              id: "card-1",
              title: "New to Trello? Start here",
              description:
                "A guided card to explain lists, cards, drag and drop, and how your team can organize work in this board.",
              labelIds: ["label-1"],
              dueDate: inThreeDays.toISOString(),
              memberIds: ["member-1", "member-3"],
              archived: false,
              checklist: [
                { id: "item-1", text: "Explore board navigation", completed: true },
                { id: "item-2", text: "Try drag and drop", completed: false },
                { id: "item-3", text: "Open a card and add details", completed: false }
              ],
              comments: [
                {
                  id: "comment-1",
                  author: "Maya Chen",
                  text: "Let’s keep this board close to Trello’s interaction model.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [
                {
                  id: "attachment-1",
                  name: "Starter guide preview",
                  url: "https://trello.com",
                  mimeType: "text/uri-list",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
              activity: ["Card created", "Checklist updated", "Attachment added"]
            }
          ]
        },
        {
          id: "list-2",
          title: "Today",
          cards: [
            {
              id: "card-2",
              title: "Implement board filters",
              description:
                "Support search by title and filters for due date, labels, and assigned members.",
              labelIds: ["label-2"],
              dueDate: inSixDays.toISOString(),
              memberIds: ["member-2", "member-4"],
              archived: false,
              checklist: [
                { id: "item-4", text: "Label filter", completed: true },
                { id: "item-5", text: "Member filter", completed: false }
              ],
              comments: [],
              attachments: [],
              cover: "",
              activity: ["Members assigned"]
            }
          ]
        },
        {
          id: "list-3",
          title: "This Week",
          cards: [
            {
              id: "card-3",
              title: "QA drag and drop",
              description: "Validate list ordering and card movement on desktop and tablet layouts.",
              labelIds: ["label-3"],
              dueDate: "",
              memberIds: ["member-1"],
              archived: false,
              checklist: [],
              comments: [],
              attachments: [],
              cover: "",
              activity: ["Card moved to This Week"]
            }
          ]
        },
        {
          id: "list-4",
          title: "Later",
          cards: []
        }
      ]
    }
  ]
};

export function cloneState(state) {
  return structuredClone(state);
}
