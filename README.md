# DevGraph — Developer Knowledge Graph
A web application that explores relationships between developers, projects, technologies, skills, and organizations using CognoDB, a managed graph database compatible with openCypher over Bolt. The application demonstrates why graph databases genuinely earn their place when the interesting questions are about multi-hop connections, dependency chains, and collaborator discovery.

## Why a Graph Database?
A relational database models entities as rows in separate tables and expresses relationships through foreign keys and JOINs. That works for simple lookups, but our application's core questions are relationship-centric and multi-hop:

Question	Relational approach	Graph approach
"What technologies has a developer used across all their projects?"	JOIN developers→projects, then JOIN projects→technologies. Two JOINs, readable.	MATCH (d:Developer)-[:WORKED_ON]->(p)-[:USES]->(t) — one pattern.
"Find all technologies in Next.js's dependency tree (recursive)."	Recursive CTE in PostgreSQL. Awkward, verbose, and hard to tune.	MATCH path = (t)-[:DEPENDS_ON*1..5]->(dep) — variable-length path, native.
"Find potential collaborators through shared projects, tech, and skills."	Three separate JOINs across join tables, then UNION, then aggregate. Complex.	One MATCH pattern with OPTIONAL MATCH clauses, scored in Cypher.
"Find the shortest connection path between two developers."	Requires recursive traversal with backtracking. Extremely awkward in SQL.	shortestPath() — a built-in Cypher function. Trivial.
Concrete advantages for this application:

Multi-hop traversal — "Developer → Project → Technology" is a single Cypher pattern. In SQL it's two JOINs; at 4+ hops it becomes recursive CTEs.
Relationship-centric discovery — Relationships are first-class citizens with types and properties. COLLABORATED_WITH, DEPENDS_ON, WORKED_ON are queryable directly.
Finding indirect connections — "Who has experience with React through their projects?" traverses Technology ← Project ← Developer naturally.
Traversing technology dependencies — DEPENDS_ON*1..5 walks the dependency tree in one expression. Recursive CTEs in SQL are painful.
Collaboration discovery — Scoring developers by shared projects + technologies + skills is a single Cypher query with collect() and size().
Recommendation-style queries — "Shortest path between two developers" uses shortestPath(), a graph-native operation.
## Features
Dashboard — overview with live stats, top technologies, and recent activity.
Global search — full-text search across developers, projects, technologies, organizations, and skills.
Developer profiles — projects, technologies (multi-hop), skills, organization, and potential collaborators.
Technology profiles — recursive dependency trees, reverse dependents, and developers with experience.
Project profiles — team members, tech stack, owning organization.
Graph Explorer — interactive React Flow visualization with entity selection.
Developer Connection Finder — shortest path between two developers through mixed relationship types.
Collaborator discovery — scored recommendations based on shared projects, technologies, and skills.
## Architecture
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│ Frontend │────▶│ Backend │────▶│ CognoDB │
│ React/Vite │ HTTP│ Express/TS │ Bolt│ (Graph DB) │
│ Tailwind │ │ Repository │ │ openCypher │
│ React Flow │ │ Services │ │ │
└─────────────┘ └──────────────┘ └──────────────┘

text


**Frontend** (`web/`): React + TypeScript + Vite + Tailwind CSS. React Flow for graph visualization. Communicates with the backend via REST API. No database credentials ever reach the browser.

**Backend** (`server/`): Node.js + Express + TypeScript. Uses the official `neo4j-driver` (JavaScript) to connect to CognoDB over Bolt. Clean layering: routes → services → repository → Cypher queries.

**Database**: CognoDB (managed graph database). Speaks openCypher over Bolt 5.0–5.4. Accessed via the official Neo4j JavaScript driver — no custom SDK needed.

### Key design decisions

- **Centralized Cypher registry** (`server/src/queries/index.ts`): All queries live in one place, parameterized, and documented. Easy to review for injection safety.
- **Repository pattern**: The `Repository` class is the only component that touches the driver. Services call `repository.run('QUERY_KEY', params)`.
- **Zod validation**: All API input is validated before reaching the database.
- **Graceful degradation**: The server starts even if CognoDB is unreachable. Database-dependent endpoints return 503 with a user-friendly message.

---

## Data Model

### Diagram

