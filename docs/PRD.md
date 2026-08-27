# DevGraph — Product Requirements Document

## 1. Product Summary
DevGraph is a developer knowledge graph application that helps users discover relationships between developers, projects, technologies, skills, and organizations. The product is intentionally graph-native: its highest-value workflows depend on multi-hop traversal, dependency chains, indirect connections, collaborator discovery, and shortest-path exploration.

## 2. Problem Statement
Traditional CRUD interfaces answer isolated questions such as “What is this developer’s title?” but become cumbersome when a user asks relationship-heavy questions: which technologies a developer has encountered through projects, which developers have used a technology indirectly, what a technology depends on recursively, who could collaborate with a developer, or how two developers are connected. DevGraph makes those relationships first-class and explorable.

## 3. Goals
- Provide a polished web application understandable to a non-technical user.
- Demonstrate concrete advantages of a graph database over a relational model for relationship-centric use cases.
- Support search, profiles, dependency exploration, collaborator discovery, and graph visualization.
- Keep CognoDB credentials server-side and all Cypher user input parameterized.
- Provide realistic seed data and a maintainable architecture suitable for an interview submission.

## 4. Target Users
### Recruiter / Talent Partner
Find developers with relevant technology experience and inspect their project context.

### Engineering Manager
Discover potential collaborators and understand team/project/technology relationships.

### Developer
Explore technology ecosystems, dependency chains, and connected engineers.

## 5. Core User Journeys
1. Search for a developer, technology, project, or organization.
2. Open a developer profile and inspect connected projects and technologies.
3. Select multiple developers and compare their profiles side by side.
4. Open a technology and traverse dependency relationships.
5. Find developers connected to a technology through project experience.
6. Explore a selected entity in the interactive graph explorer.
7. Discover potential collaborators based on shared projects, technologies, and skills.
8. Find a connection path between two developers.

## 6. Functional Requirements
### Search
- Search across developers, projects, technologies, organizations, and skills.
- Validate query length and result limits.
- Return friendly errors when the database is unavailable.

### Developer Experience
- Browse developers.
- View developer detail.
- Show connected projects, technologies, skills, and organization context.
- Allow 2–4 developers to be selected for side-by-side comparison.
- Show collaborator recommendations.

### Technology Experience
- Browse technologies.
- View technology detail.
- Show recursive dependency relationships.
- Show reverse dependents.
- Show developers with project-based experience in the technology.

### Project Experience
- Browse projects.
- View project detail.
- Show connected developers, technologies, and organization context.

### Graph Explorer
- Select an entity.
- Display neighboring nodes and typed relationships visually.
- Support pan, zoom, node dragging, fit-to-view, and minimap controls.
- Keep the graph bounded so it remains readable.

### Reliability and Security
- Health endpoint for CognoDB connectivity.
- Graceful 503 responses for database failures.
- Environment-based secrets.
- Zod input validation.
- Parameterized Cypher.
- CORS, Helmet, and API rate limiting.

## 7. Graph Data Model
### Nodes
- Developer: id, name, title, bio, location, github
- Project: id, name, description, status, createdAt
- Technology: id, name, category, description
- Skill: id, name
- Organization: id, name, industry, founded, size, description

### Relationships
- Developer -[:WORKED_ON]-> Project
- Project -[:USES]-> Technology
- Developer -[:HAS_SKILL]-> Technology
- Developer -[:KNOWS_SKILL]-> Skill
- Developer -[:WORKED_AT]-> Organization
- Organization -[:OWNS]-> Project
- Technology -[:DEPENDS_ON]-> Technology
- Developer -[:COLLABORATED_WITH]-> Developer

## 8. Key Graph Queries
### Query A — Developer → Project → Technology
Question: What technologies has a developer encountered through projects they worked on?

### Query B — Technology → Project → Developer
Question: Which developers have experience with a selected technology through project work?

### Query C — Recursive Technology Dependencies
Question: What technologies are reachable through a dependency chain up to a bounded depth?

### Query D — Collaboration Discovery
Question: Which developers share projects, technologies, or skills with a selected developer?

### Query E — Shortest Connection Path
Question: What is the shortest relationship path between two developers through mixed graph relationship types?

## 9. Technical Architecture
React + TypeScript + Vite + Tailwind CSS + React Flow → REST API → Node.js + Express + TypeScript → repository/service layers → official Neo4j JavaScript driver → CognoDB.

## 10. Non-Functional Requirements
- Responsive layout.
- Clear loading, empty, and error states.
- No database credentials exposed to the browser.
- Parameterized database access only.
- Production-safe error responses.
- Maintainable separation between routes, services, repository, queries, configuration, and seed logic.

## 11. Seed Data Requirements
The development dataset should remain realistic and small enough for a free tier. The current dataset targets 20 developers, 15 projects, 29 technologies, plus skills, organizations, dependencies, and overlapping relationships.

## 12. Acceptance Criteria
- A user can search and open developers, technologies, and projects.
- A user can inspect multi-hop relationships.
- A user can compare 2–4 developers.
- A user can explore a graph visually.
- Technology dependency traversal works.
- Collaboration discovery works.
- Shortest-path discovery works.
- CognoDB credentials are environment-based.
- Important Cypher is parameterized.
- Seed is repeatable.
- Health and graceful database error handling work.
- The project builds successfully.
- Final submission excludes secrets, dependencies, and generated build directories.

## 13. Submission Readiness
Before submitting: run tests and lint locally, capture final screenshots, deploy backend and frontend, replace README placeholders, record the demo, and push only source/configuration/documentation files.
