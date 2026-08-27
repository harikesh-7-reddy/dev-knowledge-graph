import { getDriver, closeDriver } from '../db/driver.js';
import { logger } from '../utils/logger.js';

const developers = [
  ['dev-1','Alice Chen','Staff Engineer','Distributed systems architect','San Francisco, CA'],['dev-2','Marcus Johnson','Frontend Lead','React and accessibility specialist','Brooklyn, NY'],['dev-3','Priya Patel','ML Engineer','Production ML and NLP','London, UK'],['dev-4','Diego Ramirez','Backend Engineer','Go and Kubernetes expert','Berlin, DE'],['dev-5','Sofia Andersson','Full-Stack Engineer','TypeScript developer tooling','Stockholm, SE'],['dev-6','Kenji Tanaka','Platform Engineer','Infrastructure-as-code advocate','Tokyo, JP'],['dev-7','Olivia Brown','Senior Frontend Engineer','Real-time web and WebGL','Austin, TX'],['dev-8','Raj Mehta','Data Engineer','Streaming and lakehouse systems','Bangalore, IN'],['dev-9','Emma Wilson','DevOps Engineer','CI/CD and observability','Toronto, CA'],['dev-10','Liam OBrien','Mobile Engineer','React Native and Swift','Dublin, IE'],['dev-11','Yuki Sato','Security Engineer','Application security and zero trust','Singapore, SG'],['dev-12','Aisha Muhammad','Staff Backend Engineer','Microservices and event sourcing','Dubai, AE'],['dev-13','Tom Hendricks','Engineering Manager','Full-stack engineering leadership','Amsterdam, NL'],['dev-14','Nina Costa','Frontend Engineer','Vue and design systems','Lisbon, PT'],['dev-15','Arjun Gupta','Senior ML Engineer','Recommendation systems and vision','Seattle, WA'],['dev-16','Helena Volkov','Backend Engineer','Database internals and query optimization','Prague, CZ'],['dev-17','James Park','Full-Stack Engineer','SaaS and Next.js','Seoul, KR'],['dev-18','Fatima Al-Rashid','Senior Platform Engineer','Multi-region Kubernetes','Riyadh, SA'],['dev-19','Lucas Silva','Mobile Engineer','Flutter and Kotlin','Sao Paulo, BR'],['dev-20','Zara Ahmed','Staff Frontend Engineer','Web performance and edge computing','Cairo, EG']
].map(([id,name,title,bio,location])=>({id,name,title,bio,location}));

const organizations = [
  ['org-1','Northwind Labs','Developer Tools'],['org-2','Cipherwave','Fintech'],['org-3','DataNova','Data Infrastructure'],['org-4','PixelForge','Design Tools'],['org-5','Quantum Health','Healthcare']
].map(([id,name,industry])=>({id,name,industry}));

const technologies = [
  ['tech-react','React','Frontend'],['tech-typescript','TypeScript','Language'],['tech-node','Node.js','Backend'],['tech-python','Python','Language'],['tech-go','Go','Language'],['tech-rust','Rust','Language'],['tech-java','Java','Language'],['tech-next','Next.js','Frontend'],['tech-vite','Vite','Frontend'],['tech-tailwind','Tailwind CSS','Frontend'],['tech-postgres','PostgreSQL','Database'],['tech-neo4j','Neo4j','Database'],['tech-cogno','CognoDB','Database'],['tech-redis','Redis','Database'],['tech-kafka','Kafka','Data'],['tech-k8s','Kubernetes','Infrastructure'],['tech-docker','Docker','Infrastructure'],['tech-terraform','Terraform','Infrastructure'],['tech-pulumi','Pulumi','Infrastructure'],['tech-aws','AWS','Cloud'],['tech-gcp','GCP','Cloud'],['tech-github','GitHub','Tooling'],['tech-git','Git','Tooling'],['tech-graphql','GraphQL','API'],['tech-grpc','gRPC','API'],['tech-pytorch','PyTorch','ML'],['tech-fastapi','FastAPI','Backend'],['tech-reactnative','React Native','Mobile'],['tech-flutter','Flutter','Mobile']
].map(([id,name,category])=>({id,name,category}));

const projects = [
  ['proj-1','Atlas Developer Portal','active'],['proj-2','Signal Payments','active'],['proj-3','StreamLake','active'],['proj-4','Design Cloud','active'],['proj-5','Clinical Search','active'],['proj-6','Edge Analytics','active'],['proj-7','Fleet Control','active'],['proj-8','Graph Insights','active'],['proj-9','Mobile Wallet','active'],['proj-10','Identity Hub','active'],['proj-11','Realtime Canvas','active'],['proj-12','Data Quality Engine','active'],['proj-13','Recommendation API','active'],['proj-14','Platform Console','active'],['proj-15','Search Copilot','active']
].map(([id,name,status],i)=>({id,name,status,updatedAt:`2026-08-${String(27-i%20).padStart(2,'0')}T10:00:00.000Z`}));

const skills = ['skill-architecture','skill-frontend','skill-backend','skill-data','skill-security','skill-infrastructure','skill-ml','skill-mobile','skill-graphql','skill-observability'].map((id)=>({id,name:id.replace('skill-','')}));

