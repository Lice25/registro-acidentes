export type Severity = 'leve' | 'moderado' | 'grave' | 'fatal';

export type AccidentType =
  | 'queda'
  | 'corte'
  | 'queimadura'
  | 'esmagamento'
  | 'choque_eletrico'
  | 'sobreesforco'
  | 'atropelamento'
  | 'outro';

export interface Accident {
  id: string;
  nomeColaborador: string;
  matricula: string;
  setor: string;
  dataHora: string; // ISO
  local: string;
  tipoAcidente: AccidentType;
  gravidade: Severity;
  descricao: string;
  epiUtilizado: boolean;
  testemunhas: string;
  createdAt: string;
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  leve: 'Leve',
  moderado: 'Moderado',
  grave: 'Grave',
  fatal: 'Fatal',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  leve: '#10b981',
  moderado: '#f59e0b',
  grave: '#f97316',
  fatal: '#ef4444',
};

export const ACCIDENT_TYPE_LABELS: Record<AccidentType, string> = {
  queda: 'Queda',
  corte: 'Corte',
  queimadura: 'Queimadura',
  esmagamento: 'Esmagamento',
  choque_eletrico: 'Choque Elétrico',
  sobreesforco: 'Sobreesforço',
  atropelamento: 'Atropelamento',
  outro: 'Outro',
};

export const COMMON_SECTORS = [
  'Produção',
  'Manutenção',
  'Logística',
  'Administrativo',
  'Qualidade',
  'Almoxarifado',
  'Expedição',
  'Engenharia',
];
