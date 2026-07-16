import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Accident } from './types';
import { ACCIDENT_TYPE_LABELS, SEVERITY_LABELS } from './types';

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR');
}

export function exportPDF(items: Accident[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Relatório de Acidentes de Trabalho', 40, 40);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Emitido em ${new Date().toLocaleString('pt-BR')} · ${items.length} registro(s)`,
    40,
    58
  );

  autoTable(doc, {
    startY: 80,
    head: [
      [
        'Colaborador',
        'Matrícula',
        'Setor',
        'Data/Hora',
        'Local',
        'Tipo',
        'Gravidade',
        'EPI',
      ],
    ],
    body: items.map((a) => [
      a.nomeColaborador,
      a.matricula,
      a.setor,
      fmtDate(a.dataHora),
      a.local,
      ACCIDENT_TYPE_LABELS[a.tipoAcidente],
      SEVERITY_LABELS[a.gravidade],
      a.epiUtilizado ? 'Sim' : 'Não',
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [14, 165, 233], textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const str = `Página ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 60, doc.internal.pageSize.getHeight() - 20);
    },
  });

  doc.save(`relatorio-acidentes-${Date.now()}.pdf`);
}

function csvEscape(v: string): string {
  const s = String(v ?? '');
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCSV(items: Accident[]): void {
  const headers = [
    'Nome',
    'Matrícula',
    'Setor',
    'Data/Hora',
    'Local',
    'Tipo',
    'Gravidade',
    'EPI',
    'Testemunhas',
    'Descrição',
  ];
  const rows = items.map((a) => [
    a.nomeColaborador,
    a.matricula,
    a.setor,
    fmtDate(a.dataHora),
    a.local,
    ACCIDENT_TYPE_LABELS[a.tipoAcidente],
    SEVERITY_LABELS[a.gravidade],
    a.epiUtilizado ? 'Sim' : 'Não',
    a.testemunhas,
    a.descricao,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `acidentes-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