const deps: [string,string][] = [
 ['tech-next','tech-react'],['tech-react','tech-typescript'],['tech-vite','tech-node'],['tech-node','tech-typescript'],['tech-fastapi','tech-python'],['tech-grpc','tech-go'],['tech-k8s','tech-docker'],['tech-terraform','tech-aws'],['tech-pulumi','tech-aws'],['tech-reactnative','tech-react'],['tech-flutter','tech-git'],['tech-pytorch','tech-python'],['tech-cogno','tech-neo4j'],['tech-neo4j','tech-java'],['tech-graphql','tech-node'],['tech-redis','tech-docker'],['tech-kafka','tech-docker'],['tech-gcp','tech-k8s'],['tech-aws','tech-docker'],['tech-postgres','tech-docker']
];

const projectTech: Record<string,string[]> = {
  'proj-1':['tech-react','tech-typescript','tech-node','tech-cogno'], 'proj-2':['tech-java','tech-kafka','tech-redis','tech-aws'], 'proj-3':['tech-python','tech-kafka','tech-gcp','tech-postgres'], 'proj-4':['tech-react','tech-typescript','tech-next'], 'proj-5':['tech-python','tech-fastapi','tech-pytorch'], 'proj-6':['tech-go','tech-grpc','tech-k8s'], 'proj-7':['tech-go','tech-k8s','tech-terraform'], 'proj-8':['tech-cogno','tech-neo4j','tech-typescript'], 'proj-9':['tech-reactnative','tech-typescript','tech-node'], 'proj-10':['tech-node','tech-graphql','tech-redis'], 'proj-11':['tech-react','tech-vite','tech-typescript'], 'proj-12':['tech-python','tech-postgres','tech-gcp'], 'proj-13':['tech-python','tech-pytorch','tech-fastapi'], 'proj-14':['tech-go','tech-k8s','tech-pulumi'], 'proj-15':['tech-next','tech-python','tech-cogno']
};
const developerProjects: Record<string,string[]> = {};
for (let i=1;i<=20;i++) developerProjects[`dev-${i}`]=[`proj-${((i-1)%15)+1}`,`proj-${(i%15)+1}`];

async function run(cypher:string, params:Record<string,unknown>={}) { const s=getDriver().session(); try { await s.run(cypher,params); } finally { await s.close(); } }

async function main(){
  if(process.argv.includes('--reset')) { await run('MATCH (n) DETACH DELETE n'); logger.info('Development graph cleared.'); }
  for (const q of [
    'CREATE CONSTRAINT dev_id IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT tech_id IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE',
    'CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE',
    'CREATE CONSTRAINT org_id IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE'
  ]) await run(q);
  await run('UNWIND $rows AS x MERGE (d:Developer {id:x.id}) SET d += x', {rows:developers});
  await run('UNWIND $rows AS x MERGE (o:Organization {id:x.id}) SET o += x', {rows:organizations});
  await run('UNWIND $rows AS x MERGE (t:Technology {id:x.id}) SET t += x', {rows:technologies});
  await run('UNWIND $rows AS x MERGE (p:Project {id:x.id}) SET p += x', {rows:projects});
  await run('UNWIND $rows AS x MERGE (s:Skill {id:x.id}) SET s += x', {rows:skills});
  await run('UNWIND $pairs AS pair MATCH (a:Technology {id:pair[0]}),(b:Technology {id:pair[1]}) MERGE (a)-[:DEPENDS_ON]->(b)', {pairs:deps});
  for (const [pid,tids] of Object.entries(projectTech)) for(const tid of tids) await run('MATCH (p:Project {id:$pid}),(t:Technology {id:$tid}) MERGE (p)-[:USES]->(t)',{pid,tid});
  for (const [did,pids] of Object.entries(developerProjects)) for(const pid of pids) await run('MATCH (d:Developer {id:$did}),(p:Project {id:$pid}) MERGE (d)-[:WORKED_ON]->(p)',{did,pid});
  for (let i=1;i<=20;i++) { const org=`org-${((i-1)%5)+1}`; await run('MATCH (d:Developer {id:$did}),(o:Organization {id:$oid}) MERGE (d)-[:WORKED_AT]->(o)',{did:`dev-${i}`,oid:org}); }
  const skillMap = [['dev-1','skill-architecture'],['dev-2','skill-frontend'],['dev-3','skill-ml'],['dev-4','skill-backend'],['dev-5','skill-frontend'],['dev-6','skill-infrastructure'],['dev-7','skill-frontend'],['dev-8','skill-data'],['dev-9','skill-observability'],['dev-10','skill-mobile'],['dev-11','skill-security'],['dev-12','skill-backend'],['dev-13','skill-architecture'],['dev-14','skill-frontend'],['dev-15','skill-ml'],['dev-16','skill-data'],['dev-17','skill-backend'],['dev-18','skill-infrastructure'],['dev-19','skill-mobile'],['dev-20','skill-frontend']];
  await run('UNWIND $pairs AS pair MATCH (d:Developer {id:pair[0]}),(s:Skill {id:pair[1]}) MERGE (d)-[:HAS_SKILL]->(s)',{pairs:skillMap});
  for(let i=1;i<=10;i++){const a=`dev-${i}`,b=`dev-${i+10}`; await run('MATCH (a:Developer {id:$a}),(b:Developer {id:$b}) MERGE (a)-[:COLLABORATED_WITH]->(b)',{a,b});}
  for(let i=1;i<=20;i++){const tid=technologies[(i*3)%technologies.length].id; await run('MATCH (d:Developer {id:$did}),(t:Technology {id:$tid}) MERGE (d)-[:HAS_SKILL]->(t)',{did:`dev-${i}`,tid});}
  logger.info(`Seed complete: ${developers.length} developers, ${projects.length} projects, ${technologies.length} technologies.`);
}
main().catch(err=>{logger.error('Seed failed',err);process.exitCode=1;}).finally(()=>closeDriver());
