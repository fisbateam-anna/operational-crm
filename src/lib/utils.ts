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

export const today = new Date('2026-08-04T12:00:00+07:00');

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
  const overdue = relatedTasks.filter((task) => task.status === 'Просрочена' || isOverdue(task.dueDate)).length;
  const incidents = counterparty.services.reduce((sum, service) => sum + service.incidentCount, 0);
  const activeProcesses = data.processes.filter(
    (process) => process.counterpartyId === counterparty.id && !['Завершен', 'Остановлен'].includes(process.status)
  ).length;
  return Math.min(100, Math.round(counterparty.riskScore + overdue * 9 + incidents * 3 + counterparty.penalties * 12 + activeProcesses * 2));
};

export const calculateSlaCompliance = (tasks: Task[]) => {
  const finished = tasks.filter((task) => task.status === 'Выполнена' || task.status === 'Просрочена');
  if (!finished.length) return 100;
  const onTime = finished.filter((task) => {
    if (task.status !== 'Выполнена') return false;
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
  const escapeCsv = (value: unknown) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };
  const isCsv = filename.toLowerCase().endsWith('.csv');
  const body = isCsv && rows.every(isObjectRow)
    ? (() => {
        const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
        return [columns.map(escapeCsv).join(','), ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(','))].join('\n');
      })()
    : JSON.stringify(rows, null, 2);
  const payload = encodeURIComponent(body);
  const link = document.createElement('a');
  link.href = `data:${isCsv ? 'text/csv' : 'application/json'};charset=utf-8,${payload}`;
  link.download = filename;
  link.click();
};

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
