# Interview Notes — DevGraph

## 1. Why I chose this use case

A Developer Knowledge Graph is the ideal graph-native use case because the core questions are inherently about multi-hop relationships: "What technologies has this developer used across their projects?", "Who could collaborate with whom based on shared tech?", and "How are two developers connected through any path?" These questions require traversing 2–6 hops through different entity types — exactly what graph databases excel at and what relational databases find awkward.

## 2. Why graph database instead of PostgreSQL/MySQL

- **Multi-hop traversals** (Developer→Project→Technology) are single Cypher patterns. In SQL, they require multiple JOINs, and at 4+ hops become recursive CTEs.
- **Technology dependency trees** are recursive by nature (Next.js→React→JavaScript). `DEPENDS_ON*1..5` is native Cypher. Recursive CTEs in SQL are verbose and harder to tune.
- **Shortest path between developers** uses `shortestPath()` — a built-in graph function. In SQL, you'd need to build an adjacency list and implement BFS manually.
- **Relationships are first-class** — They have types and properties. `COLLABORATED_WITH`, `WORKED_ON` with `since`/`role` properties are directly queryable without join tables.

## 3. Node/relationship model explanation

**Nodes:** Developer, Project, Technology, Skill, Organization — each with an `id` (unique constraint) and meaningful properties.

**Relationships:**
- `WORKED_ON` (Developer→Project) with `since` and `role` — captures project history
- `USES` (Project→Technology) — project tech stack
- `HAS_SKILL` (Developer→Technology) with `proficiency` (1–5) — distinguishes tech expertise from project usage
- `KNOWS_SKILL` (Developer→Skill) — soft skills
- `WORKED_AT` (Developer→Organization) — employment
- `OWNS` (Organization→Project) — project ownership
- `DEPENDS_ON` (Technology→Technology) — recursive dependency graph
- `COLLABORATED_WITH` (Developer→Developer) — peer connections

The model separates `HAS_SKILL` (technology proficiency) from `USES` (project tech stack) because a developer might know React well but not use it in their current project. This distinction enables richer collaborator discovery.

## 4. Multi-hop query explanations

**Query A** `(Developer)-[:WORKED_ON]->(Project)-[:USES]->(Technology)`: Two-hop traversal finding all technologies a developer has used. In SQL: JOIN developers↔projects, JOIN projects↔technologies.

This finds the shortest path between two developers through any combination of relationship types — projects, technologies, skills, or direct collaborations. The | syntax combines multiple relationship types in one pattern, and *1..6 allows variable-length traversal. In SQL, this would require: building an adjacency structure, implementing BFS with backtracking, tracking visited nodes, and supporting heterogeneous edge types. It's genuinely awkward.

6. Frontend/backend stack choice
Frontend: React + TypeScript + Vite + Tailwind. Vite gives instant HMR; TypeScript catches type errors; Tailwind enables fast, consistent design without CSS overhead. React Flow was chosen for graph visualization because it's React-native (no wrapper needed) and supports custom node styling.

Backend: Node.js + Express + TypeScript. The official neo4j-driver for JavaScript is first-class and well-documented. Express is minimal and well-understood. TypeScript ensures the service layer is type-safe. The monorepo structure (server/ + web/) keeps concerns separated while sharing the same repo.

7. Major engineering tradeoffs
Centralized query registry vs. inline queries: Centralized is easier to audit and document, but queries are strings (not compile-time checked). Tradeoff accepted for auditability.
Repository pattern: Adds an indirection layer, but isolates driver concerns to one file. Easy to mock for tests.
No ORM: Using raw Cypher via the driver. Graph databases don't have great ORMs, and raw Cypher is more expressive and auditable.
React Flow vs. Cytoscape: React Flow has simpler React integration but weaker auto-layout. For our dataset size (~15 neighbors), it's adequate.
8. Error-handling strategy
Database unreachable: Server still starts. checkHealth() returns status: 'down'. API endpoints that need the DB return 503 with a user-friendly message. The frontend shows a banner.
Validation errors: Zod schemas at the API boundary. Returns 400 with specific field errors.
Not found: 404 with resource name and ID.
Internal errors: 500 with a generic message in production (stack trace in dev only). Logged server-side with structured logging.
No stack traces or credentials exposed to the client. The error handler sanitizes all responses.
9. Security considerations
No secrets in code: All credentials from environment variables. .env in .gitignore.
Parameterized Cypher: Every query uses $param. No string concatenation. Centralized in the query registry for easy auditing.
Input validation: Zod validates and sanitizes all API input. IDs are regex-checked (^[a-zA-Z0-9_-]+$).
CORS: Configured to allow only the frontend origin(s).
Helmet: Sets security headers (XSS protection, content type sniffing, etc.).
Rate limiting: 100 requests per minute per IP on API routes.
No unsafe HTML rendering: React's JSX escapes by default.
10. Scaling beyond the free tier
Connection pooling: Already configured (maxConnectionPoolSize: 50). Scale up for higher concurrency.
Read replicas: CognoDB supports read replicas for query-heavy workloads. Route read-only queries to replicas.
Caching: Add Redis for frequently-accessed stats and search results. The dashboard stats are a good cache candidate.
Pagination: Currently uses LIMIT. Add cursor-based pagination for large result sets.
Full-text search: Already using CognoDB's full-text index. Could add a dedicated search service (Elasticsearch/Meilisearch) for fuzzy search at scale.
Frontend: Vite build is already static. Deploy to a CDN (Vercel/Cloudflare Pages). No scaling concerns.
11. What I'd improve with another week
Better graph layout: Use Dagre or ELK for automatic, deterministic graph layout in the explorer.
Collaborator recommendations with ML: Use graph embeddings (Node2Vec) or GNN-based link prediction for smarter collaborator suggestions.
Authentication: Add user accounts so developers can claim and edit their profiles.
Real-time updates: WebSocket subscriptions for graph changes.
Export/share: Allow users to share a specific graph view via URL.
More seed data: Expand to 100+ developers for a more compelling demo.
Performance benchmarks: Add a /api/benchmarks endpoint that times each query type.
Visual query builder: Let non-technical users build multi-hop queries visually.
12. Potential weaknesses
No authentication: Anyone can view all data. Not appropriate for production with sensitive info.
No pagination: Lists use LIMIT but no offset/cursor. Fine for the seed dataset, but wouldn't scale to thousands of developers.
Graph layout is randomized: React Flow's default layout places nodes randomly. A deterministic layout engine would be better.
No real-time updates: Data is static unless re-seeded. No subscription mechanism.
Single database instance: No failover. If CognoDB is down, the app degrades (gracefully, but still degrades).
Query E (shortestPath): shortestPath can be expensive on very large graphs. In production, add a depth limit and cache results.
Tests don't hit a real database: The integration tests check API structure and validation, but a full test database would be more thorough. This is a tradeoff to keep the test suite runnable without a CognoDB instance.
