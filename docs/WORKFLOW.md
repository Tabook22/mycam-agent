# Hybrid Workflow: Hermes Agent + Claude Code

## Overview

This project uses a two-brain hybrid workflow:

```
┌─────────────────────────────────────────────────────────────┐
│                    Local Machine (Windows)                   │
│                                                             │
│   ┌──────────────────┐        ┌──────────────────────────┐  │
│   │  Hermes Agent    │        │      Claude Code         │  │
│   │  (The Brain)     │───────▶│      (The Builder)       │  │
│   │                  │ plans  │                          │  │
│   │  • Think         │ & docs │  • Write code            │  │
│   │  • Plan          │        │  • Refactor              │  │
│   │  • Document      │◀───────│  • Debug                 │  │
│   │  • Remember      │ lessons│  • Test                  │  │
│   │  • Learn         │        │  • Deploy                │  │
│   └──────────────────┘        └──────────────────────────┘  │
│                                          │                   │
│                                          │ git push          │
│                                          ▼                   │
│                                   ┌──────────┐              │
│                                   │  GitHub  │              │
│                                   └──────────┘              │
└──────────────────────────────────────────┬──────────────────┘
                                           │ git pull
                                           ▼
                              ┌────────────────────────┐
                              │   Hostinger VPS         │
                              │   76.13.124.173         │
                              │   user: nasser          │
                              │                         │
                              │   Production App        │
                              └────────────────────────┘
```

---

## Role Definitions

### Hermes = The Brain
Hermes never writes production code. It acts as:
- **CEO** — Sets direction and priorities
- **Architect** — Designs systems and APIs
- **Product Manager** — Defines requirements and features
- **Documentation Manager** — Maintains project memory
- **Learning Engine** — Records lessons after every milestone

### Claude Code = The Builder
Claude Code never plans — it executes. It acts as:
- **Senior Software Engineer** — Writes production-quality code
- **Backend Developer** — FastAPI, Python, database
- **Frontend Developer** — React, Vite, Tailwind CSS
- **DevOps Assistant** — Docker, deployment, scripts
- **Debugger** — Diagnoses and fixes issues
- **Refactoring Expert** — Keeps code clean and maintainable

### GitHub = Version Control
All code changes flow through GitHub before reaching production.

### Hostinger VPS = Production
- IP: `76.13.124.173`
- User: `nasser`
- Path: `/opt/mycam-agent`

---

## Daily Workflow

### Phase 1 — Think in Hermes

Open Hermes. Prompt it to analyze requirements and generate:

```
Analyze the next development milestone.

Create:
- Clear feature requirements
- Architecture decisions
- API specification changes
- Database schema changes
- Task list for Claude Code

Store in docs/ and update memory.
```

Hermes creates / updates:
- `docs/REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/API_SPEC.md`
- `docs/ROADMAP.md`

---

### Phase 2 — Build in Claude Code

Open Claude Code in the project directory. Prompt it to implement the Hermes plan:

```
Read:
- docs/ARCHITECTURE.md
- docs/API_SPEC.md

Implement Phase [X] exactly as specified.
Follow the existing code style.
Run tests after changes.
```

Claude Code:
- Writes backend (FastAPI, Python)
- Writes frontend (React, Tailwind)
- Runs the dev server to verify UI
- Fixes bugs it discovers

---

### Phase 3 — Local Testing

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm run dev
```

Verify:
- API endpoints work at http://localhost:8000/docs
- Frontend loads at http://localhost:5174
- Camera stream works
- Payment detection works

---

### Phase 4 — Commit and Push to GitHub

Claude Code stages and commits:

```bash
git add backend/ frontend/ docs/
git commit -m "feat: implement Phase X — [description]"
git push origin main
```

---

### Phase 5 — Deploy to Hostinger VPS

```bash
# SSH into VPS
ssh nasser@76.13.124.173

# Go to project
cd /opt/mycam-agent

# Pull latest code
git pull origin main

# Activate Python environment
source .venv/bin/activate

# Install any new dependencies
pip install -r backend/requirements.txt

# Restart services
sudo systemctl restart mycam-agent
sudo systemctl restart mycam-agent-frontend  # if separate

# Verify
systemctl status mycam-agent
```

Or use the automated deploy script:

```bash
# From your local machine
ssh nasser@76.13.124.173 'bash /opt/mycam-agent/deployment/deploy.sh'
```

---

### Phase 6 — Learn in Hermes

After every milestone, return to Hermes:

```
The following milestone is complete:
[describe what was built]

What worked: [observations]
What failed: [issues encountered]
What should be improved: [improvements]

Update:
- MEMORY.md
- LESSONS.md
- ROADMAP.md (mark completed, plan next)
```

---

## Key Differences from Cursor Workflow

| Aspect | Old (Cursor) | New (Claude Code) |
|--------|-------------|-------------------|
| Editor | Cursor IDE | Terminal / any editor |
| AI access | Cursor AI inline | Claude Code CLI |
| Context | File-level | Full codebase awareness |
| Memory | None | Persistent memory system |
| Commands | In-editor chat | `/` commands + natural language |
| Git integration | Manual | Can commit/push directly |
| Multi-file | Limited | Full project editing |

---

## Golden Rule

> **Hermes creates knowledge.**  
> **Claude Code creates software.**  
> **GitHub stores history.**  
> **Hostinger VPS runs production.**

Every completed task returns to Hermes, which updates memory, skills, lessons, and generates the next task.
