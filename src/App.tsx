import { useEffect, useState } from 'react';
import {
  HardHat,
  LayoutDashboard,
  ListChecks,
  Plus,
  Moon,
  Sun,
  FileText,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';
import type { Accident } from './types';
import { loadAccidents, saveAccidents } from './storage';
import { useTheme } from './theme';
import { exportCSV, exportPDF } from './exporters';
import { AccidentForm } from './components/AccidentForm';
import { AccidentList } from './components/AccidentList';
import { Dashboard } from './components/Dashboard';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastContainer, type ToastMsg } from './components/Toast';

type Tab = 'dashboard' | 'lista';

export default function App() {
  const { dark, toggle } = useTheme();
  const [items, setItems] = useState<Accident[]>([]);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Accident | null>(null);
  const [deleting, setDeleting] = useState<Accident | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    setItems(loadAccidents());
  }, []);

  useEffect(() => {
    saveAccidents(items);
  }, [items]);

  const pushToast = (kind: ToastMsg['kind'], text: string) => {
    setToasts((t) => [...t, { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind, text }]);
  };
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const handleSave = (a: Accident) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === a.id);
      return exists ? prev.map((p) => (p.id === a.id ? a : p)) : [a, ...prev];
    });
    setFormOpen(false);
    setEditing(null);
    pushToast('success', editing ? 'Acidente atualizado com sucesso.' : 'Acidente cadastrado com sucesso.');
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setItems((prev) => prev.filter((p) => p.id !== deleting.id));
    setDeleting(null);
    pushToast('success', 'Registro excluído.');
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a: Accident) => {
    setEditing(a);
    setFormOpen(true);
  };

  const handlePDF = () => {
    if (items.length === 0) return pushToast('error', 'Não há registros para exportar.');
    exportPDF(items);
    pushToast('success', 'PDF gerado.');
  };
  const handleCSV = () => {
    if (items.length === 0) return pushToast('error', 'Não há registros para exportar.');
    exportCSV(items);
    pushToast('success', 'CSV gerado.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 p-2.5 text-white shadow-md">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-lg">
                Registro de Acidentes de Trabalho
              </h1>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Sistema de gestão de segurança ocupacional
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo acidente</span>
            </button>
            <button
              onClick={toggle}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Alternar tema"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={LayoutDashboard}>
            Dashboard
          </TabButton>
          <TabButton active={tab === 'lista'} onClick={() => setTab('lista')} icon={ListChecks}>
            Registros
            {items.length > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {items.length}
              </span>
            )}
          </TabButton>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {items.length === 0 ? (
          <EmptyState onNew={openNew} />
        ) : tab === 'dashboard' ? (
          <Dashboard items={items} />
        ) : (
          <AccidentList items={items} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </main>

      {/* Reports floating bar */}
      {items.length > 0 && (
        <div className="pointer-events-none fixed bottom-5 left-5 z-30 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handlePDF}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <FileText className="h-4 w-4" /> Exportar PDF
          </button>
          <button
            onClick={handleCSV}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            <FileSpreadsheet className="h-4 w-4" /> Exportar CSV
          </button>
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <Modal
          title={editing ? 'Editar acidente' : 'Cadastrar acidente'}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          wide
        >
          <AccidentForm
            initial={editing}
            onSubmit={handleSave}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <ConfirmDialog
          title="Excluir registro"
          message={`Deseja excluir o registro de ${deleting.nomeColaborador}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? 'border-sky-600 text-sky-600 dark:text-sky-400'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
      <div className="inline-flex rounded-2xl bg-sky-100 p-4 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Nenhum acidente registrado
        </h2>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Cadastre o primeiro acidente de trabalho para começar a acompanhar os indicadores
          de segurança da sua organização.
        </p>
      </div>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
      >
        <Plus className="h-4 w-4" /> Cadastrar acidente
      </button>
    </div>
  );
}
