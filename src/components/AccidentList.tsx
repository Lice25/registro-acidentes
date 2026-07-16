import { useMemo, useState } from 'react';
import { Search, Pencil, Trash2, ShieldCheck, ShieldAlert, Filter, Inbox } from 'lucide-react';
import type { Accident, Severity } from '../types';
import { ACCIDENT_TYPE_LABELS, SEVERITY_COLORS, SEVERITY_LABELS } from '../types';

type Filter = 'all' | Severity;

const severityBadge: Record<Severity, string> = {
  leve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  moderado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  grave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  fatal: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccidentList({
  items,
  onEdit,
  onDelete,
}: {
  items: Accident[];
  onEdit: (a: Accident) => void;
  onDelete: (a: Accident) => void;
}) {
  const [qName, setQName] = useState('');
  const [qSector, setQSector] = useState('');
  const [qDate, setQDate] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return items
      .filter((a) => {
        if (filter !== 'all' && a.gravidade !== filter) return false;
        if (qName && !a.nomeColaborador.toLowerCase().includes(qName.toLowerCase())) return false;
        if (qSector && !a.setor.toLowerCase().includes(qSector.toLowerCase())) return false;
        if (qDate) {
          const d = new Date(a.dataHora);
          const day = d.toISOString().slice(0, 10);
          if (day !== qDate) return false;
        }
        return true;
      })
      .sort((a, b) => (a.dataHora < b.dataHora ? 1 : -1));
  }, [items, filter, qName, qSector, qDate]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'leve', label: 'Leves' },
    { key: 'moderado', label: 'Moderados' },
    { key: 'grave', label: 'Graves' },
    { key: 'fatal', label: 'Fatal' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Pesquisar colaborador..."
              value={qName}
              onChange={(e) => setQName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Pesquisar setor..."
              value={qSector}
              onChange={(e) => setQSector(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <input
            type="date"
            value={qDate}
            onChange={(e) => setQDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Filter className="h-3.5 w-3.5" /> Gravidade:
        </span>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === f.key
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Inbox className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Nenhum acidente encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Colaborador</th>
                <th className="px-4 py-3 font-semibold">Setor</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Data/Hora</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Local</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Tipo</th>
                <th className="px-4 py-3 font-semibold">Gravidade</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">EPI</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {a.nomeColaborador}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Matrícula {a.matricula}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.setor}</td>
                  <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                    {fmtDate(a.dataHora)}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 lg:table-cell">
                    {a.local}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">
                    {ACCIDENT_TYPE_LABELS[a.tipoAcidente]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${severityBadge[a.gravidade]}`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: SEVERITY_COLORS[a.gravidade] }}
                      />
                      {SEVERITY_LABELS[a.gravidade]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {a.epiUtilizado ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-4 w-4" /> Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400">
                        <ShieldAlert className="h-4 w-4" /> Não
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(a)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600 dark:text-slate-400 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(a)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
