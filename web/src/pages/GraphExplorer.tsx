import { FormEvent, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

export function GraphExplorer() {
  const [id, setId] = useState('dev-1');
  const { data, loading, error, refetch } = useFetch(() => api.neighbors(id), [id]);

  const flowNodes = useMemo<Node[]>(() => {
    const source = data?.nodes ?? [];
    const center = id;
    const angleStep = source.length ? (Math.PI * 2) / source.length : 0;
    return source.map((node: any, index: number) => {
      const isCenter = node.id === center;
      const radius = 260;
      return {
        id: node.id,
        position: isCenter
          ? { x: 420, y: 250 }
          : { x: 420 + Math.cos(index * angleStep) * radius, y: 250 + Math.sin(index * angleStep) * radius },
        data: { label: node.label, type: node.type },
        style: {
          borderRadius: 16,
          padding: '12px 14px',
          minWidth: 150,
          background: isCenter ? '#111827' : '#ffffff',
          color: isCenter ? '#ffffff' : '#0f172a',
          border: isCenter ? '1px solid #111827' : '1px solid #e2e8f0',
          boxShadow: '0 8px 25px rgba(15, 23, 42, 0.08)',
          fontWeight: 600
        }
      };
    });
  }, [data, id]);

  const flowEdges = useMemo<Edge[]>(() => (data?.edges ?? []).map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.source === id || edge.target === id,
    style: { strokeWidth: 1.6 },
    labelStyle: { fontSize: 11, fontWeight: 600 }
  })), [data, id]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    refetch();
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">RELATIONSHIP EXPLORER</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Graph Explorer</h1>
        <p className="text-sm text-slate-500 mt-2">Choose an entity ID and visually inspect its neighborhood.</p>
      </div>

      <form className="card flex flex-col md:flex-row gap-3" onSubmit={submit}>
        <input className="field flex-1" value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. dev-1, tech-react, proj-1" />
        <button className="btn-primary" type="submit">Explore relationship map</button>
      </form>

      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <section className="card p-2 overflow-hidden">
          <div className="graph-toolbar">
            <div>
              <div className="font-semibold">{data?.nodes?.length ?? 0} entities · {data?.edges?.length ?? 0} relationships</div>
              <div className="text-xs text-slate-500 mt-1">Click, pan, and zoom to explore. Relationship labels stay on the edges.</div>
            </div>
            <div className="text-xs text-slate-500 hidden md:block">Center: <span className="font-medium text-slate-900">{id}</span></div>
          </div>
          <div className="graph-canvas">
            <ReactFlow nodes={flowNodes} edges={flowEdges} fitView>
              <MiniMap pannable zoomable />
              <Controls />
              <Background gap={24} size={1} />
            </ReactFlow>
          </div>
        </section>
      )}
    </div>
  );
}