┌──────────────┐
│ Organization │
│ id, name, │
│ industry │
└──────┬───────┘
OWNS │ ▲ WORKED_AT
▼ │
┌──────────┐ WORKED_ON ┌──────────┐ USES ┌──────────────┐
│ Developer │───────────▶│ Project │───────▶│ Technology │
│ id, name, │◀───────────│ id, name, │ │ id, name, │
│ title, bio│ │ status │ │ category │
└─────┬────┘ └──────────┘ └──────┬───────┘
│ │
│ HAS_SKILL ┌──────────┐ DEPENDS_ON │ (recursive)
└──────────────────────│ Skill │◀─────────────┘
│ id, name │
└──────────┘

Developer ─COLLABORATED_WITH─▶ Developer (peer-to-peer)
Developer ──KNOWS_SKILL──────▶ Skill

text


### Nodes

| Label | Key Properties |
|---|---|
| `Developer` | `id`, `name`, `title`, `bio`, `location`, `github` |
| `Project` | `id`, `name`, `description`, `status`, `createdAt` |
| `Technology` | `id`, `name`, `category`, `description` |
| `Skill` | `id`, `name` |
| `Organization` | `id`, `name`, `industry`, `founded`, `size`, `description` |

### Relationships

| Type | From → To | Properties | Purpose |
|---|---|---|---|
| `WORKED_ON` | Developer → Project | `since`, `role` | Project membership |
| `USES` | Project → Technology | — | Tech stack |
| `HAS_SKILL` | Developer → Technology | `proficiency` (1–5) | Tech proficiency |
| `KNOWS_SKILL` | Developer → Skill | — | Soft skills |
| `WORKED_AT` | Developer → Organization | — | Employment |
| `OWNS` | Organization → Project | — | Project ownership |
| `DEPENDS_ON` | Technology → Technology | — | Recursive dependency chain |
| `COLLABORATED_WITH` | Developer → Developer | — | Peer collaboration |

---

## Example Graph Queries

### Query A — Developer → Project → Technology (multi-hop)

**Question:** "What technologies has a developer used across all their projects?"

