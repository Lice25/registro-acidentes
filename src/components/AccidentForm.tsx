import { useEffect, useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import type { Accident, AccidentType, Severity } from '../types';
import { ACCIDENT_TYPE_LABELS, COMMON_SECTORS, SEVERITY_LABELS } from '../types';
import { uid } from '../storage';

type FormState = Omit<Accident, 'id' | 'createdAt'>;

const empty: FormState = {
  nomeColaborador: '',
  matricula: '',
  setor: '',
  dataHora: '',
  local: '',
  tipoAcidente: 'queda',
  gravidade: 'leve',
  descricao: '',
  epiUtilizado: false,
  testemunhas: '',
};

const labels: Record<keyof FormState, string> = {
  nomeColaborador: 'Nome do colaborador',
  matricula: 'Matrícula',
  setor: 'Setor',
  dataHora: 'Data e hora',
  local: 'Local do acidente',
  tipoAcidente: 'Tipo de acidente',
  gravidade: 'Gravidade',
  descricao: 'Descrição',
  epiUtilizado: 'EPI utilizado',
  testemunhas: 'Testemunhas',
};

function validate(s: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!s.nomeColaborador.trim()) e.nomeColaborador = 'Informe o nome do colaborador';
  if (!s.matricula.trim()) e.matricula = 'Informe a matrícula';
  if (!s.setor.trim()) e.setor = 'Informe o setor';
  if (!s.dataHora) e.dataHora = 'Informe data e hora';
  if (!s.local.trim()) e.local = 'Informe o local do acidente';
  if (!s.descricao.trim() || s.descricao.trim().length < 10)
    e.descricao = 'Descrição deve ter ao menos 10 caracteres';
  return e;
}

export function AccidentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Accident | null;
  onSubmit: (a: Accident) => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _c, ...rest } = initial;
      void _id;
      void _c;
      setState(rest);
    } else {
      setState(empty);
    }
    setErrors({});
    setTouched({});
  }, [initial]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
    if (touched[k]) {
      const next = validate({ ...state, [k]: v });
      setErrors((e) => ({ ...e, [k]: next[k] || '' }));
    }
  };

  const blur = (k: keyof FormState) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const next = validate(state);
    setErrors((e) => ({ ...e, [k]: next[k] || '' }));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const next = validate(state);
    setErrors(next);
    setTouched(Object.fromEntries(Object.keys(labels).map((k) => [k, true])));
    if (Object.values(next).some(Boolean)) return;
    const accident: Accident = {
      ...state,
      id: initial?.id ?? uid(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSubmit(accident);
  };

  const fieldClass = (k: keyof FormState) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
      errors[k] && touched[k]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
        : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/30 dark:border-slate-700'
    }`;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.nomeColaborador} error={touched.nomeColaborador ? errors.nomeColaborador : ''}>
          <input
            className={fieldClass('nomeColaborador')}
            value={state.nomeColaborador}
            onChange={(e) => set('nomeColaborador', e.target.value)}
            onBlur={() => blur('nomeColaborador')}
            placeholder="Ex.: João Silva"
          />
        </Field>
        <Field label={labels.matricula} error={touched.matricula ? errors.matricula : ''}>
          <input
            className={fieldClass('matricula')}
            value={state.matricula}
            onChange={(e) => set('matricula', e.target.value)}
            onBlur={() => blur('matricula')}
            placeholder="Ex.: 12345"
          />
        </Field>
        <Field label={labels.setor} error={touched.setor ? errors.setor : ''}>
          <input
            list="setores"
            className={fieldClass('setor')}
            value={state.setor}
            onChange={(e) => set('setor', e.target.value)}
            onBlur={() => blur('setor')}
            placeholder="Selecione ou digite"
          />
          <datalist id="setores">
            {COMMON_SECTORS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label={labels.dataHora} error={touched.dataHora ? errors.dataHora : ''}>
          <input
            type="datetime-local"
            className={fieldClass('dataHora')}
            value={state.dataHora}
            onChange={(e) => set('dataHora', e.target.value)}
            onBlur={() => blur('dataHora')}
          />
        </Field>
        <Field label={labels.local} error={touched.local ? errors.local : ''}>
          <input
            className={fieldClass('local')}
            value={state.local}
            onChange={(e) => set('local', e.target.value)}
            onBlur={() => blur('local')}
            placeholder="Ex.: Linha de montagem 3"
          />
        </Field>
        <Field label={labels.tipoAcidente}>
          <select
            className={fieldClass('tipoAcidente')}
            value={state.tipoAcidente}
            onChange={(e) => set('tipoAcidente', e.target.value as AccidentType)}
          >
            {Object.entries(ACCIDENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.gravidade}>
          <select
            className={fieldClass('gravidade')}
            value={state.gravidade}
            onChange={(e) => set('gravidade', e.target.value as Severity)}
          >
            {Object.entries(SEVERITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.epiUtilizado}>
          <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <input
              type="checkbox"
              checked={state.epiUtilizado}
              onChange={(e) => set('epiUtilizado', e.target.checked)}
              className="h-4 w-4 rounded accent-sky-600"
            />
            EPI estava em uso no momento
          </label>
        </Field>
        <div className="sm:col-span-2">
          <Field label={labels.descricao} error={touched.descricao ? errors.descricao : ''}>
            <textarea
              rows={3}
              className={fieldClass('descricao')}
              value={state.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              onBlur={() => blur('descricao')}
              placeholder="Descreva como ocorreu o acidente..."
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={labels.testemunhas}>
            <input
              className={fieldClass('testemunhas')}
              value={state.testemunhas}
              onChange={(e) => set('testemunhas', e.target.value)}
              placeholder="Nomes separados por vírgula (opcional)"
            />
          </Field>
        </div>
      </div>

      {Object.values(errors).some(Boolean) && touched.nomeColaborador && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          Verifique os campos destacados.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" /> Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          <Save className="h-4 w-4" /> {initial ? 'Salvar alterações' : 'Cadastrar acidente'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">{error}</span>
      ) : null}
    </label>
  );
}
