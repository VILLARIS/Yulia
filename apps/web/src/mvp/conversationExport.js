const ROLE_LABELS = {
  student: 'Estudiante',
  user: 'Estudiante',
  tutor: 'Yulia',
  assistant: 'Yulia',
  model: 'Yulia',
};

const SEPARATOR = '─'.repeat(36);

const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' });

function formatExportDate(date) {
  return dateFormatter.format(date);
}

export function buildConversationExport({ simulationTitle, studentName, messages, exportedAt = new Date() }) {
  const header = [
    'YULIA — Bromatología y Nutrición',
    'Conversación de simulación',
    '',
    `Simulación: ${simulationTitle}`,
  ];
  if (studentName) header.push(`Estudiante: ${studentName}`);
  header.push(`Exportado: ${formatExportDate(exportedAt)}`);

  const blocks = messages
    .map((message) => {
      const speaker = ROLE_LABELS[message.role];
      if (!speaker || !message.content) return null;
      return `${speaker}:\n${message.content}`;
    })
    .filter(Boolean);

  const sections = [header.join('\n')];
  if (blocks.length) sections.push(SEPARATOR, blocks.join('\n\n'));
  sections.push(SEPARATOR, 'Conversación generada durante una simulación educativa en Yulia.');

  return `${sections.join('\n\n')}\n`;
}

export function conversationFileName(simulationTitle) {
  const slug = String(simulationTitle ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return `yulia-${slug || 'simulacion'}-conversacion.txt`;
}

export function downloadConversationExport({ simulationTitle, studentName, messages, exportedAt = new Date() }) {
  const text = buildConversationExport({ simulationTitle, studentName, messages, exportedAt });
  const blob = new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = conversationFileName(simulationTitle);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