```cypher
MATCH (d:Developer {id: $id})-[:WORKED_ON]->(p:Project)-[:USES]->(t:Technology)
RETURN t.id, t.name, t.category, collect(DISTINCT p.name) AS projects
ORDER BY projectCount DESC
Why it matters: A 2-hop traversal. In SQL this requires joining developers, developer_project, projects, project_technology, and technologies — five tables. In Cypher it's one pattern.

Query B — Technology → Projects → Developers (reverse)
Question: "Which developers have experience with a technology through their projects?"

cypher

MATCH (t:Technology {id: $id})<-[:USES]-(p:Project)<-[:WORKED_ON]-(d:Developer)
RETURN d, collect(DISTINCT p) AS projects
Why it matters: Reverse multi-hop discovery. Finding developers who indirectly know a technology.

Query C — Technology dependency traversal (recursive)
Question: "What does this technology depend on, recursively, up to 5 hops?"

cypher

MATCH path = (t:Technology {id: $id})-[:DEPENDS_ON*1..5]->(dep:Technology)
RETURN dep, length(path) AS depth, [n IN nodes(path) | n.name] AS chain
Why it matters: Variable-length path traversal. In SQL this is a recursive CTE — verbose and hard to tune. DEPENDS_ON*1..5 is native Cypher.

Query D — Collaboration discovery
Question: "Who could collaborate with this developer, based on shared projects, technologies, and skills?"

cypher

MATCH (d:Developer {id: $id})
OPTIONAL MATCH (d)-[:WORKED_ON]->(p)<-[:WORKED_ON]-(collab)
OPTIONAL MATCH (d)-[:HAS_SKILL]->(t)<-[:HAS_SKILL]-(collab2)
...
RETURN candidate, sharedProjects, sharedTechnologies, sharedSkills,
       size(...) AS connectionScore
ORDER BY connectionScore DESC
Why it matters: Scoring developers by multi-dimensional overlap. In SQL, three separate JOINs, UNIONs, and aggregation.

Query E — Relationally awkward: shortest path between developers
Question: "How are two developers connected through any combination of projects, technologies, skills, and collaborations?"

cypher

MATCH (d1:Developer {id: $fromId}), (d2:Developer {id: $toId})
CALL {
  WITH d1, d2
  MATCH path = shortestPath((d1)-[:WORKED_ON|HAS_SKILL|KNOWS_SKILL|COLLABORATED_WITH*1..6]-(d2))
  RETURN path LIMIT 1
}
RETURN nodes(path), relationships(path), length(path) AS hops
Why it matters: shortestPath() with mixed relationship types and variable length. This is the quintessential graph-native query — finding the shortest connection through any path type. In SQL, this requires building an adjacency structure and implementing BFS in application code or recursive CTEs with manual path tracking. It's genuinely awkward.

## Tech Stack
Layer
Technology
Frontend	React 18, TypeScript, Vite, Tailwind CSS, React Flow
Backend	Node.js, Express, TypeScript
Database	CognoDB (managed graph database, openCypher / Bolt)
Driver	Official neo4j-driver (JavaScript)
Validation	Zod
Testing	Vitest, Supertest
Deployment	Render (backend), Vercel (frontend)

## Local Setup
Prerequisites
Node.js 18+ and npm
A CognoDB Cloud account (free tier, no credit card)
1. Clone the repository
bash

git clone https://github.com/<your-username>/dev-knowledge-graph.git
cd dev-knowledge-graph
2. Install dependencies
bash

npm run install:all
This installs root, server/, and web/ dependencies.

3. Create a CognoDB Cloud instance
Go to console.cognodb.com/signup and sign up.
From the console, create a free (c0) instance and pick a region. It provisions in under a minute.
Save your connection details:
URI: bolt+s://<instance-id>.databases.cognodb.cloud
Username: cognodb
Password: shown exactly once — copy it immediately.
4. Configure environment variables
Copy the example files and fill in your CognoDB credentials:

bash

cp server/.env.example server/.env
cp web/.env.example web/.env
Edit server/.env:

bash

COGNODB_URI=bolt+s://your-instance-id.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-password
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
Edit web/.env (for local development, the Vite proxy handles /api routing, so you can leave the default):

bash

VITE_API_URL=http://localhost:4000/api
5. Seed the database
bash

npm run seed
This creates constraints, indexes, and inserts 20 developers, 15 projects, 29 technologies, 10 skills, 8 organizations, and all their relationships.

To reset and reseed:

bash

npm run seed:reset
6. Run the application
In one terminal, start both frontend and backend:

bash

npm run dev
Or separately:

bash

# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd web && npm run dev
Frontend: http://localhost:5173
Backend API: http://localhost:4000/api
Health check: http://localhost:4000/api/health
## Environment Variables
Variable
Where
Required
Description
COGNODB_URI	server/.env	✅	CognoDB Bolt URI (bolt+s://...)
COGNODB_USERNAME	server/.env	✅	Database username (cognodb)
COGNODB_PASSWORD	server/.env	✅	Database password
PORT	server/.env	❌	Backend port (default: 4000)
NODE_ENV	server/.env	❌	development or production
CORS_ORIGIN	server/.env	❌	Allowed CORS origins (comma-separated)
VITE_API_URL	web/.env	❌	Backend API URL for the frontend

See .env.example files for reference. Never commit .env files.

## Seed Data
The seed script (server/src/scripts/seed.ts) is idempotent:

npm run seed — Creates constraints/indexes, checks if data exists, and only inserts if the database is empty.
npm run seed:reset — Clears all nodes and relationships, then re-seeds from scratch.
The seed data includes:

20 developers with realistic titles, bios, and locations
15 projects across 8 organizations with statuses
29 technologies across 8 categories (Language, Frontend, Backend, Database, Infrastructure, ML, etc.)
10 skills (System Design, Technical Leadership, etc.)
8 organizations across different industries
20 technology dependency edges forming realistic chains (Next.js → React → JavaScript)
40 WORKED_ON relationships with roles and dates
50+ HAS_SKILL relationships with proficiency levels
40+ USES relationships linking projects to technologies
17 COLLABORATED_WITH relationships between developers
## Running Tests
bash

# From the server directory (or root)
cd server && npm test

# Watch mode
cd server && npm run test:watch
Tests cover:

Health endpoint behavior (200 when connected, 503 when down)
Input validation (Zod schemas)
API route responses (including 400/404/503 states)
Cypher query structure (parameterization, multi-hop patterns, shortestPath usage)
## Deployment
Backend → Render
Push your code to GitHub.
Go to render.com and create a new Web Service.
Connect your GitHub repository.
Configure:
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start
Environment Variables: Add COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD, NODE_ENV=production, CORS_ORIGIN=https://your-frontend.vercel.app
Deploy.
Frontend → Vercel
Go to vercel.com and import your GitHub repository.
Configure:
Root Directory: web
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Environment Variables: VITE_API_URL=https://your-backend.onrender.com/api
Deploy.
Why these platforms?
Render: Free tier supports Node.js web services with environment variables. Simple, reliable.
Vercel: Optimal for Vite/React static builds. Free tier with global CDN.
## Screenshots
Note: Replace these placeholders with actual screenshots after running the application.

Dashboard — docs/screenshots/dashboard.png
Developer Profile — docs/screenshots/developer-detail.png
Technology Detail with Dependency Tree — docs/screenshots/technology-detail.png
Graph Explorer — docs/screenshots/graph-explorer.png
Developer Connection Finder — docs/screenshots/path-finder.png
Search — docs/screenshots/search.png
## Project Structure
text

dev-knowledge-graph/
├── README.md
├── INTERVIEW_NOTES.md
├── .env.example
├── package.json                # root workspace
├── server/                     # backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   └── env.ts          # environment configuration
│       ├── db/
│       │   ├── driver.ts       # Neo4j/CognoDB driver singleton
│       │   ├── health.ts        # database health check
│       │   └── repository.ts   # data-access layer
│       ├── queries/
│       │   └── index.ts        # centralized Cypher registry
│       ├── services/           # business logic
│       │   ├── developerService.ts
│       │   ├── technologyService.ts
│       │   ├── projectService.ts
│       │   ├── graphService.ts
│       │   ├── searchService.ts
│       │   └── statsService.ts
│       ├── routes/             # Express route handlers
│       │   ├── health.ts
│       │   ├── search.ts
│       │   ├── developers.ts
│       │   ├── technologies.ts
│       │   ├── projects.ts
│       │   ├── organizations.ts
│       │   ├── graph.ts
│       │   └── stats.ts
│       ├── middleware/
│       │   └── errorHandler.ts # global error handler
## Demo
Hosted application: <your Vercel URL>

## Video
Screen recording: <your Loom/YouTube URL>

## Engineering Decisions
Monorepo with separate server/ and web/ packages — Clear separation of concerns. Each has its own package.json and tsconfig.json. No build tooling coupling.
Centralized Cypher registry — All queries live in server/src/queries/index.ts. This makes it trivial to audit for parameterization (no string concatenation) and to document each query's purpose. The tradeoff: queries are strings, not type-checked at compile time. Acceptable for a project this size.
Repository pattern — The Repository class is the only component that touches the Neo4j driver. Services call repository.run('QUERY_KEY', params). This means swapping the driver or adding caching only affects one file.
Zod for validation — Type-safe runtime validation at the API boundary. Catches malformed input before it reaches the database.
Graceful degradation — The server starts even if CognoDB is unreachable. Startup logs a warning; database-dependent endpoints return 503. The health endpoint reports status. The frontend shows a banner when the database is down.
React Flow for visualization — Chosen over Cytoscape.js for its React-native API and simpler integration. Tradeoff: React Flow's auto-layout is basic; for large graphs, a dedicated layout engine (Dagre) would be needed. For this dataset size (~15 neighbors per query), it's fine.
Official Neo4j driver — CognoDB is wire-compatible with Bolt 5.0–5.4. The official JavaScript driver works with no modifications. No custom SDK or adapter needed.
## Final Verification Checklist
 Functional web application
 CognoDB connection works
 Official Neo4j driver used
 Environment-based database credentials
 No secrets committed
 Thoughtful graph schema (5 node types, 8 relationship types)
 Data model diagram (above)
 Realistic seed data (20 developers, 15 projects, 29 technologies)
 Repeatable seed script (idempotent, with --reset)
 Parameterized Cypher (all queries use $param)
 At least one 2+ hop traversal (Query A: Developer→Project→Technology)
 At least one relationally awkward query (Query E: shortestPath with mixed rel types)
 Functional UI for a non-technical user
 Clean intentional UX (Tailwind, consistent design system)
 Loading states
 Empty states
 Error states
 Graceful database failure handling (503 + banner)
 README completed
 Screenshots included (add after running)
 Tests included and passing
 Production build succeeds
 Deployment instructions documented
 Hosted demo ready (deploy then add URL)
 Screen-recording plan ready
 Interview notes completed
