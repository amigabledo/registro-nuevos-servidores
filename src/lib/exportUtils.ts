import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServidorRegistro } from '@/types';

function getAreaLabel(area: string): string {
  if (area === 'ujieres') return 'Ujieres';
  if (area === 'seguridad') return 'Seguridad';
  if (area === 'escuela_dominical') return 'Escuela dominical';
  return area || '-';
}

function getEscuelaLabel(val: string): string {
  if (val === 'si') return 'Sí';
  if (val === 'cursando') return 'Cursando';
  return 'No';
}

function getEstadoLabel(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_revision: 'En revisión',
    contactado: 'Contactado',
    aprobado: 'Aprobado',
  };
  return map[estado] || estado;
}

export function exportarExcel(servidores: ServidorRegistro[]): void {
  const rows = servidores.map((s) => ({
    'Marca temporal': s.created_at ? new Date(s.created_at).toLocaleString('es-DO') : '',
    'Nombre': s.nombre,
    'Apellido': s.apellido,
    'Teléfono o WhatsApp': s.telefono,
    'Correo electrónico': s.correo || '',
    'Área en que desea servir': getAreaLabel(s.area_servicio),
    'Escuela de nuevos creyentes': getEscuelaLabel(s.escuela_nuevos_creyentes),
    'Bautizado en aguas': s.bautizado ? 'Sí' : 'No',
    'Fecha de bautismo': s.fecha_bautismo || '',
    'Retiro de liberación': s.retiro_liberacion ? 'Sí' : 'No',
    'Fecha de retiro': s.fecha_retiro || '',
    'Tiene mentor': s.tiene_mentor ? 'Sí' : 'No',
    'Nombre del mentor': s.nombre_mentor || '',
    'Asiste a casa de paz': s.asiste_casa_paz ? 'Sí' : 'No',
    'Estado': getEstadoLabel(s.estado),
    'Notas y observaciones': s.notas_servidor || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Anchos automáticos de columna
  worksheet['!cols'] = [
    { wch: 20 }, // Marca temporal
    { wch: 18 }, // Nombre
    { wch: 18 }, // Apellido
    { wch: 18 }, // Teléfono
    { wch: 26 }, // Correo
    { wch: 22 }, // Área
    { wch: 24 }, // Escuela
    { wch: 18 }, // Bautizado
    { wch: 18 }, // Fecha bautismo
    { wch: 18 }, // Retiro
    { wch: 18 }, // Fecha retiro
    { wch: 14 }, // Tiene mentor
    { wch: 24 }, // Nombre mentor
    { wch: 18 }, // Casa de paz
    { wch: 16 }, // Estado
    { wch: 35 }, // Notas
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Servidores');

  const fechaStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `servidores_registro_${fechaStr}.xlsx`);
}

export function exportarPDF(servidores: ServidorRegistro[]): void {
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

  // Encabezado institucional
  doc.setFontSize(15);
  doc.setTextColor(10, 74, 191);
  doc.text('Ministerio Internacional Monte de Dios', 14, 15);

  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('Inscripción de nuevos servidores', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const fechaStr = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Generado el: ${fechaStr} | Total de registros: ${servidores.length}`, 14, 28);

  const tableHead = [[
    'Postulante',
    'Teléfono',
    'Área deseada',
    'Mentor',
    'Casa paz',
    'Bautismo',
    'Retiro',
    'Escuela',
    'Notas y observaciones',
  ]];

  const tableBody = servidores.map((s) => [
    `${s.nombre} ${s.apellido}`,
    s.telefono,
    getAreaLabel(s.area_servicio),
    s.tiene_mentor ? (s.nombre_mentor || 'Sí') : 'No',
    s.asiste_casa_paz ? 'Sí' : 'No',
    s.bautizado ? (s.fecha_bautismo ? `Sí (${s.fecha_bautismo})` : 'Sí') : 'No',
    s.retiro_liberacion ? (s.fecha_retiro ? `Sí (${s.fecha_retiro})` : 'Sí') : 'No',
    getEscuelaLabel(s.escuela_nuevos_creyentes),
    s.notas_servidor || '-',
  ]);

  autoTable(doc, {
    startY: 32,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [10, 74, 191],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28 },
      3: { cellWidth: 36 },
      4: { cellWidth: 18 },
      5: { cellWidth: 26 },
      6: { cellWidth: 26 },
      7: { cellWidth: 22 },
      8: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  const fechaDoc = new Date().toISOString().slice(0, 10);
  doc.save(`servidores_registro_${fechaDoc}.pdf`);
}
