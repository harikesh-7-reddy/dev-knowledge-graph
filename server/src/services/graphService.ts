import { repository } from '../db/repository.js';
function props(node: any) { return node?.properties ?? node ?? {}; }
export const graphService = {
  async neighbors(id: string, limit = 20) {
    const rows = await repository.run('GRAPH_NEIGHBORS', { id, limit });
    if (!rows.length) return { nodes: [], edges: [] };
    const nodes = new Map<string, any>(); const edges: any[] = [];
    for (const row of rows) {
      const c = props(row.center); const n = props(row.neighbor); if (c?.id) nodes.set(c.id, { id: c.id, label: c.name ?? c.id, type: row.centerType }); if (n?.id) nodes.set(n.id, { id: n.id, label: n.name ?? n.id, type: row.neighborType });
      if (c?.id && n?.id) edges.push({ id: `${row.relType}-${c.id}-${n.id}-${edges.length}`, source: row.outgoing ? c.id : n.id, target: row.outgoing ? n.id : c.id, label: row.relType });
    }
    return { nodes: [...nodes.values()], edges };
  },
  findPath: (fromId: string, toId: string) => repository.run('DEV_CONNECTION_PATH', { fromId, toId }).then(rows => rows[0] ?? null)
};
