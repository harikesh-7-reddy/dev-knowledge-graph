import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

const unwrap = (value: any) => value?.properties ?? value ?? {};

export function Technologies() {
  const { data, loading, error, refetch } = useFetch(() => api.technologies(50), []);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  const technologies = data?.technologies ?? [];
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">TECHNOLOGY NETWORK</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Technologies</h1>
        <p className="text-sm text-slate-500 mt-2">Explore dependency chains and the developers behind each technology.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technologies.map((row: any) => {
          const t = unwrap(row.t ?? row);
          return (
            <Link key={t.id} to={`/technologies/${t.id}`} className="card hover:shadow-md transition-shadow">
              <div className="text-xs uppercase tracking-wide text-indigo-600">{t.category || 'Technology'}</div>
              <div className="font-semibold text-lg mt-2">{t.name || t.id}</div>
              <div className="text-sm text-slate-500 mt-2 line-clamp-2">{t.description || 'Explore dependencies and connected developers.'}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
