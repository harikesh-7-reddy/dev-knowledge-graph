import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

const unwrap = (value: any) => value?.properties ?? value ?? {};

export function Projects() {
  const { data, loading, error, refetch } = useFetch(() => api.projects(50), []);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  const projects = data?.projects ?? [];
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">PROJECT NETWORK</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Projects</h1>
        <p className="text-sm text-slate-500 mt-2">Follow the projects that connect developers and technologies.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((row: any) => {
          const p = unwrap(row.p ?? row);
          return (
            <Link className="card hover:shadow-md transition-shadow" key={p.id} to={`/projects/${p.id}`}>
              <div className="font-semibold text-lg">{p.name || p.id}</div>
              <div className="text-xs text-indigo-600 uppercase tracking-wide mt-2">{p.status || 'Active'}</div>
              <div className="text-sm text-slate-500 mt-2 line-clamp-2">{p.description || 'Explore the people and technologies connected to this project.'}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
