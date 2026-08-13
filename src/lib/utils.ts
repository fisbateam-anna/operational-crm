import type {
  AppData,
  AuditLog,
  Counterparty,
  ProcessInstance,
  ProcessStatus,
  StatusTone,
  Task,
  TaskStatus
} from '../types';

export const today = new Date('2026-08-13T12:00:00+07:00');

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

export const formatNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value);

export const daysBetween = (date: string) => {
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const isOverdue = (date: string) => daysBetween(date) < 0;

export const statusTone = (status: string): StatusTone => {
  const green = ['Активен', 'Подключен', 'Выполнена', 'Завершен', 'Валидирован', 'Успешно', 'Доставлено', 'Отправлено', 'Опубликована'];
  const amber = ['Подключение', 'Пилот', 'Ожидание', 'Ожидание контрагента', 'Ожидает', 'На проверке'];
  const red = ['Риск', 'Риск сроков', 'Просрочена', 'Ошибка', 'Ошибка интеграции', 'Приостановлен'];
  const blue = ['Запущен', 'В работе', 'Назначена', 'Подключается', 'Загружен'];
  const violet = ['Черновик', 'Архив', 'Архивная'];

  if (green.includes(status)) return 'green';
  if (amber.includes(status)) return 'amber';
  if (red.includes(status)) return 'red';
  if (blue.includes(status)) return 'blue';
  if (violet.includes(status)) return 'violet';
  return 'neutral';
};

export const priorityTone = (priority: string): StatusTone => {
  if (priority === 'Критичный') return 'red';
  if (priority === 'Высокий') return 'amber';
  if (priority === 'Средний') return 'blue';
  return 'neutral';
};

export const getUserName = (data: AppData, id?: string) => data.users.find((user) => user.id === id)?.name ?? 'Группа';

export const getCounterparty = (data: AppData, id?: string) =>
  data.counterparties.find((counterparty) => counterparty.id === id);

export const getProcess = (data: AppData, id?: string) => data.processes.find((process) => process.id === id);

export const getTask = (data: AppData, id?: string) => data.tasks.find((task) => task.id === id);

export const calculateProfileCompleteness = (counterparty: Counterparty, data: AppData) => {
  const hasContacts = counterparty.contacts.length > 0;
  const hasServices = counterparty.services.length > 0;
  const hasDocs = data.documents.some((document) => document.linkedObjectId === counterparty.id);
  const hasProcesses = data.processes.some((process) => process.counterpartyId === counterparty.id);
  const isIndividual = counterparty.partyKind === 'ФЛ' || counterparty.type === 'ФЛ';
  const reqsScore = isIndividual
    ? counterparty.birthDate && counterparty.identityDocument && counterparty.consentStatus
      ? 25
      : 8
    : counterparty.inn && counterparty.kpp && counterparty.ogrn
      ? 25
      : 8;
  return reqsScore + (hasContacts ? 20 : 0) + (hasServices ? 25 : 0) + (hasProcesses ? 15 : 0) + (hasDocs ? 15 : 0);
};

export const calculateOperationalRisk = (counterparty: Counterparty, data: AppData) => {
  const relatedTasks = data.tasks.filter((task) => task.counterpartyId === counterparty.id);
  const overdue = relatedTasks.filter((task) => !['Выполнена', 'Отменена'].includes(task.status) && isOverdue(task.dueDate)).length;
  const incidents = counterparty.services.reduce((sum, service) => sum + service.incidentCount, 0);
  const activeProcesses = data.processes.filter(
    (process) => process.counterpartyId === counterparty.id && !['Завершен', 'Остановлен'].includes(process.status)
  ).length;
  return Math.min(100, Math.round(counterparty.riskScore + overdue * 9 + incidents * 3 + counterparty.penalties * 12 + activeProcesses * 2));
};

export const calculateSlaCompliance = (tasks: Task[]) => {
  const finished = tasks.filter((task) => task.status === 'Выполнена');
  if (!finished.length) return 100;
  const onTime = finished.filter((task) => {
    const completion = task.history.find((entry) => entry.status === 'Выполнена');
    const completedAt = completion ? new Date(completion.at) : today;
    const dueEnd = new Date(`${task.dueDate}T23:59:59+07:00`);
    return completedAt.getTime() <= dueEnd.getTime();
  }).length;
  return Math.round((onTime / finished.length) * 100);
};

export const calculateProcessProgress = (process: ProcessInstance, data: AppData) => {
  const template = data.processTemplates.find((item) => item.id === process.templateId);
  if (!template) return 0;
  if (process.status === 'Завершен') return 100;
  if (process.status === 'Остановлен') return 0;
  return Math.round((process.stageIndex / template.stages.length) * 100);
};

export const processStatusAfterStage = (process: ProcessInstance, data: AppData): ProcessStatus => {
  const template = data.processTemplates.find((item) => item.id === process.templateId);
  if (!template) return process.status;
  if (process.stageIndex + 1 >= template.stages.length) return 'Завершен';
  return 'В работе';
};

export const nextTaskStatus = (status: TaskStatus): TaskStatus => {
  const order: TaskStatus[] = ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена'];
  const index = order.indexOf(status);
  return order[Math.min(order.length - 1, Math.max(index + 1, 1))];
};

export const makeAudit = (
  data: AppData,
  userId: string,
  action: string,
  objectType: string,
  objectName: string,
  result: AuditLog['result'] = 'Успешно',
  type: AuditLog['logType'] = 'Действие пользователя'
): AuditLog => {
  const user = data.users.find((item) => item.id === userId);
  return {
    id: `LOG-${String(data.auditLogs.length + 1).padStart(4, '0')}`,
    userIdMasked: user?.maskedId ?? 'USR-0000',
    at: new Date(today.getTime() + data.auditLogs.length * 60000).toISOString(),
    action,
    objectType,
    objectName,
    objectLink: objectName,
    logType: type,
    result
  };
};

export const exportRows = (rows: unknown[], filename: string) => {
  const isObjectRow = (row: unknown): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row);
  const objectRows: Record<string, unknown>[] = rows.every(isObjectRow) ? (rows as Record<string, unknown>[]) : rows.map((row) => ({ value: row }));
  const columns = Array.from(new Set(objectRows.flatMap((row) => Object.keys(row))));
  const escapeCsv = (value: unknown) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };
  const escapeXml = (value: unknown) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  const downloadBlob = (content: string | Uint8Array, mime: string) => {
    const payload: BlobPart =
      typeof content === 'string'
        ? content
        : (() => {
            const buffer = new ArrayBuffer(content.byteLength);
            new Uint8Array(buffer).set(content);
            return buffer;
          })();
    const blob = new Blob([payload], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const crcTable = (() => {
    const table: number[] = [];
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();
  const crc32 = (bytes: Uint8Array) => {
    let crc = 0xffffffff;
    bytes.forEach((byte) => {
      crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    });
    return (crc ^ 0xffffffff) >>> 0;
  };
  const concatBytes = (chunks: Uint8Array[]) => {
    const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(size);
    let offset = 0;
    chunks.forEach((chunk) => {
      result.set(chunk, offset);
      offset += chunk.length;
    });
    return result;
  };
  const uint16 = (value: number) => new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
  const uint32 = (value: number) => new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]);
  const buildZip = (files: { name: string; content: string }[]) => {
    const encoder = new TextEncoder();
    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;
    files.forEach((file) => {
      const name = encoder.encode(file.name);
      const content = encoder.encode(file.content);
      const crc = crc32(content);
      const localHeader = concatBytes([
        uint32(0x04034b50),
        uint16(20),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(crc),
        uint32(content.length),
        uint32(content.length),
        uint16(name.length),
        uint16(0),
        name
      ]);
      localParts.push(localHeader, content);
      centralParts.push(
        concatBytes([
          uint32(0x02014b50),
          uint16(20),
          uint16(20),
          uint16(0),
          uint16(0),
          uint16(0),
          uint16(0),
          uint32(crc),
          uint32(content.length),
          uint32(content.length),
          uint16(name.length),
          uint16(0),
          uint16(0),
          uint16(0),
          uint16(0),
          uint32(0),
          uint32(offset),
          name
        ])
      );
      offset += localHeader.length + content.length;
    });
    const central = concatBytes(centralParts);
    const end = concatBytes([uint32(0x06054b50), uint16(0), uint16(0), uint16(files.length), uint16(files.length), uint32(central.length), uint32(offset), uint16(0)]);
    return concatBytes([...localParts, central, end]);
  };
  const buildDocx = () => {
    const tableRows = [
      `<w:tr>${columns.map((column) => `<w:tc><w:p><w:r><w:t>${escapeXml(column)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`,
      ...objectRows.map((row) => `<w:tr>${columns.map((column) => `<w:tc><w:p><w:r><w:t>${escapeXml(row[column])}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`)
    ].join('');
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${escapeXml(filename.replace(/\\.docx$/i, ''))}</w:t></w:r></w:p>
    <w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="B8C2D0"/><w:left w:val="single" w:sz="4" w:space="0" w:color="B8C2D0"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="B8C2D0"/><w:right w:val="single" w:sz="4" w:space="0" w:color="B8C2D0"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="B8C2D0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="B8C2D0"/></w:tblBorders></w:tblPr>${tableRows}</w:tbl>
    <w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr>
  </w:body>
</w:document>`;
    return buildZip([
      {
        name: '[Content_Types].xml',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
      },
      {
        name: '_rels/.rels',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
      },
      { name: 'word/document.xml', content: documentXml }
    ]);
  };
  const isCsv = filename.toLowerCase().endsWith('.csv');
  const isXml = filename.toLowerCase().endsWith('.xml');
  const isDocx = filename.toLowerCase().endsWith('.docx');
  if (isCsv) {
    downloadBlob(`\ufeff${[columns.map(escapeCsv).join(','), ...objectRows.map((row) => columns.map((column) => escapeCsv(row[column])).join(','))].join('\n')}`, 'text/csv;charset=utf-8');
    return;
  }
  if (isXml) {
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n${objectRows
      .map((row) => `  <row>\n${columns.map((column) => `    <field name="${escapeXml(column)}">${escapeXml(row[column])}</field>`).join('\n')}\n  </row>`)
      .join('\n')}\n</rows>`;
    downloadBlob(body, 'application/xml;charset=utf-8');
    return;
  }
  if (isDocx) {
    downloadBlob(buildDocx(), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    return;
  }
  downloadBlob(JSON.stringify(rows, null, 2), 'application/json;charset=utf-8');
};

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
