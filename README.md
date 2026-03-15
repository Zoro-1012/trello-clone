# 🚀 TaskOrbit Board

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.2.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-6.5.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel" />
</div>

<div align="center">
  <h3>🎯 A Powerful Trello-Inspired Kanban Board Built with Modern Web Technologies</h3>
  <p>Manage your projects with style! Create boards, organize tasks, collaborate with teams, and track progress with an intuitive drag-and-drop interface.</p>
</div>

---

## 📸 Screenshots

<div align="center">
  <img src="./screenshots/board-overview.png" alt="Board Overview" width="80%" />
  <p><em>Main board view with multiple lists and cards</em></p>
</div>

<div align="center">
  <img src="./screenshots/card-detail.png" alt="Card Detail Modal" width="80%" />
  <p><em>Detailed card view with comments, attachments, and checklists</em></p>
</div>


---

## ✨ Features

### 🎨 Core Functionality
- ✅ **Multiple Boards**: Create and switch between different project boards
- ✅ **Drag & Drop**: Smooth card and list reordering with visual feedback
- ✅ **Real-time Updates**: Instant synchronization across all connected clients
- ✅ **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📋 Task Management
- ✅ **Card Operations**: Create, edit, archive, and delete cards
- ✅ **Rich Descriptions**: Support for formatted text and markdown
- ✅ **Due Dates**: Set and track deadlines with visual indicators
- ✅ **Checklists**: Break down tasks into manageable subtasks
- ✅ **Labels**: Color-coded categorization system
- ✅ **Cover Images**: Add visual context to cards

### 👥 Collaboration
- ✅ **Team Members**: Add and manage workspace members
- ✅ **Card Assignment**: Assign members to specific tasks
- ✅ **Comments**: Threaded discussions on cards
- ✅ **Attachments**: Upload files and add links
- ✅ **Activity Logs**: Track all changes and updates

### 🎭 Customization
- ✅ **Board Themes**: Multiple background options including Trello Classic
- ✅ **Custom Colors**: Personalize with color picker
- ✅ **Member Avatars**: Custom initials and color schemes
- ✅ **Dark/Light Modes**: Adaptive theming (planned)

### 🔍 Advanced Features
- ✅ **Search**: Find cards by title instantly
- ✅ **Filtering**: Filter by labels, members, due dates, and status
- ✅ **Keyboard Shortcuts**: Power user shortcuts for efficiency
- ✅ **Export/Import**: Data portability options

---

## 🛠️ Tech Stack

### Frontend
- **⚡ Next.js 15** - React framework with App Router
- **⚛️ React 18** - UI library with hooks and concurrent features
- **🎨 CSS Modules** - Scoped styling with responsive design
- **🎯 @hello-pangea/dnd** - Advanced drag-and-drop functionality
- **📅 date-fns** - Modern date utility library
- **🎭 Lucide React** - Beautiful icon library

### Backend
- **🟢 Node.js** - Runtime environment
- **🔄 Next.js API Routes** - Serverless API endpoints
- **🗄️ Prisma ORM** - Type-safe database operations
- **🐘 PostgreSQL** - Robust relational database
- **☁️ Neon** - Serverless PostgreSQL hosting

### DevOps & Tools
- **🚀 Vercel** - Deployment and hosting platform
- **📦 npm** - Package management
- **🎯 ESLint** - Code quality and linting
- **🔧 Prisma CLI** - Database management
- **📝 Git** - Version control

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskorbit-board.git
   cd taskorbit-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Database Setup (Optional)

For full persistence, set up PostgreSQL:

1. **Create a Neon database** (or any PostgreSQL instance)
2. **Add environment variable**
   ```bash
   echo "DATABASE_URL=your_postgresql_connection_string" > .env
   ```
3. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

---

## 📖 Usage

### Creating Your First Board
1. Click the **"Add Board"** button
2. Choose a background theme
3. Start adding lists and cards

### Managing Tasks
- **Add Lists**: Click "Add List" to create columns
- **Create Cards**: Click "Add Card" within any list
- **Drag & Drop**: Move cards between lists or reorder them
- **Edit Details**: Click any card to open the detail modal

### Collaboration
- **Add Members**: Use the member panel to add team members
- **Assign Tasks**: Drag members onto cards
- **Add Comments**: Discuss tasks directly on cards
- **Attach Files**: Upload images, documents, or links

---

## 🏗️ Project Structure

```
taskorbit-board/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── backend/               # Backend logic
│   ├── board-repository.js # Data access layer
│   ├── prisma.js         # Database client
│   └── store.js          # In-memory fallback
├── frontend/              # Frontend components
│   ├── components/        # Reusable UI components
│   └── styles/           # Component styles
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.js          # Database seeding
├── public/               # Static assets
└── shared/               # Shared utilities
    ├── board-state.js    # Initial state
    └── board-themes.js   # Theme definitions
```

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed the database
```

### Database Commands

```bash
npx prisma studio     # Open Prisma Studio
npx prisma db push    # Push schema changes
npx prisma generate   # Generate Prisma client
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Manual Deployment

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Trello** for the inspiration and design patterns
- **Vercel** for amazing deployment platform
- **Neon** for serverless PostgreSQL
- **Prisma** for the excellent ORM
- **Next.js** team for the fantastic framework

---

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: goyalnipurn203@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Zoro-1012/taskorbit-board/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Zoro-1012/taskorbit-board/discussions)

---

<div align="center">
  <p>Made with ❤️ using Next.js, React, and Prisma</p>
  <p>
    <a href="#taskorbit-board">Back to top</a>
  </p>
</div>
