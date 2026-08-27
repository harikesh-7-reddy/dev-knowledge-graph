import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

const unwrap = (value: any) => value?.properties ?? value ?? {};

export function TechnologyDetail() {
  const { id } = useParams();
  const t = useFetch(() => api.technology(id!), [id]);
  const d = useFetch(() => api.technologyDeps(id!), [id]);
  const dev = useFetch(() => api.technologyDevelopers(id!), [id]);
  const dependents = useFetch(() => api.technologyDependents(id!), [id]);

  if (t.loading) return <Loading message="Loading technology…" />;
  if (t.error) return <ErrorState message={t.error} onRetry={t.refetch} />;

  const tech = unwrap(t.data?.t ?? t.data);
  const deps = (d.data?.dependencies ?? []).map((x: any) => ({ dep: unwrap(x.dep ?? x), hops: x.hops }));
  const rev = (dependents.data?.dependents ?? []).map((x: any) => unwrap(x.dep ?? x));
  const developers = (dev.data?.developers ?? []).map((x: any) => unwrap(x.d ?? x));

  return (
    <div className="space-y-6">
      <Link className="text-sm text-indigo-600 hover:text-indigo-800" to="/technologies">← Technologies</Link>
      <section className="hero-mini">
        <div className="tech-icon">{tech.name?.slice(0, 2)?.toUpperCase() ?? 'TE'}</div>
        <div>
          <div className="eyebrow eyebrow-on-dark">TECHNOLOGY NODE</div>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">{tech.name ?? 'Technology'}</h1>
          <p className="hero-copy mt-2">{tech.category ?? 'Technology'} · dependency-aware exploration</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="card">
          <div className="eyebrow">DEPENDENCY CHAIN</div>
          <h2 className="text-xl font-semibold mt-1">Depends on</h2>
          <div className="space-y-3 mt-5">
            {deps.length ? deps.map(({ dep, hops }: any) => (
              <Link key={dep.id} className="tech-detail-row" to={`/technologies/${dep.id}`}>
                <span className="font-medium">{dep.name}</span>
                <span className="text-xs text-slate-500">{hops} hop{hops === 1 ? '' : 's'}</span>
              </Link>
            )) : <p className="text-sm text-slate-500">No dependencies found.</p>}
          </div>
        </section>

        <section className="card">
          <div className="eyebrow">REVERSE DEPENDENCIES</div>
          <h2 className="text-xl font-semibold mt-1">Used by</h2>
          <div className="flex flex-wrap gap-2 mt-5">
            {rev.length ? rev.map((x: any) => <Link key={x.id} className="pill" to={`/technologies/${x.id}`}>{x.name}</Link>) : <p className="text-sm text-slate-500">No dependent technologies found.</p>}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="eyebrow">PEOPLE NETWORK</div>
        <h2 className="text-xl font-semibold mt-1">Developers via projects</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
          {developers.length ? developers.map((person: any) => (
            <Link key={person.id} className="compare-card hover:shadow-md transition-shadow" to={`/developers/${person.id}`}>
              <div className="flex items-center gap-3"><div className="avatar">{person.name?.[0] ?? '?'}</div><div><div className="font-semibold">{person.name}</div><div className="text-xs text-slate-500">{person.title}</div></div></div>
            </Link>
          )) : <p className="text-sm text-slate-500">No developers connected through projects.</p>}
        </div>
      </section>
    </div>
  );
}
