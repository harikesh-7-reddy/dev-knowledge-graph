import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { EmptyState } from '../components/EmptyState.js';

export function Developers() {
  const { data, loading, error, refetch } = useFetch(() => api.developers(50), []);
  const [selected, setSelected] = useState<string[]>([]);
  const rows = data?.developers ?? [];
  const people = useMemo(() => rows.map((row: any) => row.d ?? row), [rows]);
  const selectedPeople = people.filter((person: any) => selected.includes(person.id));

  const toggle = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : current.length < 4 ? [...current, id] : current);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!people.length) return <EmptyState title="No developers found" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="eyebrow">PEOPLE NETWORK</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Developers</h1>
          <p className="text-sm text-slate-500 mt-2">Select 2–4 people to compare their roles, experience, and graph context side by side.</p>
        </div>
        <div className="selected-count">{selected.length} selected <span>·</span> max 4</div>
      </div>

      {selectedPeople.length >= 2 && (
        <section className="card border-indigo-100 bg-indigo-50/60">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <div className="eyebrow">SIDE-BY-SIDE VIEW</div>
              <h2 className="text-xl font-semibold mt-1">Compare selected developers</h2>
              <p className="text-sm text-slate-500 mt-1">A calmer layout for 2–4 people, without stacking dense profile cards.</p>
            </div>
            <button className="btn-secondary" onClick={() => setSelected([])}>Clear selection</button>
          </div>
          <div className="compare-grid mt-5">
            {selectedPeople.map((d: any) => (
              <article className="compare-card" key={d.id}>
                <div className="flex items-start gap-3">
                  <div className="avatar-large">{d.name?.[0] ?? '?'}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{d.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{d.title}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-6 mt-4 line-clamp-4">{d.bio}</p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{d.location}</span>
                  <Link to={`/developers/${d.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Profile →</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {people.map((d: any) => {
          const active = selected.includes(d.id);
          return (
            <article className={`card developer-card ${active ? 'developer-card-selected' : ''}`} key={d.id}>
              <div className="flex items-start justify-between gap-3">
                <Link to={`/developers/${d.id}`} className="flex items-center gap-3 min-w-0">
                  <div className="avatar">{d.name?.[0] ?? '?'}</div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{d.name}</div>
                    <div className="text-sm text-slate-500 truncate">{d.title}</div>
                  </div>
                </Link>
                <button
                  type="button"
                  className={`select-person ${active ? 'select-person-active' : ''}`}
                  onClick={() => toggle(d.id)}
                  aria-label={`${active ? 'Remove' : 'Select'} ${d.name}`}
                >
                  {active ? '✓' : '+'}
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-4 leading-6 line-clamp-3">{d.bio}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">{d.location}</div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
