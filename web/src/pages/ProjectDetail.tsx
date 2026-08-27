import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

const unwrap = (value: any) => value?.properties ?? value ?? {};

export function ProjectDetail() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch(() => api.project(id!), [id]);
  if (loading) return <Loading message="Loading project…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const p = unwrap(data?.p ?? data);
  const technologies = (data?.technologies ?? []).map((x: any) => unwrap(x));
  const developers = (data?.developers ?? []).map((x: any) => unwrap(x));
  const organization = unwrap(data?.organization);

  return (
    <div className="space-y-6">
      <Link className="text-sm text-indigo-600 hover:text-indigo-800" to="/projects">← Projects</Link>
      <section className="card">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div><div className="eyebrow">PROJECT NODE</div><h1 className="text-3xl font-bold mt-1">{p.name}</h1><p className="text-sm text-slate-500 mt-2">{p.status ?? 'Active'} {organization.name ? `· ${organization.name}` : ''}</p></div>
          <div className="pill">Connected ecosystem</div>
        </div>
      </section>
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="card"><div className="eyebrow">TECH STACK</div><h2 className="text-xl font-semibold mt-1">Technologies</h2><div className="flex flex-wrap gap-2 mt-5">{technologies.map((t: any) => <Link className="pill" key={t.id} to={`/technologies/${t.id}`}>{t.name}</Link>)}</div></section>
        <section className="card"><div className="eyebrow">PEOPLE</div><h2 className="text-xl font-semibold mt-1">Developers</h2><div className="space-y-3 mt-5">{developers.map((d: any) => <Link className="flex items-center gap-3 hover:bg-slate-50 rounded-xl p-2" key={d.id} to={`/developers/${d.id}`}><div className="avatar">{d.name?.[0] ?? '?'}</div><div><div className="font-semibold">{d.name}</div><div className="text-xs text-slate-500">{d.title}</div></div></Link>)}</div></section>
      </div>
    </div>
  );
}
