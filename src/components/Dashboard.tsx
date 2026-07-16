import { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { AlertTriangle, CalendarDays, Building2, Activity } from 'lucide-react';
import type { Accident } from '../types';
import { SEVERITY_COLORS, SEVERITY_LABELS, ACCIDENT_TYPE_LABELS } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

export function Dashboard({ items }: { items: Accident[] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const bySector: Record<string, number> = {};
    const bySeverity: Record<string, number> = { leve: 0, moderado: 0, grave: 0, fatal: 0 };
    const byType: Record<string, number> = {};
    let thisMonth = 0;

    for (const a of items) {
      bySector[a.setor] = (bySector[a.setor] || 0) + 1;
      bySeverity[a.gravidade] = (bySeverity[a.gravidade] || 0) + 1;
      byType[a.tipoAcidente] = (byType[a.tipoAcidente] || 0) + 1;
      if (isSameMonth(a.dataHora, now)) thisMonth++;
    }

    return { bySector, bySeverity, byType, thisMonth, total: items.length };
  }, [items]);

  const sectorData = {
    labels: Object.keys(stats.bySector),
    datasets: [
      {
        label: 'Acidentes',
        data: Object.values(stats.bySector),
        backgroundColor: '#0ea5e9',
        borderRadius: 6,
      },
    ],
  };

  const severityData = {
    labels: Object.keys(stats.bySeverity).map((k) => SEVERITY_LABELS[k as keyof typeof SEVERITY_LABELS]),
    datasets: [
      {
        data: Object.values(stats.bySeverity),
        backgroundColor: Object.keys(stats.bySeverity).map(
          (k) => SEVERITY_COLORS[k as keyof typeof SEVERITY_COLORS]
        ),
        borderWidth: 0,
      },
    ],
  };

  const typeData = {
    labels: Object.keys(stats.byType).map(
      (k) => ACCIDENT_TYPE_LABELS[k as keyof typeof ACCIDENT_TYPE_LABELS]
    ),
    datasets: [
      {
        label: 'Ocorrências',
        data: Object.values(stats.byType),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  const cards = [
    {
      label: 'Total de acidentes',
      value: stats.total,
      icon: AlertTriangle,
      tint: 'from-sky-500 to-sky-600',
    },
    {
      label: 'Acidentes do mês',
      value: stats.thisMonth,
      icon: CalendarDays,
      tint: 'from-violet-500 to-violet-600',
    },
    {
      label: 'Setores atingidos',
      value: Object.keys(stats.bySector).length,
      icon: Building2,
      tint: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Sem EPI',
      value: items.filter((a) => !a.epiUtilizado).length,
      icon: Activity,
      tint: 'from-rose-500 to-rose-600',
    },
  ];

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${c.tint} p-2.5 text-white shadow`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{c.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Acidentes por setor
          </h3>
          <div className="h-64">
            <Bar data={sectorData} options={baseOpts} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Por gravidade
          </h3>
          <div className="flex h-64 items-center justify-center">
            <Doughnut
              data={severityData}
              options={{
                ...baseOpts,
                plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } } },
                cutout: '62%',
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Por tipo de acidente
          </h3>
          <div className="h-64">
            <Bar data={typeData} options={baseOpts} />
          </div>
        </div>
      </div>
    </div>
  );
}
