*This project has been created as part of the 42 curriculum by mohilali, asedoun, sel-aada.*

# 🏓 WebPong - ft_transcendence

A modern multiplayer Pong game web application with real-time gameplay, tournaments, chat system, and user management.

---

## 📋 Description

**WebPong** is a full-stack web application that recreates the classic Pong game with modern features. Players can compete in real-time matches, join tournaments, chat with friends, and track their progress through a leveling system.

### Key Features
- 🎮 Real-time Pong & Tic-Tac-Toe games
- 🏆 Tournament system with brackets
- 💬 Real-time chat & messaging
- 👥 Friend system with requests/blocking
- 🔐 Two-factor authentication (OTP via email)
- 📊 Player statistics & leaderboards
- 🎨 Modern responsive UI

---

## 👥 Team Information

| Member | Role | Responsibilities |
|--------|------|------------------|
| mohilali | Tech Lead / Developer | Backend architecture, API development, database design |
| asedoun | Developer | Frontend development, UI/UX implementation |
| sel-aada | PO / Developer | Feature coordination, game logic, testing |

---

## 📁 Project Management

- **Task Distribution**: GitHub Issues for task tracking
- **Meetings**: Weekly sync meetings + daily standups when needed
- **Tools**: GitHub Projects for Kanban board
- **Communication**: Discord for daily communication

---

## 🛠 Technical Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS | Modern React framework with SSR support |
| **Backend** | Fastify, Node.js, TypeScript | Fast and lightweight server framework |
| **Database** | SQLite (better-sqlite3) | Simple, file-based, no external dependencies |
| **Real-time** | Socket.IO | Reliable WebSocket implementation for games & chat |
| **Auth** | JWT + Google OAuth | Secure token-based auth with social login |
| **Monitoring** | Prometheus + Grafana | Industry-standard observability stack |
| **Reverse Proxy** | Nginx | SSL termination, load balancing |
| **Containerization** | Docker + Docker Compose | Consistent deployment environment |

---

## 🗄 Database Schema

```
players ─────────┬──── player_infos
                 ├──── player_otps
                 ├──── game_stats
                 ├──── game_history
                 ├──── friends
                 ├──── message
                 ├──── block
                 ├──── attendance
                 └──── tournament_players ──── tournaments
```

**Main Tables:**
- `players` - User accounts (username, email, password, level, XP, 2FA settings)
- `friends` - Friend relationships (pending/accepted/blocked)
- `game_stats` - Win/loss statistics per player
- `game_history` - Match records with scores
- `tournaments` - Tournament metadata
- `message` - Chat messages between players

---

## ✨ Features List

| Feature | Description | Contributor(s) |
|---------|-------------|----------------|
| User Authentication | Sign up, login, Google OAuth, 2FA | mohilali |
| Real-time Pong Game | Multiplayer Pong with Socket.IO | asedoun, sel-aada |
| Tic-Tac-Toe | Alternative game mode | sel-aada |
| Tournament System | Create/join tournaments with brackets | mohilali, asedoun |
| Chat System | Real-time messaging between friends | asedoun |
| Friend Management | Send requests, accept, block users | mohilali |
| Player Profiles | Stats, level progression, avatars | sel-aada |
| Leaderboard | Global player rankings | mohilali |
| Monitoring Dashboard | Grafana + Prometheus metrics | asedoun |

---

## 📦 Modules

| Module | Type | Points | Description | Contributor(s) |
|--------|------|--------|-------------|----------------|
| Backend Framework (Fastify) | Major | 2 | RESTful API with Fastify | mohilali |
| Frontend Framework (Next.js) | Major | 2 | React-based SPA with SSR | asedoun |
| Database Integration | Minor | 1 | SQLite with proper schema | mohilali |
| User Management | Major | 2 | Auth, profiles, 2FA | mohilali, sel-aada |
| Real-time Multiplayer | Major | 2 | Socket.IO game implementation | asedoun, sel-aada |
| Chat System | Major | 2 | Real-time messaging | asedoun |
| Monitoring (Prometheus/Grafana) | Minor | 1 | Metrics and dashboards | asedoun |
| Docker Deployment | Minor | 1 | Full containerization | mohilali |
| Another Game (Tic-Tac-Toe) | Minor | 1 | Additional game mode | sel-aada |

**Total Points**: 14 pts (7 Major + 7 Minor)

---

## 🚀 Instructions

### Prerequisites
- Docker & Docker Compose
- Make (optional, for convenience)
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/ApplexX7/WebPong-Game.git
cd WebPong-Game
```

2. Configure environment files in `/env/`:
   - `api.env` - Backend settings (JWT secrets, email config, Google OAuth)
   - `client.env` - Frontend settings (API URL)
   - `grafana.env` - Grafana admin credentials

3. Build and run:
```bash
docker-compose up --build
```

4. Access the application:
   - **App**: https://localhost:443
   - **Grafana**: http://localhost:4000 (for monitoring)

---

## 👤 Individual Contributions

### mohilali
- Designed and implemented backend API architecture
- Set up database schema and migrations
- Implemented authentication system with 2FA
- Docker configuration and deployment setup

### asedoun
- Built the entire frontend UI with Next.js
- Implemented real-time game rendering
- Chat interface and Socket.IO integration
- Set up monitoring with Grafana dashboards

### sel-aada
- Developed game logic for Pong and Tic-Tac-Toe
- Tournament bracket system
- Player statistics and leaderboard features
- Testing and bug fixes

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

### AI Usage
AI tools (GitHub Copilot) were used for:
- Code autocompletion and boilerplate generation
- Debugging assistance
- Documentation writing support

All AI-generated code was reviewed and adapted by team members.

---

## 📄 License

This project is part of the 42 school curriculum and is for educational purposes.
