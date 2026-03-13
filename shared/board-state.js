import { boardThemes } from "./board-themes.js";

function themeBackground(themeId) {
  return boardThemes.find((theme) => theme.id === themeId)?.background || boardThemes[0].background;
}

const now = new Date();
const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const inSixDays = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

export const defaultMembers = [
  { id: "member-1", name: "Maya Chen", initials: "MC", color: "#22c55e" },
  { id: "member-2", name: "Jordan Lee", initials: "JL", color: "#f59e0b" },
  { id: "member-3", name: "Ava Singh", initials: "AS", color: "#3b82f6" },
  { id: "member-4", name: "Noah Patel", initials: "NP", color: "#ec4899" },
  { id: "member-5", name: "Liam Brooks", initials: "LB", color: "#14b8a6" },
  { id: "member-6", name: "Sophia Kim", initials: "SK", color: "#f97316" }
];

export const defaultProfile = {
  id: "profile-1",
  name: "My Profile",
  initials: "MP",
  color: "#a855f7"
};

export const defaultTeams = [
  {
    id: "team-1",
    name: "Product Team",
    memberIds: ["member-1", "member-2", "member-3", "member-4"]
  },
  {
    id: "team-2",
    name: "Growth Team",
    memberIds: ["member-5", "member-6"]
  }
];

export const defaultLabels = [
  { id: "label-1", name: "Design", color: "#22c55e" },
  { id: "label-2", name: "Backend", color: "#60a5fa" },
  { id: "label-3", name: "Urgent", color: "#ef4444" },
  { id: "label-4", name: "Research", color: "#a78bfa" },
  { id: "label-5", name: "Content", color: "#f97316" },
  { id: "label-6", name: "QA", color: "#14b8a6" }
];

