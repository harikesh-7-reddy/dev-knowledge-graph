import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { StatCard } from '../components/StatCard.js';
import { SearchBar } from '../components/SearchBar.js';

function metric(value: unknown) {
  if (typeof value === 'number') return value;
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber();
  }
  if (value && typeof value === 'object' && 'low' in value && 'high' in value) {
    const v = value as { low: number; high: number };
    return v.low + v.high * 2 ** 32;
  }
  return Number(value ?? 0) || 0;
}

export function Dashboard() {
  const { data, loading, error, refetch } = useFetch(api.stats, []);
  if (loading) return <Loading message="Loading graph metrics…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const stats = (data?.stats ?? {}) as Record<string, unknown>;
  const topTechnologies = data?.topTechnologies ?? [];

  return (
    <div className="space-y-6">
      <section className="hero-panel">
        <div className="max-w-3xl">
          <div className="eyebrow eyebrow-on-dark">CONNECTED ENGINEERING INTELLIGENCE</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">Developer Knowledge Graph</h1>
          <p className="hero-copy mt-4">
            Find the people behind the stack, understand technology dependencies, and uncover the relationships
            that are easy to miss in a flat database.
          </p>
        </div>
        <div className="mt-8 max-w-5xl">
          <SearchBar />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="btn bg-white text-indigo-700 hover:bg-indigo-50" to="/explorer">
            Explore the network →
          </Link>
          <Link className="btn border border-white/25 text-white hover:bg-white/10" to="/developers">
            Meet the developers
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Developers" value={metric(stats.developers)} />
        <StatCard label="Projects" value={metric(stats.projects)} />
        <StatCard label="Technologies" value={metric(stats.technologies)} />
        <StatCard label="Skills" value={metric(stats.skills)} />
        <StatCard label="Relationships" value={metric(stats.relationships)} />
      </section>

      <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-5">
        <div className="card">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">GRAPH SIGNAL</div>
              <h2 className="text-xl font-semibold mt-1">Most connected technologies</h2>
              <p className="text-sm text-slate-500 mt-1">Where project relationships concentrate across the graph.</p>
            </div>
            <Link to="/technologies" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {topTechnologies.map((t: any, index: number) => (
              <Link key={t.name} to={`/technologies/${t.id}`} className="tech-row">
                <span className="tech-rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="block font-semibold truncate">{t.name}</span>
                  <span className="block text-xs text-slate-500 mt-1">{metric(t.projects)} connected projects</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card bg-slate-900 text-white border-slate-800">
          <div className="eyebrow eyebrow-on-dark">WHY GRAPH?</div>
          <h2 className="text-xl font-semibold mt-1">Relationships are the product.</h2>
          <p className="text-sm text-slate-300 mt-3 leading-6">
            A developer can know a technology through a project, a teammate, or a dependency chain. DevGraph keeps those
            paths connected so discovery does not stop at a single table join.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <div className="insight-pill">Developer → Project → Technology</div>
            <div className="insight-pill">Technology → dependency chain</div>
            <div className="insight-pill">Developer ↔ collaboration network</div>
          </div>
        </div>
      </section>
    </div>
  );
}
