import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { Badge } from '../components/Badge.js';

const unwrap = (value: any) => value?.properties ?? value ?? {};

export function DeveloperDetail() {
  const { id } = useParams();
  const base = useFetch(() => api.developer(id!), [id]);
  const tech = useFetch(() => api.developerTech(id!), [id]);
  const collab = useFetch(() => api.collaborators(id!), [id]);

  if (base.loading) return <Loading message="Loading developer…" />;
  if (base.error) return <ErrorState message={base.error} onRetry={base.refetch} />;

  const d = unwrap(base.data?.d ?? base.data);
  const technologies = (tech.data?.technologies ?? []).map((x: any) => unwrap(x.t ?? x));
  const collaborators = (collab.data?.collaborators ?? []).map((x: any) => ({ person: unwrap(x.other ?? x), shared: x.shared }));

  return (
    <div className="space-y-6">
      <Link className="text-sm text-indigo-600 hover:text-indigo-800" to="/developers">← Developers</Link>
      <section className="hero-mini">
        <div className="avatar-large">{d.name?.[0] ?? '?'}</div>
        <div className="min-w-0">
          <div className="eyebrow eyebrow-on-dark">DEVELOPER PROFILE</div>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 truncate">{d.name ?? 'Developer'}</h1>
          <p className="hero-copy mt-2">{d.title ?? 'Engineering professional'} {d.location ? `· ${d.location}` : ''}</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5">
        <section className="card">
          <div className="eyebrow">BACKGROUND</div>
          <h2 className="text-xl font-semibold mt-1">Experience</h2>
          <p className="text-sm text-slate-600 leading-7 mt-4">{d.bio ?? 'No biography provided.'}</p>
          {d.github && (
            <a className="btn-secondary mt-5" href={`https://github.com/${d.github}`} target="_blank" rel="noreferrer">GitHub profile ↗</a>
          )}
        </section>

        <section className="card">
          <div className="eyebrow">GRAPH CONTEXT</div>
          <h2 className="text-xl font-semibold mt-1">Connected technologies</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {technologies.length ? technologies.map((t: any) => (
              <Link key={t.id} to={`/technologies/${t.id}`}><Badge>{t.name}</Badge></Link>
            )) : <p className="text-sm text-slate-500">No connected technologies found.</p>}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="eyebrow">COLLABORATION SIGNAL</div>
        <h2 className="text-xl font-semibold mt-1">Potential collaborators</h2>
        <p className="text-sm text-slate-500 mt-1">People connected through shared projects or skills.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
          {collaborators.length ? collaborators.map(({ person, shared }: any) => (
            <Link className="compare-card hover:shadow-md transition-shadow" key={person.id} to={`/developers/${person.id}`}>
              <div className="flex items-center gap-3">
                <div className="avatar">{person.name?.[0] ?? '?'}</div>
                <div className="min-w-0"><div className="font-semibold truncate">{person.name}</div><div className="text-xs text-slate-500 truncate">{person.title}</div></div>
              </div>
              <div className="text-xs text-slate-500 mt-4">{shared} shared connection{shared === 1 ? '' : 's'}</div>
            </Link>
          )) : <p className="text-sm text-slate-500">No collaborator matches yet.</p>}
        </div>
      </section>
    </div>
  );
}