export const initialState = {
  activeBoardId: "board-1",
  activeTeamId: "team-1",
  profile: defaultProfile,
  members: defaultMembers,
  teams: defaultTeams,
  labels: defaultLabels,
  boards: [
    {
      id: "board-1",
      title: "Product Launch Sprint",
      background: themeBackground("trello-purple"),
      lists: [
        {
          id: "list-1",
          title: "Backlog",
          cards: [
            {
              id: "card-1",
              title: "Design hero section for launch page",
              description:
                "Create a polished hero section with headline, product mockup, supporting copy, and primary CTA variants for desktop and mobile.",
              labelIds: ["label-1", "label-5"],
              dueDate: tomorrow.toISOString(),
              memberIds: ["member-1", "member-6"],
              archived: false,
              checklist: [
                { id: "item-1", text: "Collect inspiration references", completed: true },
                { id: "item-2", text: "Create desktop layout", completed: true },
                { id: "item-3", text: "Adapt for tablet and mobile", completed: false },
                { id: "item-4", text: "Share design review link", completed: false }
              ],
              comments: [
                {
                  id: "comment-1",
                  author: "Maya Chen",
                  text: "Try keeping the headline concise so the mockup remains the visual focus.",
                  createdAt: now.toISOString()
                },
                {
                  id: "comment-2",
                  author: "Sophia Kim",
                  text: "I added new product screenshots in the shared folder for the hero card.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [
                {
                  id: "attachment-1",
                  name: "Launch copy brief.pdf",
                  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                  mimeType: "text/uri-list",
                  size: null,
                  createdAt: now.toISOString()
                },
                {
                  id: "attachment-2",
                  name: "Hero visual reference",
                  url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                  mimeType: "image/jpeg",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover:
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
              activity: ["Card created", "Checklist updated", "Attachment added", "Design review requested"]
            },
            {
              id: "card-2",
              title: "Finalize API payload for board persistence",
              description:
                "Review the board save contract so lists, cards, members, comments, and attachments remain in sync with the backend.",
              labelIds: ["label-2", "label-3"],
              dueDate: inThreeDays.toISOString(),
              memberIds: ["member-2", "member-5"],
              archived: false,
              checklist: [
                { id: "item-5", text: "Validate reorder payload", completed: true },
                { id: "item-6", text: "Check archived card behavior", completed: false },
                { id: "item-7", text: "Document API edge cases", completed: false }
              ],
              comments: [
                {
                  id: "comment-3",
                  author: "Jordan Lee",
                  text: "Need to preserve active board selection after save.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [
                {
                  id: "attachment-3",
                  name: "API schema notes",
                  url: "https://jsonplaceholder.typicode.com/posts/1",
                  mimeType: "application/json",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover:
                "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
              activity: ["Members assigned", "Backend spec reviewed"]
            }
          ]
        },
        {
          id: "list-2",
          title: "In Progress",
          cards: [
            {
              id: "card-3",
              title: "Implement board filters",
              description:
                "Support search by title and filters for due date, labels, and assigned members without breaking card movement.",
              labelIds: ["label-2", "label-6"],
              dueDate: inSixDays.toISOString(),
              memberIds: ["member-2", "member-4"],
              archived: false,
              checklist: [
                { id: "item-8a", text: "Label filter", completed: true },
                { id: "item-8", text: "Member filter", completed: true },
                { id: "item-9", text: "Due date filter", completed: false }
              ],
              comments: [
                {
                  id: "comment-4",
                  author: "Noah Patel",
                  text: "Looks good. Just make sure drag and drop pauses only while filters are active.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [
                {
                  id: "attachment-4",
                  name: "Filter acceptance criteria.doc",
                  url: "https://example.com/filter-acceptance-criteria",
                  mimeType: "text/uri-list",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover: "",
              activity: ["Members assigned", "Checklist updated"]
            },
            {
              id: "card-4",
              title: "Upload photo attachments for showcase cards",
              description:
                "Enable image uploads from the card detail modal so reviewers can attach screenshots, references, and assets directly to tasks.",
              labelIds: ["label-1", "label-2"],
              dueDate: nextWeek.toISOString(),
              memberIds: ["member-3", "member-5"],
              archived: false,
              checklist: [
                { id: "item-10", text: "Hook file picker to card modal", completed: true },
                { id: "item-11", text: "Store data URL preview", completed: true },
                { id: "item-12", text: "Display attachment count on card", completed: false }
              ],
              comments: [
                {
                  id: "comment-5",
                  author: "Ava Singh",
                  text: "We should include at least one image attachment in the sample data for the demo.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [
                {
                  id: "attachment-5",
                  name: "Board preview.png",
                  url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
                  mimeType: "image/jpeg",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover:
                "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
              activity: ["Attachment added", "Cover image set"]
            }
          ]
        },
        {
          id: "list-3",
          title: "Review",
          cards: [
            {
              id: "card-5",
              title: "QA drag and drop",
              description:
                "Validate list ordering, cross-column movement, and card reordering on desktop, tablet, and narrow laptop widths.",
              labelIds: ["label-3", "label-6"],
              dueDate: "",
              memberIds: ["member-1", "member-4"],
              archived: false,
              checklist: [
                { id: "item-13", text: "Desktop interaction pass", completed: true },
                { id: "item-14", text: "Tablet interaction pass", completed: false },
                { id: "item-15", text: "Regression check with filters", completed: false }
              ],
              comments: [
                {
                  id: "comment-6",
                  author: "Noah Patel",
                  text: "The list reorder flow feels smooth now. Need one more pass on filtered states.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [],
              cover: "",
              activity: ["Card moved to Review", "QA checklist expanded"]
            },
            {
              id: "card-6",
              title: "Review background theme presets",
              description:
                "Compare the Trello-like blue preset, purple gradient, and custom color mode to make sure they all preserve readability.",
              labelIds: ["label-1", "label-4"],
              dueDate: inSixDays.toISOString(),
              memberIds: ["member-6"],
              archived: false,
              checklist: [
                { id: "item-16", text: "Check board header contrast", completed: true },
                { id: "item-17", text: "Check card legibility", completed: false }
              ],
              comments: [],
              attachments: [
                {
                  id: "attachment-6",
                  name: "Theme comparison board.jpg",
                  url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                  mimeType: "image/jpeg",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover: "",
              activity: ["Background options reviewed"]
            }
          ]
        },
        {
          id: "list-4",
          title: "Done",
          cards: [
            {
              id: "card-7",
              title: "Seed member directory",
              description:
                "Added default sample members for assignment and filtering across the board so the product demo feels complete.",
              labelIds: ["label-4"],
              dueDate: "",
              memberIds: ["member-4"],
              archived: false,
              checklist: [
                { id: "item-18", text: "Add avatars and initials", completed: true },
                { id: "item-19", text: "Link members to sample cards", completed: true }
              ],
              comments: [
                {
                  id: "comment-7",
                  author: "Jordan Lee",
                  text: "This makes the board feel much more realistic for reviewers.",
                  createdAt: now.toISOString()
                }
              ],
              attachments: [],
              cover: "",
              activity: ["Card completed"]
            }
          ]
        }
      ]
    },
    {
      id: "board-2",
      title: "Marketing Campaign Board",
      background: themeBackground("trello-classic"),
      lists: [
        {
          id: "list-5",
          title: "Ideas",
          cards: [
            {
              id: "card-8",
              title: "Collect launch testimonials",
              description:
                "Reach out to pilot users and gather short quotes we can use in social cards and the landing page.",
              labelIds: ["label-5", "label-4"],
              dueDate: nextWeek.toISOString(),
              memberIds: ["member-6", "member-1"],
              archived: false,
              checklist: [
                { id: "item-20", text: "Draft outreach message", completed: false },
                { id: "item-21", text: "Confirm approvals", completed: false }
              ],
              comments: [],
              attachments: [
                {
                  id: "attachment-7",
                  name: "Testimonial ideas board",
                  url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
                  mimeType: "image/jpeg",
                  size: null,
                  createdAt: now.toISOString()
                }
              ],
              cover:
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
              activity: ["Card created"]
            }
          ]
        },
        {
          id: "list-6",
          title: "Scheduled",
          cards: [
            {
              id: "card-9",
              title: "Publish launch teaser thread",
              description:
                "Prepare teaser copy, visual assets, and posting schedule for the release week social thread.",
              labelIds: ["label-5", "label-3"],
              dueDate: inThreeDays.toISOString(),
              memberIds: ["member-2", "member-3"],
              archived: false,
              checklist: [
                { id: "item-22", text: "Write copy", completed: true },
                { id: "item-23", text: "Attach visuals", completed: true },
                { id: "item-24", text: "Schedule posts", completed: false }
              ],
              comments: [],
              attachments: [],
              cover: "",
              activity: ["Posting schedule drafted"]
            }
          ]
        }
      ]
    }
  ]
};

export function cloneState(state) {
  return structuredClone(state);
}
