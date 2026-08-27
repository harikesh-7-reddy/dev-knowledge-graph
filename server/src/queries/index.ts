/** Parameterized Cypher registry. User input is always passed through $params. */
export const QUERIES = {
  CREATE_CONSTRAINTS: [
    'CREATE CONSTRAINT dev_id IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT tech_id IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE',
    'CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE',
    'CREATE CONSTRAINT org_id IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE',
    'CREATE INDEX dev_name IF NOT EXISTS FOR (d:Developer) ON (d.name)',
    'CREATE INDEX tech_name IF NOT EXISTS FOR (t:Technology) ON (t.name)',
    'CREATE INDEX proj_name IF NOT EXISTS FOR (p:Project) ON (p.name)'
  ],
  SEARCH: `MATCH (n) WHERE toLower(n.name) CONTAINS toLower($term) OR toLower(coalesce(n.bio,'')) CONTAINS toLower($term) RETURN labels(n)[0] AS type, n.id AS id, n.name AS name, coalesce(n.bio,n.description,'') AS summary LIMIT $limit`,
  ALL_DEVELOPERS: `MATCH (d:Developer) RETURN d ORDER BY d.name LIMIT $limit`,
  DEVELOPER_BY_ID: `MATCH (d:Developer {id:$id}) OPTIONAL MATCH (d)-[:WORKED_AT]->(o:Organization) RETURN d, o AS organization`,
  DEVELOPER_TECHNOLOGIES: `MATCH (d:Developer {id:$id})-[:WORKED_ON]->(:Project)-[:USES]->(t:Technology) RETURN DISTINCT t ORDER BY t.name`,
  COLLABORATORS: `MATCH (d:Developer {id:$id}) MATCH (d)-[:WORKED_ON|HAS_SKILL]->(x)<-[:WORKED_ON|HAS_SKILL]-(other:Developer) WHERE other <> d WITH other, count(*) AS shared ORDER BY shared DESC LIMIT $limit RETURN other, shared`,
  ALL_TECHNOLOGIES: `MATCH (t:Technology) RETURN t ORDER BY t.name LIMIT $limit`,
  TECHNOLOGY_BY_ID: `MATCH (t:Technology {id:$id}) RETURN t`,
  TECHNOLOGY_DEPENDENCY_TREE: `MATCH (t:Technology {id:$id})-[r:DEPENDS_ON*1..5]->(dep:Technology) RETURN DISTINCT dep, length(r) AS hops ORDER BY hops, dep.name LIMIT $limit`,
  TECHNOLOGY_REVERSE_DEPENDENTS: `MATCH (t:Technology {id:$id})<-[:DEPENDS_ON*1..5]-(dep:Technology) RETURN DISTINCT dep LIMIT $limit`,
  TECHNOLOGY_DEVELOPERS: `MATCH (t:Technology {id:$id})<-[:USES]-(:Project)<-[:WORKED_ON]-(d:Developer) RETURN DISTINCT d ORDER BY d.name`,
  ALL_PROJECTS: `MATCH (p:Project) RETURN p ORDER BY p.name LIMIT $limit`,
  PROJECT_BY_ID: `MATCH (p:Project {id:$id}) OPTIONAL MATCH (d:Developer)-[:WORKED_ON]->(p) OPTIONAL MATCH (p)-[:USES]->(t:Technology) OPTIONAL MATCH (p)-[:OWNED_BY]->(o:Organization) RETURN p, collect(DISTINCT d) AS developers, collect(DISTINCT t) AS technologies, collect(DISTINCT o)[0] AS organization`,
  ALL_ORGANIZATIONS: `MATCH (o:Organization) RETURN o ORDER BY o.name`,
  GRAPH_NEIGHBORS: `MATCH (center {id:$id}) OPTIONAL MATCH (center)-[r]-(neighbor) RETURN center, labels(center)[0] AS centerType, neighbor, labels(neighbor)[0] AS neighborType, type(r) AS relType, startNode(r).id = center.id AS outgoing LIMIT $limit`,
  DEV_CONNECTION_PATH: `MATCH (a:Developer {id:$fromId}),(b:Developer {id:$toId}) MATCH p=shortestPath((a)-[:WORKED_ON|HAS_SKILL|COLLABORATED_WITH*1..6]-(b)) RETURN [n IN nodes(p) | {id:n.id,name:n.name,type:labels(n)[0]}] AS nodes, [r IN relationships(p) | {type:type(r)}] AS relationships`,
  STATS: `CALL { MATCH (n:Developer) RETURN count(n) AS developers } CALL { MATCH (n:Project) RETURN count(n) AS projects } CALL { MATCH (n:Technology) RETURN count(n) AS technologies } CALL { MATCH (n:Skill) RETURN count(n) AS skills } CALL { MATCH (n:Organization) RETURN count(n) AS organizations } MATCH ()-[r]->() RETURN developers, projects, technologies, skills, organizations, count(r) AS relationships`,
  RECENT_ACTIVITY: `MATCH (d:Developer)-[:WORKED_ON]->(p:Project) RETURN d.name AS developer, p.name AS project, p.updatedAt AS updatedAt ORDER BY p.updatedAt DESC LIMIT $limit`,
  TOP_TECHNOLOGIES: `MATCH (p:Project)-[:USES]->(t:Technology) RETURN t.id AS id, t.name AS name, count(*) AS projects ORDER BY projects DESC LIMIT $limit`
} as const;
