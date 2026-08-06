import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Columns3,
  Database,
  Download,
  Edit,
  FileClock,
  FileDown,
  Filter,
  GitBranch,
  History,
  Home,
  LayoutDashboard,
  Link2,
  ListChecks,
  LockKeyhole,
  Mail,
  MessageSquare,
  Network,
  Phone,
  PieChart as PieChartIcon,
  PlayCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  SquarePen,
  StopCircle,
  Table2,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  Workflow,
  X,
  Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { roles } from './data/mock';
import { loadData, loadRole, resetData, saveData, saveRole } from './lib/store';
import {
  calculateOperationalRisk,
  calculateProcessProgress,
  calculateProfileCompleteness,
  calculateSlaCompliance,
  daysBetween,
  exportRows,
  formatDate,
  formatDateTime,
  formatNumber,
  getCounterparty,
  getProcess,
  getTask,
  getUserName,
  isOverdue,
  makeAudit,
  nextTaskStatus,
  priorityTone,
  statusTone,
  today
} from './lib/utils';
import type {
  AppData,
  AuditLog,
  BusinessDocument,
  Communication,
  CommunicationStatus,
  Counterparty,
  CounterpartyStatus,
  CounterpartyType,
  DictionaryField,
  InternalHandoff,
  InternalHandoffStatus,
  IntegrationExchange,
  Priority,
  ProcessTemplate,
  ProcessInstance,
  ProcessStatus,
  RoleKey,
  SavedFilter,
  Task,
  TaskStatus
} from './types';

type Page =
  | 'dashboard'
  | 'counterparties'
  | 'counterparty'
  | 'communications'
  | 'coordination'
  | 'processes'
  | 'process'
  | 'tasks'
  | 'reports'
  | 'designer'
  | 'integrations'
  | 'wiki'
  | 'dictionaries'
  | 'logs';

interface RouteState {
  page: Page;
  id?: string;
  tab?: string;
  filter?: Record<string, string | number>;
}

type ToastTone = 'success' | 'warning' | 'danger' | 'info';
type PartyKindFilter = 'Все' | 'ФЛ' | 'ЮЛ';
type CounterpartySortKey = 'risk' | 'name' | 'touch';
type FilterLogic = 'AND' | 'OR';
type CommunicationType = Communication['type'];
type CommunicationChannel = NonNullable<Communication['channel']>;

interface CommunicationFormValues {
  counterpartyId: string;
  type: CommunicationType;
  subject: string;
  at: string;
  status: CommunicationStatus;
  channel: CommunicationChannel;
  processId?: string;
  summary: string;
  nextAction: string;
  agenda: string;
  participants: string;
  createTask: boolean;
  taskGroup: string;
  taskDueDate: string;
}

interface HandoffFormValues {
  title: string;
  sourceDepartment: string;
  targetDepartment: string;
  priority: Priority;
  dueDate: string;
  counterpartyId?: string;
  processId?: string;
  taskId?: string;
  comment: string;
  createTask: boolean;
}

interface TaskCreatePayload {
  title: string;
  priority: Priority;
  counterpartyId: string;
  processId?: string;
  assigneeGroup: string;
  dueDate: string;
  templateId: string;
  requiredFields: string[];
  comment: string;
}

interface DocumentUploadPayload {
  linkedObjectType: string;
  linkedObjectId: string;
  file: File;
  contentDataUrl?: string;
  businessPurpose: string;
  service: string;
  nextAction: string;
}

interface ControlDatePayload {
  counterpartyId: string;
  nextControlDate: string;
  reason: string;
  comment: string;
}

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

type ModalState =
  | { type: 'counterpartyForm'; mode: 'create' | 'edit'; id?: string }
  | { type: 'startProcess'; counterpartyId?: string }
  | { type: 'taskForm'; counterpartyId?: string; processId?: string }
  | { type: 'communication'; counterpartyId?: string }
  | { type: 'contactDetail'; counterpartyId: string; contactId: string }
  | { type: 'controlDate'; counterpartyId: string }
  | { type: 'documentUpload'; linkedObjectType: string; linkedObjectId: string }
  | { type: 'internalHandoff'; counterpartyId?: string; processId?: string; taskId?: string }
  | { type: 'taskDetail'; id: string }
  | { type: 'integrationLog'; id: string }
  | { type: 'widgets' }
  | { type: 'import' }
  | null;

const counterpartyStatuses: CounterpartyStatus[] = ['Активен', 'Подключение', 'Пилот', 'Риск', 'Приостановлен', 'Архив'];
const counterpartyTypes: CounterpartyType[] = ['КО', 'НКО', 'ТСП', 'ПСП', 'Партнер', 'ФЛ'];
const legalCounterpartyTypes: CounterpartyType[] = ['КО', 'НКО', 'ТСП', 'ПСП', 'Партнер'];
const counterpartySortOptions: CounterpartySortKey[] = ['risk', 'touch', 'name'];
const filterLogicOptions: FilterLogic[] = ['AND', 'OR'];
const riskLimitPresets = [0, 40, 50, 60, 80];
const RESET_DATA_HASH = '#/reset-data';
const partyKindLabels: Record<PartyKindFilter, string> = {
  Все: 'Все клиенты',
  ФЛ: 'Физические лица',
  ЮЛ: 'Юридические лица'
};
const counterpartyTypeLabels: Record<CounterpartyType | 'Все', string> = {
  Все: 'Все типы',
  КО: 'Кредитные организации',
  НКО: 'Некредитные организации',
  ТСП: 'Торгово-сервисные предприятия',
  ПСП: 'Платежные сервис-провайдеры',
  Партнер: 'Партнеры',
  ФЛ: 'Физические лица'
};
const counterpartyStatusLabels: Record<CounterpartyStatus | 'Все', string> = {
  Все: 'Все статусы',
  Активен: 'Активен',
  Подключение: 'Подключение',
  Пилот: 'Пилот',
  Риск: 'На контроле',
  Приостановлен: 'Приостановлен',
  Архив: 'Архив'
};
const counterpartySortLabels: Record<CounterpartySortKey, string> = {
  risk: 'Высокий риск',
  touch: 'Недавний контакт',
  name: 'А-Я'
};
const filterLogicLabels: Record<FilterLogic, string> = {
  AND: 'Все выбранные условия',
  OR: 'Поиск или риск'
};
const taskStatuses: TaskStatus[] = ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Просрочена', 'Выполнена', 'Отменена'];
const communicationStatuses: CommunicationStatus[] = ['Запланирована', 'Проведена', 'Требует follow-up', 'Отменена'];
const internalHandoffStatuses: InternalHandoffStatus[] = ['Ожидает', 'В работе', 'На проверке', 'Закрыто', 'Просрочено'];
const dashboardTaskStatusOrder: TaskStatus[] = ['Просрочена', 'В работе', 'На проверке', 'Ожидание', 'Назначена', 'Новая', 'Выполнена', 'Отменена'];
const dashboardTaskStatusColors: Record<TaskStatus, string> = {
  Просрочена: '#bd3a3a',
  'В работе': '#a86512',
  'На проверке': '#0f7890',
  Ожидание: '#6e56b8',
  Назначена: '#178d7f',
  Новая: '#285dcc',
  Выполнена: '#2d8451',
  Отменена: '#647286'
};
const priorities: Priority[] = ['Низкий', 'Средний', 'Высокий', 'Критичный'];
const processStatuses: ProcessStatus[] = [
  'Черновик',
  'Запущен',
  'В работе',
  'Ожидание контрагента',
  'Риск сроков',
  'Ошибка интеграции',
  'Завершен',
  'Остановлен'
];

const pageTitles: Record<Page, string> = {
  dashboard: 'Главная',
  counterparties: 'Клиенты и контрагенты',
  counterparty: 'Карточка контрагента',
  communications: 'Коммуникации',
  coordination: 'Поручения подразделениям',
  processes: 'Процессы',
  process: 'Экземпляр процесса',
  tasks: 'Задачи',
  reports: 'Отчеты',
  designer: 'Конструктор процессов',
  integrations: 'Технические обмены и импорт',
  wiki: 'База знаний',
  dictionaries: 'Справочники',
  logs: 'Журналы'
};

const roleNav: Record<RoleKey, { page: Page; label: string; icon: LucideIcon }[]> = {
  curator: [
    { page: 'dashboard', label: 'Главная', icon: Home },
    { page: 'counterparties', label: 'Контрагенты', icon: Building2 },
    { page: 'communications', label: 'Коммуникации', icon: Phone },
    { page: 'processes', label: 'Процессы', icon: Workflow },
    { page: 'tasks', label: 'Задачи', icon: ListChecks },
    { page: 'reports', label: 'Отчеты', icon: FileDown },
    { page: 'wiki', label: 'Wiki', icon: BookOpen }
  ],
  department: [
    { page: 'dashboard', label: 'Главная', icon: Home },
    { page: 'tasks', label: 'Мои задачи', icon: ListChecks },
    { page: 'processes', label: 'Процессы', icon: Workflow },
    { page: 'wiki', label: 'Wiki', icon: BookOpen }
  ],
  owner: [
    { page: 'dashboard', label: 'Главная', icon: Home },
    { page: 'processes', label: 'Процессы', icon: Workflow },
    { page: 'reports', label: 'Отчеты', icon: FileDown },
    { page: 'logs', label: 'Журналы', icon: History },
    { page: 'wiki', label: 'Wiki', icon: BookOpen }
  ],
  admin: [
    { page: 'dashboard', label: 'Главная', icon: Home },
    { page: 'designer', label: 'Конструктор', icon: GitBranch },
    { page: 'dictionaries', label: 'Справочники', icon: Database },
    { page: 'integrations', label: 'Тех. обмены', icon: Network },
    { page: 'logs', label: 'Журналы', icon: History },
    { page: 'reports', label: 'Отчеты', icon: FileDown },
    { page: 'wiki', label: 'Wiki', icon: BookOpen }
  ]
};

const cloneState = (data: AppData): AppData => JSON.parse(JSON.stringify(data)) as AppData;

const normalize = (value: string) => value.toLowerCase().trim();
const formatHoursInput = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',');
};
const calculateTaskFactHours = (task: Task) => {
  if (task.timeSpentHours > 0) return task.timeSpentHours;
  const events = task.history
    .map((entry) => ({ ...entry, date: new Date(entry.at) }))
    .filter((entry) => Number.isFinite(entry.date.getTime()));
  const workStart =
    events
      .filter((entry) => entry.status === 'В работе' || normalize(`${entry.action} ${entry.details}`).includes('в работе'))
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date ??
    (['В работе', 'Ожидание', 'На проверке', 'Просрочена', 'Выполнена'].includes(task.status) ? new Date(task.createdAt) : undefined);
  if (!workStart || !Number.isFinite(workStart.getTime())) return 0;
  const completion = events
    .filter((entry) => ['Выполнена', 'Отменена'].includes(entry.status ?? '') && entry.date.getTime() >= workStart.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date;
  const latest = events
    .filter((entry) => entry.date.getTime() >= workStart.getTime())
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.date;
  const fallbackEnd = today.getTime() > workStart.getTime() ? today : new Date(workStart.getTime() + 30 * 60 * 1000);
  const end = completion ?? latest ?? fallbackEnd;
  const elapsed = Math.max(0.1, (end.getTime() - workStart.getTime()) / (1000 * 60 * 60));
  return Math.round(elapsed * 10) / 10;
};
const isIndividualCounterparty = (item?: Counterparty) => item?.partyKind === 'ФЛ' || item?.type === 'ФЛ';
type ProcessPartyKind = Exclude<PartyKindFilter, 'Все'>;
const getProcessTemplatePartyKinds = (template: ProcessTemplate): ProcessPartyKind[] => {
  if (template.partyKinds?.length) return template.partyKinds;
  const text = normalize(`${template.name} ${template.processType ?? ''} ${template.entityTypes.join(' ')}`);
  if (text.includes('физическое лицо') || text.includes('фл') || text.includes('клиентское обращение')) return ['ФЛ'];
  if (text.includes('юридическое лицо') || text.includes('юл') || text.includes('договор') || text.includes('штраф') || text.includes('маркетингов')) return ['ЮЛ'];
  return ['ЮЛ'];
};
const canStartProcessForCounterparty = (template: ProcessTemplate, counterparty?: Counterparty) => {
  if (!counterparty) return true;
  const kind: ProcessPartyKind = isIndividualCounterparty(counterparty) ? 'ФЛ' : 'ЮЛ';
  return getProcessTemplatePartyKinds(template).includes(kind);
};
const rowsCountByKind = (items: Counterparty[], kind: 'ФЛ' | 'ЮЛ') =>
  items.filter((item) => (kind === 'ФЛ' ? isIndividualCounterparty(item) : !isIndividualCounterparty(item))).length;
const getCounterpartyTypeOptions = (kind: PartyKindFilter): (CounterpartyType | 'Все')[] => {
  if (kind === 'ФЛ') return ['Все', 'ФЛ'];
  if (kind === 'ЮЛ') return ['Все', ...legalCounterpartyTypes];
  return ['Все', ...counterpartyTypes];
};
const normalizeCounterpartyTypeForKind = (kind: PartyKindFilter, type: CounterpartyType | 'Все') => {
  const options = getCounterpartyTypeOptions(kind);
  return options.includes(type) ? type : 'Все';
};
const normalizeRiskLimit = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};
const formatRiskLimitFilter = (value: string) => {
  const limit = Number(value);
  if (!limit) return 'Любой риск';
  if (limit >= 80) return `От ${limit}: критичный риск`;
  if (limit >= 60) return `От ${limit}: высокий риск`;
  if (limit >= 50) return `От ${limit}: требуется контроль`;
  return `От ${limit}: наблюдение`;
};
type SavedFilterPayload = Record<string, string | number>;
const encodeSavedFilter = (payload: SavedFilterPayload) => JSON.stringify(payload);
const decodeSavedFilter = (query: string): SavedFilterPayload | null => {
  try {
    const parsed = JSON.parse(query);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as SavedFilterPayload;
  } catch {
    const payload: SavedFilterPayload = {};
    query
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (part.startsWith('risk>=')) {
          payload.riskLimit = Number(part.replace('risk>=', '').trim());
          return;
        }
        const [key, ...valueParts] = part.split('=');
        if (key && valueParts.length) payload[key.trim()] = valueParts.join('=').trim();
      });
    const legacyRisk = query.match(/riskScore\s*>\s*(\d+)/);
    if (legacyRisk) payload.riskLimit = Number(legacyRisk[1]);
    const legacyStatus = query.match(/status=([^;]+?)(?:\s+OR|\s+AND|$)/);
    if (legacyStatus) payload.status = legacyStatus[1].trim();
    return Object.keys(payload).length ? payload : null;
  }
  return null;
};
const inferProcessType = (templateName: string) => {
  const normalized = normalize(templateName);
  if (normalized.includes('акци')) return 'Маркетинговая акция';
  if (normalized.includes('штраф') || normalized.includes('уведомлен')) return 'Уведомление/штраф';
  if (normalized.includes('обращ')) return 'Клиентское обращение';
  if (normalized.includes('актуализац') || normalized.includes('согласи') || normalized.includes('профил')) return 'Актуализация данных';
  return 'Подключение сервиса';
};
const buildTaskTitle = (templateName: string, subject: string) => {
  const titled = templateName.replace('контрагента', subject).replace('клиента', subject);
  return titled === templateName ? `${templateName}: ${subject}` : titled;
};
const documentFormatByExtension: Record<string, BusinessDocument['format']> = {
  pdf: 'PDF',
  docx: 'DOCX',
  xlsx: 'XLSX',
  csv: 'CSV',
  jpg: 'JPG',
  jpeg: 'JPG',
  png: 'PNG',
  xml: 'XML',
  zip: 'ZIP',
  txt: 'TXT'
};
const getDocumentFormat = (fileName: string): BusinessDocument['format'] => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return documentFormatByExtension[extension] ?? 'OTHER';
};
const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${bytes} Б`;
};
const controlDateMarker = (counterpartyId: string, date: string) => `control-date:${counterpartyId}:${date}`;
const manualTaskTypeOptions = [
  {
    id: 'tt-manual-control',
    label: 'Контрольная проверка',
    partyKinds: ['ФЛ', 'ЮЛ'] as ProcessPartyKind[],
    defaultPriority: 'Высокий' as Priority,
    defaultGroup: 'Операционный контроль',
    title: (subject: string) => `Контрольная проверка: ${subject}`,
    requiredFields: ['Проверен профиль контрагента', 'Проверены активные задачи и процессы', 'Зафиксирован результат контроля'],
    preview: 'Рабочий лист для планового или внепланового контроля карточки.'
  },
  {
    id: 'tt-manual-data-request',
    label: 'Запрос данных/документов',
    partyKinds: ['ФЛ', 'ЮЛ'] as ProcessPartyKind[],
    defaultPriority: 'Средний' as Priority,
    defaultGroup: 'Операционный контроль',
    title: (subject: string) => `Запросить данные: ${subject}`,
    requiredFields: ['Сформулирован запрос', 'Указан адресат и срок ответа', 'Зафиксирован результат получения данных'],
    preview: 'Универсальная задача для запроса сведений у клиента, контрагента или внутренней группы.'
  },
  {
    id: 'tt-manual-document',
    label: 'Проверка документа',
    partyKinds: ['ФЛ', 'ЮЛ'] as ProcessPartyKind[],
    defaultPriority: 'Средний' as Priority,
    defaultGroup: 'Юридическое сопровождение',
    title: (subject: string) => `Проверить документ: ${subject}`,
    requiredFields: ['Проверено назначение документа', 'Проверены реквизиты и связь с объектом', 'Принято решение по документу'],
    preview: 'Задача для проверки файла, договорной карточки, ЭВД или рабочего материала.'
  },
  {
    id: 'tt-manual-service-incident',
    label: 'Сервисный инцидент',
    partyKinds: ['ФЛ', 'ЮЛ'] as ProcessPartyKind[],
    defaultPriority: 'Высокий' as Priority,
    defaultGroup: 'Технологическая интеграция',
    title: (subject: string) => `Разобрать сервисный инцидент: ${subject}`,
    requiredFields: ['Определен затронутый сервис', 'Зафиксирована причина и влияние', 'Назначен план восстановления или обходное решение'],
    preview: 'Рабочий лист для инцидента по подключенному продукту или сервису.'
  },
  {
    id: 'tt-manual-followup',
    label: 'Follow-up по коммуникации',
    partyKinds: ['ФЛ', 'ЮЛ'] as ProcessPartyKind[],
    defaultPriority: 'Средний' as Priority,
    defaultGroup: 'Операционный контроль',
    title: (subject: string) => `Follow-up: ${subject}`,
    requiredFields: ['Итог коммуникации', 'Следующий шаг', 'Ответственный'],
    preview: 'Задача по договоренности после звонка, встречи, письма или обращения.'
  },
  {
    id: 'tt-manual-free',
    label: 'Свободная задача',
    partyKinds: ['ФЛ', 'ЮЛ'] as ProcessPartyKind[],
    defaultPriority: 'Средний' as Priority,
    defaultGroup: 'Операционный контроль',
    title: (subject: string) => `Рабочая задача: ${subject}`,
    requiredFields: ['Описание результата', 'Основание выполнения', 'Следующее действие'],
    preview: 'Максимально универсальная карточка, если задача не привязана к процессу.'
  }
] as const;
type ManualTaskTypeId = (typeof manualTaskTypeOptions)[number]['id'];
const getManualTaskType = (id: string) => manualTaskTypeOptions.find((item) => item.id === id) ?? manualTaskTypeOptions[0];

function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [role, setRole] = useState<RoleKey>(() => loadRole());
  const [route, setRoute] = useState<RouteState>({ page: 'dashboard' });
  const [modal, setModal] = useState<ModalState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [globalQuery, setGlobalQuery] = useState('');
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  useEffect(() => saveData(data), [data]);
  useEffect(() => saveRole(role), [role]);

  const currentRole = roles.find((item) => item.key === role) ?? roles[0];
  const currentUser = data.users.find((user) => user.id === currentRole.userId) ?? data.users[0];

  const notify = (message: string, tone: ToastTone = 'success') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  };

  const mutate = (updater: (draft: AppData) => void) => {
    setData((previous) => {
      const draft = cloneState(previous);
      updater(draft);
      return draft;
    });
  };

  const addAudit = (
    draft: AppData,
    action: string,
    objectType: string,
    objectName: string,
    result: AuditLog['result'] = 'Успешно',
    type: AuditLog['logType'] = 'Действие пользователя'
  ) => {
    draft.auditLogs.unshift(makeAudit(draft, currentUser.id, action, objectType, objectName, result, type));
  };

  const ensureControlDateTask = (draft: AppData, counterparty: Counterparty, reason: string) => {
    if (daysBetween(counterparty.nextControlDate) > 0) return undefined;
    const marker = controlDateMarker(counterparty.id, counterparty.nextControlDate);
    const existingTask = draft.tasks.find((task) => task.links.includes(marker));
    if (existingTask) return existingTask.id;

    const overdueDays = Math.abs(Math.min(0, daysBetween(counterparty.nextControlDate)));
    const taskId = `TASK-CTL-${3000 + draft.tasks.length}`;
    const assignee = draft.users.find((user) => user.id === counterparty.curatorId);
    draft.tasks.unshift({
      id: taskId,
      title: `Контрольная проверка: ${counterparty.shortName}`,
      templateId: 'tt-control-date-review',
      status: overdueDays ? 'Просрочена' : 'Новая',
      priority: overdueDays ? 'Критичный' : 'Высокий',
      counterpartyId: counterparty.id,
      assigneeId: counterparty.curatorId,
      assigneeGroup: 'Операционный контроль',
      dueDate: counterparty.nextControlDate,
      createdAt: '2026-08-04T12:05:00+07:00',
      requiredFields: ['Проверен профиль контрагента', 'Проверены активные процессы и задачи', 'Зафиксирован результат контроля'],
      completedFields: [],
      timeSpentHours: 0,
      links: [counterparty.id, marker],
      comments: [
        overdueDays
          ? `Создана по просроченной контрольной дате ${formatDate(counterparty.nextControlDate)}. Просрочка: ${overdueDays} дн.`
          : `Создана по наступившей контрольной дате ${formatDate(counterparty.nextControlDate)}.`
      ],
      history: [
        {
          at: '2026-08-04T12:05:00+07:00',
          actorId: currentUser.id,
          action: 'Создана по контрольной дате',
          details: reason,
          status: overdueDays ? 'Просрочена' : 'Новая'
        }
      ]
    });
    draft.notifications.unshift({
      id: `NTF-${450 + draft.notifications.length}`,
      channel: 'Внутрисистемное',
      status: 'Доставлено',
      recipient: assignee?.name ?? 'Операционный контроль',
      trigger: 'Наступление контрольной даты',
      objectId: taskId,
      at: '2026-08-04T12:05:01+07:00'
    });
    if (overdueDays && !['Архив', 'Приостановлен'].includes(counterparty.status)) counterparty.status = 'Риск';
    addAudit(draft, 'Автоматическое создание задачи по контрольной дате', 'Задача', taskId, 'Успешно', 'Системное событие');
    return taskId;
  };

  useEffect(() => {
    const hasMissingControlTasks = data.counterparties.some(
      (counterparty) =>
        daysBetween(counterparty.nextControlDate) <= 0 &&
        !data.tasks.some((task) => task.links.includes(controlDateMarker(counterparty.id, counterparty.nextControlDate)))
    );
    if (!hasMissingControlTasks) return;
    mutate((draft) => {
      draft.counterparties.forEach((counterparty) => {
        ensureControlDateTask(draft, counterparty, 'Контрольная дата наступила при открытии CRM');
      });
    });
  }, [data.counterparties, data.tasks]);

  const navigate = (next: RouteState) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchRole = (nextRole: RoleKey) => {
    setRole(nextRole);
    const startPage: RouteState = nextRole === 'department' ? { page: 'tasks' } : { page: 'dashboard' };
    setRoute(startPage);
    notify(`Роль переключена: ${roles.find((item) => item.key === nextRole)?.label}`, 'info');
  };

  const runGlobalSearch = () => {
    const query = normalize(globalQuery);
    if (!query) {
      notify('Введите название, ФИО, ИНН, номер процесса или задачи', 'warning');
      return;
    }

    const counterparty = data.counterparties.find(
      (item) => normalize(`${item.id} ${item.name} ${item.shortName} ${item.inn}`).includes(query)
    );
    if (counterparty) {
      navigate({ page: 'counterparty', id: counterparty.id, tab: 'profile' });
      notify(`Открыта карточка ${counterparty.shortName}`, 'success');
      return;
    }

    const process = data.processes.find((item) => normalize(`${item.id} ${item.title}`).includes(query));
    if (process) {
      navigate({ page: 'process', id: process.id, tab: 'route' });
      notify(`Открыт процесс ${process.id}`, 'success');
      return;
    }

    const task = data.tasks.find((item) => normalize(`${item.id} ${item.title}`).includes(query));
    if (task) {
      setModal({ type: 'taskDetail', id: task.id });
      notify(`Открыта задача ${task.id}`, 'success');
      return;
    }

    notify('Совпадений в данных CRM не найдено', 'warning');
  };

  const restoreInitialDemoState = (message = 'Демо-данные восстановлены') => {
    const restored = resetData();
    setData(restored);
    setRole('curator');
    saveRole('curator');
    setRoute({ page: 'dashboard' });
    setModal(null);
    setGlobalQuery('');
    setHiddenWidgets([]);
    notify(message, 'info');
  };

  useEffect(() => {
    const resetFromServiceHash = () => {
      if (window.location.hash.replace(/\/+$/, '') !== RESET_DATA_HASH) return;

      restoreInitialDemoState('Демо-данные восстановлены через служебный адрес');
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    };

    resetFromServiceHash();
    window.addEventListener('hashchange', resetFromServiceHash);
    return () => window.removeEventListener('hashchange', resetFromServiceHash);
  }, []);

  const resetPrototype = () => {
    restoreInitialDemoState();
  };

  const simulateIncomingCall = () => {
    mutate((draft) => {
      const counterparty = draft.counterparties.find((item) => item.id === 'КО-000219');
      if (!counterparty) return;
      draft.communications.unshift({
        id: `COM-${700 + draft.communications.length + 1}`,
        counterpartyId: counterparty.id,
        type: 'Звонок',
        subject: 'Входящий звонок распознан телефонией',
        at: '2026-08-04T12:08:00+07:00',
        responsibleId: currentUser.id,
        summary: 'Система сопоставила номер с основным контактом ВКЦ и открыла единый профиль контрагента.',
        nextAction: 'Зафиксировать итог звонка и связать его с процессом BP-2026-0152',
        recording: 'call-20260804-1208.mp3'
      });
      draft.integrations.unshift({
        id: `INT-${600 + draft.integrations.length}`,
        system: 'Телефония',
        status: 'Успешно',
        lastSync: '2026-08-04T12:08:00+07:00',
        objectType: 'Контрагент',
        objectId: counterparty.id,
        operation: 'Сопоставление входящего звонка с карточкой',
        records: 1,
        errors: [],
        log: [
          { at: '2026-08-04T12:08:00+07:00', level: 'INFO', message: 'Номер +7 423 240-09-18 сопоставлен с контактом Ольга Шестакова' }
        ]
      });
      addAudit(draft, 'Автоматическое открытие карточки по звонку', 'Контрагент', counterparty.id, 'Успешно', 'Межсистемное взаимодействие');
    });
    navigate({ page: 'counterparty', id: 'КО-000219', tab: 'communications' });
    notify('Телефония распознала входящий звонок и открыла карточку ВКЦ', 'info');
  };

  const createCounterparty = (form: Partial<Counterparty>) => {
    const partyKind = form.partyKind ?? (form.type === 'ФЛ' ? 'ФЛ' : 'ЮЛ');
    const type = partyKind === 'ФЛ' ? 'ФЛ' : form.type ?? 'КО';
    const id = `${type}-${String(data.counterparties.length + 321).padStart(6, '0')}`;
    mutate((draft) => {
      draft.counterparties.unshift({
        id,
        name: form.name ?? '',
        shortName: form.shortName ?? '',
        partyKind,
        type,
        status: form.status ?? 'Подключение',
        inn: form.inn ?? '',
        kpp: partyKind === 'ФЛ' ? 'не применяется' : form.kpp ?? '',
        ogrn: partyKind === 'ФЛ' ? 'не применяется' : form.ogrn ?? '0000000000000',
        region: form.region ?? 'Москва',
        address: form.address ?? 'Адрес уточняется',
        curatorId: currentUser.id,
        segment: form.segment ?? (partyKind === 'ФЛ' ? 'Новый клиент ФЛ' : 'Новый контрагент ЮЛ'),
        riskScore: 24,
        lastTouch: '2026-08-04T12:00:00+07:00',
        nextControlDate: '2026-08-11',
        officialRequests: 0,
        penalties: 0,
        services: [],
        contacts: partyKind === 'ФЛ' && form.contacts?.[0] ? form.contacts : [],
        departments: partyKind === 'ФЛ' ? ['Контактный центр'] : ['Операционный контроль'],
        birthDate: form.birthDate,
        identityDocument: form.identityDocument,
        loyaltyId: form.loyaltyId,
        customerValue: form.customerValue,
        preferredChannel: form.preferredChannel,
        consentStatus: form.consentStatus,
        personalDataLevel: form.personalDataLevel,
        maskedCard: form.maskedCard,
        appealCategory: form.appealCategory
      });
      addAudit(draft, 'Создание бизнес-сущности', 'Контрагент', id);
    });
    navigate({ page: 'counterparty', id, tab: 'profile' });
    notify(`Контрагент ${id} создан и связан с куратором`, 'success');
  };

  const updateCounterparty = (id: string, form: Partial<Counterparty>) => {
    mutate((draft) => {
      const item = draft.counterparties.find((counterparty) => counterparty.id === id);
      if (!item) return;
      Object.assign(item, form, { lastTouch: '2026-08-04T12:05:00+07:00' });
      addAudit(draft, 'Редактирование бизнес-сущности', 'Контрагент', id);
    });
    notify(`Карточка ${id} обновлена`, 'success');
  };

  const deleteCounterparty = (id: string) => {
    const item = getCounterparty(data, id);
    if (!item) return;
    if (!window.confirm(`Удалить запись ${item.shortName}? Связанные процессы останутся в журнале CRM.`)) return;
    mutate((draft) => {
      draft.counterparties = draft.counterparties.filter((counterparty) => counterparty.id !== id);
      addAudit(draft, 'Удаление бизнес-сущности при подтверждении', 'Контрагент', id, 'Предупреждение');
    });
    navigate({ page: 'counterparties' });
    notify(`Запись ${id} удалена`, 'warning');
  };

  const startProcess = (counterpartyId: string, templateId: string, dueDate: string, title: string) => {
    const template = data.processTemplates.find((item) => item.id === templateId);
    const counterparty = getCounterparty(data, counterpartyId);
    if (!template || !counterparty) return;
    const processId = `BP-2026-${String(170 + data.processes.length).padStart(4, '0')}`;
    const taskTemplate = data.taskTemplates.find((task) => task.id === template.stages[0]?.autoTaskTemplateId);
    const taskId = `TASK-${2100 + data.tasks.length}`;
    const integrationId = `INT-${620 + data.integrations.length}`;

    mutate((draft) => {
      const process: ProcessInstance = {
        id: processId,
        templateId,
        title,
        type: template.processType ?? inferProcessType(template.name),
        status: 'Запущен',
        counterpartyId,
        stageIndex: 0,
        startedAt: '2026-08-04T12:00:00+07:00',
        dueDate,
        initiatorId: currentUser.id,
        ownerDepartment: template.stages[0]?.department ?? 'Офис управления процессами',
        currentGroup: template.stages[0]?.department ?? 'Операционный контроль',
        priority: taskTemplate?.defaultPriority ?? 'Средний',
        elapsedHours: 0,
        businessObjectId: `ЗК-${processId.slice(-4)}`,
        taskIds: [taskId],
        documentIds: [],
        integrationIds: [integrationId],
        history: [
          {
            at: '2026-08-04T12:00:00+07:00',
            actorId: currentUser.id,
            action: 'Ручной запуск процесса',
            details: `Создана первая задача по шаблону "${taskTemplate?.name ?? 'Задача'}"`,
            status: 'Новая'
          }
        ]
      };
      draft.processes.unshift(process);
      draft.tasks.unshift({
        id: taskId,
        title: taskTemplate ? buildTaskTitle(taskTemplate.name, counterparty.shortName) : `Первичная задача по ${counterparty.shortName}`,
        templateId: taskTemplate?.id ?? 'manual',
        status: 'Новая',
        priority: taskTemplate?.defaultPriority ?? 'Средний',
        counterpartyId,
        processId,
        assigneeGroup: taskTemplate?.assigneeGroup ?? process.currentGroup,
        dueDate: dueDate,
        createdAt: '2026-08-04T12:00:00+07:00',
        requiredFields: taskTemplate?.requiredFields ?? ['Описание результата'],
        completedFields: [],
        timeSpentHours: 0,
        links: [counterpartyId, processId],
        comments: ['Создана автоматически при запуске процесса.'],
        history: [
          {
            at: '2026-08-04T12:00:00+07:00',
            actorId: currentUser.id,
            action: 'Создана автоматически',
            details: 'Запуск бизнес-процесса',
            status: 'Новая'
          }
        ]
      });
      draft.integrations.unshift({
        id: integrationId,
        system: 'СЭД',
        status: 'Успешно',
        lastSync: '2026-08-04T12:00:02+07:00',
        objectType: 'Процесс',
        objectId: processId,
        operation: 'Проверка зарегистрированных обращений перед запуском',
        records: counterparty.officialRequests,
        errors: [],
        log: [
          { at: '2026-08-04T12:00:01+07:00', level: 'INFO', message: 'Синхронная проверка контрагента завершена' },
          { at: '2026-08-04T12:00:02+07:00', level: 'INFO', message: `Найдено обращений: ${counterparty.officialRequests}` }
        ]
      });
      draft.notifications.unshift({
        id: `NTF-${330 + draft.notifications.length}`,
        channel: 'Внутрисистемное',
        status: 'Доставлено',
        recipient: taskTemplate?.assigneeGroup ?? process.currentGroup,
        trigger: 'Автосоздание задачи',
        objectId: taskId,
        at: '2026-08-04T12:00:03+07:00'
      });
      addAudit(draft, 'Ручной запуск бизнес-процесса', 'Процесс', processId);
      addAudit(draft, 'Автоматическое создание задачи по шаблону', 'Задача', taskId, 'Успешно', 'Системное событие');
    });
    setModal(null);
    navigate({ page: 'process', id: processId, tab: 'route' });
    notify(`Процесс ${processId} запущен, задача ${taskId} создана автоматически`, 'success');
  };

  const advanceProcess = (processId: string, allowAutoComplete = false) => {
  const process = getProcess(data, processId);
  const template = data.processTemplates.find((item) => item.id === process?.templateId);
  if (!process || !template || ['Завершен', 'Остановлен'].includes(process.status)) return;
  const counterparty = getCounterparty(data, process.counterpartyId);
  const currentStage = template.stages[process.stageIndex];
    const nextStage = template.stages[process.stageIndex + 1];
    const currentTaskIds = process.taskIds.filter((taskId) => {
      const task = getTask(data, taskId);
      return task?.templateId === currentStage?.autoTaskTemplateId && task.status !== 'Выполнена';
    });
    if (currentTaskIds.length && !allowAutoComplete) {
      setModal({ type: 'taskDetail', id: currentTaskIds[0] });
      notify('Сначала выполните обязательную задачу текущего этапа', 'warning');
      return;
    }
    const createdTaskId = nextStage ? `TASK-${2110 + data.tasks.length}` : '';

    mutate((draft) => {
      const draftProcess = draft.processes.find((item) => item.id === processId);
      if (!draftProcess) return;
      currentTaskIds.forEach((taskId) => {
        const draftTask = draft.tasks.find((task) => task.id === taskId);
        if (draftTask) {
          draftTask.status = 'Выполнена';
          draftTask.completedFields = [...draftTask.requiredFields];
          draftTask.history.unshift({
            at: '2026-08-04T12:15:00+07:00',
            actorId: currentUser.id,
            action: 'Этапная задача выполнена',
            details: 'Заполнены обязательные поля этапа',
            status: 'Выполнена'
          });
        }
      });

      if (nextStage) {
        const nextTemplate = draft.taskTemplates.find((taskTemplate) => taskTemplate.id === nextStage.autoTaskTemplateId);
        draftProcess.stageIndex += 1;
        draftProcess.status = 'В работе';
        draftProcess.currentGroup = nextStage.department;
        draftProcess.elapsedHours += currentStage?.slaHours ?? 4;
        draftProcess.taskIds.push(createdTaskId);
        draftProcess.history.unshift({
          at: '2026-08-04T12:15:00+07:00',
          actorId: currentUser.id,
          action: 'Переход этапа',
          details: `Завершен этап "${currentStage?.name}", создана задача "${nextTemplate?.name}"`,
          status: 'В работе'
        });
        draft.tasks.unshift({
          id: createdTaskId,
          title: nextTemplate ? buildTaskTitle(nextTemplate.name, counterparty?.shortName ?? draftProcess.counterpartyId) : `Задача этапа ${nextStage.name}`,
          templateId: nextTemplate?.id ?? 'manual',
          status: 'Новая',
          priority: nextTemplate?.defaultPriority ?? draftProcess.priority,
          counterpartyId: draftProcess.counterpartyId,
          processId: draftProcess.id,
          assigneeGroup: nextStage.department,
          dueDate: draftProcess.dueDate,
          createdAt: '2026-08-04T12:15:00+07:00',
          requiredFields: nextTemplate?.requiredFields ?? nextStage.requiredAttributes,
          completedFields: [],
          timeSpentHours: 0,
          links: [draftProcess.counterpartyId, draftProcess.id],
          comments: ['Создана автоматически после завершения предыдущего этапа.'],
          history: [
            {
              at: '2026-08-04T12:15:00+07:00',
              actorId: currentUser.id,
              action: 'Создана автоматически',
              details: `Маршрут процесса: ${currentStage?.name} -> ${nextStage.name}`,
              status: 'Новая'
            }
          ]
        });
        draft.notifications.unshift({
          id: `NTF-${340 + draft.notifications.length}`,
          channel: 'Внутрисистемное',
          status: 'Доставлено',
          recipient: nextStage.department,
          trigger: 'Переход этапа процесса',
          objectId: createdTaskId,
          at: '2026-08-04T12:15:01+07:00'
        });
        addAudit(draft, 'Переход этапа и автосоздание задачи', 'Процесс', processId);
      } else {
        draftProcess.status = 'Завершен';
        draftProcess.elapsedHours += currentStage?.slaHours ?? 4;
        draftProcess.history.unshift({
          at: '2026-08-04T12:15:00+07:00',
          actorId: currentUser.id,
          action: 'Процесс завершен',
          details: 'Все этапы маршрута пройдены, данные переданы в витрину отчетности',
          status: 'Выполнена'
        });
        draft.integrations.unshift({
          id: `INT-${640 + draft.integrations.length}`,
          system: 'DWH',
          status: 'Успешно',
          lastSync: '2026-08-04T12:15:03+07:00',
          objectType: 'Процесс',
          objectId: processId,
          operation: 'Передача итоговых метрик процесса',
          records: draftProcess.taskIds.length,
          errors: [],
          log: [{ at: '2026-08-04T12:15:03+07:00', level: 'INFO', message: 'Итоги процесса обновили dashboard CRM_OPER' }]
        });
        addAudit(draft, 'Завершение бизнес-процесса', 'Процесс', processId);
      }
    });
    notify(nextStage ? `Этап завершен, создана следующая задача ${createdTaskId}` : `Процесс ${processId} завершен`, 'success');
  };

  const stopProcess = (processId: string) => {
    if (!window.confirm(`Принудительно остановить процесс ${processId}?`)) return;
    mutate((draft) => {
      const process = draft.processes.find((item) => item.id === processId);
      if (!process) return;
      process.status = 'Остановлен';
      process.history.unshift({
        at: '2026-08-04T12:20:00+07:00',
        actorId: currentUser.id,
        action: 'Принудительная остановка',
        details: 'Связанные задачи переведены в ожидание решения владельца процесса',
        status: 'Отменена'
      });
      draft.tasks.forEach((task) => {
        if (task.processId === processId && !['Выполнена', 'Отменена'].includes(task.status)) task.status = 'Отменена';
      });
      addAudit(draft, 'Принудительная остановка процесса', 'Процесс', processId, 'Предупреждение');
    });
    notify(`Процесс ${processId} остановлен`, 'warning');
  };

  const updateTaskStatus = (taskId: string, status?: TaskStatus) => {
    mutate((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      if (!task) return;
      task.status = status ?? nextTaskStatus(task.status);
      if (task.status === 'Выполнена') task.completedFields = [...task.requiredFields];
      task.history.unshift({
        at: '2026-08-04T12:25:00+07:00',
        actorId: currentUser.id,
        action: 'Изменение статуса',
        details: `Новый статус: ${task.status}`,
        status: task.status
      });
      addAudit(draft, 'Изменение статуса задачи', 'Задача', taskId);
    });
    notify(`Статус задачи ${taskId} обновлен`, 'success');
  };

  const executeTask = (taskId: string, completedFields: string[], result: string, spentHours: number, complete: boolean) => {
    mutate((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      if (!task) return;
      const normalizedFields = task.requiredFields.filter((field) => completedFields.includes(field));
      const allRequiredDone = task.requiredFields.every((field) => normalizedFields.includes(field));
      const safeHours = Number.isFinite(spentHours) && spentHours >= 0 ? spentHours : task.timeSpentHours;
      const trimmedResult = result.trim();

      task.completedFields = normalizedFields;
      task.timeSpentHours = Math.max(task.timeSpentHours, safeHours);
      if (trimmedResult) task.comments.unshift(`Результат выполнения: ${trimmedResult}`);
      task.status = complete ? 'Выполнена' : allRequiredDone ? 'На проверке' : task.status === 'Новая' ? 'В работе' : task.status;
      task.history.unshift({
        at: '2026-08-05T10:20:00+07:00',
        actorId: currentUser.id,
        action: complete ? 'Задача выполнена исполнителем' : 'Результат выполнения сохранен',
        details: trimmedResult || `Заполнено обязательных полей: ${normalizedFields.length}/${task.requiredFields.length}`,
        status: task.status
      });

      if (task.processId) {
        const process = draft.processes.find((item) => item.id === task.processId);
        process?.history.unshift({
          at: '2026-08-05T10:20:00+07:00',
          actorId: currentUser.id,
          action: complete ? 'Выполнена задача этапа' : 'Обновлен результат задачи этапа',
          details: `${task.id}: ${trimmedResult || task.title}`,
          status: task.status
        });
      }
      addAudit(draft, complete ? 'Выполнение задачи исполнителем' : 'Сохранение результата задачи', 'Задача', taskId);
    });
    notify(complete ? `Задача ${taskId} выполнена` : `Результат по задаче ${taskId} сохранен`, 'success');
  };

  const delegateTask = (taskId: string) => {
    mutate((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      if (!task) return;
      task.assigneeId = undefined;
      task.assigneeGroup = task.assigneeGroup === 'Технологическая интеграция' ? 'Операционный контроль' : 'Технологическая интеграция';
      task.history.unshift({
        at: '2026-08-04T12:28:00+07:00',
        actorId: currentUser.id,
        action: 'Делегирование',
        details: `Ответственный изменен на группу ${task.assigneeGroup}`,
        status: task.status
      });
      addAudit(draft, 'Делегирование задачи группе пользователей', 'Задача', taskId);
    });
    notify(`Задача ${taskId} делегирована группе`, 'info');
  };

  const undoTask = (taskId: string) => {
    mutate((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      if (!task) return;
      const previous = task.history.find((entry) => entry.status && entry.status !== task.status)?.status ?? 'Назначена';
      task.status = previous;
      task.history.unshift({
        at: '2026-08-04T12:31:00+07:00',
        actorId: currentUser.id,
        action: 'Откат к точке истории',
        details: `Статус восстановлен: ${previous}`,
        status: previous
      });
      addAudit(draft, 'Откат изменений задачи к истории', 'Задача', taskId);
    });
    notify(`Задача ${taskId} откатана к предыдущему состоянию`, 'warning');
  };

  const createTask = (payload: TaskCreatePayload) => {
    const id = `TASK-${2120 + data.tasks.length}`;
    mutate((draft) => {
      draft.tasks.unshift({
        id,
        title: payload.title,
        templateId: payload.templateId,
        status: 'Новая',
        priority: payload.priority,
        counterpartyId: payload.counterpartyId,
        processId: payload.processId,
        assigneeGroup: payload.assigneeGroup,
        dueDate: payload.dueDate,
        createdAt: '2026-08-04T12:35:00+07:00',
        requiredFields: payload.requiredFields,
        completedFields: [],
        timeSpentHours: 0,
        links: [payload.counterpartyId, payload.processId].filter(Boolean) as string[],
        comments: [payload.comment || 'Создана вручную из интерфейса CRM.'],
        history: [
          {
            at: '2026-08-04T12:35:00+07:00',
            actorId: currentUser.id,
            action: 'Создана через GUI',
            details: `Тип задачи: ${getManualTaskType(payload.templateId).label}`,
            status: 'Новая'
          }
        ]
      });
      const process = payload.processId ? draft.processes.find((item) => item.id === payload.processId) : undefined;
      process?.taskIds.push(id);
      process?.history.unshift({
        at: '2026-08-04T12:35:00+07:00',
        actorId: currentUser.id,
        action: 'Создана ручная задача',
        details: `${id}: ${payload.title}`,
        status: process.status === 'Завершен' ? 'Выполнена' : 'В работе'
      });
      addAudit(draft, 'Создание задачи через GUI', 'Задача', id);
    });
    setModal(null);
    notify(`Задача ${id} создана`, 'success');
  };

  const addCommunication = (payload: CommunicationFormValues) => {
    const communicationId = `COM-${820 + data.communications.length}`;
    const taskId = payload.createTask ? `TASK-${2180 + data.tasks.length}` : undefined;
    mutate((draft) => {
      const counterparty = draft.counterparties.find((item) => item.id === payload.counterpartyId);
      const process = payload.processId ? draft.processes.find((item) => item.id === payload.processId) : undefined;
      draft.communications.unshift({
        id: communicationId,
        counterpartyId: payload.counterpartyId,
        type: payload.type,
        subject: payload.subject,
        at: payload.at,
        responsibleId: currentUser.id,
        summary: payload.summary,
        nextAction: payload.nextAction,
        status: payload.status,
        channel: payload.channel,
        processId: payload.processId || undefined,
        agenda: payload.agenda.split('\n').map((item) => item.trim()).filter(Boolean),
        participants: payload.participants.split(',').map((item) => item.trim()).filter(Boolean),
        outcome: payload.status === 'Запланирована' ? undefined : payload.summary,
        linkedTaskIds: taskId ? [taskId] : undefined
      });
      if (counterparty) counterparty.lastTouch = payload.at;
      if (process) {
        process.history.unshift({
          at: payload.at,
          actorId: currentUser.id,
          action: payload.status === 'Запланирована' ? 'Запланирована коммуникация' : 'Зафиксирована коммуникация',
          details: `${payload.type}: ${payload.subject}`,
          status: process.status === 'Завершен' ? 'Выполнена' : 'В работе'
        });
      }
      if (taskId) {
        draft.tasks.unshift({
          id: taskId,
          title: `Follow-up: ${payload.nextAction}`,
          templateId: 'tt-communication-followup',
          status: 'Новая',
          priority: 'Средний',
          counterpartyId: payload.counterpartyId,
          processId: payload.processId || undefined,
          assigneeGroup: payload.taskGroup,
          dueDate: payload.taskDueDate,
          createdAt: payload.at,
          requiredFields: ['Итог коммуникации', 'Следующий шаг', 'Ответственный'],
          completedFields: payload.status === 'Запланирована' ? [] : ['Итог коммуникации'],
          timeSpentHours: 0,
          links: [payload.counterpartyId, payload.processId, communicationId].filter(Boolean) as string[],
          comments: [`Создана автоматически из коммуникации: ${payload.subject}`],
          history: [
            {
              at: payload.at,
              actorId: currentUser.id,
              action: 'Создана из коммуникации',
              details: payload.nextAction,
              status: 'Новая'
            }
          ]
        });
        if (process) process.taskIds.push(taskId);
        draft.notifications.unshift({
          id: `NTF-${390 + draft.notifications.length}`,
          channel: 'Внутрисистемное',
          status: 'Доставлено',
          recipient: payload.taskGroup,
          trigger: 'Follow-up по коммуникации',
          objectId: taskId,
          at: payload.at
        });
        addAudit(draft, 'Автоматическое создание follow-up задачи', 'Задача', taskId, 'Успешно', 'Системное событие');
      }
      addAudit(draft, payload.status === 'Запланирована' ? 'Планирование коммуникации' : 'Фиксация итогов коммуникации', 'Коммуникация', communicationId);
    });
    setModal(null);
    notify(taskId ? `Коммуникация сохранена, создана follow-up задача ${taskId}` : 'Коммуникация сохранена в карточке', 'success');
  };

  const createFollowUpFromCommunication = (communicationId: string) => {
    const communication = data.communications.find((item) => item.id === communicationId);
    if (!communication) return;
    const taskId = `TASK-${2190 + data.tasks.length}`;
    mutate((draft) => {
      const draftCommunication = draft.communications.find((item) => item.id === communicationId);
      draft.tasks.unshift({
        id: taskId,
        title: `Follow-up по коммуникации: ${communication.nextAction}`,
        templateId: 'tt-communication-followup',
        status: 'Новая',
        priority: 'Средний',
        counterpartyId: communication.counterpartyId,
        processId: communication.processId,
        assigneeGroup: 'Операционный контроль',
        dueDate: '2026-08-08',
        createdAt: '2026-08-05T14:05:00+07:00',
        requiredFields: ['Итог коммуникации', 'Следующий шаг', 'Ответственный'],
        completedFields: communication.status === 'Проведена' ? ['Итог коммуникации'] : [],
        timeSpentHours: 0,
        links: [communication.counterpartyId, communication.processId, communication.id].filter(Boolean) as string[],
        comments: [`Создано из коммуникации "${communication.subject}"`],
        history: [{ at: '2026-08-05T14:05:00+07:00', actorId: currentUser.id, action: 'Создана из коммуникации', details: communication.nextAction, status: 'Новая' }]
      });
      if (draftCommunication) {
        draftCommunication.status = 'Требует follow-up';
        draftCommunication.linkedTaskIds = Array.from(new Set([...(draftCommunication.linkedTaskIds ?? []), taskId]));
      }
      const process = communication.processId ? draft.processes.find((item) => item.id === communication.processId) : undefined;
      process?.taskIds.push(taskId);
      addAudit(draft, 'Создание follow-up задачи из коммуникации', 'Задача', taskId);
    });
    notify(`Создана follow-up задача ${taskId}`, 'success');
  };

  const completeCommunication = (communicationId: string) => {
    mutate((draft) => {
      const communication = draft.communications.find((item) => item.id === communicationId);
      if (!communication) return;
      communication.status = 'Проведена';
      communication.outcome = communication.outcome ?? communication.summary;
      communication.summary = communication.summary.includes('Итог зафиксирован')
        ? communication.summary
        : `${communication.summary} Итог зафиксирован в CRM, следующий шаг: ${communication.nextAction}.`;
      const counterparty = draft.counterparties.find((item) => item.id === communication.counterpartyId);
      if (counterparty) counterparty.lastTouch = '2026-08-05T14:10:00+07:00';
      const process = communication.processId ? draft.processes.find((item) => item.id === communication.processId) : undefined;
      process?.history.unshift({
        at: '2026-08-05T14:10:00+07:00',
        actorId: currentUser.id,
        action: 'Зафиксирован итог коммуникации',
        details: communication.subject,
        status: process.status === 'Завершен' ? 'Выполнена' : 'В работе'
      });
      addAudit(draft, 'Документирование итогов коммуникации', 'Коммуникация', communicationId);
    });
    notify('Итог коммуникации зафиксирован', 'success');
  };

  const createInternalHandoff = (payload: HandoffFormValues) => {
    const handoffId = `HND-${9200 + data.internalHandoffs.length}`;
    const taskId = payload.createTask ? `TASK-${2200 + data.tasks.length}` : undefined;
    mutate((draft) => {
      const handoff: InternalHandoff = {
        id: handoffId,
        title: payload.title,
        sourceDepartment: payload.sourceDepartment,
        targetDepartment: payload.targetDepartment,
        status: 'Ожидает',
        priority: payload.priority,
        createdAt: '2026-08-05T14:15:00+07:00',
        dueDate: payload.dueDate,
        responsibleId: currentUser.id,
        counterpartyId: payload.counterpartyId,
        processId: payload.processId,
        taskId,
        comment: payload.comment,
        history: [
          {
            at: '2026-08-05T14:15:00+07:00',
            actorId: currentUser.id,
            action: 'Создано внутреннее поручение',
            details: `${payload.sourceDepartment} -> ${payload.targetDepartment}`,
            status: 'Новая'
          }
        ]
      };
      draft.internalHandoffs.unshift(handoff);
      if (taskId) {
        draft.tasks.unshift({
          id: taskId,
          title: payload.title,
          templateId: 'tt-internal-handoff',
          status: 'Новая',
          priority: payload.priority,
          counterpartyId: payload.counterpartyId,
          processId: payload.processId,
          assigneeGroup: payload.targetDepartment,
          dueDate: payload.dueDate,
          createdAt: '2026-08-05T14:15:00+07:00',
          requiredFields: ['Запрошенное действие', 'Результат подразделения', 'Комментарий для инициатора'],
          completedFields: ['Запрошенное действие'],
          timeSpentHours: 0,
          links: [payload.counterpartyId, payload.processId, payload.taskId, handoffId].filter(Boolean) as string[],
          comments: [payload.comment],
          history: [
            {
              at: '2026-08-05T14:15:00+07:00',
              actorId: currentUser.id,
              action: 'Создана по внутреннему поручению',
              details: payload.comment,
              status: 'Новая'
            }
          ]
        });
        const process = payload.processId ? draft.processes.find((item) => item.id === payload.processId) : undefined;
        process?.taskIds.push(taskId);
      }
      draft.notifications.unshift({
        id: `NTF-${410 + draft.notifications.length}`,
        channel: 'Внутрисистемное',
        status: 'Доставлено',
        recipient: payload.targetDepartment,
        trigger: 'Внутреннее поручение',
        objectId: handoffId,
        at: '2026-08-05T14:15:00+07:00'
      });
      addAudit(draft, 'Создание внутреннего поручения', 'Внутреннее взаимодействие', handoffId);
    });
    setModal(null);
    notify(taskId ? `Поручение ${handoffId} и задача ${taskId} созданы` : `Поручение ${handoffId} создано`, 'success');
  };

  const advanceInternalHandoff = (handoffId: string) => {
    const nextStatusMap: Record<InternalHandoffStatus, InternalHandoffStatus> = {
      Ожидает: 'В работе',
      'В работе': 'На проверке',
      'На проверке': 'Закрыто',
      Закрыто: 'Закрыто',
      Просрочено: 'В работе'
    };
    mutate((draft) => {
      const handoff = draft.internalHandoffs.find((item) => item.id === handoffId);
      if (!handoff) return;
      handoff.status = nextStatusMap[handoff.status];
      handoff.history.unshift({
        at: '2026-08-05T14:20:00+07:00',
        actorId: currentUser.id,
        action: 'Изменен статус поручения',
        details: `Новый статус: ${handoff.status}`,
        status: handoff.status === 'Закрыто' ? 'Выполнена' : 'В работе'
      });
      if (handoff.taskId) {
        const task = draft.tasks.find((item) => item.id === handoff.taskId);
        if (task) {
          task.status = handoff.status === 'Закрыто' ? 'Выполнена' : handoff.status === 'На проверке' ? 'На проверке' : 'В работе';
          if (task.status === 'Выполнена') task.completedFields = [...task.requiredFields];
          task.history.unshift({
            at: '2026-08-05T14:20:00+07:00',
            actorId: currentUser.id,
            action: 'Синхронизация со статусом поручения',
            details: `Поручение ${handoffId}: ${handoff.status}`,
            status: task.status
          });
        }
      }
      addAudit(draft, 'Изменение статуса внутреннего поручения', 'Внутреннее взаимодействие', handoffId);
    });
    notify(`Поручение ${handoffId} обновлено`, 'success');
  };

  const uploadDocument = (linkedObjectType: string, linkedObjectId: string) => {
    setModal({ type: 'documentUpload', linkedObjectType, linkedObjectId });
  };

  const attachDocument = (payload: DocumentUploadPayload) => {
    const id = `DOC-${930 + data.documents.length}`;
    const { linkedObjectType, linkedObjectId } = payload;
    const linkedProcess = linkedObjectType === 'Процесс' ? getProcess(data, linkedObjectId) : undefined;
    mutate((draft) => {
      draft.documents.unshift({
        id,
        name: payload.file.name,
        kind: 'Файл',
        format: getDocumentFormat(payload.file.name),
        size: formatFileSize(payload.file.size),
        status: 'Загружен',
        linkedObjectType,
        linkedObjectId,
        ownerId: currentUser.id,
        createdAt: '2026-08-04T12:45:00+07:00',
        businessPurpose: payload.businessPurpose,
        service: payload.service,
        version: 'загружен пользователем',
        nextAction: payload.nextAction,
        sourceFileName: payload.file.name,
        contentDataUrl: payload.contentDataUrl
      });
      if (linkedProcess) {
        const draftProcess = draft.processes.find((process) => process.id === linkedProcess.id);
        draftProcess?.documentIds.push(id);
        draftProcess?.history.unshift({
          at: '2026-08-04T12:45:00+07:00',
          actorId: currentUser.id,
          action: 'Добавлен файл к процессу',
          details: `${payload.file.name}: ${payload.businessPurpose}`,
          status: draftProcess.status === 'Завершен' ? 'Выполнена' : 'В работе'
        });
      }
      addAudit(draft, 'Загрузка файла в хранилище', linkedObjectType, linkedObjectId);
    });
    setModal(null);
    notify(`Файл ${payload.file.name} добавлен в документы`, 'success');
  };

  const updateControlDate = (payload: ControlDatePayload) => {
    const marker = controlDateMarker(payload.counterpartyId, payload.nextControlDate);
    const willCreateTask = daysBetween(payload.nextControlDate) <= 0 && !data.tasks.some((task) => task.links.includes(marker));
    const expectedTaskId = willCreateTask ? `TASK-CTL-${3000 + data.tasks.length}` : undefined;
    mutate((draft) => {
      const counterparty = draft.counterparties.find((item) => item.id === payload.counterpartyId);
      if (!counterparty) return;
      const previousDate = counterparty.nextControlDate;
      counterparty.nextControlDate = payload.nextControlDate;
      counterparty.lastTouch = '2026-08-04T12:42:00+07:00';
      ensureControlDateTask(
        draft,
        counterparty,
        `${payload.reason}. Предыдущая дата: ${formatDate(previousDate)}. ${payload.comment || 'Комментарий не указан.'}`
      );
      addAudit(draft, 'Изменение контрольной даты', 'Контрагент', counterparty.id);
    });
    setModal(null);
    notify(
      expectedTaskId
        ? `Контрольная дата изменена, создана задача ${expectedTaskId}`
        : 'Контрольная дата изменена',
      'success'
    );
  };

  const createEvd = (processId: string) => {
    const id = `EVD-${950 + data.documents.length}`;
    const linkedProcess = getProcess(data, processId);
    const linkedCounterparty = linkedProcess ? getCounterparty(data, linkedProcess.counterpartyId) : undefined;
    mutate((draft) => {
      draft.documents.unshift({
        id,
        name: `ЭВД основание по процессу ${processId}.docx`,
        kind: 'ЭВД',
        format: 'DOCX',
        size: '88 КБ',
        status: 'На проверке',
        linkedObjectType: 'Процесс',
        linkedObjectId: processId,
        ownerId: currentUser.id,
        createdAt: '2026-08-04T12:47:00+07:00',
        templateName: 'ЭВД: внутреннее основание процесса',
        businessPurpose: linkedProcess ? `Внутреннее основание по процессу: ${linkedProcess.title}` : `Внутреннее основание по процессу ${processId}`,
        service: linkedCounterparty?.services[0]?.service ?? linkedProcess?.type ?? 'Операционный процесс',
        version: 'сформировано CRM',
        nextAction: 'Проверить реквизиты ЭВД и приложить к результату этапа'
      });
      const process = draft.processes.find((item) => item.id === processId);
      process?.documentIds.push(id);
      addAudit(draft, 'Автоматическое создание ЭВД по шаблону', 'ЭВД', id, 'Успешно', 'Системное событие');
    });
    notify(`ЭВД ${id} создан по шаблону и связан с процессом`, 'success');
  };

  const retryIntegration = (id: string) => {
    mutate((draft) => {
      const integration = draft.integrations.find((item) => item.id === id);
      if (!integration) return;
      integration.status = 'Успешно';
      integration.lastSync = '2026-08-04T12:50:00+07:00';
      integration.errors = [];
      integration.log.unshift({ at: '2026-08-04T12:50:00+07:00', level: 'INFO', message: 'Повтор обмена выполнен успешно' });
      addAudit(draft, 'Повтор межсистемного обмена', 'Интеграция', id, 'Успешно', 'Межсистемное взаимодействие');
    });
    notify(`Обмен ${id} повторен успешно`, 'success');
  };

  const renderPage = () => {
    switch (route.page) {
      case 'dashboard':
        return (
          <DashboardPage
            data={data}
            role={role}
            currentUserId={currentUser.id}
            hiddenWidgets={hiddenWidgets}
            navigate={navigate}
            openModal={setModal}
            advanceProcess={advanceProcess}
            updateTaskStatus={updateTaskStatus}
          />
        );
      case 'counterparties':
        return (
          <CounterpartiesPage
            data={data}
            role={role}
            navigate={navigate}
            openModal={setModal}
            notify={notify}
            mutate={mutate}
            addAudit={addAudit}
            deleteCounterparty={deleteCounterparty}
            routeFilter={route.filter}
          />
        );
      case 'communications':
        return (
          <CommunicationsPage
            data={data}
            role={role}
            currentUserId={currentUser.id}
            navigate={navigate}
            openModal={setModal}
            completeCommunication={completeCommunication}
            createFollowUpFromCommunication={createFollowUpFromCommunication}
            notify={notify}
          />
        );
      case 'coordination':
        return (
          <CoordinationPage
            data={data}
            role={role}
            currentUserId={currentUser.id}
            navigate={navigate}
            openModal={setModal}
            advanceInternalHandoff={advanceInternalHandoff}
            notify={notify}
          />
        );
      case 'counterparty':
        return (
        <CounterpartyDetailPage
            data={data}
            id={route.id}
            tab={route.tab}
            role={role}
            navigate={navigate}
            openModal={setModal}
            uploadDocument={uploadDocument}
            createEvd={createEvd}
            deleteCounterparty={deleteCounterparty}
            mutate={mutate}
            addAudit={addAudit}
            notify={notify}
            completeCommunication={completeCommunication}
            createFollowUpFromCommunication={createFollowUpFromCommunication}
          />
        );
      case 'processes':
        return (
          <ProcessesPage
            data={data}
            role={role}
            navigate={navigate}
            openModal={setModal}
            advanceProcess={advanceProcess}
            stopProcess={stopProcess}
            notify={notify}
            mutate={mutate}
            addAudit={addAudit}
            routeFilter={route.filter}
          />
        );
      case 'process':
        return (
          <ProcessDetailPage
            data={data}
            id={route.id}
            tab={route.tab}
            navigate={navigate}
            role={role}
            openModal={setModal}
            advanceProcess={advanceProcess}
            stopProcess={stopProcess}
            uploadDocument={uploadDocument}
            createEvd={createEvd}
            retryIntegration={retryIntegration}
            advanceInternalHandoff={advanceInternalHandoff}
          />
        );
      case 'tasks':
        return (
          <TasksPage
            data={data}
            role={role}
            currentUserId={currentUser.id}
            navigate={navigate}
            openModal={setModal}
            updateTaskStatus={updateTaskStatus}
            delegateTask={delegateTask}
            undoTask={undoTask}
            notify={notify}
            mutate={mutate}
            addAudit={addAudit}
            routeFilter={route.filter}
          />
        );
      case 'reports':
        return <ReportsPage data={data} role={role} notify={notify} mutate={mutate} addAudit={addAudit} />;
      case 'designer':
        return <DesignerPage data={data} role={role} mutate={mutate} notify={notify} addAudit={addAudit} />;
      case 'integrations':
        return (
          <IntegrationsPage
            data={data}
            role={role}
            openModal={setModal}
            retryIntegration={retryIntegration}
            notify={notify}
            mutate={mutate}
            addAudit={addAudit}
          />
        );
      case 'wiki':
        return <WikiPage data={data} role={role} mutate={mutate} notify={notify} addAudit={addAudit} />;
      case 'dictionaries':
        return <DictionariesPage data={data} role={role} mutate={mutate} notify={notify} addAudit={addAudit} />;
      case 'logs':
        return <LogsPage data={data} role={role} notify={notify} routeFilter={route.filter} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate({ page: 'dashboard' })}>
          <span className="brand-mark">CRM</span>
          <span>
            <strong>Единый контур</strong>
            <small>Клиенты · процессы · сервисы</small>
          </span>
        </button>

        <nav className="side-nav">
          {roleNav[role].map((item) => (
            <button
              key={item.page}
              className={`side-nav-item ${route.page === item.page ? 'active' : ''}`}
              onClick={() => navigate({ page: item.page })}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>{currentRole.workspace}</span>
            <ChevronDown size={14} />
            <strong>{pageTitles[route.page]}</strong>
          </div>

          <div className="top-actions">
            <label className="global-search">
              <Search size={16} />
              <input
                value={globalQuery}
                onChange={(event) => setGlobalQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') runGlobalSearch();
                }}
                placeholder="Поиск: КО-000184, СРБ, TASK-2050"
              />
            </label>
            <IconButton title="Найти" icon={Search} onClick={runGlobalSearch} />
            <IconButton title="Входящий звонок" icon={Phone} onClick={simulateIncomingCall} />
            <IconButton title="Сбросить тестовые данные" icon={RotateCcw} onClick={resetPrototype} />
            <div className="role-switcher">
              <UserRound size={16} />
              <select value={role} onChange={(event) => switchRole(event.target.value as RoleKey)}>
                {roles.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {renderPage()}
      </main>

      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone}`}>
            {toast.message}
          </div>
        ))}
      </div>

      {modal?.type === 'counterpartyForm' && (
        <CounterpartyFormModal
          mode={modal.mode}
          item={modal.id ? getCounterparty(data, modal.id) : undefined}
          onClose={() => setModal(null)}
          onCreate={createCounterparty}
          onUpdate={updateCounterparty}
        />
      )}
      {modal?.type === 'startProcess' && (
        <StartProcessModal
          data={data}
          counterpartyId={modal.counterpartyId}
          onClose={() => setModal(null)}
          onStart={startProcess}
        />
      )}
      {modal?.type === 'taskForm' && (
        <TaskFormModal
          data={data}
          counterpartyId={modal.counterpartyId}
          processId={modal.processId}
          onClose={() => setModal(null)}
          onCreate={createTask}
        />
      )}
      {modal?.type === 'communication' && (
        <CommunicationModal
          data={data}
          counterparty={getCounterparty(data, modal.counterpartyId)}
          counterpartyId={modal.counterpartyId}
          onClose={() => setModal(null)}
          onCreate={addCommunication}
        />
      )}
      {modal?.type === 'contactDetail' && (
        <ContactDetailModal
          counterparty={getCounterparty(data, modal.counterpartyId)}
          contactId={modal.contactId}
          notify={notify}
          onClose={() => setModal(null)}
          openModal={setModal}
        />
      )}
      {modal?.type === 'controlDate' && (
        <ControlDateModal
          counterparty={getCounterparty(data, modal.counterpartyId)}
          onClose={() => setModal(null)}
          onSave={updateControlDate}
        />
      )}
      {modal?.type === 'documentUpload' && (
        <DocumentUploadModal
          data={data}
          linkedObjectType={modal.linkedObjectType}
          linkedObjectId={modal.linkedObjectId}
          onClose={() => setModal(null)}
          onUpload={attachDocument}
        />
      )}
      {modal?.type === 'internalHandoff' && (
        <InternalHandoffModal
          data={data}
          role={role}
          currentDepartment={currentUser.department}
          counterpartyId={modal.counterpartyId}
          processId={modal.processId}
          taskId={modal.taskId}
          onClose={() => setModal(null)}
          onCreate={createInternalHandoff}
        />
      )}
      {modal?.type === 'taskDetail' && (
        <TaskDetailModal
          data={data}
          role={role}
          taskId={modal.id}
          onClose={() => setModal(null)}
          updateTaskStatus={updateTaskStatus}
          executeTask={executeTask}
          advanceProcess={advanceProcess}
          delegateTask={delegateTask}
          undoTask={undoTask}
          navigate={navigate}
          openModal={setModal}
        />
      )}
      {modal?.type === 'integrationLog' && (
        <IntegrationLogModal
          item={data.integrations.find((integration) => integration.id === modal.id)}
          onClose={() => setModal(null)}
          retryIntegration={retryIntegration}
        />
      )}
      {modal?.type === 'widgets' && (
        <WidgetSettingsModal
          hiddenWidgets={hiddenWidgets}
          setHiddenWidgets={setHiddenWidgets}
          role={role}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'import' && (
        <ImportModal
          data={data}
          mutate={mutate}
          addAudit={addAudit}
          notify={notify}
          currentUserId={currentUser.id}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

function Button({ children, icon: Icon, onClick, variant = 'secondary', type = 'button', disabled }: ButtonProps) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} type={type} disabled={disabled}>
      {Icon ? <Icon size={16} /> : null}
      <span>{children}</span>
    </button>
  );
}

function IconButton({ title, icon: Icon, onClick }: { title: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <button className="icon-btn" onClick={onClick} title={title} aria-label={title}>
      <Icon size={18} />
    </button>
  );
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: ReturnType<typeof statusTone> | 'danger' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Modal({ title, children, onClose, width = 'medium' }: { title: string; children: ReactNode; onClose: () => void; width?: 'small' | 'medium' | 'large' }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className={`modal ${width}`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <IconButton title="Закрыть" icon={X} onClick={onClose} />
        </header>
        {children}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  className
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span>
        {label}
        {required ? <b>*</b> : null}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  className,
  optionLabels,
  formatOption
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
  required?: boolean;
  className?: string;
  optionLabels?: Partial<Record<T, string>>;
  formatOption?: (value: T) => string;
}) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span>
        {label}
        {required ? <b>*</b> : null}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption?.(option) ?? optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  return (
    <div className="progress" aria-label={`${value}%`}>
      <span className={tone} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <FileClock size={30} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'blue',
  onClick
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'cyan';
  onClick: () => void;
}) {
  return (
    <button className={`kpi-card ${tone}`} onClick={onClick}>
      <span className="kpi-icon">
        <Icon size={20} />
      </span>
      <span className="kpi-copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{detail}</em>
      </span>
    </button>
  );
}

type ChartItem = { label: string; value: number; tone?: string; color?: string; id?: string };
type LinePoint = { label: string; value: number; id?: string };
type OperationalPoint = {
  id: string;
  label: string;
  created: number;
  closed: number;
  pressure: number;
};

function BarChart({ values, onSelect }: { values: ChartItem[]; onSelect?: (item: ChartItem) => void }) {
  const max = Math.max(1, ...values.map((item) => item.value));
  return (
    <div className="bar-chart">
      {values.map((item) => {
        const content = (
          <>
            <span>{item.label}</span>
            <div>
              <i style={{ width: `${Math.round((item.value / max) * 100)}%` }} className={item.tone ?? ''} />
            </div>
            <b>{item.value}</b>
          </>
        );
        return onSelect ? (
          <button key={item.id ?? item.label} className="bar-row interactive" onClick={() => onSelect(item)} type="button">
            {content}
          </button>
        ) : (
          <div key={item.id ?? item.label} className="bar-row">
            {content}
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ values, onSelect }: { values: ChartItem[]; onSelect?: (item: ChartItem) => void }) {
  const total = values.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 25;
  return (
    <div className="pie-wrap">
      <svg viewBox="0 0 42 42" className="pie">
        {values.map((item) => {
          const dash = (item.value / total) * 100;
          const circle = (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={item.color}
              strokeWidth="6"
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={offset}
              className={onSelect ? 'chart-slice interactive' : 'chart-slice'}
              onClick={onSelect ? () => onSelect(item) : undefined}
            />
          );
          offset -= dash;
          return circle;
        })}
      </svg>
      <div className="legend">
        {values.map((item) => (
          onSelect ? (
            <button key={item.id ?? item.label} onClick={() => onSelect(item)} type="button">
              <i style={{ background: item.color }} /> {item.label}: {item.value}
            </button>
          ) : (
            <span key={item.id ?? item.label}>
              <i style={{ background: item.color }} /> {item.label}: {item.value}
            </span>
          )
        ))}
      </div>
    </div>
  );
}

function PortfolioChart({
  individualCount,
  legalCount,
  activeCount,
  riskCount,
  onSelect
}: {
  individualCount: number;
  legalCount: number;
  activeCount: number;
  riskCount: number;
  onSelect: (filter: SavedFilterPayload) => void;
}) {
  const total = Math.max(1, individualCount + legalCount);
  const values = [
    { label: 'ФЛ', id: 'ФЛ', value: individualCount, color: '#6e56b8' },
    { label: 'ЮЛ', id: 'ЮЛ', value: legalCount, color: '#0f7890' }
  ];
  let offset = 25;

  return (
    <div className="portfolio-chart">
      <div className="portfolio-donut-shell">
        <svg viewBox="0 0 42 42" className="portfolio-donut" aria-label="Доля физических и юридических лиц в клиентском портфеле">
          {values.map((item) => {
            const dash = (item.value / total) * 100;
            const circle = (
              <circle
                key={item.id}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={item.color}
                strokeWidth="6.5"
                strokeDasharray={`${dash} ${100 - dash}`}
                strokeDashoffset={offset}
                className="chart-slice interactive"
                onClick={() => onSelect({ partyKind: item.id })}
              />
            );
            offset -= dash;
            return circle;
          })}
        </svg>
        <div className="portfolio-donut-center">
          <strong>{individualCount + legalCount}</strong>
          <span>клиентов</span>
        </div>
      </div>

      <div className="portfolio-side">
        <div className="portfolio-legend">
          {values.map((item) => (
            <button key={item.id} onClick={() => onSelect({ partyKind: item.id })}>
              <i style={{ background: item.color }} />
              <span>
                <strong>{item.label}: {item.value}</strong>
                <small>{Math.round((item.value / total) * 100)}% портфеля</small>
              </span>
            </button>
          ))}
        </div>
        <div className="portfolio-facts">
          <button onClick={() => onSelect({ status: 'Активен' })}>
            <small>Активные</small>
            <strong>{activeCount}</strong>
          </button>
          <button onClick={() => onSelect({ riskLimit: 60 })}>
            <small>Риск</small>
            <strong>{riskCount}</strong>
          </button>
        </div>
      </div>
    </div>
  );
}

function LineChart({ points, onSelect }: { points: LinePoint[]; onSelect?: (point: LinePoint) => void }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const width = 420;
  const height = 150;
  const coords = points.map((point, index) => {
    const x = 24 + index * ((width - 48) / Math.max(1, points.length - 1));
    const y = height - 24 - (point.value / max) * (height - 48);
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `24,${height - 24} ${line} ${width - 24},${height - 24}`;
  return (
    <svg className="line-chart" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#285dcc" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#1a9a8a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((level) => (
        <line key={level} x1="24" x2={width - 24} y1={24 + (height - 48) * level} y2={24 + (height - 48) * level} />
      ))}
      <polygon points={area} fill="url(#lineFill)" />
      <polyline points={line} fill="none" stroke="#285dcc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((point) => {
        return (
          <g key={point.label} className={onSelect ? 'chart-point interactive' : 'chart-point'} onClick={onSelect ? () => onSelect(point) : undefined}>
            <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#285dcc" strokeWidth="3" />
            <text x={point.x} y={height - 6} textAnchor="middle">
              {point.label}
            </text>
            <text x={point.x} y={point.y - 10} textAnchor="middle">
              {point.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function OperationalDynamicsChart({ points, onSelect }: { points: OperationalPoint[]; onSelect: (point: OperationalPoint) => void }) {
  const width = 560;
  const height = 166;
  const chartTop = 18;
  const chartBottom = 132;
  const chartLeft = 38;
  const chartRight = width - 20;
  const max = Math.max(1, ...points.flatMap((point) => [point.created, point.closed, point.pressure]));
  const xStep = (chartRight - chartLeft) / Math.max(1, points.length - 1);
  const scaleY = (value: number) => chartBottom - (value / max) * (chartBottom - chartTop);
  const coords = points.map((point, index) => ({
    ...point,
    x: chartLeft + index * xStep,
    createdHeight: chartBottom - scaleY(point.created),
    closedHeight: chartBottom - scaleY(point.closed),
    pressureY: scaleY(point.pressure)
  }));
  const pressureLine = coords.map((point) => `${point.x},${point.pressureY}`).join(' ');

  return (
    <div className="ops-chart-wrap">
      <svg className="ops-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Динамика входящих задач, закрытия и SLA-давления">
        {[0, 0.5, 1].map((level) => {
          const y = chartBottom - level * (chartBottom - chartTop);
          return (
            <g key={level}>
              <line className="ops-grid-line" x1={chartLeft} x2={chartRight} y1={y} y2={y} />
              <text className="ops-axis-label" x={6} y={y + 4}>
                {Math.round(max * level)}
              </text>
            </g>
          );
        })}
        {coords.map((point) => (
          <g key={point.id} className="ops-day" onClick={() => onSelect(point)}>
            <title>{`${point.label}: создано ${point.created}, закрыто ${point.closed}, SLA-давление ${point.pressure}`}</title>
            <rect className="ops-hitbox" x={point.x - xStep / 2} y={0} width={Math.max(42, xStep)} height={height} />
            <rect className="ops-bar created" x={point.x - 16} y={chartBottom - point.createdHeight} width={13} height={Math.max(2, point.createdHeight)} rx={4} />
            <rect className="ops-bar closed" x={point.x + 3} y={chartBottom - point.closedHeight} width={13} height={Math.max(2, point.closedHeight)} rx={4} />
            {point.created > 0 ? (
              <text className="ops-bar-value created-value" x={point.x - 9.5} y={Math.max(chartTop + 10, chartBottom - point.createdHeight - 6)} textAnchor="middle">
                {point.created}
              </text>
            ) : null}
            {point.closed > 0 ? (
              <text className="ops-bar-value closed-value" x={point.x + 9.5} y={Math.max(chartTop + 10, chartBottom - point.closedHeight - 6)} textAnchor="middle">
                {point.closed}
              </text>
            ) : null}
            <text className="ops-day-label" x={point.x} y={height - 8} textAnchor="middle">
              {point.label}
            </text>
          </g>
        ))}
        <polyline className="ops-pressure-line" points={pressureLine} />
        {coords.map((point) => (
          <g key={`${point.id}-pressure`} className="ops-pressure-point" onClick={() => onSelect(point)}>
            <circle cx={point.x} cy={point.pressureY} r="5" />
            <text x={point.x} y={point.pressureY - 9} textAnchor="middle">
              {point.pressure}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DashboardPage({
  data,
  role,
  currentUserId,
  hiddenWidgets,
  navigate,
  openModal,
  advanceProcess,
  updateTaskStatus
}: {
  data: AppData;
  role: RoleKey;
  currentUserId: string;
  hiddenWidgets: string[];
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  advanceProcess: (id: string, allowAutoComplete?: boolean) => void;
  updateTaskStatus: (id: string) => void;
}) {
  const activeProcesses = data.processes.filter((process) => !['Завершен', 'Остановлен'].includes(process.status));
  const overdueTasks = data.tasks.filter((task) => task.status === 'Просрочена' || isOverdue(task.dueDate));
  const roleTasks =
    role === 'department'
      ? data.tasks.filter((task) => task.assigneeId === currentUserId || task.assigneeGroup === 'Технологическая интеграция')
      : data.tasks.filter((task) => !['Выполнена', 'Отменена'].includes(task.status));
  const sla = calculateSlaCompliance(data.tasks);
  const riskCounterparties = data.counterparties.filter((item) => calculateOperationalRisk(item, data) >= 60);
  const visible = (id: string) => !hiddenWidgets.includes(id);
  const individualCount = data.counterparties.filter(isIndividualCounterparty).length;
  const legalCount = data.counterparties.length - individualCount;
  const activePortfolioCount = data.counterparties.filter((item) => item.status === 'Активен').length;
  const portfolioScope = role === 'curator' ? 'Все ФЛ и ЮЛ, доступные Куратору CRM' : 'Все ФЛ и ЮЛ в доступе роли';
  const openTasks = data.tasks.filter((task) => !['Выполнена', 'Отменена'].includes(task.status));
  const dueSoonTasks = openTasks.filter((task) => daysBetween(task.dueDate) >= 0 && daysBetween(task.dueDate) <= 2);
  const integrationErrors = data.integrations.filter((item) => item.status === 'Ошибка');
  const autoTasks = data.tasks.filter((task) => task.history.some((entry) => entry.action.includes('Создана'))).length;
  const processRiskCount = data.processes.filter((process) => process.status === 'Риск сроков' || daysBetween(process.dueDate) <= 1).length;
  const healthScore = Math.max(0, Math.min(100, Math.round(sla - overdueTasks.length * 2 - integrationErrors.length * 4 + activeProcesses.length)));
  const taskStatusChart = dashboardTaskStatusOrder
    .map((status) => ({
      label: status,
      value: data.tasks.filter((task) => task.status === status).length,
      color: dashboardTaskStatusColors[status]
    }))
    .filter((item) => item.value > 0);
  const riskCounterpartyChart = data.counterparties
    .map((item) => {
      const risk = calculateOperationalRisk(item, data);
      return { id: item.id, label: item.shortName, value: risk, tone: risk > 60 ? 'red' : 'cyan' };
    })
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'ru'))
    .slice(0, 5);
  const departmentLoad = Array.from(new Set([...data.tasks.map((task) => task.assigneeGroup).filter(Boolean), ...data.processes.map((process) => process.currentGroup)] as string[]))
    .map((group) => ({
      label: group.replace('Технологическая ', 'Тех. ').replace('Администрирование ', 'Админ. '),
      id: group,
      value:
        data.tasks.filter((task) => task.assigneeGroup === group && !['Выполнена', 'Отменена'].includes(task.status)).length +
        data.processes.filter((process) => process.currentGroup === group && !['Завершен', 'Остановлен'].includes(process.status)).length,
      tone: group.includes('Юрид') ? 'red' : group.includes('Контакт') ? 'violet' : group.includes('Тех') ? 'blue' : 'cyan'
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'ru'))
    .slice(0, 6);
  const notificationRows = [...data.notifications]
    .sort((a, b) => {
      const aPriority = a.status === 'Ошибка' ? 0 : 1;
      const bPriority = b.status === 'Ошибка' ? 0 : 1;
      return aPriority - bPriority || new Date(b.at).getTime() - new Date(a.at).getTime();
    })
    .slice(0, 4);
  const todayKey = today.toISOString().slice(0, 10);
  const trendDates = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (5 - index));
    return date.toISOString().slice(0, 10);
  });
  const operationalDynamics: OperationalPoint[] = trendDates.map((date) => {
    const created = data.tasks.filter((task) => task.createdAt.startsWith(date)).length;
    const closed = data.tasks.filter((task) =>
      task.history.some((entry) => entry.at.startsWith(date) && (entry.status === 'Выполнена' || entry.action.includes('Выполнена')))
    ).length;
    const dueToday = openTasks.filter((task) => task.dueDate === date).length;
    const overdueByDate = openTasks.filter((task) => task.dueDate < date && (task.status === 'Просрочена' || isOverdue(task.dueDate))).length;
    return {
      id: date,
      label: `${date.slice(8, 10)}.${date.slice(5, 7)}`,
      created,
      closed,
      pressure: dueToday + overdueByDate
    };
  });
  const emptyDynamics: OperationalPoint = { id: todayKey, label: '-', created: 0, closed: 0, pressure: 0 };
  const todayDynamics = operationalDynamics.find((point) => point.id === todayKey) ?? operationalDynamics[operationalDynamics.length - 1] ?? emptyDynamics;
  const pressurePeak = operationalDynamics.reduce((peak, point) => (point.pressure > peak.pressure ? point : peak), operationalDynamics[0] ?? emptyDynamics);
  const createdTotal = operationalDynamics.reduce((sum, point) => sum + point.created, 0);
  const closedTotal = operationalDynamics.reduce((sum, point) => sum + point.closed, 0);
  const backlogDelta = createdTotal - closedTotal;
  const pressureTone = todayDynamics.pressure >= 5 ? 'red' : todayDynamics.pressure > 0 ? 'amber' : 'green';
  const operationalFocus =
    todayDynamics.pressure >= 5
      ? 'перераспределить SLA'
      : backlogDelta > 0
        ? 'рост очереди'
        : 'баланс входа/закрытия';

  return (
    <div className="page-grid dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">Главная</span>
          <h1>{role === 'department' ? 'Операционная смена подразделения' : 'Пульс операционной CRM'}</h1>
          <p>
            {role === 'department'
              ? `В очереди ${roleTasks.length} задач, из них ${overdueTasks.length} просрочены и ${dueSoonTasks.length} подходят к SLA.`
              : `${activeProcesses.length} активных процессов, ${openTasks.length} открытых задач, ${integrationErrors.length} ошибок обмена.`}
          </p>
          <div className="workspace-pills hero-pills">
            <button onClick={() => navigate({ page: 'tasks', filter: { query: 'Создана' } })}><Zap size={14} /> Автозадачи: {autoTasks}</button>
            <button onClick={() => navigate({ page: 'counterparties', filter: { partyKind: 'ФЛ' } })}><UsersRound size={14} /> ФЛ: {individualCount}</button>
            <button onClick={() => navigate({ page: 'counterparties', filter: { partyKind: 'ЮЛ' } })}><Building2 size={14} /> ЮЛ: {legalCount}</button>
            <button onClick={() => navigate({ page: 'logs' })}><ShieldCheck size={14} /> Журнал: {data.auditLogs.length}</button>
          </div>
          <div className="hero-actions">
            <Button icon={Settings} onClick={() => openModal({ type: 'widgets' })}>
              Настроить виджеты
            </Button>
            {role !== 'department' ? (
              <Button icon={PlayCircle} variant="primary" onClick={() => openModal({ type: 'startProcess' })}>
                Запустить процесс
              </Button>
            ) : (
              <Button icon={CheckCircle2} variant="primary" onClick={() => updateTaskStatus(roleTasks[0]?.id ?? '')}>
                Взять первую задачу
              </Button>
            )}
          </div>
        </div>

        <div className="hero-command-card">
          <div className="health-ring" style={{ background: `conic-gradient(#2d8451 0 ${healthScore * 3.6}deg, #e4ebf2 ${healthScore * 3.6}deg 360deg)` }}>
            <span>{healthScore}</span>
            <small>индекс</small>
          </div>
          <div className="command-metrics">
            <article>
              <small>SLA</small>
              <strong>{sla}%</strong>
              <span>закрытые задачи</span>
            </article>
            <article>
              <small>До 2 дней</small>
              <strong>{dueSoonTasks.length}</strong>
              <span>срочных задач</span>
            </article>
            <article>
              <small>Обмены</small>
              <strong>{integrationErrors.length}</strong>
              <span>ошибки обмена</span>
            </article>
          </div>
        </div>
      </section>

      <section className="kpi-grid accent-kpis">
        <KpiCard
          label="Клиенты и контрагенты"
          value={data.counterparties.filter((item) => item.status !== 'Архив').length}
          detail={`${riskCounterparties.length} требуют внимания`}
          icon={Building2}
          tone="cyan"
          onClick={() => navigate({ page: 'counterparties' })}
        />
        <KpiCard
          label="Запущенные процессы"
          value={activeProcesses.length}
          detail={`${processRiskCount} требуют контроля срока`}
          icon={Workflow}
          tone="blue"
          onClick={() => navigate({ page: 'processes' })}
        />
        <KpiCard
          label="Просроченные задачи"
          value={overdueTasks.length}
          detail="эскалации отправляются email и внутри системы"
          icon={AlertTriangle}
          tone="red"
          onClick={() => navigate({ page: 'tasks', filter: { status: 'Просрочена' } })}
        />
        <KpiCard
          label="SLA исполнения"
          value={`${sla}%`}
          detail="формула: выполнено вовремя / закрытые задачи"
          icon={Activity}
          tone={sla >= 85 ? 'green' : 'amber'}
          onClick={() => navigate({ page: 'reports' })}
        />
      </section>

      <div className="dashboard-analytics-grid">
        <section className="panel chart-panel trend-panel">
          <div className="panel-header">
            <div>
              <h2>Операционная динамика</h2>
              <p>Синие столбцы — создано, зеленые — закрыто, красная линия — задачи с риском SLA</p>
            </div>
            <Badge tone={pressureTone}>SLA сегодня: {todayDynamics.pressure}</Badge>
          </div>
          <OperationalDynamicsChart points={operationalDynamics} onSelect={(point) => navigate({ page: 'tasks', filter: { query: point.id } })} />
          <div className="ops-legend">
            <span><i className="created" /> Создано</span>
            <span><i className="closed" /> Закрыто</span>
            <span><i className="pressure" /> SLA-давление</span>
          </div>
          <div className="ops-reading">
            <span>Синий выше зеленого — очередь растет</span>
            <span>Красная выше — риск SLA выше</span>
          </div>
          <div className="ops-insights">
            <button onClick={() => navigate({ page: 'tasks', filter: { query: todayKey } })}>
              <small>Сегодня</small>
              <strong>{todayDynamics.created} / {todayDynamics.closed}</strong>
              <span>вход / выход</span>
            </button>
            <button onClick={() => navigate({ page: 'tasks', filter: { query: pressurePeak.id } })}>
              <small>Пик SLA</small>
              <strong>{pressurePeak.label}: {pressurePeak.pressure}</strong>
              <span>под контролем</span>
            </button>
            <button onClick={() => navigate({ page: 'tasks', filter: { status: 'Просрочена' } })}>
              <small>Фокус</small>
              <strong>{backlogDelta > 0 ? `+${backlogDelta}` : backlogDelta}</strong>
              <span>{operationalFocus}</span>
            </button>
          </div>
        </section>

        <section className="panel chart-panel portfolio-panel">
          <div className="panel-header">
            <div>
              <h2>Клиентский портфель</h2>
              <p>{portfolioScope}</p>
            </div>
          </div>
          <PortfolioChart
            individualCount={individualCount}
            legalCount={legalCount}
            activeCount={activePortfolioCount}
            riskCount={riskCounterparties.length}
            onSelect={(filter) => navigate({ page: 'counterparties', filter })}
          />
        </section>

        <section className="panel chart-panel status-panel">
          <div className="panel-header">
            <div>
              <h2>Статусы задач</h2>
              <p>Открытые и закрытые операционные работы</p>
            </div>
          </div>
          <PieChart values={taskStatusChart.map((item) => ({ ...item, id: item.label }))} onSelect={(item) => navigate({ page: 'tasks', filter: { status: item.id ?? item.label } })} />
          <div className="status-facts">
            <button onClick={() => navigate({ page: 'tasks' })}>
              <small>Открыто</small>
              <strong>{openTasks.length}</strong>
            </button>
            <button onClick={() => navigate({ page: 'tasks', filter: { status: 'Просрочена' } })}>
              <small>Просрочено</small>
              <strong>{overdueTasks.length}</strong>
            </button>
            <button onClick={() => navigate({ page: 'tasks', filter: { query: todayKey } })}>
              <small>До 2 дней</small>
              <strong>{dueSoonTasks.length}</strong>
            </button>
          </div>
        </section>

        <section className="panel chart-panel workload-panel">
          <div className="panel-header">
            <div>
              <h2>Нагрузка групп</h2>
              <p>Активные задачи и процессы по подразделениям</p>
            </div>
          </div>
          <BarChart values={departmentLoad} onSelect={(item) => navigate({ page: 'tasks', filter: { group: item.id ?? item.label } })} />
        </section>
      </div>

      <div className="content-layout two-columns dashboard-focus-grid">
        <section className="panel focus-panel">
          <div className="panel-header">
            <div>
              <h2>Приоритетная очередь</h2>
              <p>Сначала задачи с просрочкой, высоким приоритетом и ближайшим SLA</p>
            </div>
            <Button icon={ListChecks} onClick={() => navigate({ page: 'tasks' })}>
              Все задачи
            </Button>
          </div>
          <div className="task-list compact">
            {roleTasks.slice(0, 6).map((task) => (
              <button key={task.id} className="task-row" onClick={() => openModal({ type: 'taskDetail', id: task.id })}>
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {task.id} · {task.assigneeGroup ?? getUserName(data, task.assigneeId)}
                  </small>
                </span>
                <Badge tone={statusTone(task.status)}>{task.status}</Badge>
                <em className={isOverdue(task.dueDate) ? 'danger-text' : ''}>{formatDate(task.dueDate)}</em>
              </button>
            ))}
          </div>
        </section>

        {visible('processRoute') ? (
          <section className="panel focus-panel">
            <div className="panel-header">
              <div>
                <h2>Процессы на контроле</h2>
                <p>Маршрут, текущая группа и прогресс исполнения</p>
              </div>
              <Button icon={Workflow} onClick={() => navigate({ page: 'processes' })}>
                Реестр
              </Button>
            </div>
            <div className="process-stack">
              {activeProcesses.slice(0, 4).map((process) => {
                const counterparty = getCounterparty(data, process.counterpartyId);
                const progress = calculateProcessProgress(process, data);
                return (
                  <article key={process.id} className="process-mini">
                    <button className="process-mini-main" onClick={() => navigate({ page: 'process', id: process.id, tab: 'route' })}>
                      <span>
                        <strong>{process.title}</strong>
                        <small>
                          {process.id} · {counterparty?.shortName} · {process.currentGroup}
                        </small>
                      </span>
                      <ProgressBar value={progress} tone={process.status === 'Риск сроков' ? 'red' : 'blue'} />
                    </button>
                    <Badge tone={statusTone(process.status)}>{process.status}</Badge>
                    {role !== 'department' ? (
                      <Button icon={PlayCircle} onClick={() => advanceProcess(process.id)}>
                        Контроль этапа
                      </Button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <div className="content-layout three-columns dashboard-insight-grid">
        {visible('risk') ? (
          <section className="panel insight-panel">
            <div className="panel-header">
              <h2>Риски контрагентов</h2>
            </div>
            <BarChart
              values={riskCounterpartyChart}
              onSelect={(item) => navigate({ page: 'counterparty', id: item.id, tab: 'profile' })}
            />
          </section>
        ) : null}

        {visible('notifications') ? (
          <section className="panel insight-panel">
            <div className="panel-header">
              <h2>Нотификации</h2>
              <Badge tone="amber">{data.notifications.filter((item) => item.status === 'Ошибка').length} ошибки</Badge>
            </div>
            <div className="event-list">
              {notificationRows.map((event) => (
                <button key={event.id} className="event-row" onClick={() => navigate({ page: 'logs' })}>
                  <Bell size={16} />
                  <span>
                    <strong>{event.trigger}</strong>
                    <small>
                      {event.channel} · {event.recipient}
                    </small>
                  </span>
                  <Badge tone={statusTone(event.status)}>{event.status}</Badge>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {role === 'admin' && visible('integrations') ? (
          <section className="panel insight-panel">
            <div className="panel-header">
              <h2>Технические обмены</h2>
              <Button icon={RefreshCw} onClick={() => navigate({ page: 'integrations' })}>
                Проверить
              </Button>
            </div>
            <div className="integration-health">
              {data.integrations.slice(0, 5).map((integration) => (
                <button key={integration.id} onClick={() => navigate({ page: 'integrations' })}>
                  <span>{integration.system}</span>
                  <Badge tone={statusTone(integration.status)}>{integration.status}</Badge>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function CounterpartiesPage({
  data,
  role,
  navigate,
  openModal,
  notify,
  mutate,
  addAudit,
  deleteCounterparty,
  routeFilter
}: {
  data: AppData;
  role: RoleKey;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  notify: (message: string, tone?: ToastTone) => void;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
  deleteCounterparty: (id: string) => void;
  routeFilter?: SavedFilterPayload;
}) {
  const [query, setQuery] = useState('');
  const [partyKind, setPartyKind] = useState<PartyKindFilter>('Все');
  const [type, setType] = useState<CounterpartyType | 'Все'>('Все');
  const [status, setStatus] = useState<CounterpartyStatus | 'Все'>('Все');
  const [sort, setSort] = useState<CounterpartySortKey>('risk');
  const [logic, setLogic] = useState<FilterLogic>('AND');
  const [riskLimit, setRiskLimit] = useState(0);
  const [savedFilterId, setSavedFilterId] = useState('');
  const savedFilters = data.savedFilters.filter((filter) => filter.ownerRole === role && filter.target === 'counterparties');
  const individualRows = rowsCountByKind(data.counterparties, 'ФЛ');
  const legalRows = rowsCountByKind(data.counterparties, 'ЮЛ');
  const counterpartyTypeOptions = getCounterpartyTypeOptions(partyKind);
  const riskLimitOptions = Array.from(new Set([...riskLimitPresets, riskLimit]))
    .sort((a, b) => a - b)
    .map(String);

  const markManualFilterChange = () => {
    if (savedFilterId) setSavedFilterId('');
  };

  const changePartyKind = (nextKind: PartyKindFilter) => {
    markManualFilterChange();
    setPartyKind(nextKind);
    setType((current) => normalizeCounterpartyTypeForKind(nextKind, current));
  };

  const rows = useMemo(() => {
    const visible = data.counterparties;
    const filtered = visible.filter((item) => {
      const normalizedQuery = normalize(query);
      const contactText = item.contacts.map((contact) => `${contact.name} ${contact.position} ${contact.phone} ${contact.email}`).join(' ');
      const serviceText = item.services.map((service) => `${service.service} ${service.status} ${service.stage}`).join(' ');
      const searchableText = normalize(`${item.id} ${item.name} ${item.shortName} ${item.inn} ${item.region} ${item.segment} ${contactText} ${serviceText}`);
      const queryHit = normalizedQuery ? searchableText.includes(normalizedQuery) : true;
      const typeHit = type === 'Все' || item.type === type;
      const kindHit = partyKind === 'Все' || (partyKind === 'ФЛ' ? isIndividualCounterparty(item) : !isIndividualCounterparty(item));
      const statusHit = status === 'Все' || item.status === status;
      const riskHit = calculateOperationalRisk(item, data) >= riskLimit;
      const hasRiskFilter = riskLimit > 0;
      if (logic === 'OR') return ((normalizedQuery ? queryHit : false) || (hasRiskFilter ? riskHit : false) || (!normalizedQuery && !hasRiskFilter)) && kindHit && typeHit && statusHit;
      return queryHit && kindHit && typeHit && statusHit && riskHit;
    });
    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'touch') return new Date(b.lastTouch).getTime() - new Date(a.lastTouch).getTime();
      return calculateOperationalRisk(b, data) - calculateOperationalRisk(a, data);
    });
  }, [data, logic, partyKind, query, riskLimit, sort, status, type]);

  const canEdit = role === 'curator' || role === 'admin';

  useEffect(() => {
    if (!routeFilter) return;
    const nextKind = String(routeFilter.partyKind ?? 'Все') as PartyKindFilter;
    const nextTypeCandidate = String(routeFilter.type ?? 'Все') as CounterpartyType | 'Все';
    const nextType = normalizeCounterpartyTypeForKind(nextKind, nextTypeCandidate);
    const nextStatus = String(routeFilter.status ?? 'Все') as CounterpartyStatus | 'Все';
    const nextSort = String(routeFilter.sort ?? 'risk') as CounterpartySortKey;
    setQuery(String(routeFilter.query ?? ''));
    if (['Все', 'ФЛ', 'ЮЛ'].includes(nextKind)) setPartyKind(nextKind);
    setType(nextType);
    if (['Все', ...counterpartyStatuses].includes(nextStatus)) setStatus(nextStatus);
    if (counterpartySortOptions.includes(nextSort)) setSort(nextSort);
    setLogic((routeFilter.logic === 'OR' ? 'OR' : 'AND') as FilterLogic);
    setRiskLimit(normalizeRiskLimit(routeFilter.riskLimit ?? 0));
    setSavedFilterId('');
  }, [routeFilter]);

  const saveFilter = () => {
    const nameParts = [
      query.trim() ? `поиск "${query.trim()}"` : '',
      partyKind !== 'Все' ? partyKindLabels[partyKind] : '',
      type !== 'Все' ? counterpartyTypeLabels[type] : '',
      status !== 'Все' ? `статус ${status}` : '',
      riskLimit ? `риск от ${riskLimit}` : ''
    ].filter(Boolean);
    const item: SavedFilter = {
      id: `sf-counterparties-${Date.now()}`,
      ownerRole: role,
      name: `Контрагенты: ${nameParts.length ? nameParts.join(', ') : 'полный реестр'}`,
      target: 'counterparties',
      query: encodeSavedFilter({ query, partyKind, type, status, sort, logic, riskLimit })
    };
    mutate((draft) => {
      draft.savedFilters.unshift(item);
      addAudit(draft, 'Сохранение пользовательского фильтра', 'Фильтр', item.name);
    });
    setSavedFilterId(item.id);
    notify('Настройки фильтра сохранены для текущей роли', 'success');
  };

  const applySavedFilter = (id: string) => {
    setSavedFilterId(id);
    if (!id) return;
    const item = savedFilters.find((filter) => filter.id === id);
    const payload = item ? decodeSavedFilter(item.query) : null;
    if (!item || !payload) {
      notify('Не удалось применить фильтр: сохраненные параметры устарели', 'warning');
      return;
    }
    const nextType = String(payload.type ?? 'Все') as CounterpartyType | 'Все';
    const nextKind = String(payload.partyKind ?? 'Все') as PartyKindFilter;
    const nextStatus = String(payload.status ?? 'Все') as CounterpartyStatus | 'Все';
    const nextSort = String(payload.sort ?? 'risk') as CounterpartySortKey;
    const nextLogic = String(payload.logic ?? 'AND') as FilterLogic;
    setQuery(String(payload.query ?? ''));
    if (['Все', 'ФЛ', 'ЮЛ'].includes(nextKind)) setPartyKind(nextKind);
    setType(normalizeCounterpartyTypeForKind(nextKind, nextType));
    if (['Все', ...counterpartyStatuses].includes(nextStatus)) setStatus(nextStatus);
    if (counterpartySortOptions.includes(nextSort)) setSort(nextSort);
    if (filterLogicOptions.includes(nextLogic)) setLogic(nextLogic);
    setRiskLimit(normalizeRiskLimit(payload.riskLimit ?? 0));
    notify(`Фильтр "${item.name}" применен`, 'success');
  };

  const resetFilters = () => {
    setQuery('');
    setPartyKind('Все');
    setType('Все');
    setStatus('Все');
    setSort('risk');
    setRiskLimit(0);
    setLogic('AND');
    setSavedFilterId('');
    navigate({ page: 'counterparties' });
    notify('Фильтры сброшены', 'info');
  };

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>Единая база клиентов и контрагентов</h1>
          <p>Единый реестр ФЛ и ЮЛ: поиск, фильтры, сортировка, скролл по таблице, сохранение фильтра и кликабельные номера объектов.</p>
        </div>
        <div className="actions">
          <Button icon={FileDown} onClick={() => exportRows(rows, 'counterparties.filtered.json')}>
            Экспорт JSON
          </Button>
          {canEdit ? (
            <Button icon={Plus} variant="primary" onClick={() => openModal({ type: 'counterpartyForm', mode: 'create' })}>
              Создать контрагента
            </Button>
          ) : null}
        </div>
      </section>

      <section className="filters-panel counterparty-filters">
        <Field
          className="counterparty-search-field"
          label="Поиск"
          value={query}
          onChange={(value) => {
            markManualFilterChange();
            setQuery(value);
          }}
          placeholder="ФИО, название, ИНН, регион, контакт, сервис"
        />
        <SelectField
          label="Клиент"
          value={partyKind}
          options={['Все', 'ФЛ', 'ЮЛ']}
          onChange={changePartyKind}
          optionLabels={partyKindLabels}
        />
        <SelectField
          label="Тип контрагента"
          value={type}
          options={counterpartyTypeOptions}
          onChange={(value) => {
            markManualFilterChange();
            setType(value);
          }}
          optionLabels={counterpartyTypeLabels}
        />
        <SelectField
          label="Статус"
          value={status}
          options={['Все', ...counterpartyStatuses]}
          onChange={(value) => {
            markManualFilterChange();
            setStatus(value);
          }}
          optionLabels={counterpartyStatusLabels}
        />
        <SelectField
          label="Сортировка"
          value={sort}
          options={counterpartySortOptions}
          onChange={(value) => {
            markManualFilterChange();
            setSort(value);
          }}
          optionLabels={counterpartySortLabels}
        />
        <SelectField
          label="Режим поиска"
          value={logic}
          options={filterLogicOptions}
          onChange={(value) => {
            markManualFilterChange();
            setLogic(value);
          }}
          optionLabels={filterLogicLabels}
        />
        <label className="field filter-template-field">
          <span>Шаблон фильтра</span>
          <select value={savedFilterId} onChange={(event) => applySavedFilter(event.target.value)}>
            <option value="">Не выбран</option>
            {savedFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>
        </label>
        <SelectField
          label="Операционный риск"
          value={String(riskLimit)}
          options={riskLimitOptions}
          onChange={(value) => {
            markManualFilterChange();
            setRiskLimit(Number(value));
          }}
          formatOption={formatRiskLimitFilter}
        />
        <div className="filter-actions">
          <Button icon={Save} onClick={saveFilter}>
            Сохранить фильтр
          </Button>
          <Button
            icon={RotateCcw}
            onClick={resetFilters}
          >
            Сбросить
          </Button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Найдено: {rows.length}</h2>
            <p>
              В доступе роли: {data.counterparties.length} контрагентов · ФЛ: {individualRows} · ЮЛ: {legalRows} · активный фильтр: {savedFilterId ? 'выбран' : 'нет'} · сохранено шаблонов: {savedFilters.length || 'нет'}
            </p>
          </div>
        </div>
        <div className="table-wrap counterparty-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Контрагент</th>
                <th>Вид / тип</th>
                <th>Статус</th>
                <th>Сервисы</th>
                <th>Риск</th>
                <th>Контроль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const risk = calculateOperationalRisk(item, data);
                return (
                  <tr key={item.id}>
                    <td>
                      <button className="link-btn" onClick={() => navigate({ page: 'counterparty', id: item.id, tab: 'profile' })}>
                        {item.id}
                      </button>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <small>{item.inn} · {item.region}</small>
                    </td>
                    <td>
                      <Badge tone={isIndividualCounterparty(item) ? 'violet' : 'cyan'}>{isIndividualCounterparty(item) ? 'ФЛ' : 'ЮЛ'}</Badge>
                      <small>{item.type}</small>
                    </td>
                    <td>
                      <Badge tone={statusTone(item.status)}>{counterpartyStatusLabels[item.status]}</Badge>
                    </td>
                    <td>{item.services.map((service) => service.service).join(', ') || 'нет подключений'}</td>
                    <td>
                      <span className={risk > 60 ? 'danger-text' : ''}>{risk}</span>
                    </td>
                    <td>{formatDate(item.nextControlDate)}</td>
                    <td>
                      <div className="row-actions">
                        <IconButton title="Открыть" icon={Link2} onClick={() => navigate({ page: 'counterparty', id: item.id, tab: 'profile' })} />
                        {canEdit ? <IconButton title="Редактировать" icon={Edit} onClick={() => openModal({ type: 'counterpartyForm', mode: 'edit', id: item.id })} /> : null}
                        {canEdit ? <IconButton title="Удалить" icon={Trash2} onClick={() => deleteCounterparty(item.id)} /> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CommunicationsPage({
  data,
  role,
  currentUserId,
  navigate,
  openModal,
  completeCommunication,
  createFollowUpFromCommunication,
  notify
}: {
  data: AppData;
  role: RoleKey;
  currentUserId: string;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  completeCommunication: (id: string) => void;
  createFollowUpFromCommunication: (id: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CommunicationStatus | 'Все'>('Все');
  const [type, setType] = useState<CommunicationType | 'Все'>('Все');
  const currentUser = data.users.find((user) => user.id === currentUserId);
  const visibleCounterpartyIds = new Set(
    role === 'department'
      ? data.tasks
          .filter((task) => task.assigneeGroup === currentUser?.department || task.assigneeId === currentUserId)
          .map((task) => task.counterpartyId)
          .filter(Boolean) as string[]
      : data.counterparties.map((item) => item.id)
  );
  const rows = data.communications
    .filter((communication) => {
      const counterparty = getCounterparty(data, communication.counterpartyId);
      const process = getProcess(data, communication.processId);
      const hit = normalize(
        `${communication.id} ${communication.subject} ${communication.summary} ${communication.nextAction} ${counterparty?.name ?? ''} ${process?.title ?? ''} ${communication.participants?.join(' ') ?? ''}`
      ).includes(normalize(query));
      return (
        visibleCounterpartyIds.has(communication.counterpartyId) &&
        hit &&
        (status === 'Все' || (communication.status ?? 'Проведена') === status) &&
        (type === 'Все' || communication.type === type)
      );
    })
    .sort((a, b) => {
      const statusRank = (item: Communication) =>
        item.status === 'Запланирована' ? 0 : item.status === 'Требует follow-up' ? 1 : item.status === 'Проведена' ? 2 : 3;
      return statusRank(a) - statusRank(b) || new Date(b.at).getTime() - new Date(a.at).getTime();
    });
  const planned = data.communications.filter((item) => item.status === 'Запланирована').length;
  const followUp = data.communications.filter((item) => item.status === 'Требует follow-up').length;
  const linkedTasks = data.communications.reduce((sum, item) => sum + (item.linkedTaskIds?.length ?? 0), 0);
  const meetingCount = data.communications.filter((item) => item.type === 'Встреча').length;

  return (
    <div className="page-grid">
      <section className="toolbar band accent-communications">
        <div>
          <h1>Коммуникации с клиентами и контрагентами</h1>
          <p>Планирование встреч и звонков, фиксация итогов, follow-up задачи и история взаимодействий.</p>
        </div>
        <div className="actions">
          <Button icon={Plus} variant="primary" onClick={() => openModal({ type: 'communication' })}>
            Запланировать
          </Button>
          <Button icon={FileDown} onClick={() => exportRows(rows, 'communications.filtered.json')}>
            Экспорт
          </Button>
        </div>
      </section>

      <section className="kpi-grid compact-kpis">
        <KpiCard label="Запланировано" value={planned} detail="встречи и звонки" icon={CalendarClock} tone="blue" onClick={() => setStatus('Запланирована')} />
        <KpiCard label="Требуют шага" value={followUp} detail="нужно действие" icon={Bell} tone="amber" onClick={() => setStatus('Требует follow-up')} />
        <KpiCard label="Создано задач" value={linkedTasks} detail="из коммуникаций" icon={ListChecks} tone="green" onClick={() => navigate({ page: 'tasks', filter: { taskType: 'tt-communication-followup' } })} />
        <KpiCard label="Встречи" value={meetingCount} detail="рабочие контакты" icon={Phone} tone="cyan" onClick={() => setType('Встреча')} />
      </section>

      <section className="filters-panel">
        <Field label="Поиск" value={query} onChange={setQuery} placeholder="Норд Капитал Банк, договор, звонок, follow-up" />
        <SelectField label="Статус" value={status} options={['Все', ...communicationStatuses]} onChange={setStatus} />
        <SelectField label="Тип" value={type} options={['Все', 'Звонок', 'Встреча', 'Письмо', 'Обращение']} onChange={setType} />
        <div className="filter-actions">
          <Button icon={RotateCcw} onClick={() => { setQuery(''); setStatus('Все'); setType('Все'); notify('Фильтры коммуникаций сброшены', 'info'); }}>
            Сбросить
          </Button>
        </div>
      </section>

      <section className="communication-workspace">
        <div className="communication-list">
          {rows.map((communication) => {
            const counterparty = getCounterparty(data, communication.counterpartyId);
            const process = getProcess(data, communication.processId);
            return (
              <article key={communication.id} className="communication-card">
                <div className="communication-card-head">
                  <div>
                    <div className="badge-row">
                      <Badge tone="cyan">{communication.type}</Badge>
                      <Badge tone={statusTone(communication.status ?? 'Проведена')}>{communication.status ?? 'Проведена'}</Badge>
                      {communication.channel ? <Badge tone="neutral">{communication.channel}</Badge> : null}
                    </div>
                    <h3>{communication.subject}</h3>
                  </div>
                  <strong>{formatDateTime(communication.at)}</strong>
                </div>
                <p>{communication.summary}</p>
                <div className="mini-checklist">
                  {(communication.agenda ?? ['Повестка не заполнена']).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="communication-meta">
                  <button className="link-btn" onClick={() => navigate({ page: 'counterparty', id: communication.counterpartyId, tab: 'communications' })}>
                    {counterparty?.shortName ?? communication.counterpartyId}
                  </button>
                  <span>{communication.participants?.join(', ') || getUserName(data, communication.responsibleId)}</span>
                  <span>Следующий шаг: {communication.nextAction}</span>
                </div>
                <div className="actions compact">
                  {process ? (
                    <Button icon={Workflow} onClick={() => navigate({ page: 'process', id: process.id, tab: 'route' })}>
                      {process.id}
                    </Button>
                  ) : null}
                  <Button icon={ClipboardCheck} onClick={() => completeCommunication(communication.id)}>
                    Зафиксировать итог
                  </Button>
                  <Button icon={Plus} onClick={() => createFollowUpFromCommunication(communication.id)}>
                    Задача
                  </Button>
                </div>
              </article>
            );
          })}
          {!rows.length ? <EmptyState title="Коммуникации не найдены" text="Сбросьте фильтры или запланируйте новую коммуникацию." /> : null}
        </div>
      </section>
    </div>
  );
}

function CoordinationPage({
  data,
  role,
  currentUserId,
  navigate,
  openModal,
  advanceInternalHandoff,
  notify
}: {
  data: AppData;
  role: RoleKey;
  currentUserId: string;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  advanceInternalHandoff: (id: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<InternalHandoffStatus | 'Все'>('Все');
  const [department, setDepartment] = useState('Все');
  const currentUser = data.users.find((user) => user.id === currentUserId);
  const departments = ['Все', ...Array.from(new Set(data.internalHandoffs.flatMap((handoff) => [handoff.sourceDepartment, handoff.targetDepartment]))).sort()];
  const visibleRows = data.internalHandoffs.filter((handoff) => {
    const counterparty = getCounterparty(data, handoff.counterpartyId);
    const process = getProcess(data, handoff.processId);
    const task = getTask(data, handoff.taskId);
    const roleVisible =
      role !== 'department' ||
      handoff.targetDepartment === currentUser?.department ||
      handoff.sourceDepartment === currentUser?.department ||
      task?.assigneeId === currentUserId;
    const hit = normalize(`${handoff.id} ${handoff.title} ${handoff.comment} ${counterparty?.name ?? ''} ${process?.title ?? ''}`).includes(normalize(query));
    return roleVisible && hit && (status === 'Все' || handoff.status === status) && (department === 'Все' || handoff.targetDepartment === department || handoff.sourceDepartment === department);
  });
  const rows = [...visibleRows].sort((a, b) => {
    const statusRank = (item: InternalHandoff) => (item.status === 'Просрочено' ? 0 : item.status === 'Ожидает' ? 1 : item.status === 'В работе' ? 2 : item.status === 'На проверке' ? 3 : 4);
    return statusRank(a) - statusRank(b) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  const overdue = data.internalHandoffs.filter((item) => item.status === 'Просрочено' || (isOverdue(item.dueDate) && item.status !== 'Закрыто')).length;
  const active = data.internalHandoffs.filter((item) => !['Закрыто'].includes(item.status)).length;
  const review = data.internalHandoffs.filter((item) => item.status === 'На проверке').length;
  const withTasks = data.internalHandoffs.filter((item) => item.taskId).length;

  return (
    <div className="page-grid">
      <section className="toolbar band accent-coordination">
        <div>
          <h1>Поручения подразделениям</h1>
          <p>Поручения, сроки, переходы статусов и связанные задачи между операционным контролем, юристами, ИТ и администраторами.</p>
        </div>
        <div className="actions">
          <Button icon={Plus} variant="primary" onClick={() => openModal({ type: 'internalHandoff' })}>
            Создать поручение
          </Button>
          <Button icon={FileDown} onClick={() => exportRows(rows, 'internal-handoffs.filtered.json')}>
            Экспорт
          </Button>
        </div>
      </section>

      <section className="kpi-grid compact-kpis">
        <KpiCard label="Активно" value={active} detail="в работе подразделений" icon={UsersRound} tone="blue" onClick={() => setStatus('Все')} />
        <KpiCard label="Просрочено" value={overdue} detail="нужна эскалация" icon={AlertTriangle} tone="red" onClick={() => setStatus('Просрочено')} />
        <KpiCard label="На проверке" value={review} detail="у инициатора" icon={ClipboardCheck} tone="amber" onClick={() => setStatus('На проверке')} />
        <KpiCard label="Связано с задачами" value={withTasks} detail="есть рабочая задача" icon={ListChecks} tone="green" onClick={() => navigate({ page: 'tasks', filter: { taskType: 'tt-internal-handoff' } })} />
      </section>

      <section className="filters-panel">
        <Field label="Поиск" value={query} onChange={setQuery} placeholder="Норд Капитал Банк, договор, SLA, HND-9101" />
        <SelectField label="Статус" value={status} options={['Все', ...internalHandoffStatuses]} onChange={setStatus} />
        <SelectField label="Подразделение" value={department} options={departments} onChange={setDepartment} />
        <div className="filter-actions">
          <Button icon={RotateCcw} onClick={() => { setQuery(''); setStatus('Все'); setDepartment('Все'); notify('Фильтры взаимодействия сброшены', 'info'); }}>
            Сбросить
          </Button>
        </div>
      </section>

      <section className="handoff-grid">
        {rows.map((handoff) => (
          <HandoffCard key={handoff.id} handoff={handoff} data={data} navigate={navigate} openModal={openModal} advanceInternalHandoff={advanceInternalHandoff} />
        ))}
        {!rows.length ? <EmptyState title="Поручения не найдены" text="Сбросьте фильтры или создайте внутреннее поручение." /> : null}
      </section>
    </div>
  );
}

function HandoffCard({
  handoff,
  data,
  navigate,
  openModal,
  advanceInternalHandoff
}: {
  handoff: InternalHandoff;
  data: AppData;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  advanceInternalHandoff: (id: string) => void;
}) {
  const counterparty = getCounterparty(data, handoff.counterpartyId);
  const process = getProcess(data, handoff.processId);
  const task = getTask(data, handoff.taskId);
  return (
    <article className={`handoff-card ${handoff.status === 'Просрочено' ? 'danger' : ''}`}>
      <div className="handoff-header">
        <span>{handoff.id}</span>
        <Badge tone={statusTone(handoff.status)}>{handoff.status}</Badge>
      </div>
      <h3>{handoff.title}</h3>
      <div className="handoff-route">
        <strong>{handoff.sourceDepartment}</strong>
        <ArrowDownUp size={16} />
        <strong>{handoff.targetDepartment}</strong>
      </div>
      <p>{handoff.comment}</p>
      <div className="profile-grid compact">
        <Info label="Срок" value={formatDate(handoff.dueDate)} />
        <Info label="Приоритет" value={handoff.priority} />
        <Info label="Ответственный" value={getUserName(data, handoff.responsibleId)} />
        <Info label="Задача" value={handoff.taskId ?? 'не создана'} />
      </div>
      <div className="actions compact">
        {counterparty ? (
          <Button icon={Building2} onClick={() => navigate({ page: 'counterparty', id: counterparty.id, tab: 'profile' })}>
            {counterparty.shortName}
          </Button>
        ) : null}
        {process ? (
          <Button icon={Workflow} onClick={() => navigate({ page: 'process', id: process.id, tab: 'coordination' })}>
            {process.id}
          </Button>
        ) : null}
        {task ? (
          <Button icon={ListChecks} onClick={() => openModal({ type: 'taskDetail', id: task.id })}>
            {task.id}
          </Button>
        ) : null}
        <Button icon={CheckCircle2} variant="primary" onClick={() => advanceInternalHandoff(handoff.id)}>
          Дальше
        </Button>
      </div>
    </article>
  );
}

function ProcessHandoffsPanel({
  data,
  handoffs,
  navigate,
  openModal,
  advanceInternalHandoff
}: {
  data: AppData;
  handoffs: InternalHandoff[];
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  advanceInternalHandoff: (id: string) => void;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Поручения подразделениям</h2>
          <p>Поручения показывают, как задача процесса передается между внутренними структурными подразделениями.</p>
        </div>
      </div>
      <div className="handoff-grid">
        {handoffs.map((handoff) => (
          <HandoffCard key={handoff.id} handoff={handoff} data={data} navigate={navigate} openModal={openModal} advanceInternalHandoff={advanceInternalHandoff} />
        ))}
        {!handoffs.length ? <EmptyState title="Поручений по процессу нет" text="Создайте поручение из шапки процесса, если нужен ответ другого подразделения." /> : null}
      </div>
    </section>
  );
}

function CounterpartyDetailPage({
  data,
  id,
  tab,
  role,
  navigate,
  openModal,
  uploadDocument,
  createEvd,
  deleteCounterparty,
  mutate,
  addAudit,
  notify,
  completeCommunication,
  createFollowUpFromCommunication
}: {
  data: AppData;
  id?: string;
  tab?: string;
  role: RoleKey;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  uploadDocument: (objectType: string, objectId: string) => void;
  createEvd: (processId: string) => void;
  deleteCounterparty: (id: string) => void;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
  notify: (message: string, tone?: ToastTone) => void;
  completeCommunication: (id: string) => void;
  createFollowUpFromCommunication: (id: string) => void;
}) {
  const item = getCounterparty(data, id);
  const activeTab = tab === 'integrations' ? 'history' : tab ?? 'profile';
  if (!item) return <EmptyState title="Контрагент не найден" text="Откройте объект из реестра или через глобальный поиск." />;

  const isIndividual = isIndividualCounterparty(item);
  const processes = data.processes.filter((process) => process.counterpartyId === item.id);
  const tasks = data.tasks.filter((task) => task.counterpartyId === item.id);
  const documents = data.documents.filter((document) => document.linkedObjectId === item.id || processes.some((process) => process.id === document.linkedObjectId));
  const communications = data.communications.filter((communication) => communication.counterpartyId === item.id);
  const completeness = calculateProfileCompleteness(item, data);
  const risk = calculateOperationalRisk(item, data);
  const canEdit = role === 'curator' || role === 'admin';
  const activeTasks = tasks.filter((task) => !['Выполнена', 'Отменена'].includes(task.status));
  const overdueTasks = activeTasks.filter((task) => task.status === 'Просрочена' || isOverdue(task.dueDate));
  const nearDueTasks = activeTasks.filter((task) => daysBetween(task.dueDate) >= 0 && daysBetween(task.dueDate) <= 2);
  const activeProcesses = processes.filter((process) => !['Завершен', 'Остановлен'].includes(process.status));
  const incidentCount = item.services.reduce((sum, service) => sum + service.incidentCount, 0);
  const integrationErrors = data.integrations.filter(
    (integration) =>
      integration.status === 'Ошибка' &&
      (integration.objectId === item.id ||
        processes.some((process) => process.id === integration.objectId || process.integrationIds.includes(integration.id)) ||
        tasks.some((task) => task.id === integration.objectId || task.links.includes(integration.id)))
  );
  const integrationSourceList = Array.from(
    new Set(
      data.integrations
        .filter(
          (integration) =>
            integration.objectId === item.id ||
            processes.some((process) => process.id === integration.objectId || process.integrationIds.includes(integration.id)) ||
            tasks.some((task) => task.id === integration.objectId || task.links.includes(integration.id))
        )
        .map((integration) => integration.system)
    )
  );
  const incidentSourceDetail = item.services
    .map((service) => `${service.service}: ${service.incidentCount}`)
    .join(', ');
  const getServiceIncidentSource = (service: Counterparty['services'][number]) => {
    if (!service.incidentCount) return 'нет открытых инцидентов';
    if (service.service === 'СБП') return 'журнал API-инцидентов';
    if (service.service === 'ПС МИР') return 'операционный Service Desk';
    if (service.service === 'Программа лояльности') return 'обращения и Service Desk';
    return `${service.ownerDepartment}: журнал инцидентов`;
  };
  const failedIntegrationDetails = integrationErrors.length
    ? integrationErrors.map((integration) => `${integration.system}: ${integration.operation}`).join('; ')
    : 'сбоев по связанным операциям нет';
  const hasCoreData = isIndividual
    ? Boolean(item.birthDate && item.identityDocument && item.consentStatus)
    : Boolean(item.inn && item.kpp && item.ogrn);
  const qualityItems = [
    { label: isIndividual ? 'Идентификация и ПДн' : 'Реквизиты', done: hasCoreData },
    { label: 'Контакты', done: item.contacts.length > 0 },
    { label: 'Сервисы', done: item.services.length > 0 },
    { label: 'Процессы', done: processes.length > 0 },
    { label: 'Документы', done: documents.length > 0 }
  ];
  const missingQualityItems = qualityItems.filter((qualityItem) => !qualityItem.done);
  const qualitySummary =
    completeness >= 85
      ? 'Профиль готов для запуска процессов и регулярного контроля.'
      : `Нужно дозаполнить: ${missingQualityItems.map((qualityItem) => qualityItem.label).join(', ') || 'рабочие данные'}.`;
  const controlTone = overdueTasks.length || integrationErrors.length || risk >= 80 ? 'red' : nearDueTasks.length || incidentCount || item.penalties || risk >= 60 ? 'amber' : 'green';
  const controlLevel = controlTone === 'red' ? 'Срочный контроль' : controlTone === 'amber' ? 'Повышенное внимание' : 'Плановый контроль';
  const controlDateDelta = daysBetween(item.nextControlDate);
  const controlDateHint = controlDateDelta < 0 ? `просрочена на ${Math.abs(controlDateDelta)} дн.` : controlDateDelta === 0 ? 'сегодня' : `через ${controlDateDelta} дн.`;
  const controlSignals = [
    overdueTasks.length
      ? { label: 'Просроченные задачи', detail: overdueTasks.map((task) => task.id).join(', '), tone: 'red' as const }
      : { label: 'Просроченные задачи', detail: 'нет', tone: 'green' as const },
    nearDueTasks.length
      ? { label: 'Срок до 2 дней', detail: nearDueTasks.map((task) => task.id).join(', '), tone: 'amber' as const }
      : { label: 'Сроки задач', detail: 'ближайших нарушений нет', tone: 'green' as const },
    incidentCount
      ? { label: 'Сервисные инциденты', detail: item.services.filter((service) => service.incidentCount > 0).map((service) => `${service.service}: ${service.incidentCount}`).join(', '), tone: incidentCount > 2 ? 'red' as const : 'amber' as const }
      : { label: 'Сервисные инциденты', detail: 'нет', tone: 'green' as const },
    item.penalties
      ? { label: isIndividual ? 'Ограничения/блокировки' : 'Предписания/штрафы', detail: `${item.penalties} активн.`, tone: 'amber' as const }
      : { label: isIndividual ? 'Ограничения/блокировки' : 'Предписания/штрафы', detail: 'нет', tone: 'green' as const },
    integrationErrors.length
      ? { label: 'Сбои связанных операций', detail: integrationErrors.map((integration) => `${integration.system}: ${integration.id}`).join(', '), tone: 'red' as const }
      : { label: 'Сбои связанных операций', detail: 'нет', tone: 'green' as const }
  ];

  const refreshControlSignals = () => {
    mutate((draft) => {
      addAudit(draft, 'Обновление контрольных сигналов', 'Контрагент', item.id);
    });
    notify(`Контрольные сигналы обновлены: ${controlLevel.toLowerCase()}`, controlTone === 'red' ? 'warning' : 'success');
  };

  const tabs = [
    ['profile', 'Общая информация'],
    ['processes', 'Процессы'],
    ['tasks', 'Задачи'],
    ['documents', 'Документы'],
    ['communications', 'Коммуникации'],
    ['history', 'История']
  ];

  return (
    <div className="page-grid">
      <section className="object-header">
        <div>
          <button className="back-link" onClick={() => navigate({ page: 'counterparties' })}>
            Контрагенты / {item.id}
          </button>
          <h1>{item.name}</h1>
          <div className="badge-row">
            <Badge tone={isIndividual ? 'violet' : 'cyan'}>{isIndividual ? 'Физическое лицо' : 'Юридическое лицо'}</Badge>
            <Badge tone={statusTone(item.status)}>Статус: {counterpartyStatusLabels[item.status]}</Badge>
            <Badge tone={controlTone}>{controlLevel}</Badge>
            <Badge tone={completeness >= 85 ? 'green' : 'amber'}>Данные {completeness}%</Badge>
          </div>
        </div>
        <div className="actions">
          <Button icon={PlayCircle} variant="primary" onClick={() => openModal({ type: 'startProcess', counterpartyId: item.id })}>
            Запустить процесс
          </Button>
          <Button icon={Plus} onClick={() => openModal({ type: 'taskForm', counterpartyId: item.id })}>
            Задача
          </Button>
          {canEdit ? <Button icon={Edit} onClick={() => openModal({ type: 'counterpartyForm', mode: 'edit', id: item.id })}>Редактировать</Button> : null}
          {canEdit ? <Button icon={Trash2} variant="danger" onClick={() => deleteCounterparty(item.id)}>Удалить</Button> : null}
        </div>
      </section>

      <nav className="tabs">
        {tabs.map(([key, label]) => (
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => navigate({ page: 'counterparty', id: item.id, tab: key })}>
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'profile' ? (
        <div className="content-layout two-columns wide-left">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{isIndividual ? 'Профиль физического лица' : 'Единый профиль юридического лица'}</h2>
                <p>{isIndividual ? 'Идентификация, ПДн, карта, канал обслуживания, обращения и клиентские сервисы' : 'Реквизиты, контакты, сервисы, контрольные даты и связанные подразделения'}</p>
              </div>
            </div>
            <div className="profile-grid">
              {isIndividual ? (
                <>
                  <Info label="Дата рождения" value={item.birthDate ? formatDate(item.birthDate) : 'не заполнено'} />
                  <Info label="Документ" value={item.identityDocument ?? 'не заполнено'} />
                  <Info label="ИНН ФЛ" value={item.inn} />
                  <Info label="Карта / идентификатор" value={item.maskedCard ?? item.loyaltyId ?? 'не заполнено'} />
                  <Info label="Канал обслуживания" value={item.preferredChannel ?? 'не выбран'} />
                  <Info label="Согласие ПДн" value={item.consentStatus ?? 'не заполнено'} />
                  <Info label="Категория обращения" value={item.appealCategory ?? 'нет активного обращения'} />
                  <Info label="Клиентская ценность" value={`${formatNumber(item.customerValue ?? 0)} руб./год`} />
                  <Info label="Регион" value={item.region} />
                  <Info label="Адрес обслуживания" value={item.address} wide />
                </>
              ) : (
                <>
                  <Info label="ИНН / КПП" value={`${item.inn} / ${item.kpp}`} />
                  <Info label="ОГРН" value={item.ogrn} />
                  <Info label="Регион" value={item.region} />
                  <Info label="Адрес" value={item.address} wide />
                  <Info label="Сегмент" value={item.segment} />
                  <Info label="Куратор" value={getUserName(data, item.curatorId)} />
                  <Info label="Последний контакт" value={formatDateTime(item.lastTouch)} />
                  <Info label="Контрольная дата" value={formatDate(item.nextControlDate)} />
                </>
              )}
            </div>
            <div className="profile-quality-card">
              <div>
                <span>Качество данных профиля</span>
                <strong>{completeness}%</strong>
                <p>{qualitySummary}</p>
                <ProgressBar value={completeness} tone={completeness >= 85 ? 'green' : 'amber'} />
              </div>
              <div className="quality-checks">
                {qualityItems.map((qualityItem) => (
                  <span key={qualityItem.label} className={qualityItem.done ? 'done' : 'attention'}>
                    {qualityItem.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="panel-subheader">
              <h3>{isIndividual ? 'Клиентские продукты, обращения и сервисы' : 'Подключения к продуктам и сервисам'}</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Сервис</th>
                    <th>Статус</th>
                    <th>Этап</th>
                    <th>Подразделение</th>
                    <th>Операции/мес.</th>
                    <th>Открытые инциденты</th>
                  </tr>
                </thead>
                <tbody>
                  {item.services.map((service) => (
                    <tr key={service.service}>
                      <td>{service.service}</td>
                      <td>
                        <Badge tone={statusTone(service.status)}>{service.status}</Badge>
                      </td>
                      <td>{service.stage}</td>
                      <td>{service.ownerDepartment}</td>
                      <td>{formatNumber(service.monthlyOperations)}</td>
                      <td>
                        <span className={service.incidentCount ? 'incident-cell active' : 'incident-cell'}>
                          <strong>{service.incidentCount}</strong>
                          <small>{getServiceIncidentSource(service)}</small>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Контроль и риски</h2>
              </div>
              <Badge tone={controlTone}>{controlLevel}</Badge>
            </div>
            <div className="control-summary-grid">
              <article>
                <span>Открытые задачи</span>
                <strong>{activeTasks.length}</strong>
                <small>просрочено: {overdueTasks.length}</small>
              </article>
              <article>
                <span>Активные процессы</span>
                <strong>{activeProcesses.length}</strong>
                <small>{activeProcesses.slice(0, 2).map((process) => process.id).join(', ') || 'нет активных'}</small>
              </article>
              <article>
                <span>{isIndividual ? 'Активные обращения' : 'Входящие запросы'}</span>
                <strong>{item.officialRequests}</strong>
                <small>{item.officialRequests ? 'требуют контроля' : 'новых нет'}</small>
              </article>
              <article>
                <span>Контрольная дата</span>
                <strong>{formatDate(item.nextControlDate)}</strong>
                <small>{controlDateHint}</small>
              </article>
            </div>
            <div className="control-signal-list">
              {controlSignals.map((signal) => (
                <article key={signal.label} className={signal.tone}>
                  <span>{signal.label}</span>
                  <strong>{signal.detail}</strong>
                </article>
              ))}
            </div>
            <details className="control-methods">
              <summary>Источники данных</summary>
              <dl>
                <div>
                  <dt>Контрольная дата</dt>
                  <dd>Хранится в карточке контрагента. Первично задается куратором при заведении карточки либо правилом маршрута при запуске процесса. Далее срок меняет куратор кнопкой "Контрольная дата" или BPM-правило после просрочки, сбоя связанной операции или закрытия процесса.</dd>
                </div>
                <div>
                  <dt>{isIndividual ? 'Активные обращения' : 'Входящие запросы'}</dt>
                  <dd>Счетчик официально зарегистрированных входящих запросов или клиентских обращений по карточке. Пополняется при регистрации письма, звонка, формы обращения или документа с признаком "требует ответа"; куратор отвечает за корректность привязки к контрагенту.</dd>
                </div>
                <div>
                  <dt>Сервисные инциденты</dt>
                  <dd>Сумма открытых инцидентов из таблицы "Подключения к продуктам и сервисам": {incidentSourceDetail || 'инцидентов нет'}. По каждой строке источник указан в колонке "Открытые инциденты"; показатель ведет ответственное подразделение-владелец сервиса.</dd>
                </div>
                <div>
                  <dt>Предписания/штрафы</dt>
                  <dd>Количество активных официальных предписаний, уведомлений или штрафных событий. Источник - процессы типа "Уведомление/штраф" и зарегистрированные документы в СЭД.</dd>
                </div>
                <div>
                  <dt>Сбои связанных операций</dt>
                  <dd>Учитываются только операции, связанные с этой карточкой, ее процессами или задачами: {failedIntegrationDetails}. Проверяемые журналы: {integrationSourceList.length ? integrationSourceList.join(', ') : 'связанных журналов нет'}.</dd>
                </div>
              </dl>
            </details>
            <div className="control-actions">
              <Button icon={RefreshCw} onClick={refreshControlSignals}>
                Обновить сигналы
              </Button>
              <Button icon={CalendarClock} onClick={() => openModal({ type: 'controlDate', counterpartyId: item.id })}>
                Изменить дату
              </Button>
              <Button icon={Upload} onClick={() => uploadDocument('Контрагент', item.id)}>
                Добавить файл
              </Button>
              <Button icon={MessageSquare} onClick={() => openModal({ type: 'communication', counterpartyId: item.id })}>
                Запланировать контакт
              </Button>
            </div>
            <div className="panel-subheader">
              <h3>Основные контакты</h3>
            </div>
            <div className="contact-list">
              {item.contacts.map((contact) => (
                <button key={contact.id} className={contact.primary ? 'primary' : ''} onClick={() => openModal({ type: 'contactDetail', counterpartyId: item.id, contactId: contact.id })}>
                  <span className="contact-card-head">
                    <strong>{contact.name}</strong>
                    {contact.primary ? <Badge tone="green">Основной</Badge> : null}
                  </span>
                  <span>{contact.position}</span>
                  <small>{contact.phone}</small>
                  <small>{contact.email}</small>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'processes' ? (
        <LinkedProcesses data={data} processes={processes} navigate={navigate} createEvd={createEvd} />
      ) : null}

      {activeTab === 'tasks' ? (
        <LinkedTasks data={data} tasks={tasks} openModal={openModal} />
      ) : null}

      {activeTab === 'documents' ? (
        <DocumentsPanel documents={documents} data={data} upload={() => uploadDocument('Контрагент', item.id)} navigate={navigate} openModal={openModal} />
      ) : null}

      {activeTab === 'communications' ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>План и история коммуникаций</h2>
              <p>Встречи, звонки и обращения фиксируются с итогом, следующим шагом и связанными задачами</p>
            </div>
            <Button icon={Plus} onClick={() => openModal({ type: 'communication', counterpartyId: item.id })}>
              Запланировать
            </Button>
          </div>
          <div className="communication-list">
            {communications.map((communication) => (
              <article key={communication.id} className="communication-card">
                <div className="communication-card-head">
                  <div>
                    <div className="badge-row">
                      <Badge tone="cyan">{communication.type}</Badge>
                      <Badge tone={statusTone(communication.status ?? 'Проведена')}>{communication.status ?? 'Проведена'}</Badge>
                      {communication.channel ? <Badge tone="neutral">{communication.channel}</Badge> : null}
                    </div>
                    <h3>{communication.subject}</h3>
                  </div>
                  <strong>{formatDateTime(communication.at)}</strong>
                </div>
                <p>{communication.summary}</p>
                {communication.agenda?.length ? (
                  <div className="mini-checklist">
                    {communication.agenda.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
                <div className="communication-meta">
                  <span>Ответственный: {getUserName(data, communication.responsibleId)}</span>
                  <span>Участники: {communication.participants?.join(', ') || 'не указаны'}</span>
                  <span>Следующий шаг: {communication.nextAction}</span>
                </div>
                <div className="actions compact">
                  {communication.processId ? (
                    <Button icon={Workflow} onClick={() => navigate({ page: 'process', id: communication.processId, tab: 'route' })}>
                      Процесс
                    </Button>
                  ) : null}
                  <Button icon={ClipboardCheck} onClick={() => completeCommunication(communication.id)}>
                    Зафиксировать итог
                  </Button>
                  <Button icon={Plus} onClick={() => createFollowUpFromCommunication(communication.id)}>
                    Задача
                  </Button>
                  {communication.recording ? <Badge tone="blue">Запись: {communication.recording}</Badge> : null}
                </div>
              </article>
            ))}
            {!communications.length ? <EmptyState title="Коммуникаций пока нет" text="Запланируйте звонок или встречу из карточки контрагента." /> : null}
          </div>
        </section>
      ) : null}

      {activeTab === 'history' ? (
        <HistoryPanel
          logs={data.auditLogs.filter((log) => log.objectLink === item.id || processes.some((process) => process.id === log.objectLink))}
          processHistory={processes.flatMap((process) => process.history.map((entry) => ({ ...entry, processId: process.id })))}
          data={data}
        />
      ) : null}
    </div>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`info ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LinkedProcesses({ data, processes, navigate, createEvd }: { data: AppData; processes: ProcessInstance[]; navigate: (route: RouteState) => void; createEvd: (id: string) => void }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Связанные процессы</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Номер</th>
              <th>Название</th>
              <th>Статус</th>
              <th>Текущая группа</th>
              <th>Прогресс</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.id}>
                <td>
                  <button className="link-btn" onClick={() => navigate({ page: 'process', id: process.id, tab: 'route' })}>
                    {process.id}
                  </button>
                </td>
                <td>{process.title}</td>
                <td>
                  <Badge tone={statusTone(process.status)}>{process.status}</Badge>
                </td>
                <td>{process.currentGroup}</td>
                <td>
                  <ProgressBar value={calculateProcessProgress(process, data)} tone={process.status === 'Риск сроков' ? 'red' : 'blue'} />
                </td>
                <td>
                  <Button icon={FileClock} onClick={() => createEvd(process.id)}>
                    ЭВД
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LinkedTasks({ data, tasks, openModal }: { data: AppData; tasks: Task[]; openModal: (modal: ModalState) => void }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Связанные задачи</h2>
      </div>
      <div className="task-list">
        {tasks.map((task) => {
          const group = task.assigneeGroup ?? 'Группа не указана';
          const assignee = task.assigneeId ? getUserName(data, task.assigneeId) : 'персонально не назначен';
          return (
            <button key={task.id} className="task-row" onClick={() => openModal({ type: 'taskDetail', id: task.id })}>
              <span>
                <strong>{task.title}</strong>
                <small>{task.id} · срок {formatDate(task.dueDate)}</small>
                <small>Исполнитель: {group} · {assignee}</small>
              </span>
              <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
              <Badge tone={statusTone(task.status)}>{task.status}</Badge>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getDocumentBusinessContext(data: AppData, document: BusinessDocument) {
  const process =
    document.linkedObjectType === 'Процесс'
      ? getProcess(data, document.linkedObjectId)
      : data.processes.find((item) => item.documentIds.includes(document.id));
  const relatedTask =
    document.relatedTaskId
      ? getTask(data, document.relatedTaskId)
      : data.tasks.find((task) => task.links.includes(document.id) || task.processId === process?.id);
  const counterparty =
    document.linkedObjectType === 'Контрагент'
      ? getCounterparty(data, document.linkedObjectId)
      : process
        ? getCounterparty(data, process.counterpartyId)
        : relatedTask?.counterpartyId
          ? getCounterparty(data, relatedTask.counterpartyId)
          : undefined;
  const service =
    document.service ??
    counterparty?.services.find((item) => process?.title.includes(item.service) || document.name.includes(item.service))?.service ??
    counterparty?.services[0]?.service;

  return {
    process,
    relatedTask,
    counterparty,
    service,
    relationLabel: process
      ? `${process.title}`
      : counterparty
        ? `${counterparty.shortName} · профиль ${isIndividualCounterparty(counterparty) ? 'ФЛ' : 'ЮЛ'}`
        : `${document.linkedObjectType}: ${document.linkedObjectId}`,
    relationMeta: process
      ? `${process.type} · ${process.id} · ${process.status}`
      : counterparty
        ? `${counterparty.id} · ${counterpartyStatusLabels[counterparty.status]}`
        : 'Связанный объект CRM'
  };
}

function DocumentsPanel({
  documents,
  data,
  upload,
  navigate,
  openModal
}: {
  documents: BusinessDocument[];
  data: AppData;
  upload: () => void;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
}) {
  const rows = documents
    .map((document) => ({ document, context: getDocumentBusinessContext(data, document) }))
    .sort((a, b) => {
      const rank = (item: BusinessDocument) =>
        item.status === 'Ошибка' ? 0 : item.status === 'На проверке' ? 1 : item.contractNumber ? 2 : item.status === 'Загружен' ? 3 : 4;
      return rank(a.document) - rank(b.document) || new Date(b.document.createdAt).getTime() - new Date(a.document.createdAt).getTime();
    });
  const services = Array.from(new Set(rows.map(({ context }) => context.service).filter(Boolean))).sort();
  const reviewCount = documents.filter((document) => ['На проверке', 'Ошибка'].includes(document.status)).length;
  const contractCount = documents.filter((document) => document.contractNumber || normalize(document.businessPurpose ?? '').includes('договор')).length;
  const taskLinkedCount = rows.filter(({ context }) => context.relatedTask).length;
  const downloadStoredDocument = (document: BusinessDocument) => {
    if (!document.contentDataUrl) return;
    const link = window.document.createElement('a');
    link.href = document.contentDataUrl;
    link.download = document.sourceFileName ?? document.name;
    link.click();
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Документы и рабочие материалы</h2>
          <p>По каждому файлу показано назначение, сервис, процесс, связанная задача и контрольный следующий шаг.</p>
        </div>
        <Button icon={Upload} onClick={upload}>
          Загрузить файл
        </Button>
      </div>

      <div className="document-summary-grid">
        <article>
          <span>Документов</span>
          <strong>{documents.length}</strong>
          <small>в карточке и связанных процессах</small>
        </article>
        <article>
          <span>На контроле</span>
          <strong>{reviewCount}</strong>
          <small>на проверке или с ошибкой</small>
        </article>
        <article>
          <span>Договоры</span>
          <strong>{contractCount}</strong>
          <small>договорные пакеты и формы</small>
        </article>
        <article>
          <span>Сервисы</span>
          <strong>{services.length || '-'}</strong>
          <small>{services.length ? services.join(', ') : 'не указаны'}</small>
        </article>
      </div>

      <div className="table-wrap documents-table-wrap">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Документ</th>
              <th>Назначение</th>
              <th>Относится к</th>
              <th>Задача / контроль</th>
              <th>Статус</th>
              <th>Владелец</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ document, context }) => {
              const relationRoute = context.process
                ? { page: 'process' as const, id: context.process.id, tab: 'documents' }
                : context.counterparty
                  ? { page: 'counterparty' as const, id: context.counterparty.id, tab: 'documents' }
                  : undefined;
              return (
                <tr key={document.id}>
                  <td className="document-name-cell">
                    <strong>{document.name}</strong>
                    <small>
                      {document.id} · {document.kind} · {document.format} · {document.size}
                    </small>
                    <div className="badge-row">
                      {document.templateName ? <Badge tone="neutral">{document.templateName}</Badge> : null}
                      {document.version ? <Badge tone="cyan">{document.version}</Badge> : null}
                      {document.contentDataUrl ? (
                        <button className="link-btn" onClick={() => downloadStoredDocument(document)}>
                          Скачать
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="document-purpose-cell">
                    <strong>{document.businessPurpose ?? 'Рабочий материал по объекту CRM'}</strong>
                    <small>{context.service ? `Сервис: ${context.service}` : 'Сервис не указан'}</small>
                    {document.contractNumber ? <small>Договор: {document.contractNumber}</small> : null}
                  </td>
                  <td className="document-context-cell">
                    {relationRoute ? (
                      <button className="link-btn" onClick={() => navigate(relationRoute)}>
                        {context.relationLabel}
                      </button>
                    ) : (
                      <strong>{context.relationLabel}</strong>
                    )}
                    <small>{context.relationMeta}</small>
                  </td>
                  <td className="document-action-cell">
                    {context.relatedTask ? (
                      <button className="link-btn" onClick={() => openModal({ type: 'taskDetail', id: context.relatedTask!.id })}>
                        {context.relatedTask.id}: {context.relatedTask.title}
                      </button>
                    ) : (
                      <strong>Без активной задачи</strong>
                    )}
                    <small>{document.nextAction ?? 'Следующее действие не требуется'}</small>
                  </td>
                  <td className="document-status-cell">
                    <Badge tone={statusTone(document.status)}>{document.status}</Badge>
                    <small>Загружен: {formatDateTime(document.createdAt)}</small>
                    {document.validUntil ? <small>Действует до: {formatDate(document.validUntil)}</small> : null}
                  </td>
                  <td>{getUserName(data, document.ownerId)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!rows.length ? <EmptyState title="Документов пока нет" text="Загрузите файл из карточки или создайте ЭВД из процесса." /> : null}
    </section>
  );
}

function HistoryPanel({
  logs,
  processHistory,
  data
}: {
  logs: AuditLog[];
  processHistory: Array<{ at: string; actorId: string; action: string; details: string; processId: string }>;
  data: AppData;
}) {
  return (
    <div className="content-layout two-columns">
      <section className="panel">
        <div className="panel-header">
          <h2>Журнал действий</h2>
        </div>
        <div className="event-list">
          {logs.length ? (
            logs.map((log) => (
              <div key={log.id} className="event-row static">
                <History size={16} />
                <span>
                  <strong>{log.action}</strong>
                  <small>
                    {formatDateTime(log.at)} · {log.userIdMasked} · {log.objectType}
                  </small>
                </span>
                <Badge tone={statusTone(log.result)}>{log.result}</Badge>
              </div>
            ))
          ) : (
            <EmptyState title="Логи будут появляться после действий" text="Все основные действия пишутся в обезличенный журнал." />
          )}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>История процессов</h2>
        </div>
        <div className="timeline dense">
          {processHistory.map((entry, index) => (
            <article key={`${entry.processId}-${index}`}>
              <h3>{entry.action}</h3>
              <p>{entry.details}</p>
              <small>
                {entry.processId} · {formatDateTime(entry.at)} · {getUserName(data, entry.actorId)}
              </small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProcessesPage({
  data,
  role,
  navigate,
  openModal,
  advanceProcess,
  stopProcess,
  notify,
  mutate,
  addAudit,
  routeFilter
}: {
  data: AppData;
  role: RoleKey;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  advanceProcess: (id: string, allowAutoComplete?: boolean) => void;
  stopProcess: (id: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
  routeFilter?: SavedFilterPayload;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProcessStatus | 'Все'>('Все');
  const [type, setType] = useState('Все');
  const [savedFilterId, setSavedFilterId] = useState('');
  const savedFilters = data.savedFilters.filter((filter) => filter.ownerRole === role && filter.target === 'processes');

  const rows = data.processes.filter((process) => {
    const hit = normalize(`${process.id} ${process.title} ${getCounterparty(data, process.counterpartyId)?.shortName ?? ''}`).includes(normalize(query));
    return hit && (status === 'Все' || process.status === status) && (type === 'Все' || process.type === type);
  });

  const processTypes = useMemo(() => ['Все', ...Array.from(new Set(data.processes.map((process) => process.type)))], [data.processes]);

  useEffect(() => {
    if (!routeFilter) return;
    const nextStatus = String(routeFilter.status ?? 'Все') as ProcessStatus | 'Все';
    const nextType = String(routeFilter.type ?? 'Все');
    setQuery(String(routeFilter.query ?? ''));
    if (['Все', ...processStatuses].includes(nextStatus)) setStatus(nextStatus);
    if (processTypes.includes(nextType)) setType(nextType);
    setSavedFilterId('');
  }, [routeFilter, processTypes]);

  const saveFilter = () => {
    const item: SavedFilter = {
      id: `sf-processes-${Date.now()}`,
      ownerRole: role,
      name: `Процессы: ${query || 'без поиска'} / ${status}`,
      target: 'processes',
      query: encodeSavedFilter({ query, status, type })
    };
    mutate((draft) => {
      draft.savedFilters.unshift(item);
      addAudit(draft, 'Сохранение пользовательского фильтра', 'Фильтр', item.name);
    });
    setSavedFilterId(item.id);
    notify('Фильтр процессов сохранен для текущей роли', 'success');
  };

  const applySavedFilter = (id: string) => {
    setSavedFilterId(id);
    if (!id) return;
    const item = savedFilters.find((filter) => filter.id === id);
    const payload = item ? decodeSavedFilter(item.query) : null;
    if (!item || !payload) {
      notify('Не удалось применить фильтр: сохраненные параметры устарели', 'warning');
      return;
    }
    const nextStatus = String(payload.status ?? 'Все') as ProcessStatus | 'Все';
    const nextType = String(payload.type ?? 'Все');
    setQuery(String(payload.query ?? ''));
    if (['Все', ...processStatuses].includes(nextStatus)) setStatus(nextStatus);
    if (processTypes.includes(nextType)) setType(nextType);
    notify(`Фильтр "${item.name}" применен`, 'success');
  };

  const resetFilters = () => {
    setQuery('');
    setStatus('Все');
    setType('Все');
    setSavedFilterId('');
    notify('Фильтры процессов сброшены', 'info');
  };

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>Реестр процессов</h1>
          <p>Процессы показывают маршрут, задачи подразделений, сроки, связанные сущности и системные события.</p>
        </div>
        <div className="actions">
          <Button icon={FileDown} onClick={() => exportRows(rows, 'processes.filtered.json')}>
            Экспорт
          </Button>
          {role !== 'department' ? (
            <Button icon={PlayCircle} variant="primary" onClick={() => openModal({ type: 'startProcess' })}>
              Запустить процесс
            </Button>
          ) : null}
        </div>
      </section>

      <section className="filters-panel">
        <Field label="Поиск" value={query} onChange={setQuery} placeholder="BP-2026-0148, СБП, контрагент" />
        <SelectField label="Статус" value={status} options={['Все', ...processStatuses]} onChange={setStatus} />
        <SelectField label="Тип" value={type} options={processTypes} onChange={setType} />
        <label className="field">
          <span>Сохраненный фильтр</span>
          <select value={savedFilterId} onChange={(event) => applySavedFilter(event.target.value)}>
            <option value="">Не выбран</option>
            {savedFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <Button icon={Save} onClick={saveFilter}>
            Сохранить
          </Button>
          <Button icon={RotateCcw} onClick={resetFilters}>
            Сбросить
          </Button>
        </div>
      </section>

      <div className="content-layout board-layout">
        {['Запущен', 'В работе', 'Ожидание контрагента', 'Риск сроков', 'Завершен'].map((column) => (
          <section key={column} className="board-column">
            <h2>{column}</h2>
            {rows
              .filter((process) => process.status === column)
              .map((process) => {
                const counterparty = getCounterparty(data, process.counterpartyId);
                return (
                  <button key={process.id} className="board-card" onClick={() => navigate({ page: 'process', id: process.id, tab: 'route' })}>
                    <strong>{process.title}</strong>
                    <span>{process.id} · {counterparty?.shortName}</span>
                    <ProgressBar value={calculateProcessProgress(process, data)} tone={process.status === 'Риск сроков' ? 'red' : 'blue'} />
                    <small>
                      Группа: {process.currentGroup} · срок {formatDate(process.dueDate)}
                    </small>
                  </button>
                );
              })}
          </section>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Табличный список</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Процесс</th>
                <th>Контрагент</th>
                <th>Статус</th>
                <th>Группа</th>
                <th>SLA</th>
                <th>Задачи</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((process) => (
                <tr key={process.id}>
                  <td>
                    <button className="link-btn" onClick={() => navigate({ page: 'process', id: process.id, tab: 'route' })}>
                      {process.id}
                    </button>
                  </td>
                  <td>{process.title}</td>
                  <td>{getCounterparty(data, process.counterpartyId)?.shortName}</td>
                  <td>
                    <Badge tone={statusTone(process.status)}>{process.status}</Badge>
                  </td>
                  <td>{process.currentGroup}</td>
                  <td className={daysBetween(process.dueDate) <= 1 && process.status !== 'Завершен' ? 'danger-text' : ''}>
                    {formatDate(process.dueDate)}
                  </td>
                  <td>{process.taskIds.length}</td>
                  <td>
                    <div className="row-actions">
                      <IconButton title="Открыть" icon={Link2} onClick={() => navigate({ page: 'process', id: process.id, tab: 'route' })} />
                      {role !== 'department' ? <IconButton title="Контроль этапа" icon={PlayCircle} onClick={() => advanceProcess(process.id)} /> : null}
                      {role === 'owner' || role === 'admin' ? <IconButton title="Остановить" icon={StopCircle} onClick={() => stopProcess(process.id)} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ProcessDetailPage({
  data,
  id,
  tab,
  navigate,
  role,
  openModal,
  advanceProcess,
  stopProcess,
  uploadDocument,
  createEvd,
  retryIntegration,
  advanceInternalHandoff
}: {
  data: AppData;
  id?: string;
  tab?: string;
  navigate: (route: RouteState) => void;
  role: RoleKey;
  openModal: (modal: ModalState) => void;
  advanceProcess: (id: string, allowAutoComplete?: boolean) => void;
  stopProcess: (id: string) => void;
  uploadDocument: (objectType: string, objectId: string) => void;
  createEvd: (id: string) => void;
  retryIntegration: (id: string) => void;
  advanceInternalHandoff: (id: string) => void;
}) {
  const process = getProcess(data, id);
  if (!process) return <EmptyState title="Процесс не найден" text="Откройте процесс из реестра или карточки контрагента." />;
  const counterparty = getCounterparty(data, process.counterpartyId);
  const template = data.processTemplates.find((item) => item.id === process.templateId);
  const activeTab = tab === 'integrations' && role !== 'admin' ? 'history' : tab ?? 'route';
  const tasks = data.tasks.filter((task) => process.taskIds.includes(task.id));
  const documents = data.documents.filter((document) => process.documentIds.includes(document.id) || document.linkedObjectId === process.id);
  const integrations = data.integrations.filter((integration) => process.integrationIds.includes(integration.id) || integration.objectId === process.id);
  const handoffs = data.internalHandoffs.filter((handoff) => handoff.processId === process.id);

  return (
    <div className="page-grid">
      <section className="object-header">
        <div>
          <button className="back-link" onClick={() => navigate({ page: 'processes' })}>
            Процессы / {process.id}
          </button>
          <h1>{process.title}</h1>
          <div className="badge-row">
            <Badge tone={statusTone(process.status)}>{process.status}</Badge>
            <Badge tone={priorityTone(process.priority)}>{process.priority}</Badge>
            <Badge tone="cyan">{counterparty?.shortName}</Badge>
          </div>
        </div>
        <div className="actions">
          {role !== 'department' ? (
            <Button icon={PlayCircle} variant="primary" onClick={() => advanceProcess(process.id)}>
              Контроль этапа
            </Button>
          ) : null}
          <Button icon={Plus} onClick={() => openModal({ type: 'taskForm', counterpartyId: process.counterpartyId, processId: process.id })}>
            Задача
          </Button>
          <Button icon={UsersRound} onClick={() => openModal({ type: 'internalHandoff', counterpartyId: process.counterpartyId, processId: process.id })}>
            Поручение
          </Button>
          <Button icon={FileClock} onClick={() => createEvd(process.id)}>
            Создать ЭВД
          </Button>
          <Button icon={Upload} onClick={() => uploadDocument('Процесс', process.id)}>
            Файл
          </Button>
          {role === 'owner' || role === 'admin' ? <Button icon={StopCircle} variant="danger" onClick={() => stopProcess(process.id)}>Остановить</Button> : null}
        </div>
      </section>

      <nav className="tabs">
        {[
          ['route', 'Маршрут'],
          ['tasks', 'Задачи'],
          ['coordination', 'Поручения'],
          ['documents', 'Документы'],
          ...(role === 'admin' ? [['integrations', 'Технические обмены']] : []),
          ['history', 'История']
        ].map(([key, label]) => (
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => navigate({ page: 'process', id: process.id, tab: key })}>
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'route' ? (
        <div className="content-layout two-columns wide-left">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Маршрут исполнения</h2>
                <p>При переходе этапа автоматически закрывается текущая задача и создается следующая связанная задача</p>
              </div>
              <Badge tone={daysBetween(process.dueDate) < 2 && process.status !== 'Завершен' ? 'red' : 'green'}>
                Срок: {formatDate(process.dueDate)}
              </Badge>
            </div>
            <div className="route-flow">
              {template?.stages.map((stage, index) => {
                const stageTask = tasks.find((task) => task.templateId === stage.autoTaskTemplateId);
                const state = index < process.stageIndex || process.status === 'Завершен' ? 'done' : index === process.stageIndex ? 'active' : 'pending';
                return (
                  <article key={stage.id} className={`route-step ${state}`}>
                    <span className="step-index">{index + 1}</span>
                    <div>
                      <h3>{stage.name}</h3>
                      <p>{stage.department}</p>
                      <small>SLA {stage.slaHours} ч · {stage.escalationRule}</small>
                      <div className="badge-row">
                        {stage.requiredAttributes.map((attr) => (
                          <Badge key={attr} tone="neutral">{attr}</Badge>
                        ))}
                      </div>
                      {stageTask ? (
                        <button className="link-btn" onClick={() => openModal({ type: 'taskDetail', id: stageTask.id })}>
                          {stageTask.id}: {stageTask.status}
                        </button>
                      ) : (
                        <small>Задача будет создана автоматически при переходе</small>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Параметры экземпляра</h2>
            </div>
            <div className="stacked-facts">
              <Info label="Шаблон" value={`${template?.name ?? 'не найден'} v${template?.version ?? '-'}`} />
              <Info label="Связанная БС" value={`${process.businessObjectId} / ${process.counterpartyId}`} />
              <Info label="Текущая группа" value={process.currentGroup} />
              <Info label="Затрачено часов" value={`${process.elapsedHours}`} />
              <Info label="Прогресс" value={`${calculateProcessProgress(process, data)}%`} />
            </div>
            <div className="calculation-box single">
              <strong>Контроль срока</strong>
              <p>
                Осталось дней: {daysBetween(process.dueDate)}. Риск включается при остатке меньше 2 дней или наличии просроченных задач.
              </p>
              <ProgressBar value={Math.max(5, 100 - Math.abs(daysBetween(process.dueDate)) * 18)} tone={daysBetween(process.dueDate) < 2 ? 'red' : 'green'} />
            </div>
            {process.type === 'Договорной процесс' ? (
              <div className="contract-status-box">
                <div>
                  <strong>Статус договора</strong>
                  <Badge tone={statusTone(integrations[0]?.status ?? 'Ожидает')}>{integrations[0]?.status ?? 'Ожидает'}</Badge>
                </div>
                <p>CRM контролирует договорный пакет, регистрационные реквизиты и статус подписания. Текст договора и подписание ведутся во внешней СЭД.</p>
                <div className="profile-grid compact">
                  <Info label="Карточка" value={process.businessObjectId} />
                  <Info label="Обмен" value={integrations[0]?.id ?? 'не создан'} />
                  <Info label="Последнее обновление" value={integrations[0] ? formatDateTime(integrations[0].lastSync) : 'ожидается'} />
                  <Info label="Документы" value={`${documents.length}`} />
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {activeTab === 'tasks' ? <LinkedTasks data={data} tasks={tasks} openModal={openModal} /> : null}
      {activeTab === 'coordination' ? <ProcessHandoffsPanel data={data} handoffs={handoffs} navigate={navigate} openModal={openModal} advanceInternalHandoff={advanceInternalHandoff} /> : null}
      {activeTab === 'documents' ? <DocumentsPanel documents={documents} data={data} upload={() => uploadDocument('Процесс', process.id)} navigate={navigate} openModal={openModal} /> : null}
      {activeTab === 'integrations' ? <IntegrationsList integrations={integrations} openModal={openModal} retryIntegration={retryIntegration} /> : null}
      {activeTab === 'history' ? (
        <section className="panel">
          <div className="panel-header">
            <h2>История экземпляра процесса</h2>
          </div>
          <div className="timeline">
            {process.history.map((entry, index) => (
              <article key={index}>
                <h3>{entry.action}</h3>
                <p>{entry.details}</p>
                <small>{formatDateTime(entry.at)} · {getUserName(data, entry.actorId)}</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TasksPage({
  data,
  role,
  currentUserId,
  navigate,
  openModal,
  updateTaskStatus,
  delegateTask,
  undoTask,
  notify,
  mutate,
  addAudit,
  routeFilter
}: {
  data: AppData;
  role: RoleKey;
  currentUserId: string;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
  updateTaskStatus: (id: string) => void;
  delegateTask: (id: string) => void;
  undoTask: (id: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
  routeFilter?: SavedFilterPayload;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TaskStatus | 'Все'>('Все');
  const [group, setGroup] = useState('Все');
  const [taskType, setTaskType] = useState('Все');
  const [savedFilterId, setSavedFilterId] = useState('');
  const savedFilters = data.savedFilters.filter((filter) => filter.ownerRole === role && filter.target === 'tasks');

  const visibleTasks = data.tasks.filter((task) => {
    if (role === 'department') return task.assigneeId === currentUserId || task.assigneeGroup === 'Технологическая интеграция';
    return true;
  });
  const groups = useMemo(() => ['Все', ...Array.from(new Set(data.tasks.map((task) => task.assigneeGroup).filter(Boolean) as string[]))], [data.tasks]);
  const taskTypeOptions = useMemo(() => ['Все', ...data.taskTemplates.map((template) => template.id)], [data.taskTemplates]);
  const getTaskTemplateLabel = (templateId: string) => {
    if (templateId === 'Все') return 'Все типы';
    const template = data.taskTemplates.find((item) => item.id === templateId);
    return template ? `${template.entityType}: ${template.name}` : templateId;
  };
  const rows = visibleTasks.filter((task) => {
    const template = data.taskTemplates.find((item) => item.id === task.templateId);
    const hit = normalize(
      `${task.id} ${task.title} ${template?.name ?? ''} ${template?.entityType ?? ''} ${task.createdAt} ${task.dueDate} ${task.assigneeGroup ?? ''} ${task.comments.join(' ')} ${task.history.map((entry) => `${entry.at} ${entry.action} ${entry.details}`).join(' ')}`
    ).includes(normalize(query));
    return hit && (status === 'Все' || task.status === status) && (group === 'Все' || task.assigneeGroup === group) && (taskType === 'Все' || task.templateId === taskType);
  });

  useEffect(() => {
    if (!routeFilter) return;
    const nextStatus = String(routeFilter.status ?? 'Все') as TaskStatus | 'Все';
    const nextGroup = String(routeFilter.group ?? 'Все');
    const nextTaskType = String(routeFilter.taskType ?? 'Все');
    setQuery(String(routeFilter.query ?? ''));
    if (['Все', ...taskStatuses].includes(nextStatus)) setStatus(nextStatus);
    if (groups.includes(nextGroup)) setGroup(nextGroup);
    if (taskTypeOptions.includes(nextTaskType)) setTaskType(nextTaskType);
    setSavedFilterId('');
  }, [routeFilter, groups, taskTypeOptions]);

  const saveFilter = () => {
    const item: SavedFilter = {
      id: `sf-tasks-${Date.now()}`,
      ownerRole: role,
      name: `Задачи: ${query || 'без поиска'} / ${status}`,
      target: 'tasks',
      query: encodeSavedFilter({ query, status, group, taskType })
    };
    mutate((draft) => {
      draft.savedFilters.unshift(item);
      addAudit(draft, 'Сохранение пользовательского фильтра', 'Фильтр', item.name);
    });
    setSavedFilterId(item.id);
    notify('Фильтр задач сохранен для текущей роли', 'success');
  };

  const applySavedFilter = (id: string) => {
    setSavedFilterId(id);
    if (!id) return;
    const item = savedFilters.find((filter) => filter.id === id);
    const payload = item ? decodeSavedFilter(item.query) : null;
    if (!item || !payload) {
      notify('Не удалось применить фильтр: сохраненные параметры устарели', 'warning');
      return;
    }
    const nextStatus = String(payload.status ?? 'Все') as TaskStatus | 'Все';
    const nextGroup = String(payload.group ?? 'Все');
    const nextTaskType = String(payload.taskType ?? 'Все');
    setQuery(String(payload.query ?? ''));
    if (['Все', ...taskStatuses].includes(nextStatus)) setStatus(nextStatus);
    if (groups.includes(nextGroup)) setGroup(nextGroup);
    if (taskTypeOptions.includes(nextTaskType)) setTaskType(nextTaskType);
    notify(`Фильтр "${item.name}" применен`, 'success');
  };

  const resetFilters = () => {
    setQuery('');
    setStatus('Все');
    setGroup('Все');
    setTaskType('Все');
    setSavedFilterId('');
    notify('Фильтры задач сброшены', 'info');
  };
  const canReturnPreviousStatus = role === 'owner' || role === 'admin';

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>{role === 'department' ? 'Мои задачи подразделения' : 'Реестр задач'}</h1>
          <p>Задачи создаются вручную через GUI или автоматически по событию, API и переходам бизнес-процесса.</p>
        </div>
        <div className="actions">
          <Button icon={FileDown} onClick={() => exportRows(rows, 'tasks.filtered.json')}>
            Экспорт
          </Button>
          <Button icon={Plus} variant="primary" onClick={() => openModal({ type: 'taskForm' })}>
            Создать задачу
          </Button>
        </div>
      </section>

      <section className="filters-panel">
        <Field label="Поиск" value={query} onChange={setQuery} placeholder="TASK-2042, API, SLA" />
        <SelectField label="Статус" value={status} options={['Все', ...taskStatuses]} onChange={setStatus} />
        <SelectField label="Группа" value={group} options={groups} onChange={setGroup} />
        <label className="field">
          <span>Тип задачи</span>
          <select value={taskType} onChange={(event) => setTaskType(event.target.value)}>
            {taskTypeOptions.map((option) => (
              <option key={option} value={option}>
                {getTaskTemplateLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Сохраненный фильтр</span>
          <select value={savedFilterId} onChange={(event) => applySavedFilter(event.target.value)}>
            <option value="">Не выбран</option>
            {savedFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <Button icon={Save} onClick={saveFilter}>
            Сохранить
          </Button>
          <Button icon={RotateCcw} onClick={resetFilters}>
            Сбросить
          </Button>
        </div>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Задача</th>
                <th>Тип задачи</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Контрагент</th>
                <th>Процесс</th>
                <th>Исполнитель</th>
                <th>Срок</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => {
                const template = data.taskTemplates.find((item) => item.id === task.templateId);
                return (
                  <tr key={task.id}>
                    <td>
                      <button className="link-btn" onClick={() => openModal({ type: 'taskDetail', id: task.id })}>
                        {task.id}
                      </button>
                    </td>
                    <td>
                      <strong>{task.title}</strong>
                      <small>Поля: {task.completedFields.length}/{task.requiredFields.length}</small>
                    </td>
                    <td>
                      <strong>{template?.entityType ?? 'Ручная задача'}</strong>
                      <small>{template?.name ?? task.templateId}</small>
                    </td>
                    <td>
                      <Badge tone={statusTone(task.status)}>{task.status}</Badge>
                    </td>
                    <td>
                      <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                    </td>
                    <td>
                      {task.counterpartyId ? (
                        <button className="link-btn" onClick={() => navigate({ page: 'counterparty', id: task.counterpartyId, tab: 'profile' })}>
                          {getCounterparty(data, task.counterpartyId)?.shortName}
                        </button>
                      ) : (
                        'нет связи'
                      )}
                    </td>
                    <td>
                      {task.processId ? (
                        <button className="link-btn" onClick={() => navigate({ page: 'process', id: task.processId, tab: 'route' })}>
                          {task.processId}
                        </button>
                      ) : (
                        'нет'
                      )}
                    </td>
                    <td>{task.assigneeGroup ?? getUserName(data, task.assigneeId)}</td>
                    <td className={isOverdue(task.dueDate) && task.status !== 'Выполнена' ? 'danger-text' : ''}>{formatDate(task.dueDate)}</td>
                    <td>
                      <div className="row-actions">
                        <IconButton title="Следующий статус" icon={CheckCircle2} onClick={() => updateTaskStatus(task.id)} />
                        <IconButton title="Делегировать" icon={UsersRound} onClick={() => delegateTask(task.id)} />
                        {canReturnPreviousStatus ? <IconButton title="Вернуть предыдущий статус" icon={RotateCcw} onClick={() => undoTask(task.id)} /> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ReportsPage({
  data,
  role,
  notify,
  mutate,
  addAudit
}: {
  data: AppData;
  role: RoleKey;
  notify: (message: string, tone?: ToastTone) => void;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
}) {
  type ReportPeriod = 'день' | 'месяц' | 'квартал';
  type ReportFormat = 'CSV' | 'JSON';
  type ReportRunStatus = 'Готов' | 'Не сформирован' | 'Ошибка формирования';
  type ReportStatusFilter = ReportRunStatus | 'Все';
  type ReportRow = Record<string, string | number>;
  type ReportCategory = 'Клиенты' | 'Процессы' | 'Задачи' | 'Интеграции' | 'Контроль' | 'Администрирование';
  interface ReportDefinition {
    id: string;
    name: string;
    category: ReportCategory;
    frequency: string;
    owner: string;
    source: string;
    purpose: string;
    fields: string[];
    roles: RoleKey[];
  }
  interface ReportRunState {
    status: ReportRunStatus;
    lastGenerated?: string;
    rows: number;
    author: string;
  }

  const [period, setPeriod] = useState<ReportPeriod>('месяц');
  const [format, setFormat] = useState<ReportFormat>('CSV');
  const [riskLimit, setRiskLimit] = useState(60);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ReportCategory | 'Все'>('Все');
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('Все');
  const [selectedReportId, setSelectedReportId] = useState('RPT-CRM-001');

  const reportCatalog: ReportDefinition[] = [
    {
      id: 'RPT-CRM-001',
      name: 'Клиентский портфель ФЛ и ЮЛ',
      category: 'Клиенты',
      frequency: 'Ежедневно',
      owner: 'Куратор CRM',
      source: 'Контрагенты, сервисы, процессы, задачи',
      purpose: 'Сверка закрепленной клиентской базы, статусов обслуживания и риск-профиля.',
      fields: ['ID', 'Клиент', 'Вид', 'Статус', 'Сегмент', 'Регион', 'Куратор', 'Риск', 'Активные процессы'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-002',
      name: 'Активные процессы и контроль сроков',
      category: 'Процессы',
      frequency: 'Ежедневно',
      owner: 'Руководитель процесса',
      source: 'Экземпляры процессов, задачи маршрута',
      purpose: 'Контроль текущего этапа, ответственной группы, SLA маршрута и риска просрочки.',
      fields: ['Процесс', 'Тип', 'Контрагент', 'Статус', 'Текущий этап', 'Группа', 'Срок', 'Прогресс'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-003',
      name: 'Задачи, SLA и исполнители',
      category: 'Задачи',
      frequency: 'Ежедневно',
      owner: 'Куратор CRM',
      source: 'Задачи, история выполнения, пользователи',
      purpose: 'Операционная выгрузка по статусам задач, исполнителям, срокам и факту трудозатрат.',
      fields: ['Задача', 'Название', 'Контрагент', 'Процесс', 'Статус', 'Приоритет', 'Исполнитель', 'SLA'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-004',
      name: 'Просрочки и эскалации',
      category: 'Задачи',
      frequency: 'Ежедневно',
      owner: 'Руководитель процесса',
      source: 'Задачи, нотификации, журналы',
      purpose: 'Список нарушений SLA с ответственной группой и основанием для управленческой эскалации.',
      fields: ['Задача', 'Контрагент', 'Группа', 'Срок', 'Дней просрочки', 'Статус', 'Последнее действие'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-005',
      name: 'Контрагенты с операционным риском',
      category: 'Клиенты',
      frequency: 'Еженедельно',
      owner: 'Руководитель процесса',
      source: 'Контрагенты, задачи, инциденты, штрафы',
      purpose: 'Приоритизация ФЛ и ЮЛ, где нужны контроль куратора, проверка сервиса или разбор инцидента.',
      fields: ['Контрагент', 'Вид', 'Статус', 'Риск', 'Штрафы', 'Инциденты', 'Следующий контроль'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-006',
      name: 'Ошибки межсистемных обменов',
      category: 'Интеграции',
      frequency: 'По запросу',
      owner: 'Администратор BPM',
      source: 'Интеграционные обмены, лог обмена',
      purpose: 'Контроль ошибок обмена с СЭД, BI, Jira, Confluence, телефонией и почтовым шлюзом.',
      fields: ['Система', 'Операция', 'Объект', 'Статус', 'Дата обмена', 'Ошибка', 'Записей'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-007',
      name: 'Реестр документов по операциям',
      category: 'Контроль',
      frequency: 'Еженедельно',
      owner: 'Куратор CRM',
      source: 'Документы, процессы, контрагенты',
      purpose: 'Выгрузка документов с назначением, сервисом, договором, процессом и связанной задачей.',
      fields: ['Документ', 'Назначение', 'Сервис', 'Договор', 'Статус', 'Объект', 'Задача', 'Владелец', 'Дата создания'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-008',
      name: 'Коммуникации и обращения клиентов',
      category: 'Клиенты',
      frequency: 'Еженедельно',
      owner: 'Куратор CRM',
      source: 'Коммуникации, обращения, контрагенты',
      purpose: 'Контроль обращений, встреч, писем и следующих действий по ФЛ и ЮЛ.',
      fields: ['Коммуникация', 'Контрагент', 'Тип', 'Тема', 'Ответственный', 'Следующее действие', 'Дата'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-009',
      name: 'Нагрузка подразделений',
      category: 'Процессы',
      frequency: 'Ежедневно',
      owner: 'Руководитель процесса',
      source: 'Задачи, процессы, группы исполнителей',
      purpose: 'Сравнение активной нагрузки групп для перераспределения очереди и контроля SLA.',
      fields: ['Подразделение', 'Активные задачи', 'Активные процессы', 'Просрочки', 'Ближайший SLA'],
      roles: ['owner', 'admin']
    },
    {
      id: 'RPT-CRM-010',
      name: 'Версии шаблонов процессов',
      category: 'Администрирование',
      frequency: 'По запросу',
      owner: 'Администратор BPM',
      source: 'Конструктор процессов, справочники',
      purpose: 'Контроль опубликованных, черновых и архивных версий BPM-маршрутов.',
      fields: ['Шаблон', 'Версия', 'Статус', 'Триггер', 'Типы объектов', 'Этапы', 'Правила'],
      roles: ['admin', 'owner']
    },
    {
      id: 'RPT-CRM-011',
      name: 'Штрафы, уведомления и контроль реакции',
      category: 'Контроль',
      frequency: 'Еженедельно',
      owner: 'Руководитель процесса',
      source: 'Контрагенты, нотификации, процессы',
      purpose: 'Выделение контрагентов со штрафами, ошибками уведомлений и активными контрольными процессами.',
      fields: ['Контрагент', 'Штрафы', 'Уведомления', 'Ошибки доставки', 'Активные процессы', 'Контроль'],
      roles: ['curator', 'owner', 'admin']
    },
    {
      id: 'RPT-CRM-012',
      name: 'Журнал действий пользователей',
      category: 'Контроль',
      frequency: 'По запросу',
      owner: 'Администратор BPM',
      source: 'Журналы аудита',
      purpose: 'Аудит запуска процессов, создания задач, повторов обмена, импорта и изменения данных.',
      fields: ['ID', 'Дата', 'Пользователь', 'Действие', 'Объект', 'Результат', 'Тип события'],
      roles: ['owner', 'admin']
    }
  ];

  const [reportRuns, setReportRuns] = useState<Record<string, ReportRunState>>(() => ({
    'RPT-CRM-001': { status: 'Готов', lastGenerated: '2026-08-04T10:20:00+07:00', rows: data.counterparties.length, author: 'Куратор CRM' },
    'RPT-CRM-002': { status: 'Готов', lastGenerated: '2026-08-04T09:45:00+07:00', rows: data.processes.length, author: 'Руководитель процесса' },
    'RPT-CRM-003': { status: 'Готов', lastGenerated: '2026-08-04T11:10:00+07:00', rows: data.tasks.length, author: 'Куратор CRM' },
    'RPT-CRM-004': { status: 'Не сформирован', rows: data.tasks.filter((task) => task.status === 'Просрочена' || isOverdue(task.dueDate)).length, author: 'Система' },
    'RPT-CRM-005': { status: 'Готов', lastGenerated: '2026-08-04T08:55:00+07:00', rows: data.counterparties.filter((counterparty) => calculateOperationalRisk(counterparty, data) >= riskLimit).length, author: 'Руководитель процесса' },
    'RPT-CRM-006': { status: 'Ошибка формирования', lastGenerated: '2026-08-04T07:40:00+07:00', rows: data.integrations.filter((integration) => integration.status === 'Ошибка' || integration.errors.length).length, author: 'Администратор BPM' }
  }));

  const overdueTasks = data.tasks.filter((task) => task.status === 'Просрочена' || isOverdue(task.dueDate));
  const visibleReports = reportCatalog.filter((report) => report.roles.includes(role));
  const categoryOptions: (ReportCategory | 'Все')[] = ['Все', ...Array.from(new Set(visibleReports.map((report) => report.category)))];
  const statusOptions: ReportStatusFilter[] = ['Все', 'Готов', 'Не сформирован', 'Ошибка формирования'];
  const roleLabel = roles.find((item) => item.key === role)?.label ?? 'Пользователь';

  const buildReportRows = (reportId: string): ReportRow[] => {
    switch (reportId) {
      case 'RPT-CRM-001':
        return data.counterparties.map((counterparty) => ({
          id: counterparty.id,
          client: counterparty.shortName,
          kind: isIndividualCounterparty(counterparty) ? 'ФЛ' : 'ЮЛ',
          type: counterparty.type,
          status: counterparty.status,
          segment: counterparty.segment,
          region: counterparty.region,
          curator: getUserName(data, counterparty.curatorId),
          risk: calculateOperationalRisk(counterparty, data),
          activeProcesses: data.processes.filter((process) => process.counterpartyId === counterparty.id && !['Завершен', 'Остановлен'].includes(process.status)).length
        }));
      case 'RPT-CRM-002':
        return data.processes.map((process) => ({
          id: process.id,
          title: process.title,
          type: process.type,
          counterparty: getCounterparty(data, process.counterpartyId)?.shortName ?? process.counterpartyId,
          status: process.status,
          currentGroup: process.currentGroup,
          dueDate: process.dueDate,
          progress: `${calculateProcessProgress(process, data)}%`,
          tasks: process.taskIds.length
        }));
      case 'RPT-CRM-003':
        return data.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          counterparty: task.counterpartyId ? getCounterparty(data, task.counterpartyId)?.shortName ?? task.counterpartyId : 'Без контрагента',
          process: task.processId ?? 'Без процесса',
          status: task.status,
          priority: task.priority,
          assignee: task.assigneeGroup ?? getUserName(data, task.assigneeId),
          dueDate: task.dueDate,
          timeSpentHours: task.timeSpentHours
        }));
      case 'RPT-CRM-004':
        return overdueTasks.map((task) => ({
          id: task.id,
          title: task.title,
          counterparty: task.counterpartyId ? getCounterparty(data, task.counterpartyId)?.shortName ?? task.counterpartyId : 'Без контрагента',
          group: task.assigneeGroup ?? getUserName(data, task.assigneeId),
          dueDate: task.dueDate,
          daysOverdue: Math.max(0, Math.abs(daysBetween(task.dueDate))),
          status: task.status,
          lastAction: task.history[0]?.action ?? 'Нет истории'
        }));
      case 'RPT-CRM-005':
        return data.counterparties
          .map((counterparty) => ({
            id: counterparty.id,
            counterparty: counterparty.shortName,
            kind: isIndividualCounterparty(counterparty) ? 'ФЛ' : 'ЮЛ',
            status: counterparty.status,
            risk: calculateOperationalRisk(counterparty, data),
            penalties: counterparty.penalties,
            incidents: counterparty.services.reduce((sum, service) => sum + service.incidentCount, 0),
            nextControl: counterparty.nextControlDate
          }))
          .filter((row) => Number(row.risk) >= riskLimit)
          .sort((a, b) => Number(b.risk) - Number(a.risk) || String(a.counterparty).localeCompare(String(b.counterparty), 'ru'));
      case 'RPT-CRM-006':
        return data.integrations
          .filter((integration) => integration.status === 'Ошибка' || integration.errors.length)
          .map((integration) => ({
            id: integration.id,
            system: integration.system,
            operation: integration.operation,
            object: `${integration.objectType} ${integration.objectId}`,
            status: integration.status,
            lastSync: integration.lastSync,
            errors: integration.errors.join('; ') || 'нет',
            records: integration.records
          }));
      case 'RPT-CRM-007':
        return data.documents.map((document) => {
          const context = getDocumentBusinessContext(data, document);
          return {
            id: document.id,
            name: document.name,
            purpose: document.businessPurpose ?? 'Рабочий материал по объекту CRM',
            service: context.service ?? '',
            contractNumber: document.contractNumber ?? '',
            kind: document.kind,
            format: document.format,
            status: document.status,
            linkedObject: context.relationLabel,
            linkedObjectId: `${document.linkedObjectType} ${document.linkedObjectId}`,
            relatedTask: context.relatedTask ? `${context.relatedTask.id}: ${context.relatedTask.title}` : '',
            nextAction: document.nextAction ?? '',
            owner: getUserName(data, document.ownerId),
            createdAt: document.createdAt,
            validUntil: document.validUntil ?? ''
          };
        });
      case 'RPT-CRM-008':
        return data.communications.map((communication) => ({
          id: communication.id,
          counterparty: getCounterparty(data, communication.counterpartyId)?.shortName ?? communication.counterpartyId,
          type: communication.type,
          subject: communication.subject,
          responsible: getUserName(data, communication.responsibleId),
          nextAction: communication.nextAction,
          at: communication.at
        }));
      case 'RPT-CRM-009':
        return Array.from(new Set([...data.tasks.map((task) => task.assigneeGroup).filter(Boolean), ...data.processes.map((process) => process.currentGroup)] as string[]))
          .map((department) => ({
            department,
            activeTasks: data.tasks.filter((task) => task.assigneeGroup === department && !['Выполнена', 'Отменена'].includes(task.status)).length,
            activeProcesses: data.processes.filter((process) => process.currentGroup === department && !['Завершен', 'Остановлен'].includes(process.status)).length,
            overdue: data.tasks.filter((task) => task.assigneeGroup === department && (task.status === 'Просрочена' || isOverdue(task.dueDate))).length,
            nearestSla: data.tasks
              .filter((task) => task.assigneeGroup === department && !['Выполнена', 'Отменена'].includes(task.status))
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate ?? 'нет'
          }))
          .sort((a, b) => Number(b.activeTasks) + Number(b.activeProcesses) - (Number(a.activeTasks) + Number(a.activeProcesses)));
      case 'RPT-CRM-010':
        return data.processTemplates.map((template) => ({
          id: template.id,
          name: template.name,
          version: template.version,
          status: template.status,
          trigger: template.trigger,
          partyKinds: getProcessTemplatePartyKinds(template).join(', '),
          entityTypes: template.entityTypes.join(', '),
          stages: template.stages.length,
          rules: template.validationRules.length + template.integrationRules.length
        }));
      case 'RPT-CRM-011':
        return data.counterparties
          .map((counterparty) => ({
            id: counterparty.id,
            counterparty: counterparty.shortName,
            penalties: counterparty.penalties,
            notifications: data.notifications.filter((notification) => notification.recipient.includes(counterparty.shortName)).length,
            deliveryErrors: data.notifications.filter((notification) => notification.status === 'Ошибка').length,
            activeProcesses: data.processes.filter((process) => process.counterpartyId === counterparty.id && !['Завершен', 'Остановлен'].includes(process.status)).length,
            nextControl: counterparty.nextControlDate
          }))
          .filter((row) => Number(row.penalties) > 0 || Number(row.activeProcesses) > 0)
          .sort((a, b) => Number(b.penalties) - Number(a.penalties) || String(a.counterparty).localeCompare(String(b.counterparty), 'ru'));
      case 'RPT-CRM-012':
        return data.auditLogs.map((log) => ({
          id: log.id,
          at: log.at,
          user: log.userIdMasked,
          action: log.action,
          object: `${log.objectType} ${log.objectName}`,
          result: log.result,
          type: log.logType
        }));
      default:
        return [];
    }
  };

  const runFor = (reportId: string): ReportRunState => {
    const rows = buildReportRows(reportId).length;
    return reportRuns[reportId] ?? { status: 'Не сформирован', rows, author: roleLabel };
  };

  const readyReports = visibleReports.filter((report) => runFor(report.id).status === 'Готов').length;
  const normalizedSearch = normalize(search);
  const filteredReports = visibleReports.filter((report) => {
    const run = runFor(report.id);
    const categoryHit = category === 'Все' || report.category === category;
    const statusHit = statusFilter === 'Все' || run.status === statusFilter;
    const searchHit =
      !normalizedSearch ||
      normalize(`${report.id} ${report.name} ${report.category} ${report.owner} ${report.purpose} ${report.source}`).includes(normalizedSearch);
    return categoryHit && statusHit && searchHit;
  });
  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? visibleReports[0];
  const selectedRows = selectedReport ? buildReportRows(selectedReport.id) : [];
  const selectedRun = selectedReport ? runFor(selectedReport.id) : undefined;
  const totalReportRows = visibleReports.reduce((sum, report) => sum + buildReportRows(report.id).length, 0);

  const reportStatusTone = (status: ReportRunStatus): ReturnType<typeof statusTone> => {
    if (status === 'Готов') return 'green';
    if (status === 'Ошибка формирования') return 'red';
    return 'amber';
  };

  const outputFilename = (report: ReportDefinition) =>
    `${report.id.toLowerCase()}-${period}-${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`;

  const markReportGenerated = (report: ReportDefinition, rows: ReportRow[]) => {
    const generatedAt = new Date().toISOString();
    setReportRuns((previous) => ({
      ...previous,
      [report.id]: {
        status: 'Готов',
        lastGenerated: generatedAt,
        rows: rows.length,
        author: roleLabel
      }
    }));
    mutate((draft) => {
      addAudit(draft, 'Формирование отчета', 'Отчет', report.name);
    });
    notify(`Отчет "${report.name}" сформирован: ${rows.length} строк`, 'success');
  };

  const generateReport = (report: ReportDefinition) => {
    markReportGenerated(report, buildReportRows(report.id));
  };

  const downloadReport = (report: ReportDefinition) => {
    const rows = buildReportRows(report.id);
    const currentRun = runFor(report.id);
    if (currentRun.status !== 'Готов') {
      markReportGenerated(report, rows);
    }
    exportRows(rows, outputFilename(report));
    mutate((draft) => {
      addAudit(draft, 'Выгрузка отчета в файл', 'Отчет', report.name);
    });
    notify(`Файл отчета "${report.name}" подготовлен к выгрузке`, 'success');
  };

  const saveReportTemplate = () => {
    if (!selectedReport) return;
    mutate((draft) => {
      draft.savedFilters.unshift({
        id: `sf-${draft.savedFilters.length + 20}`,
        ownerRole: role,
        name: `Параметры отчета ${selectedReport.id}`,
        target: 'reports',
        query: `report=${selectedReport.id}; period=${period}; format=${format}; riskLimit=${riskLimit}`
      });
      addAudit(draft, 'Сохранение параметров отчета', 'Отчет', selectedReport.name);
    });
    notify('Параметры отчета сохранены', 'success');
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('Все');
    setStatusFilter('Все');
    setPeriod('месяц');
    setFormat('CSV');
    setRiskLimit(60);
    notify('Фильтры отчетов сброшены', 'info');
  };

  return (
    <div className="page-grid reports-page">
      <section className="toolbar band reports-hero">
        <div>
          <span className="caption">Отчетные формы</span>
          <h1>Отчеты для формирования и выгрузки</h1>
          <p>Список регламентных и операционных отчетов по клиентам, процессам, задачам, документам, обменам и аудиту.</p>
        </div>
        <div className="report-summary-strip">
          <span>
            <strong>{visibleReports.length}</strong>
            <small>доступно отчетов</small>
          </span>
          <span>
            <strong>{readyReports}</strong>
            <small>готово к выгрузке</small>
          </span>
          <span>
            <strong>{totalReportRows}</strong>
            <small>строк данных</small>
          </span>
        </div>
      </section>

      <section className="filters-panel reports-filters">
        <Field label="Поиск отчета" value={search} onChange={setSearch} placeholder="Название, код, владелец, источник" className="reports-search-field" />
        <SelectField label="Раздел" value={category} options={categoryOptions} onChange={setCategory} />
        <SelectField label="Статус" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <SelectField label="Период" value={period} options={['день', 'месяц', 'квартал']} onChange={setPeriod} />
        <SelectField label="Формат файла" value={format} options={['CSV', 'JSON']} onChange={setFormat} />
        <label className="field">
          <span>Порог риска: {riskLimit}</span>
          <input type="range" min="10" max="95" value={riskLimit} onChange={(event) => setRiskLimit(Number(event.target.value))} />
        </label>
        <div className="filter-actions">
          <Button icon={RotateCcw} onClick={resetFilters}>
            Сбросить
          </Button>
          <Button icon={Save} onClick={saveReportTemplate}>
            Сохранить
          </Button>
        </div>
      </section>

      <div className="content-layout reports-layout">
        <section className="panel reports-register">
          <div className="panel-header">
            <div>
              <h2>Реестр отчетов</h2>
              <p>Найдено: {filteredReports.length}. Выберите отчет, сформируйте актуальный набор строк и выгрузите файл.</p>
            </div>
            {selectedReport ? (
              <Button icon={Download} variant="primary" onClick={() => downloadReport(selectedReport)}>
                Выгрузить выбранный
              </Button>
            ) : null}
          </div>
          <div className="table-wrap reports-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Отчет</th>
                  <th>Раздел</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const run = runFor(report.id);
                  const rows = buildReportRows(report.id);
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <tr key={report.id} className={isSelected ? 'report-row-active' : ''} onClick={() => setSelectedReportId(report.id)}>
                      <td>
                        <strong>{report.id}</strong>
                        <small>{format}</small>
                      </td>
                      <td>
                        <button className="link-btn" onClick={() => setSelectedReportId(report.id)}>
                          {report.name}
                        </button>
                        <small>{report.purpose}</small>
                      </td>
                      <td>
                        {report.category}
                        <small>{report.frequency}</small>
                      </td>
                      <td>
                        <Badge tone={reportStatusTone(run.status)}>{run.status}</Badge>
                        <small>{formatNumber(rows.length)} строк</small>
                      </td>
                      <td>
                        <div className="row-actions report-row-actions" onClick={(event) => event.stopPropagation()}>
                          <Button icon={RefreshCw} onClick={() => generateReport(report)}>
                            {run.status === 'Ошибка формирования' ? 'Повторить' : 'Сформировать'}
                          </Button>
                          <IconButton title="Выгрузить отчет" icon={FileDown} onClick={() => downloadReport(report)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredReports.length ? <EmptyState title="Отчеты не найдены" text="Сбросьте фильтры или уточните поисковый запрос." /> : null}
          </div>
        </section>

        <aside className="panel report-detail-panel">
          {selectedReport && selectedRun ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>{selectedReport.name}</h2>
                  <p>{selectedReport.source}</p>
                </div>
                <Badge tone={reportStatusTone(selectedRun.status)}>{selectedRun.status}</Badge>
              </div>
              <div className="report-detail-grid">
                <div className="info">
                  <span>Код отчета</span>
                  <strong>{selectedReport.id}</strong>
                </div>
                <div className="info">
                  <span>Период</span>
                  <strong>{period}</strong>
                </div>
                <div className="info">
                  <span>Формат</span>
                  <strong>{format}</strong>
                </div>
                <div className="info">
                  <span>Строк в выборке</span>
                  <strong>{formatNumber(selectedRows.length)}</strong>
                </div>
                <div className="info">
                  <span>Последнее формирование</span>
                  <strong>{selectedRun.lastGenerated ? formatDateTime(selectedRun.lastGenerated) : 'не формировался'}</strong>
                </div>
                <div className="info">
                  <span>Ответственный</span>
                  <strong>{selectedRun.author}</strong>
                </div>
              </div>

              <div className="report-purpose">
                <h3>Назначение</h3>
                <p>{selectedReport.purpose}</p>
              </div>

              <div className="report-fields">
                <h3>Поля выгрузки</h3>
                <div className="check-list">
                  {selectedReport.fields.map((field) => (
                    <span key={field} className="done">
                      <CheckCircle2 size={14} />
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <div className="report-preview">
                <div className="panel-header">
                  <div>
                    <h3>Первые строки</h3>
                    <p>Предпросмотр формируется из текущих данных CRM.</p>
                  </div>
                </div>
                <div className="report-preview-list">
                  {selectedRows.slice(0, 4).map((row, index) => (
                    <article key={`${selectedReport.id}-${index}`}>
                      <strong>{String(row.id ?? row.client ?? row.counterparty ?? row.department ?? row.name ?? `Строка ${index + 1}`)}</strong>
                      <small>
                        {Object.entries(row)
                          .slice(1, 4)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' · ')}
                      </small>
                    </article>
                  ))}
                  {!selectedRows.length ? <small>По выбранным параметрам строк нет.</small> : null}
                </div>
              </div>

              <div className="report-actions-panel">
                <Button icon={RefreshCw} onClick={() => generateReport(selectedReport)}>
                  Сформировать
                </Button>
                <Button icon={FileDown} variant="primary" onClick={() => downloadReport(selectedReport)}>
                  Выгрузить файл
                </Button>
              </div>
            </>
          ) : (
            <EmptyState title="Выберите отчет" text="В реестре отчетов пока нет записи, доступной для текущих фильтров." />
          )}
        </aside>
      </div>
    </div>
  );
}

function DesignerPage({
  data,
  role,
  mutate,
  notify,
  addAudit
}: {
  data: AppData;
  role: RoleKey;
  mutate: (updater: (draft: AppData) => void) => void;
  notify: (message: string, tone?: ToastTone) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
}) {
  const [selected, setSelected] = useState(data.processTemplates[0]?.id ?? '');
  const template = data.processTemplates.find((item) => item.id === selected) ?? data.processTemplates[0];
  const canAdmin = role === 'admin';

  const publish = () => {
    mutate((draft) => {
      const item = draft.processTemplates.find((processTemplate) => processTemplate.id === template.id);
      if (!item) return;
      item.version += 1;
      item.status = 'Актуальная';
      addAudit(draft, 'Повышение версии бизнес-процесса', 'Шаблон БП', `${item.name} v${item.version}`, 'Успешно', 'Действие администратора');
    });
    notify('Версия процесса повышена и опубликована', 'success');
  };

  const rollback = () => {
    mutate((draft) => {
      const item = draft.processTemplates.find((processTemplate) => processTemplate.id === template.id);
      if (!item) return;
      item.version = Math.max(1, item.version - 1);
      addAudit(draft, 'Понижение версии бизнес-процесса', 'Шаблон БП', `${item.name} v${item.version}`, 'Предупреждение', 'Действие администратора');
    });
    notify('Версия процесса понижена до предыдущей', 'warning');
  };

  const addRule = () => {
    mutate((draft) => {
      const item = draft.processTemplates.find((processTemplate) => processTemplate.id === template.id);
      item?.validationRules.push('Новое правило: обязательная проверка ответственного подразделения');
      if (item) addAudit(draft, 'Настройка правила валидации процесса', 'Шаблон БП', item.name, 'Успешно', 'Действие администратора');
    });
    notify('Правило валидации добавлено в шаблон', 'success');
  };

  const addStage = () => {
    mutate((draft) => {
      const item = draft.processTemplates.find((processTemplate) => processTemplate.id === template.id);
      const taskTemplate = draft.taskTemplates[0];
      item?.stages.push({
        id: `s-extra-${item.stages.length + 1}`,
        name: 'Контрольная проверка качества данных',
        department: 'Операционный контроль',
        slaHours: 8,
        autoTaskTemplateId: taskTemplate.id,
        requiredAttributes: ['Комментарий проверяющего', 'Итог проверки'],
        escalationRule: 'уведомить владельца процесса при просрочке'
      });
      if (item) addAudit(draft, 'Добавление этапа в маршрут процесса', 'Шаблон БП', item.name, 'Успешно', 'Действие администратора');
    });
    notify('Новый этап добавлен в маршрут; будущие экземпляры будут создавать задачу автоматически', 'success');
  };

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>Конструктор бизнес-процессов</h1>
          <p>Визуализация low/no-code настройки: статусная модель, формы, правила, версии, проверки и интеграционные интерфейсы.</p>
        </div>
        <div className="actions">
          <Button icon={ShieldCheck} onClick={() => notify('Автопроверка: маршрут корректен, обязательные поля заполнены, интеграции описаны', 'success')}>
            Проверить БП
          </Button>
          {canAdmin ? <Button icon={RotateCcw} onClick={rollback}>Откатить версию</Button> : null}
          {canAdmin ? <Button icon={Save} variant="primary" onClick={publish}>Опубликовать</Button> : null}
        </div>
      </section>

      <div className="content-layout two-columns wide-left">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{template.name}</h2>
              <p>Версия {template.version} · {template.status} · триггер: {template.trigger} · доступен: {getProcessTemplatePartyKinds(template).join('/')}</p>
            </div>
            <select value={selected} onChange={(event) => setSelected(event.target.value)}>
              {data.processTemplates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="designer-canvas">
            {template.stages.map((stage, index) => (
              <article key={stage.id} className="designer-node">
                <span>{index + 1}</span>
                <h3>{stage.name}</h3>
                <p>{stage.department}</p>
                <small>SLA {stage.slaHours} ч</small>
                <Badge tone="cyan">{data.taskTemplates.find((taskTemplate) => taskTemplate.id === stage.autoTaskTemplateId)?.name ?? 'Шаблон задачи'}</Badge>
              </article>
            ))}
          </div>
          {canAdmin ? (
            <div className="actions">
              <Button icon={Plus} onClick={addStage}>
                Добавить этап
              </Button>
              <Button icon={Plus} onClick={addRule}>
                Добавить правило
              </Button>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Настройки шаблона</h2>
          </div>
          <div className="settings-list">
            <section>
              <h3>Атрибуты формы GUI</h3>
              {template.attributes.map((attr) => (
                <div key={attr.id} className="setting-row">
                  <span>{attr.name}</span>
                  <Badge tone={attr.required ? 'amber' : 'neutral'}>{attr.type}</Badge>
                </div>
              ))}
            </section>
            <section>
              <h3>Правила валидации</h3>
              {template.validationRules.map((rule) => (
                <p key={rule} className="rule-line">{rule}</p>
              ))}
            </section>
            <section>
              <h3>Интеграционные интерфейсы</h3>
              {template.integrationRules.map((rule) => (
                <p key={rule} className="rule-line">{rule}</p>
              ))}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function IntegrationsPage({
  data,
  role,
  openModal,
  retryIntegration,
  notify,
  mutate,
  addAudit
}: {
  data: AppData;
  role: RoleKey;
  openModal: (modal: ModalState) => void;
  retryIntegration: (id: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
}) {
  const canAdmin = role === 'admin' || role === 'owner';
  const syncAll = () => {
    mutate((draft) => {
      draft.integrations.forEach((integration) => {
        if (integration.status === 'Ожидает') {
          integration.status = 'В процессе';
          integration.log.unshift({ at: '2026-08-04T12:55:00+07:00', level: 'INFO', message: 'Поставлено в очередь повторного обмена' });
        }
      });
      addAudit(draft, 'Пакетный запуск межсистемного обмена', 'Интеграция', 'Все ожидающие', 'Успешно', 'Межсистемное взаимодействие');
    });
    notify('Ожидающие обмены поставлены в очередь', 'info');
  };

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>Технические обмены и импорт</h1>
          <p>Контур показывает статусы обмена, дату обновления, ошибки, повтор обмена, лог и результат обработки файла.</p>
        </div>
        <div className="actions">
          <Button icon={Upload} onClick={() => openModal({ type: 'import' })}>
            Импорт файла
          </Button>
          {canAdmin ? <Button icon={RefreshCw} variant="primary" onClick={syncAll}>Синхронизировать</Button> : null}
        </div>
      </section>
      <IntegrationsList integrations={data.integrations} openModal={openModal} retryIntegration={retryIntegration} />
    </div>
  );
}

function IntegrationsList({
  integrations,
  openModal,
  retryIntegration
}: {
  integrations: IntegrationExchange[];
  openModal: (modal: ModalState) => void;
  retryIntegration: (id: string) => void;
}) {
  return (
    <section className="panel">
      <div className="integration-grid">
        {integrations.map((item) => (
          <article key={item.id} className="integration-card">
            <header>
              <Network size={20} />
              <span>
                <strong>{item.system}</strong>
                <small>{item.operation}</small>
              </span>
              <Badge tone={statusTone(item.status)}>{item.status}</Badge>
            </header>
            <div className="profile-grid compact">
              <Info label="Объект" value={`${item.objectType}: ${item.objectId}`} />
              <Info label="Записей" value={String(item.records)} />
              <Info label="Обновлено" value={formatDateTime(item.lastSync)} />
              <Info label="Ошибки" value={item.errors.length ? item.errors.join('; ') : 'нет'} wide />
            </div>
            <div className="actions">
              <Button icon={History} onClick={() => openModal({ type: 'integrationLog', id: item.id })}>
                Лог
              </Button>
              <Button icon={RefreshCw} variant={item.status === 'Ошибка' ? 'primary' : 'secondary'} onClick={() => retryIntegration(item.id)}>
                Повтор
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderWikiContent(content: string) {
  const nodes: ReactNode[] = [];
  const lines = content.trim().split('\n');
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];
  let table: string[][] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(<p key={`p-${nodes.length}`}>{paragraph.join(' ')}</p>);
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const flushNumbers = () => {
    if (!numbers.length) return;
    nodes.push(
      <ol key={`ol-${nodes.length}`}>
        {numbers.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
    numbers = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const [head, ...body] = table;
    nodes.push(
      <table key={`table-${nodes.length}`} className="wiki-content-table">
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${row.join('-')}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
    table = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushNumbers();
    flushTable();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushAll();
      return;
    }

    if (line.startsWith('|')) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.every((cell) => /^-+$/.test(cell))) return;
      table.push(cells);
      return;
    }

    flushTable();

    if (line.startsWith('### ')) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      nodes.push(<h4 key={`h4-${nodes.length}`}>{line.slice(4)}</h4>);
      return;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      nodes.push(<h3 key={`h3-${nodes.length}`}>{line.slice(3)}</h3>);
      return;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      nodes.push(<div key={`callout-${nodes.length}`} className="wiki-callout">{line.slice(2)}</div>);
      return;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      flushNumbers();
      bullets.push(line.slice(2));
      return;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      flushBullets();
      numbers.push(ordered[1]);
      return;
    }

    flushBullets();
    flushNumbers();
    paragraph.push(line);
  });

  flushAll();
  return nodes;
}

function WikiPage({
  data,
  role,
  mutate,
  notify,
  addAudit
}: {
  data: AppData;
  role: RoleKey;
  mutate: (updater: (draft: AppData) => void) => void;
  notify: (message: string, tone?: ToastTone) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
}) {
  const canAdmin = role === 'admin';
  const currentRole = roles.find((item) => item.key === role);
  const currentUserId = currentRole?.userId ?? data.users[0]?.id ?? 'u-001';
  const [query, setQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('Все');
  const [selectedStatus, setSelectedStatus] = useState<'Все' | AppData['wiki'][number]['status']>('Все');
  const [selected, setSelected] = useState(data.wiki[0]?.id ?? '');
  const [versionId, setVersionId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftTags, setDraftTags] = useState('');

  const spaces = useMemo(() => ['Все', ...Array.from(new Set(data.wiki.map((page) => page.space)))], [data.wiki]);
  const statusOptions: Array<'Все' | AppData['wiki'][number]['status']> = ['Все', 'Опубликована', 'Черновик', 'Архив'];
  const normalizedQuery = normalize(query);
  const getSearchText = (item: AppData['wiki'][number]) =>
    normalize(
      [
        item.space,
        item.title,
        item.path,
        item.content,
        item.status,
        item.tags.join(' '),
        item.versions.map((version) => `${version.label} ${version.content} ${version.changeSummary}`).join(' '),
        item.attachments.map((attachment) => `${attachment.name} ${attachment.kind} ${attachment.format} ${attachment.indexedText ?? ''}`).join(' ')
      ].join(' ')
    );
  const pages = useMemo(
    () =>
      data.wiki.filter(
        (item) =>
          (selectedSpace === 'Все' || item.space === selectedSpace) &&
          (selectedStatus === 'Все' || item.status === selectedStatus) &&
          (!normalizedQuery || getSearchText(item).includes(normalizedQuery))
      ),
    [data.wiki, normalizedQuery, selectedSpace, selectedStatus]
  );
  const page = (pages.some((item) => item.id === selected) ? pages.find((item) => item.id === selected) : pages[0]) ?? data.wiki[0];
  const selectedVersion = page?.versions.find((version) => version.id === versionId);
  const visibleContent = selectedVersion?.content ?? page?.content ?? '';
  const tableAttachment = page?.attachments.find((attachment) => attachment.kind === 'Таблица');
  const schemeAttachment = page?.attachments.find((attachment) => attachment.kind === 'Схема процесса');
  const wikiPageCount = data.wiki.length;
  const attachmentCount = data.wiki.reduce((sum, item) => sum + item.attachments.length, 0);
  const publishedCount = data.wiki.filter((item) => item.status === 'Опубликована').length;

  useEffect(() => {
    if (page && page.id !== selected) setSelected(page.id);
  }, [page?.id, selected]);

  useEffect(() => {
    setVersionId('');
    setEditMode(false);
    setDraftTitle(page?.title ?? '');
    setDraftContent(page?.content ?? '');
    setDraftTags(page?.tags.join(', ') ?? '');
  }, [page?.id]);

  const buildTree = (items: AppData['wiki']) => {
    const ordered: Array<{ item: AppData['wiki'][number]; depth: number }> = [];
    const seen = new Set<string>();

    const visit = (parentId: string | undefined, depth: number) => {
      items
        .filter((item) => item.parentId === parentId)
        .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
        .forEach((item) => {
          ordered.push({ item, depth });
          seen.add(item.id);
          visit(item.id, depth + 1);
        });
    };

    visit(undefined, 0);
    items
      .filter((item) => !seen.has(item.id))
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      .forEach((item) => ordered.push({ item, depth: item.parentId ? 1 : 0 }));

    return ordered;
  };

  const groupedPages = (selectedSpace === 'Все' ? spaces.filter((space) => space !== 'Все') : [selectedSpace])
    .map((space) => ({ space, pages: pages.filter((item) => item.space === space) }))
    .filter((group) => group.pages.length > 0);

  const resetFilters = () => {
    setQuery('');
    setSelectedSpace('Все');
    setSelectedStatus('Все');
    notify('Фильтры Wiki сброшены', 'info');
  };

  const createPage = () => {
    const now = new Date().toISOString();
    const targetSpace = selectedSpace !== 'Все' ? selectedSpace : page?.space ?? 'CRM+BPM';
    const parentId = page?.space === targetSpace ? page.id : undefined;
    const id = `WIKI-${Date.now().toString().slice(-6)}`;
    const title = parentId && page ? `Рабочая инструкция: ${page.title}` : 'Новая страница базы знаний';
    const content =
      'Опишите операцию: входной канал, проверяемые реквизиты, SLA, ответственного исполнителя, результат выполнения и действия при отклонении.';

    mutate((draft) => {
      draft.wiki.unshift({
        id,
        space: targetSpace,
        parentId,
        title,
        path: parentId && page ? `${page.path} / ${title}` : `${targetSpace} / ${title}`,
        content,
        updatedAt: now,
        authorId: currentUserId,
        status: 'Черновик',
        tags: ['черновик', 'операция'],
        versions: [
          {
            id: `${id}-v1`,
            label: `v1 от ${formatDate(now)}`,
            at: now,
            authorId: currentUserId,
            content,
            changeSummary: 'Страница создана из интерфейса Wiki.'
          }
        ],
        attachments: []
      });
      addAudit(draft, 'Создание страницы Wiki', 'Wiki', id);
    });
    setQuery('');
    setSelectedSpace(targetSpace);
    setSelectedStatus('Все');
    window.setTimeout(() => {
      setSelected(id);
      setEditMode(true);
    }, 0);
    notify('Страница Wiki создана как черновик', 'success');
  };

  const createSpace = () => {
    const space = window.prompt('Название пространства Wiki', 'Регламенты операционного сервиса')?.trim();
    if (!space) {
      notify('Создание пространства отменено', 'info');
      return;
    }
    if (data.wiki.some((item) => normalize(item.space) === normalize(space))) {
      notify('Пространство с таким названием уже существует', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const id = `WIKI-${Date.now().toString().slice(-6)}`;
    const title = `Стартовая страница: ${space}`;
    const content = `Стартовая страница пространства "${space}". Зафиксируйте владельца, состав инструкций, порядок публикации и связанные операционные процессы.`;
    mutate((draft) => {
      draft.wiki.unshift({
        id,
        space,
        title,
        path: `${space} / ${title}`,
        content,
        updatedAt: now,
        authorId: currentUserId,
        status: 'Черновик',
        tags: ['пространство', 'черновик'],
        versions: [
          {
            id: `${id}-v1`,
            label: `v1 от ${formatDate(now)}`,
            at: now,
            authorId: currentUserId,
            content,
            changeSummary: 'Создано новое пространство базы знаний.'
          }
        ],
        attachments: []
      });
      addAudit(draft, 'Создание пространства Wiki', 'Wiki', space, 'Успешно', 'Действие администратора');
    });
    setQuery('');
    setSelectedSpace(space);
    setSelectedStatus('Все');
    setSelected(id);
    window.setTimeout(() => setEditMode(true), 0);
    notify(`Пространство "${space}" создано`, 'success');
  };

  const savePage = () => {
    if (!page) return;
    if (!draftTitle.trim() || !draftContent.trim()) {
      notify('Заполните название и содержание страницы', 'danger');
      return;
    }

    const now = new Date().toISOString();
    const nextTags = draftTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    mutate((draft) => {
      const item = draft.wiki.find((wikiPage) => wikiPage.id === page.id);
      if (!item) return;

      const previousContent = item.content;
      item.title = draftTitle.trim();
      item.content = draftContent.trim();
      item.tags = nextTags.length ? nextTags : ['без тега'];
      item.status = 'Опубликована';
      item.authorId = currentUserId;
      item.updatedAt = now;

      const parent = item.parentId ? draft.wiki.find((wikiPage) => wikiPage.id === item.parentId) : undefined;
      item.path = parent ? `${parent.path} / ${item.title}` : `${item.space} / ${item.title}`;

      const refreshChildPaths = (parentId: string, parentPath: string) => {
        draft.wiki
          .filter((child) => child.parentId === parentId)
          .forEach((child) => {
            child.path = `${parentPath} / ${child.title}`;
            refreshChildPaths(child.id, child.path);
          });
      };
      refreshChildPaths(item.id, item.path);

      item.versions.unshift({
        id: `${item.id}-v${item.versions.length + 1}-${Date.now()}`,
        label: `v${item.versions.length + 1} от ${formatDate(now)}`,
        at: now,
        authorId: currentUserId,
        content: item.content,
        changeSummary: previousContent === item.content ? 'Обновлены атрибуты страницы.' : 'Сохранено изменение содержания.'
      });
      addAudit(draft, 'Редактирование страницы Wiki', 'Wiki', item.id);
    });
    setEditMode(false);
    notify('Страница опубликована и сохранена в истории версий', 'success');
  };

  const deletePage = () => {
    if (!page || !canAdmin) return;
    if (!window.confirm(`Удалить страницу "${page.title}" и дочерние страницы?`)) return;

    const idsToDelete = new Set<string>([page.id]);
    const collectChildren = (parentId: string) => {
      data.wiki
        .filter((item) => item.parentId === parentId)
        .forEach((child) => {
          idsToDelete.add(child.id);
          collectChildren(child.id);
        });
    };
    collectChildren(page.id);
    const fallback = data.wiki.find((item) => !idsToDelete.has(item.id))?.id ?? '';

    mutate((draft) => {
      draft.wiki = draft.wiki.filter((item) => !idsToDelete.has(item.id));
      addAudit(draft, 'Удаление страницы Wiki', 'Wiki', page.id, 'Предупреждение', 'Действие администратора');
    });
    setSelected(fallback);
    setVersionId('');
    notify(`Удалено страниц: ${idsToDelete.size}`, 'warning');
  };

  const restoreVersion = () => {
    if (!page || !selectedVersion) return;
    const now = new Date().toISOString();
    mutate((draft) => {
      const item = draft.wiki.find((wikiPage) => wikiPage.id === page.id);
      if (!item) return;
      item.content = selectedVersion.content;
      item.updatedAt = now;
      item.authorId = currentUserId;
      item.versions.unshift({
        id: `${item.id}-restore-${Date.now()}`,
        label: `восстановлено ${formatDate(now)}`,
        at: now,
        authorId: currentUserId,
        content: selectedVersion.content,
        changeSummary: `Восстановлено из ${selectedVersion.label}.`
      });
      addAudit(draft, 'Восстановление версии Wiki', 'Wiki', item.id, 'Успешно', 'Действие администратора');
    });
    setVersionId('');
    notify('Версия восстановлена и добавлена в историю', 'success');
  };

  const uploadAttachment = () => {
    if (!page || !canAdmin) return;
    const normalizedTitle = normalize(page.title);
    const kind: AppData['wiki'][number]['attachments'][number]['kind'] = normalizedTitle.includes('процесс') || page.tags.some((tag) => normalize(tag).includes('bpm'))
      ? 'Схема процесса'
      : normalizedTitle.includes('sla') || page.tags.some((tag) => ['sla', 'контроль', 'профиль'].includes(normalize(tag)))
        ? 'Таблица'
        : 'Документ';
    const format: AppData['wiki'][number]['attachments'][number]['format'] =
      kind === 'Схема процесса' ? 'DRAWIO' : kind === 'Таблица' ? 'XLSX' : 'PDF';
    const now = new Date().toISOString();
    const attachment = {
      id: `WATT-${Date.now().toString().slice(-6)}`,
      name:
        kind === 'Схема процесса'
          ? `scheme-${page.id.toLowerCase()}.drawio`
          : kind === 'Таблица'
            ? `control-table-${page.id.toLowerCase()}.xlsx`
            : `instruction-${page.id.toLowerCase()}.pdf`,
      format,
      size: kind === 'Схема процесса' ? '82 КБ' : kind === 'Таблица' ? '44 КБ' : '96 КБ',
      uploadedAt: now,
      ownerId: currentUserId,
      kind,
      indexedText:
        kind === 'Схема процесса'
          ? `Схема процесса ${page.title}: вход, проверка, SLA, результат и ответственные подразделения.`
          : kind === 'Таблица'
            ? `Контрольная таблица ${page.title}: SLA, критерии проверки, обязательные поля и эскалации.`
            : `Инструкция ${page.title}: порядок выполнения операции, ответственные, результат и действия при отклонении.`
    };

    mutate((draft) => {
      const item = draft.wiki.find((wikiPage) => wikiPage.id === page.id);
      if (!item) return;
      item.attachments.unshift(attachment);
      item.updatedAt = now;
      addAudit(draft, 'Загрузка вложения Wiki', 'Wiki', page.id);
    });
    notify(`Вложение ${attachment.name} добавлено`, 'success');
  };

  const downloadAttachment = (attachment: AppData['wiki'][number]['attachments'][number]) => {
    const payload = [
      `Файл: ${attachment.name}`,
      `Тип: ${attachment.kind}`,
      `Страница: ${page?.title ?? ''}`,
      `Дата выгрузки: ${formatDateTime(new Date().toISOString())}`,
      attachment.indexedText ? `Индексируемое содержание: ${attachment.indexedText}` : 'Содержимое файла доступно во вложении Wiki.'
    ].join('\n');
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(payload)}`;
    link.download = attachment.name;
    link.click();
    notify(`Файл ${attachment.name} подготовлен к скачиванию`, 'success');
  };

  const openDiagram = (attachment: AppData['wiki'][number]['attachments'][number]) => {
    mutate((draft) => addAudit(draft, 'Открытие схемы процесса Wiki', 'Wiki', attachment.name));
    notify(`Схема ${attachment.name} открыта в редакторе процессов`, 'info');
  };

  return (
    <div className="page-grid">
      <section className="toolbar band wiki-hero">
        <div>
          <span className="caption">операционная база знаний</span>
          <h1>Wiki CRM</h1>
          <p>Регламенты, инструкции, шаблоны и схемы процессов для ежедневной работы.</p>
        </div>
        <div className="wiki-hero-stats">
          <span>
            <strong>{spaces.length - 1}</strong>
            <small>пространства</small>
          </span>
          <span>
            <strong>{wikiPageCount}</strong>
            <small>страниц</small>
          </span>
          <span>
            <strong>{attachmentCount}</strong>
            <small>файлов</small>
          </span>
          <span>
            <strong>{publishedCount}</strong>
            <small>опубликовано</small>
          </span>
        </div>
      </section>

      <section className="filters-panel wiki-filters">
        <Field label="Полнотекстовый поиск" value={query} onChange={setQuery} placeholder="SLA, подключение, ПДн, Email Gateway" />
        <SelectField label="Пространство" value={selectedSpace} options={spaces} onChange={setSelectedSpace} />
        <SelectField label="Статус" value={selectedStatus} options={statusOptions} onChange={setSelectedStatus} />
        <Button icon={Search} onClick={() => notify(`Найдено страниц: ${pages.length}`, 'info')}>
          Найти
        </Button>
        <Button icon={RotateCcw} onClick={resetFilters}>
          Сбросить
        </Button>
        {canAdmin ? (
          <div className="actions filter-actions">
            <Button icon={Plus} onClick={createPage}>
              Страница
            </Button>
            <Button icon={Columns3} variant="primary" onClick={createSpace}>
              Пространство
            </Button>
          </div>
        ) : null}
      </section>

      <div className="content-layout wiki-layout">
        <section className="panel wiki-sidebar">
          <div className="panel-header">
            <div>
              <h2>Пространства</h2>
              <p>{pages.length} страниц в выборке</p>
            </div>
          </div>
          <div className="wiki-space-rail">
            {spaces
              .filter((space) => space !== 'Все')
              .map((space) => {
                const count = data.wiki.filter((item) => item.space === space).length;
                return (
                  <button key={space} className={selectedSpace === space ? 'active' : ''} onClick={() => setSelectedSpace(space)}>
                    <span>{space}</span>
                    <Badge tone="neutral">{count}</Badge>
                  </button>
                );
              })}
          </div>
          <div className="panel-subheader compact">
            <h3>Страницы</h3>
          </div>
          <div className="wiki-tree">
            {groupedPages.length ? (
              groupedPages.map((group) => (
                <div key={group.space} className="wiki-tree-section">
                  {selectedSpace === 'Все' ? <strong className="wiki-space-label">{group.space}</strong> : null}
                  {buildTree(group.pages).map(({ item, depth }) => (
                    <button key={item.id} className={page?.id === item.id ? 'active' : ''} style={{ paddingLeft: 12 + depth * 18 }} onClick={() => setSelected(item.id)}>
                      <BookOpen size={16} />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.path}</small>
                      </span>
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <EmptyState title="Ничего не найдено" text="Измените поисковый запрос или сбросьте фильтры." />
            )}
          </div>
        </section>
        <section className="panel wiki-reader">
          {page ? (
            <>
              <div className="wiki-page-head">
                <div>
                  <span className="wiki-breadcrumbs">{page.path}</span>
                  <h2>{page.title}</h2>
                  <div className="wiki-tag-row">
                    <Badge tone={statusTone(page.status)}>{page.status}</Badge>
                    {page.tags.map((tag) => (
                      <Badge key={tag} tone="cyan">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="actions">
                  {canAdmin ? (
                    <>
                      <Button icon={Edit} onClick={() => setEditMode(true)}>
                        Изменить
                      </Button>
                      <Button icon={Upload} onClick={uploadAttachment}>
                        Файл
                      </Button>
                      <Button icon={Trash2} variant="danger" onClick={deletePage}>
                        Удалить
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="wiki-meta-grid">
                <Info label="Пространство" value={page.space} />
                <Info label="Автор" value={getUserName(data, page.authorId)} />
                <Info label="Обновлено" value={formatDateTime(page.updatedAt)} />
                <Info label="Вложений" value={String(page.attachments.length)} />
              </div>

              {editMode ? (
                <div className="wiki-editor">
                  <Field label="Название" value={draftTitle} onChange={setDraftTitle} required />
                  <Field label="Теги через запятую" value={draftTags} onChange={setDraftTags} placeholder="СБП, SLA, профиль" />
                  <label className="field full">
                    <span>Содержание</span>
                    <textarea value={draftContent} onChange={(event) => setDraftContent(event.target.value)} />
                  </label>
                  <div className="actions">
                    <Button icon={X} onClick={() => setEditMode(false)}>
                      Отмена
                    </Button>
                    <Button icon={Save} variant="primary" onClick={savePage}>
                      Опубликовать
                    </Button>
                  </div>
                </div>
              ) : (
                <article className="wiki-article">
                  <div className="wiki-article-title">
                    <h3>{selectedVersion ? 'Содержание выбранной версии' : 'Содержание'}</h3>
                    {selectedVersion ? <Badge tone="violet">{selectedVersion.label}</Badge> : null}
                  </div>
                  <div className="wiki-rich-text">{renderWikiContent(visibleContent)}</div>
                </article>
              )}

              {(schemeAttachment || tableAttachment) ? (
                <div className={`wiki-workbench ${schemeAttachment && tableAttachment ? '' : 'single'}`}>
                  {schemeAttachment ? (
                    <section className="wiki-diagram-preview">
                      <div className="panel-subheader compact">
                        <h3>Схема процесса</h3>
                        <Button icon={Workflow} onClick={() => openDiagram(schemeAttachment)}>
                          Открыть схему
                        </Button>
                      </div>
                      <div className="wiki-diagram-flow">
                        <span>Вход</span>
                        <span>Проверка</span>
                        <span>SLA</span>
                        <span>Результат</span>
                      </div>
                    </section>
                  ) : null}
                  {tableAttachment ? (
                    <section className="wiki-table-preview">
                      <div className="panel-subheader compact">
                        <h3>Контрольная таблица</h3>
                        <Button icon={Table2} onClick={() => downloadAttachment(tableAttachment)}>
                          Скачать
                        </Button>
                      </div>
                      <table>
                        <tbody>
                          <tr>
                            <td>SLA регистрации</td>
                            <td>4 часа</td>
                            <td>эскалация за 1 час</td>
                          </tr>
                          <tr>
                            <td>Повтор обмена</td>
                            <td>3 попытки</td>
                            <td>Email Gateway</td>
                          </tr>
                          <tr>
                            <td>Проверка профиля</td>
                            <td>80% полноты</td>
                            <td>контроль дублей</td>
                          </tr>
                        </tbody>
                      </table>
                    </section>
                  ) : null}
                </div>
              ) : null}

              <div className="wiki-bottom-grid">
                <section>
                  <div className="panel-subheader compact">
                    <h3>Версии</h3>
                    {selectedVersion && canAdmin ? (
                      <Button icon={RotateCcw} onClick={restoreVersion}>
                        Восстановить
                      </Button>
                    ) : null}
                  </div>
                  <div className="wiki-version-list">
                    {page.versions.map((version) => (
                      <button key={version.id} className={versionId === version.id ? 'active' : ''} onClick={() => setVersionId(versionId === version.id ? '' : version.id)}>
                        <span>
                          <strong>{version.label}</strong>
                          <small>{formatDateTime(version.at)} · {getUserName(data, version.authorId)}</small>
                          <small>{version.changeSummary}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="panel-subheader compact">
                    <h3>Вложения</h3>
                  </div>
                  <div className="attachment-grid">
                    {page.attachments.length ? (
                      page.attachments.map((attachment) => {
                        const AttachmentIcon = attachment.kind === 'Таблица' ? Table2 : attachment.kind === 'Схема процесса' ? Workflow : FileDown;
                        return (
                          <article key={attachment.id} className="attachment-card">
                            <AttachmentIcon size={18} />
                            <span>
                              <strong>{attachment.name}</strong>
                              <small>{attachment.kind} · {attachment.format} · {attachment.size}</small>
                              {attachment.indexedText ? <small>Содержимое участвует в поиске</small> : null}
                              <small>{formatDateTime(attachment.uploadedAt)} · {getUserName(data, attachment.ownerId)}</small>
                            </span>
                            <div className="actions">
                              {attachment.kind === 'Схема процесса' ? <IconButton title="Открыть схему" icon={Workflow} onClick={() => openDiagram(attachment)} /> : null}
                              <IconButton title="Скачать файл" icon={Download} onClick={() => downloadAttachment(attachment)} />
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <EmptyState title="Вложений нет" text="Администратор может добавить регламент, таблицу или схему процесса." />
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <EmptyState title="Страница не выбрана" text="Измените поисковый запрос или создайте новую страницу." />
          )}
        </section>
      </div>
    </div>
  );
}

function DictionariesPage({
  data,
  role,
  mutate,
  notify,
  addAudit
}: {
  data: AppData;
  role: RoleKey;
  mutate: (updater: (draft: AppData) => void) => void;
  notify: (message: string, tone?: ToastTone) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
}) {
  const [selected, setSelected] = useState(data.dictionaries[0]?.id ?? '');
  const dictionary = data.dictionaries.find((item) => item.id === selected) ?? data.dictionaries[0];
  const canAdmin = role === 'admin';

  const addField = () => {
    const field: DictionaryField = {
      id: `f-extra-${dictionary.fields.length + 1}`,
      name: 'Новое обязательное поле',
      type: 'Строка',
      required: true
    };
    mutate((draft) => {
      const item = draft.dictionaries.find((dict) => dict.id === dictionary.id);
      item?.fields.push(field);
      if (item) addAudit(draft, 'Добавление поля справочника', 'Справочник', item.name, 'Успешно', 'Действие администратора');
    });
    notify('Поле добавлено, обязательность включена', 'success');
  };

  const removeField = (fieldId: string) => {
    mutate((draft) => {
      const item = draft.dictionaries.find((dict) => dict.id === dictionary.id);
      if (!item) return;
      item.fields = item.fields.filter((field) => field.id !== fieldId);
      addAudit(draft, 'Удаление поля справочника', 'Справочник', item.name, 'Предупреждение', 'Действие администратора');
    });
    notify('Поле справочника удалено', 'warning');
  };

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>Справочники</h1>
          <p>Настройка структуры, владельцев, типов данных, обязательности полей, формул и связей с сущностями.</p>
        </div>
        <div className="actions">
          {canAdmin ? <Button icon={Plus} variant="primary" onClick={addField}>Добавить поле</Button> : null}
        </div>
      </section>
      <div className="content-layout two-columns">
        <section className="panel">
          <div className="panel-header">
            <h2>Список справочников</h2>
          </div>
          <div className="wiki-tree">
            {data.dictionaries.map((item) => (
              <button key={item.id} className={dictionary.id === item.id ? 'active' : ''} onClick={() => setSelected(item.id)}>
                <Database size={16} />
                <span>
                  <strong>{item.name}</strong>
                  <small>Владелец: {getUserName(data, item.ownerId)}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{dictionary.name}</h2>
              <p>{dictionary.description}</p>
            </div>
            <Badge tone="cyan">Записей: {dictionary.records.length}</Badge>
          </div>
          <div className="settings-list">
            <section>
              <h3>Поля</h3>
              {dictionary.fields.map((field) => (
                <div key={field.id} className="setting-row">
                  <span>
                    <strong>{field.name}</strong>
                    <small>{field.source || field.formula || 'ручной ввод'}</small>
                  </span>
                  <Badge tone={field.required ? 'amber' : 'neutral'}>{field.type}</Badge>
                  {canAdmin ? <IconButton title="Удалить поле" icon={Trash2} onClick={() => removeField(field.id)} /> : null}
                </div>
              ))}
            </section>
            <section>
              <h3>Данные</h3>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {dictionary.records.map((record, index) => (
                      <tr key={index}>
                        {Object.entries(record).map(([key, value]) => (
                          <td key={key}>
                            <small>{key}</small>
                            <strong>{String(value)}</strong>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function LogsPage({ data, role, notify, routeFilter }: { data: AppData; role: RoleKey; notify: (message: string, tone?: ToastTone) => void; routeFilter?: SavedFilterPayload }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<AuditLog['logType'] | 'Все'>('Все');
  useEffect(() => {
    if (!routeFilter) return;
    setQuery(String(routeFilter.query ?? ''));
    const nextType = String(routeFilter.type ?? 'Все') as AuditLog['logType'] | 'Все';
    if (['Все', 'Действие пользователя', 'Действие администратора', 'Системное событие', 'Межсистемное взаимодействие', 'Ошибка'].includes(nextType)) setType(nextType);
  }, [routeFilter]);
  const rows = data.auditLogs.filter((log) => normalize(`${log.at} ${log.action} ${log.objectName} ${log.userIdMasked}`).includes(normalize(query)) && (type === 'Все' || log.logType === type));
  const logTypes: Array<AuditLog['logType'] | 'Все'> = ['Все', 'Действие пользователя', 'Действие администратора', 'Системное событие', 'Межсистемное взаимодействие', 'Ошибка'];

  return (
    <div className="page-grid">
      <section className="toolbar band">
        <div>
          <h1>Журналирование и логирование</h1>
          <p>Логи обезличены и содержат пользователя, дату, действие, объект, ссылку, тип события и результат.</p>
        </div>
        <div className="actions">
          <Button icon={Settings} onClick={() => notify('Структура лога: userIdMasked, at, action, objectType, objectName, objectLink, logType, result', 'info')}>
            Структура лога
          </Button>
          <Button icon={Download} variant="primary" onClick={() => exportRows(rows, 'audit-logs.json')}>
            Экспорт
          </Button>
        </div>
      </section>
      <section className="filters-panel">
        <Field label="Поиск по логам" value={query} onChange={setQuery} placeholder="TASK-2050, обмен, USR-8007" />
        <SelectField label="Тип лога" value={type} options={logTypes} onChange={setType} />
        {role === 'admin' ? (
          <Button icon={LockKeyhole} onClick={() => notify('Правила точек логирования доступны администратору BPM', 'success')}>
            Настроить точки логирования
          </Button>
        ) : null}
      </section>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Пользователь</th>
                <th>Действие</th>
                <th>Объект</th>
                <th>Тип</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.at)}</td>
                  <td>{log.userIdMasked}</td>
                  <td>{log.action}</td>
                  <td>
                    {log.objectType}: {log.objectName}
                  </td>
                  <td>{log.logType}</td>
                  <td>
                    <Badge tone={statusTone(log.result)}>{log.result}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CounterpartyFormModal({
  mode,
  item,
  onClose,
  onCreate,
  onUpdate
}: {
  mode: 'create' | 'edit';
  item?: Counterparty;
  onClose: () => void;
  onCreate: (form: Partial<Counterparty>) => void;
  onUpdate: (id: string, form: Partial<Counterparty>) => void;
}) {
  const [form, setForm] = useState<Partial<Counterparty>>(
    item ?? {
      name: '',
      shortName: '',
      partyKind: 'ЮЛ',
      type: 'КО',
      status: 'Подключение',
      inn: '',
      kpp: '',
      ogrn: '',
      region: '',
      address: '',
      segment: ''
    }
  );
  const [error, setError] = useState('');
  const partyKind = form.partyKind ?? (form.type === 'ФЛ' ? 'ФЛ' : 'ЮЛ');
  const isIndividual = partyKind === 'ФЛ';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.shortName || !form.inn || String(form.inn).length < 10) {
      setError(isIndividual ? 'Заполните ФИО, краткое имя и корректный ИНН физического лица.' : 'Заполните название, краткое название и корректный ИНН.');
      return;
    }
    if (mode === 'edit' && item) onUpdate(item.id, form);
    else onCreate(form);
    onClose();
  };

  return (
    <Modal title={mode === 'edit' ? 'Редактирование контрагента' : 'Создание контрагента'} onClose={onClose} width="large">
      <form className="modal-form" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="form-grid">
          <SelectField
            label="Вид клиента"
            value={partyKind}
            options={['ЮЛ', 'ФЛ']}
            onChange={(value) => setForm({ ...form, partyKind: value, type: value === 'ФЛ' ? 'ФЛ' : 'КО' })}
            required
          />
          <Field label={isIndividual ? 'ФИО' : 'Полное название'} value={form.name ?? ''} onChange={(value) => setForm({ ...form, name: value })} required />
          <Field label={isIndividual ? 'Краткое имя' : 'Краткое название'} value={form.shortName ?? ''} onChange={(value) => setForm({ ...form, shortName: value })} required />
          <SelectField label="Тип" value={form.type ?? (isIndividual ? 'ФЛ' : 'КО')} options={isIndividual ? ['ФЛ'] : legalCounterpartyTypes} onChange={(value) => setForm({ ...form, type: value })} required />
          <SelectField label="Статус" value={form.status ?? 'Подключение'} options={counterpartyStatuses} onChange={(value) => setForm({ ...form, status: value })} required />
          <Field label={isIndividual ? 'ИНН ФЛ' : 'ИНН'} value={form.inn ?? ''} onChange={(value) => setForm({ ...form, inn: value })} required />
          {!isIndividual ? <Field label="КПП" value={form.kpp ?? ''} onChange={(value) => setForm({ ...form, kpp: value })} /> : null}
          {!isIndividual ? <Field label="ОГРН" value={form.ogrn ?? ''} onChange={(value) => setForm({ ...form, ogrn: value })} /> : null}
          {isIndividual ? <Field label="Дата рождения" type="date" value={form.birthDate ?? '1990-01-01'} onChange={(value) => setForm({ ...form, birthDate: value })} /> : null}
          {isIndividual ? <Field label="Документ" value={form.identityDocument ?? ''} onChange={(value) => setForm({ ...form, identityDocument: value })} placeholder="Паспорт **00 00" /> : null}
          {isIndividual ? <Field label="Маскированная карта" value={form.maskedCard ?? ''} onChange={(value) => setForm({ ...form, maskedCard: value })} placeholder="2202 **** **** 0000" /> : null}
          {isIndividual ? <Field label="ID лояльности" value={form.loyaltyId ?? ''} onChange={(value) => setForm({ ...form, loyaltyId: value })} /> : null}
          {isIndividual ? <SelectField label="Канал" value={form.preferredChannel ?? 'Чат'} options={['Телефон', 'Email', 'Чат', 'Офис', 'Форма сайта']} onChange={(value) => setForm({ ...form, preferredChannel: value })} /> : null}
          {isIndividual ? <SelectField label="Согласие ПДн" value={form.consentStatus ?? 'Получено'} options={['Получено', 'Истекает', 'Не получено']} onChange={(value) => setForm({ ...form, consentStatus: value })} /> : null}
          <Field label="Регион" value={form.region ?? ''} onChange={(value) => setForm({ ...form, region: value })} />
          <Field label={isIndividual ? 'Адрес обслуживания' : 'Адрес'} value={form.address ?? ''} onChange={(value) => setForm({ ...form, address: value })} />
          <Field label="Сегмент" value={form.segment ?? ''} onChange={(value) => setForm({ ...form, segment: value })} />
          {isIndividual ? <Field label="Категория обращения" value={form.appealCategory ?? ''} onChange={(value) => setForm({ ...form, appealCategory: value })} /> : null}
        </div>
        <footer className="modal-actions">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={Save} variant="primary" type="submit">
            Сохранить
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

function StartProcessModal({
  data,
  counterpartyId,
  onClose,
  onStart
}: {
  data: AppData;
  counterpartyId?: string;
  onClose: () => void;
  onStart: (counterpartyId: string, templateId: string, dueDate: string, title: string) => void;
}) {
  const initialCpId = counterpartyId ?? data.counterparties[0]?.id ?? '';
  const initialCounterparty = getCounterparty(data, initialCpId);
  const initialTemplate = data.processTemplates.find((item) => canStartProcessForCounterparty(item, initialCounterparty)) ?? data.processTemplates[0];
  const [cpId, setCpId] = useState(initialCpId);
  const [templateId, setTemplateId] = useState(initialTemplate?.id ?? '');
  const [dueDate, setDueDate] = useState('2026-08-14');
  const counterparty = getCounterparty(data, cpId);
  const availableTemplates = useMemo(() => data.processTemplates.filter((item) => canStartProcessForCounterparty(item, counterparty)), [data.processTemplates, counterparty?.id, counterparty?.partyKind, counterparty?.type]);
  const selectedTemplate = availableTemplates.find((item) => item.id === templateId) ?? availableTemplates[0];
  const [title, setTitle] = useState(`${initialTemplate?.name ?? 'Процесс'}: ${initialCounterparty?.shortName ?? ''}`);

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id !== templateId) setTemplateId(selectedTemplate.id);
  }, [selectedTemplate?.id, templateId]);

  useEffect(() => {
    setTitle(`${selectedTemplate?.name ?? 'Процесс'}: ${counterparty?.shortName ?? ''}`);
  }, [cpId, selectedTemplate?.name, counterparty?.shortName]);

  return (
    <Modal title="Запуск бизнес-процесса" onClose={onClose} width="large">
      <form
        className="modal-form start-process-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!selectedTemplate) return;
          onStart(cpId, selectedTemplate.id, dueDate, title);
        }}
      >
        <div className="form-grid">
          <label className="field">
            <span>Контрагент*</span>
            <select value={cpId} onChange={(event) => setCpId(event.target.value)}>
              {data.counterparties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} · {item.shortName}
                </option>
              ))}
            </select>
          </label>
          <label className="field process-template-field">
            <span>Шаблон процесса*</span>
            <select value={selectedTemplate?.id ?? ''} onChange={(event) => setTemplateId(event.target.value)}>
              {availableTemplates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} v{item.version} · {getProcessTemplatePartyKinds(item).join('/')}
                </option>
              ))}
              {!availableTemplates.length ? <option value="">Нет доступных шаблонов</option> : null}
            </select>
          </label>
          <Field className="full" label="Название экземпляра" value={title} onChange={setTitle} required />
          <Field label="Плановый срок" type="date" value={dueDate} onChange={setDueDate} required />
        </div>
        <div className="process-preview">
          <strong>Автоматически будет создано:</strong>
          <p>
            Экземпляр процесса, первая задача группе “{selectedTemplate?.stages[0]?.department}”, уведомление исполнителям и контрольный обмен: {selectedTemplate?.integrationRules[0] ?? 'журналирование события в CRM'}.
          </p>
          <div className="route-flow mini">
            {selectedTemplate?.stages.map((stage, index) => (
              <article key={stage.id} className="route-step pending">
                <span className="step-index">{index + 1}</span>
                <div>
                  <h3>{stage.name}</h3>
                  <small>{stage.department} · SLA {stage.slaHours} ч</small>
                </div>
              </article>
            ))}
          </div>
        </div>
        <footer className="modal-actions">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={PlayCircle} variant="primary" type="submit" disabled={!selectedTemplate}>
            Запустить
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

function TaskFormModal({
  data,
  counterpartyId,
  processId,
  onClose,
  onCreate
}: {
  data: AppData;
  counterpartyId?: string;
  processId?: string;
  onClose: () => void;
  onCreate: (payload: TaskCreatePayload) => void;
}) {
  const initialProcess = getProcess(data, processId);
  const initialCounterpartyId = counterpartyId ?? initialProcess?.counterpartyId ?? data.counterparties[0]?.id ?? '';
  const initialCounterparty = getCounterparty(data, initialCounterpartyId);
  const [taskType, setTaskType] = useState<ManualTaskTypeId>('tt-manual-control');
  const selectedTaskType = getManualTaskType(taskType);
  const [title, setTitle] = useState(selectedTaskType.title(initialCounterparty?.shortName ?? 'контрагент'));
  const [priority, setPriority] = useState<Priority>(selectedTaskType.defaultPriority);
  const [cpId, setCpId] = useState(initialCounterpartyId);
  const [bpId, setBpId] = useState(processId ?? '');
  const groups = Array.from(new Set([...data.users.map((user) => user.department), ...manualTaskTypeOptions.map((item) => item.defaultGroup)])).sort();
  const [group, setGroup] = useState(initialProcess?.currentGroup ?? selectedTaskType.defaultGroup);
  const [dueDate, setDueDate] = useState('2026-08-09');
  const [comment, setComment] = useState('Задача создана вручную из карточки CRM.');
  const selectedCounterparty = getCounterparty(data, cpId);
  const selectedPartyKind: ProcessPartyKind = isIndividualCounterparty(selectedCounterparty) ? 'ФЛ' : 'ЮЛ';
  const availableManualTaskTypeOptions = manualTaskTypeOptions.filter((item) => item.partyKinds.includes(selectedPartyKind));
  const selectedProcess = getProcess(data, bpId);
  const relatedProcesses = data.processes.filter((process) => process.counterpartyId === cpId);
  const applyTaskType = (nextType: ManualTaskTypeId) => {
    const config = getManualTaskType(nextType);
    setTaskType(nextType);
    setPriority(config.defaultPriority);
    setGroup(selectedProcess?.currentGroup ?? config.defaultGroup);
    setTitle(config.title(selectedCounterparty?.shortName ?? 'контрагент'));
  };

  useEffect(() => {
    if (!availableManualTaskTypeOptions.some((item) => item.id === taskType)) applyTaskType(availableManualTaskTypeOptions[0]?.id ?? 'tt-manual-control');
  }, [availableManualTaskTypeOptions, taskType]);

  return (
    <Modal title="Создание задачи" onClose={onClose} width="large">
      <form
        className="modal-form task-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            title,
            priority,
            counterpartyId: cpId,
            processId: bpId || undefined,
            assigneeGroup: group,
            dueDate,
            templateId: taskType,
            requiredFields: [...selectedTaskType.requiredFields],
            comment
          });
        }}
      >
        <div className="form-grid">
          <label className="field full">
            <span>Тип задачи*</span>
            <select value={taskType} onChange={(event) => applyTaskType(event.target.value as ManualTaskTypeId)}>
              {availableManualTaskTypeOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Field className="full" label="Название" value={title} onChange={setTitle} required />
          <SelectField label="Приоритет" value={priority} options={priorities} onChange={setPriority} />
          <label className="field">
            <span>Контрагент</span>
            <select
              value={cpId}
              onChange={(event) => {
                const currentProcess = getProcess(data, bpId);
                setCpId(event.target.value);
                if (currentProcess && currentProcess.counterpartyId !== event.target.value) setBpId('');
              }}
            >
              {data.counterparties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} · {item.shortName}
                </option>
              ))}
            </select>
          </label>
          <label className="field process-select-field">
            <span>Процесс</span>
            <select
              value={bpId}
              onChange={(event) => {
                const nextProcess = getProcess(data, event.target.value);
                setBpId(event.target.value);
                if (nextProcess) {
                  setCpId(nextProcess.counterpartyId);
                  setGroup(nextProcess.currentGroup);
                }
              }}
            >
              <option value="">Без процесса</option>
              {(relatedProcesses.length ? relatedProcesses : data.processes).map((process) => (
                <option key={process.id} value={process.id}>
                  {process.id} · {process.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Группа исполнителей</span>
            <select value={group} onChange={(event) => setGroup(event.target.value)}>
              {groups.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <Field label="Срок" type="date" value={dueDate} onChange={setDueDate} />
          <label className="field full">
            <span>Комментарий / основание</span>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
          <div className="process-preview full">
            <strong>{selectedTaskType.label}</strong>
            <p>
              {selectedTaskType.preview} {selectedProcess ? `Задача будет связана с процессом ${selectedProcess.id}.` : 'Процесс не выбран: карточка будет универсальной, но с обязательными результатами по выбранному типу.'}
            </p>
            <div className="mini-checklist">
              {selectedTaskType.requiredFields.map((field) => (
                <span key={field}>{field}</span>
              ))}
            </div>
          </div>
        </div>
        <footer className="modal-actions">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={Save} variant="primary" type="submit">
            Создать
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

function CommunicationModal({
  data,
  counterparty,
  counterpartyId,
  onClose,
  onCreate
}: {
  data: AppData;
  counterparty?: Counterparty;
  counterpartyId?: string;
  onClose: () => void;
  onCreate: (payload: CommunicationFormValues) => void;
}) {
  const defaultCounterpartyId = counterpartyId ?? data.counterparties[0]?.id ?? '';
  const [form, setForm] = useState<CommunicationFormValues>({
    counterpartyId: defaultCounterpartyId,
    type: 'Звонок',
    subject: counterparty ? `Контакт с ${counterparty.shortName}` : 'Контакт с контрагентом',
    at: '2026-08-06T11:00',
    status: 'Запланирована',
    channel: 'Телефон',
    processId: data.processes.find((process) => process.counterpartyId === defaultCounterpartyId)?.id ?? '',
    summary: 'Цель коммуникации, ожидаемый результат и рабочий контекст зафиксированы.',
    nextAction: 'Подтвердить договоренности и назначить ответственного',
    agenda: 'Контекст обращения или процесса\nРешение и следующий шаг\nСрок ответа и ответственный',
    participants: counterparty?.contacts.map((contact) => contact.name).join(', ') || '',
    createTask: true,
    taskGroup: 'Операционный контроль',
    taskDueDate: '2026-08-08'
  });
  const processOptions = ['', ...data.processes.filter((process) => process.counterpartyId === form.counterpartyId).map((process) => process.id)];
  const selectedCounterparty = getCounterparty(data, form.counterpartyId);
  const groupOptions = Array.from(new Set(['Операционный контроль', 'Контактный центр', 'Технологическая интеграция', 'Юридическое сопровождение', 'Партнерские программы', ...data.taskTemplates.map((template) => template.assigneeGroup)])).sort();
  const updateForm = <K extends keyof CommunicationFormValues>(key: K, value: CommunicationFormValues[K]) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal title="Планирование и фиксация коммуникации" onClose={onClose} width="large">
      <form
        className="modal-form communication-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(form);
        }}
      >
        <label className="field full">
          <span>Контрагент</span>
          <select
            value={form.counterpartyId}
            onChange={(event) => {
              const nextCounterparty = getCounterparty(data, event.target.value);
              setForm((current) => ({
                ...current,
                counterpartyId: event.target.value,
                processId: data.processes.find((process) => process.counterpartyId === event.target.value)?.id ?? '',
                subject: nextCounterparty ? `Контакт с ${nextCounterparty.shortName}` : current.subject,
                participants: nextCounterparty?.contacts.map((contact) => contact.name).join(', ') ?? current.participants
              }));
            }}
          >
            {data.counterparties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.shortName} · {isIndividualCounterparty(item) ? 'ФЛ' : 'ЮЛ'} · {item.id}
              </option>
            ))}
          </select>
        </label>
        <SelectField label="Тип" value={form.type} options={['Звонок', 'Встреча', 'Письмо', 'Обращение']} onChange={(value) => updateForm('type', value)} />
        <SelectField label="Статус" value={form.status} options={communicationStatuses} onChange={(value) => updateForm('status', value)} />
        <SelectField label="Канал" value={form.channel} options={['Телефон', 'ВКС', 'Email', 'Офис', 'Чат', 'Форма сайта']} onChange={(value) => updateForm('channel', value)} />
        <Field label="Дата и время" value={form.at} onChange={(value) => updateForm('at', value)} type="datetime-local" required />
        <Field label="Тема" value={form.subject} onChange={(value) => updateForm('subject', value)} required className="full" />
        <label className="field full">
          <span>Связанный процесс</span>
          <select value={form.processId ?? ''} onChange={(event) => updateForm('processId', event.target.value)}>
            {processOptions.map((id) => (
              <option key={id || 'none'} value={id}>
                {id ? `${id} · ${getProcess(data, id)?.title}` : 'Без связи с процессом'}
              </option>
            ))}
          </select>
        </label>
        <label className="field full">
          <span>Повестка</span>
          <textarea value={form.agenda} onChange={(event) => updateForm('agenda', event.target.value)} />
        </label>
        <Field label="Участники" value={form.participants} onChange={(value) => updateForm('participants', value)} placeholder="Через запятую" className="full" />
        <label className="field full">
          <span>{form.status === 'Запланирована' ? 'Контекст и ожидаемый результат' : 'Итоги'}</span>
          <textarea value={form.summary} onChange={(event) => updateForm('summary', event.target.value)} />
        </label>
        <Field label="Следующий шаг" value={form.nextAction} onChange={(value) => updateForm('nextAction', value)} required className="full" />
        <label className="check-row full">
          <input type="checkbox" checked={form.createTask} onChange={(event) => updateForm('createTask', event.target.checked)} />
          <span>Создать follow-up задачу по итогам коммуникации</span>
        </label>
        {form.createTask ? (
          <>
            <SelectField label="Группа задачи" value={form.taskGroup} options={groupOptions} onChange={(value) => updateForm('taskGroup', value)} />
            <Field label="Срок задачи" value={form.taskDueDate} onChange={(value) => updateForm('taskDueDate', value)} type="date" />
          </>
        ) : null}
        <div className="process-preview full">
          <strong>{selectedCounterparty?.name}</strong>
          <p>{selectedCounterparty ? `${selectedCounterparty.region}. Последний контакт: ${formatDateTime(selectedCounterparty.lastTouch)}. Активных процессов: ${data.processes.filter((process) => process.counterpartyId === selectedCounterparty.id && process.status !== 'Завершен').length}.` : 'Выберите контрагента для связи коммуникации с карточкой.'}</p>
        </div>
        <footer className="modal-actions full">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={Save} variant="primary" type="submit">
            Сохранить
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

function InternalHandoffModal({
  data,
  role,
  currentDepartment,
  counterpartyId,
  processId,
  taskId,
  onClose,
  onCreate
}: {
  data: AppData;
  role: RoleKey;
  currentDepartment: string;
  counterpartyId?: string;
  processId?: string;
  taskId?: string;
  onClose: () => void;
  onCreate: (payload: HandoffFormValues) => void;
}) {
  const process = getProcess(data, processId);
  const defaultCounterpartyId = counterpartyId ?? process?.counterpartyId ?? data.counterparties[0]?.id;
  const departmentOptions = Array.from(
    new Set([
      currentDepartment,
      'Операционный контроль',
      'Контактный центр',
      'Технологическая интеграция',
      'Юридическое сопровождение',
      'Партнерские программы',
      'Администрирование Целевой ИС',
      'Офис управления процессами',
      ...data.counterparties.flatMap((item) => item.departments)
    ])
  ).filter(Boolean).sort();
  const [form, setForm] = useState<HandoffFormValues>({
    title: process ? `Запросить результат по процессу ${process.id}` : 'Запросить результат у подразделения',
    sourceDepartment: role === 'department' ? currentDepartment : 'Операционный контроль',
    targetDepartment: process?.currentGroup && process.currentGroup !== currentDepartment ? process.currentGroup : 'Юридическое сопровождение',
    priority: process?.priority ?? 'Средний',
    dueDate: '2026-08-08',
    counterpartyId: defaultCounterpartyId,
    processId: processId ?? '',
    taskId: taskId ?? '',
    comment: 'Нужно подготовить результат и вернуть комментарий инициатору в CRM.',
    createTask: true
  });
  const updateForm = <K extends keyof HandoffFormValues>(key: K, value: HandoffFormValues[K]) => setForm((current) => ({ ...current, [key]: value }));
  const processOptions = ['', ...data.processes.filter((item) => !form.counterpartyId || item.counterpartyId === form.counterpartyId).map((item) => item.id)];
  const taskOptions = ['', ...data.tasks.filter((task) => !form.processId || task.processId === form.processId).map((task) => task.id)];

  return (
    <Modal title="Внутреннее поручение подразделению" onClose={onClose} width="large">
      <form
        className="modal-form handoff-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(form);
        }}
      >
        <Field label="Тема поручения" value={form.title} onChange={(value) => updateForm('title', value)} required className="full" />
        <SelectField label="От подразделения" value={form.sourceDepartment} options={departmentOptions} onChange={(value) => updateForm('sourceDepartment', value)} />
        <SelectField label="Кому" value={form.targetDepartment} options={departmentOptions} onChange={(value) => updateForm('targetDepartment', value)} />
        <SelectField label="Приоритет" value={form.priority} options={priorities} onChange={(value) => updateForm('priority', value)} />
        <Field label="Срок" value={form.dueDate} onChange={(value) => updateForm('dueDate', value)} type="date" />
        <label className="field full">
          <span>Контрагент</span>
          <select value={form.counterpartyId ?? ''} onChange={(event) => updateForm('counterpartyId', event.target.value)}>
            {data.counterparties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.shortName} · {item.id}
              </option>
            ))}
          </select>
        </label>
        <label className="field full">
          <span>Связанный процесс</span>
          <select value={form.processId ?? ''} onChange={(event) => updateForm('processId', event.target.value)}>
            {processOptions.map((id) => (
              <option key={id || 'none'} value={id}>
                {id ? `${id} · ${getProcess(data, id)?.title}` : 'Без процесса'}
              </option>
            ))}
          </select>
        </label>
        <label className="field full">
          <span>Связанная задача</span>
          <select value={form.taskId ?? ''} onChange={(event) => updateForm('taskId', event.target.value)}>
            {taskOptions.map((id) => (
              <option key={id || 'none'} value={id}>
                {id ? `${id} · ${getTask(data, id)?.title}` : 'Без задачи'}
              </option>
            ))}
          </select>
        </label>
        <label className="field full">
          <span>Что требуется от подразделения</span>
          <textarea value={form.comment} onChange={(event) => updateForm('comment', event.target.value)} />
        </label>
        <label className="check-row full">
          <input type="checkbox" checked={form.createTask} onChange={(event) => updateForm('createTask', event.target.checked)} />
          <span>Создать связанную задачу в очереди целевого подразделения</span>
        </label>
        <div className="process-preview full">
          <strong>{form.sourceDepartment} {'->'} {form.targetDepartment}</strong>
          <p>Поручение попадет в реестр взаимодействия, а связанная задача - в очередь подразделения. История будет доступна из процесса и задачи.</p>
        </div>
        <footer className="modal-actions full">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={Save} variant="primary" type="submit">
            Создать
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

function ContactDetailModal({
  counterparty,
  contactId,
  notify,
  onClose,
  openModal
}: {
  counterparty?: Counterparty;
  contactId: string;
  notify: (message: string, tone?: ToastTone) => void;
  onClose: () => void;
  openModal: (modal: ModalState) => void;
}) {
  const contact = counterparty?.contacts.find((item) => item.id === contactId);
  if (!counterparty || !contact) return null;
  const copyValue = (label: string, value: string) => {
    if (navigator.clipboard) void navigator.clipboard.writeText(value);
    notify(`${label} скопирован: ${value}`, 'success');
  };

  return (
    <Modal title="Карточка контакта" onClose={onClose}>
      <div className="modal-body contact-detail-modal">
        <div className="object-mini-header">
          <div>
            <h2>{contact.name}</h2>
            <p>{contact.position}</p>
            <div className="badge-row">
              {contact.primary ? <Badge tone="green">Основной контакт</Badge> : null}
              <Badge tone={isIndividualCounterparty(counterparty) ? 'violet' : 'cyan'}>{counterparty.shortName}</Badge>
            </div>
          </div>
        </div>
        <div className="profile-grid compact">
          <Info label="Контрагент" value={`${counterparty.name} / ${counterparty.id}`} />
          <Info label="Роль контакта" value={contact.position} />
          <Info label="Телефон" value={contact.phone} />
          <Info label="Email" value={contact.email} />
        </div>
        <div className="contact-action-grid">
          <Button icon={Phone} onClick={() => openModal({ type: 'communication', counterpartyId: counterparty.id })}>
            Запланировать звонок
          </Button>
          <Button icon={Mail} onClick={() => openModal({ type: 'communication', counterpartyId: counterparty.id })}>
            Зафиксировать письмо
          </Button>
          <Button icon={ClipboardCheck} onClick={() => copyValue('Телефон', contact.phone)}>
            Скопировать телефон
          </Button>
          <Button icon={Mail} onClick={() => copyValue('Email', contact.email)}>
            Скопировать email
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ControlDateModal({
  counterparty,
  onClose,
  onSave
}: {
  counterparty?: Counterparty;
  onClose: () => void;
  onSave: (payload: ControlDatePayload) => void;
}) {
  const [nextControlDate, setNextControlDate] = useState(counterparty?.nextControlDate ?? '2026-08-18');
  const [reason, setReason] = useState('Плановый перенос контрольной проверки');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!counterparty) return null;

  const delta = daysBetween(nextControlDate);
  const effect =
    delta <= 0
      ? 'После сохранения CRM создаст контрольную задачу и запишет событие в историю.'
      : `Контрольная задача будет создана при наступлении даты: ${formatDate(nextControlDate)}.`;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!nextControlDate) {
      setError('Выберите новую контрольную дату.');
      return;
    }
    onSave({ counterpartyId: counterparty.id, nextControlDate, reason, comment });
  };

  return (
    <Modal title="Изменение контрольной даты" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="profile-grid compact">
          <Info label="Контрагент" value={`${counterparty.shortName} · ${counterparty.id}`} />
          <Info label="Текущая дата" value={formatDate(counterparty.nextControlDate)} />
        </div>
        <div className="form-grid">
          <Field label="Новая контрольная дата" type="date" value={nextControlDate} onChange={setNextControlDate} required />
          <SelectField
            label="Причина"
            value={reason}
            options={['Плановый перенос контрольной проверки', 'Просрочка задачи или процесса', 'Сбой связанной операции', 'Завершение процесса', 'Ручное решение куратора']}
            onChange={setReason}
          />
          <label className="field full">
            <span>Комментарий</span>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Кратко укажите основание изменения срока" />
          </label>
        </div>
        <div className="process-preview">
          <strong>{delta < 0 ? `Дата уже просрочена на ${Math.abs(delta)} дн.` : delta === 0 ? 'Контрольная дата сегодня' : `До контроля ${delta} дн.`}</strong>
          <p>{effect}</p>
        </div>
        <footer className="modal-actions">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={Save} variant="primary" type="submit">
            Сохранить дату
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

function DocumentUploadModal({
  data,
  linkedObjectType,
  linkedObjectId,
  onClose,
  onUpload
}: {
  data: AppData;
  linkedObjectType: string;
  linkedObjectId: string;
  onClose: () => void;
  onUpload: (payload: DocumentUploadPayload) => void;
}) {
  const linkedProcess = linkedObjectType === 'Процесс' ? getProcess(data, linkedObjectId) : undefined;
  const counterparty =
    linkedObjectType === 'Контрагент'
      ? getCounterparty(data, linkedObjectId)
      : linkedProcess
        ? getCounterparty(data, linkedProcess.counterpartyId)
        : undefined;
  const serviceOptions = Array.from(
    new Set([
      ...(counterparty?.services.map((service) => service.service) ?? []),
      linkedProcess?.type,
      'Профиль клиента',
      'Договорный пакет',
      'Коммуникация'
    ].filter(Boolean) as string[])
  );
  const relationLabel = linkedProcess
    ? `${linkedProcess.id} · ${linkedProcess.title}`
    : counterparty
      ? `${counterparty.shortName} · ${counterparty.id}`
      : `${linkedObjectType}: ${linkedObjectId}`;
  const [file, setFile] = useState<File | null>(null);
  const [businessPurpose, setBusinessPurpose] = useState(
    linkedProcess ? `Материал по процессу: ${linkedProcess.title}` : `Материал по карточке ${counterparty?.shortName ?? linkedObjectId}`
  );
  const [service, setService] = useState(serviceOptions[0] ?? 'Профиль клиента');
  const [nextAction, setNextAction] = useState(linkedProcess ? 'Проверить материал на текущем этапе процесса' : 'Связать файл с процессом, задачей или коммуникацией');
  const [error, setError] = useState('');
  const maxFileSize = 2 * 1024 * 1024;

  const readFile = (selectedFile: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
      reader.readAsDataURL(selectedFile);
    });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Выберите файл для добавления.');
      return;
    }
    if (file.size > maxFileSize) {
      setError('Для локального рабочего хранилища выберите файл до 2 МБ.');
      return;
    }
    if (!businessPurpose.trim()) {
      setError('Укажите назначение файла.');
      return;
    }
    try {
      const contentDataUrl = await readFile(file);
      onUpload({
        linkedObjectType,
        linkedObjectId,
        file,
        contentDataUrl,
        businessPurpose: businessPurpose.trim(),
        service,
        nextAction: nextAction.trim() || 'Следующее действие не требуется'
      });
    } catch {
      setError('Не удалось прочитать файл. Выберите другой файл.');
    }
  };

  return (
    <Modal title="Добавление файла" onClose={onClose} width="large">
      <form className="modal-form document-upload-form" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="object-mini-header">
          <div>
            <h2>{relationLabel}</h2>
            <p>{linkedObjectType === 'Процесс' ? 'Файл будет связан с процессом и попадет в карточку контрагента.' : 'Файл будет связан с карточкой контрагента.'}</p>
          </div>
          <Badge tone="blue">{linkedObjectType}</Badge>
        </div>
        <label className={file ? 'file-picker selected' : 'file-picker'}>
          <Upload size={20} />
          <span>
            <strong>{file ? file.name : 'Выберите файл'}</strong>
            <small>{file ? `${getDocumentFormat(file.name)} · ${formatFileSize(file.size)}` : 'PDF, DOCX, XLSX, CSV, JPG, PNG, XML, ZIP, TXT до 2 МБ'}</small>
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png,.xml,.zip,.txt"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              setFile(selectedFile);
              if (selectedFile && !businessPurpose.trim()) setBusinessPurpose(selectedFile.name);
              setError('');
            }}
          />
        </label>
        <div className="form-grid">
          <Field className="full" label="Назначение файла" value={businessPurpose} onChange={setBusinessPurpose} required />
          <SelectField label="Сервис / контекст" value={service} options={serviceOptions.length ? serviceOptions : ['Профиль клиента']} onChange={setService} />
          <Field className="full" label="Следующее действие" value={nextAction} onChange={setNextAction} />
        </div>
        <footer className="modal-actions full">
          <Button onClick={onClose}>Отмена</Button>
          <Button icon={Upload} variant="primary" type="submit">
            Добавить файл
          </Button>
        </footer>
      </form>
    </Modal>
  );
}

type TaskWorkProfile = {
  source: string;
  objective: string;
  trigger: string;
  checks: string[];
  evidence: string[];
  expectedResult: string;
  completionEffect: string;
  resultPlaceholder: string;
};

function getTaskWorkProfile({
  task,
  counterparty,
  process,
  currentStage,
  nextStage,
  relatedDocuments,
  relatedIntegrations,
  recentCommunications
}: {
  task: Task;
  counterparty?: Counterparty;
  process?: ProcessInstance;
  currentStage?: { name: string; department: string; requiredAttributes: string[]; slaHours: number };
  nextStage?: { name: string; department: string };
  relatedDocuments: BusinessDocument[];
  relatedIntegrations: IntegrationExchange[];
  recentCommunications: Communication[];
}): TaskWorkProfile {
  const service = counterparty?.services.find((item) => task.title.includes(item.service) || process?.title.includes(item.service)) ?? counterparty?.services[0];
  const document = relatedDocuments[0];
  const integration = relatedIntegrations[0];
  const communication = recentCommunications[0];
  const nextEffect = nextStage
    ? `После закрытия обязательных результатов процесс перейдет на этап "${nextStage.name}", задача появится у группы "${nextStage.department}".`
    : process
      ? 'После закрытия обязательных результатов процесс будет готов к завершению или финальному контролю владельца.'
      : 'После сохранения результата обновятся статус задачи, комментарии и история объекта.';

  const base: TaskWorkProfile = {
    source: process ? `${process.id}: ${process.title}` : communication ? `${communication.id}: ${communication.subject}` : 'Ручная или регламентная задача CRM',
    objective: `Закрыть рабочий результат по задаче "${task.title}"`,
    trigger: process
      ? `Задача создана маршрутом процесса, текущий этап: ${currentStage?.name ?? process.currentGroup}.`
      : task.history[0]?.details ?? 'Задача создана пользователем или регламентным правилом.',
    checks: task.requiredFields.map((field) => `Проверить и подтвердить: ${field}`),
    evidence: [
      document ? `Документ: ${document.name}` : 'Зафиксировать рабочий комментарий в карточке задачи',
      integration ? `Результат обмена: ${integration.system} - ${integration.status}` : 'Проверить связанные объекты клиента/контрагента',
      counterparty ? `Профиль: ${counterparty.shortName}, риск ${counterparty.riskScore}` : 'Указать основание выполнения'
    ],
    expectedResult: task.requiredFields.join(', '),
    completionEffect: nextEffect,
    resultPlaceholder: 'Опишите проверку, принятое решение, основание и кому передан результат.'
  };

  switch (task.templateId) {
    case 'tt-control-date-review':
    case 'tt-manual-control':
      return {
        ...base,
        objective: `Провести контрольную проверку ${counterparty?.shortName ?? 'объекта CRM'}.`,
        trigger: process ? base.trigger : 'Задача создана вручную или по наступившей контрольной дате карточки.',
        checks: [
          'Проверить актуальность реквизитов, контактов и контрольной даты',
          'Просмотреть активные процессы, просроченные задачи и открытые обращения',
          'Определить, нужен ли новый процесс, коммуникация или поручение подразделению'
        ],
        evidence: [
          counterparty ? `Карточка: ${counterparty.name}` : 'Карточка контрагента должна быть выбрана',
          `Обязательные результаты: ${task.requiredFields.join(', ')}`,
          'Итог проверки фиксируется в истории задачи и карточки'
        ],
        expectedResult: 'Профиль и рабочие сигналы проверены, следующий шаг определен.',
        completionEffect: process ? nextEffect : 'После выполнения обновятся статус задачи, комментарии и журнал действий карточки.',
        resultPlaceholder: 'Например: профиль проверен, просрочек нет, следующий контроль 18.08, дополнительных задач не требуется.'
      };
    case 'tt-manual-data-request':
      return {
        ...base,
        objective: `Запросить недостающие данные по ${counterparty?.shortName ?? 'объекту CRM'}.`,
        trigger: process ? base.trigger : 'Задача создана вручную для получения данных, документов или подтверждений.',
        checks: [
          'Сформулировать, каких данных не хватает и кто должен ответить',
          'Указать канал, срок ответа и ответственного',
          'После получения данных обновить карточку, процесс или связанную задачу'
        ],
        evidence: [
          counterparty ? `Контрагент: ${counterparty.name}` : 'Связанный контрагент не выбран',
          communication ? `Последняя коммуникация: ${communication.subject}` : 'При необходимости создать коммуникацию',
          document ? `Связанный материал: ${document.name}` : 'Если пришел файл, добавить его на вкладку Документы'
        ],
        expectedResult: 'Запрос отправлен или данные получены, результат и следующий шаг зафиксированы.',
        completionEffect: process ? nextEffect : 'После выполнения задача останется в истории карточки; при необходимости создается follow-up или запускается процесс.',
        resultPlaceholder: 'Например: запрос направлен Виктору Ковалеву, срок ответа 07.08, ожидаем письмо с подтверждением стенда.'
      };
    case 'tt-manual-document':
      return {
        ...base,
        objective: `Проверить документ по ${counterparty?.shortName ?? 'объекту CRM'}.`,
        trigger: document ? `Основание: документ ${document.id} - ${document.name}.` : 'Задача создана вручную для проверки документа или рабочего материала.',
        checks: [
          'Проверить назначение документа и связанный сервис/процесс',
          'Сверить реквизиты, версию, срок действия и владельца',
          'Принять решение: валидировать, вернуть на доработку или запросить уточнение'
        ],
        evidence: [
          document ? `Документ: ${document.name}` : 'Документ должен быть загружен или выбран в карточке',
          process ? `Процесс: ${process.id} - ${process.title}` : 'Процесс может быть не выбран для универсальной проверки',
          'Решение попадет в комментарий и историю задачи'
        ],
        expectedResult: 'Документ проверен, решение и следующий шаг понятны инициатору.',
        completionEffect: process ? nextEffect : 'После выполнения статус задачи обновится, а документ останется связанным с карточкой.',
        resultPlaceholder: 'Например: файл относится к СБП, реквизиты совпадают, документ можно использовать на текущем этапе.'
      };
    case 'tt-manual-service-incident':
      return {
        ...base,
        objective: `Разобрать сервисный инцидент ${counterparty?.shortName ? `по ${counterparty.shortName}` : ''}.`,
        trigger: service ? `Основание: сервис ${service.service}, открытых инцидентов ${service.incidentCount}.` : 'Задача создана вручную по сигналу сервиса или обращению.',
        checks: [
          'Определить затронутый сервис, масштаб влияния и ответственного владельца',
          'Проверить связанные обращения, задачи и операции',
          'Зафиксировать причину, план восстановления и срок контрольного ответа'
        ],
        evidence: [
          service ? `Сервис: ${service.service}, подразделение ${service.ownerDepartment}` : 'Сервис нужно указать в результате задачи',
          integration ? `Связанная операция: ${integration.system} - ${integration.status}` : 'При необходимости проверить журнал связанной операции',
          'План восстановления должен быть понятен куратору и владельцу сервиса'
        ],
        expectedResult: 'Причина и влияние инцидента описаны, ответственный и следующий контроль назначены.',
        completionEffect: process ? nextEffect : 'После выполнения задача фиксирует решение по сервисному сигналу и остается в истории карточки.',
        resultPlaceholder: 'Например: инцидент СБП связан с ошибкой тестового endpoint, владелец Технологическая интеграция, обходной сценарий согласован.'
      };
    case 'tt-verify-profile':
      return {
        ...base,
        objective: `Проверить единый профиль ${counterparty?.shortName ?? 'контрагента'} перед следующим этапом маршрута.`,
        checks: [
          'Сверить реквизиты, основной контакт и подразделения-владельцы',
          'Проверить активные сервисы, документы и открытые запросы',
          'Зафиксировать замечания, которые блокируют передачу в следующее подразделение'
        ],
        evidence: [
          counterparty ? `Карточка: ${counterparty.name}` : 'Карточка контрагента должна быть выбрана',
          document ? `Связанный документ: ${document.name}` : 'Проверить вкладку Документы',
          `Открытые сервисы: ${service?.service ?? 'уточнить в карточке'}`
        ],
        expectedResult: 'Единый профиль подтвержден либо возвращен куратору на дозаполнение.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: реквизиты и основной контакт подтверждены, сервисы СБП/ПС МИР сверены, замечаний нет.'
      };
    case 'tt-launch-control':
      return {
        ...base,
        objective: `Проконтролировать промышленный запуск сервиса ${service?.service ?? ''} для ${counterparty?.shortName ?? 'контрагента'}.`,
        checks: [
          'Подтвердить дату запуска и ответственного на стороне контрагента',
          'Проверить метрики первого дня и отсутствие критичных инцидентов',
          'Зафиксировать решение: запуск принят, нужен повторный контроль или возврат на технологическую проверку'
        ],
        evidence: [
          service ? `Сервис: ${service.service}, этап "${service.stage}"` : 'Сервис должен быть указан в карточке',
          integration ? `Обмен: ${integration.system} - ${integration.status}` : 'Проверить результаты контрольного обмена',
          document ? `Материал запуска: ${document.name}` : 'При необходимости приложить отчет первого дня'
        ],
        expectedResult: 'Промышленный запуск принят под контроль, дальнейший статус сервиса понятен.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: запуск СБП подтвержден на 12.08, тестовые операции успешны, контроль первого дня без критичных инцидентов.'
      };
    case 'tt-marketing-budget':
      return {
        ...base,
        objective: `Согласовать параметры маркетинговой акции с ${counterparty?.shortName ?? 'партнером'}.`,
        checks: [
          'Проверить бюджет, период акции и механику начисления',
          'Сверить ограничения по сегменту клиентов и сервису',
          'Определить, готова ли акция к операционному запуску'
        ],
        evidence: [
          document ? `Материалы акции: ${document.name}` : 'Материалы акции должны быть связаны с процессом',
          counterparty ? `Партнер/контрагент: ${counterparty.name}` : 'Контрагент акции не выбран',
          'Решение передается в операционный контроль запуска акции'
        ],
        expectedResult: 'Бюджет, механика и период согласованы либо возвращены на уточнение.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: бюджет 1,2 млн руб. согласован, период 09-30.08, механика кешбэка подтверждена.'
      };
    case 'tt-marketing-launch-control':
      return {
        ...base,
        objective: `Проконтролировать операционный запуск маркетинговой акции ${counterparty?.shortName ?? ''}.`,
        checks: [
          'Проверить готовность каналов, витрины правил и контрольных метрик',
          'Сверить дату старта и ответственных со стороны партнера и внутренних подразделений',
          'Зафиксировать метрики первого дня или блокирующие замечания'
        ],
        evidence: [
          document ? `Пакет акции: ${document.name}` : 'Пакет акции должен быть приложен к процессу',
          integration ? `Передача параметров: ${integration.system} - ${integration.status}` : 'Проверить передачу параметров в BI/DWH',
          communication ? `Коммуникация: ${communication.subject}` : 'При необходимости запланировать контакт с партнером'
        ],
        expectedResult: 'Акция запущена под контроль или возвращена владельцу с конкретным списком замечаний.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: акция стартовала 10.08, каналы готовы, первые начисления проверены, контрольная выгрузка в BI успешна.'
      };
    case 'tt-legal-notice':
      return {
        ...base,
        objective: `Подготовить основание уведомления или штрафного события по ${counterparty?.shortName ?? 'контрагенту'}.`,
        checks: [
          'Проверить основание нарушения, расчет SLA и повторность',
          'Сверить получателя, реквизиты и связанный инцидент/предписание',
          'Зафиксировать решение для контроля реакции контрагента'
        ],
        evidence: [
          document ? `Основание: ${document.name}` : 'Основание должно быть связано с процессом',
          integration ? `Регистрация события: ${integration.system} - ${integration.status}` : 'Проверить статус регистрации исходящего события',
          counterparty ? `Предписания/штрафы в карточке: ${counterparty.penalties}` : 'Контрагент не выбран'
        ],
        expectedResult: 'Основание готово, расчет понятен, следующая задача контролирует реакцию контрагента.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: превышение SLA подтверждено по 4 инцидентам, сумма пересчитана с коэффициентом повторности, получатель сверен.'
      };
    case 'tt-penalty-response-control':
      return {
        ...base,
        objective: `Проконтролировать ответ ${counterparty?.shortName ?? 'контрагента'} на уведомление или штрафное событие.`,
        checks: [
          'Проверить наличие ответа и плана корректирующих действий',
          'Оценить, закрывает ли план причину нарушения SLA',
          'Принять решение: закрыть контроль, запросить уточнение или эскалировать'
        ],
        evidence: [
          communication ? `Последний контакт: ${communication.subject}` : 'При отсутствии ответа создать коммуникацию/follow-up',
          document ? `Ответ или основание: ${document.name}` : 'Ответ контрагента можно загрузить во вкладку Документы',
          'Решение фиксируется в истории процесса и карточки контрагента'
        ],
        expectedResult: 'Реакция контрагента оценена, дальнейшее действие по штрафу и SLA определено.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: план корректирующих действий получен, срок восстановления 09.08, штраф оставлен на контроле до подтверждения метрик.'
      };
    case 'tt-legal-profile-check':
      return {
        ...base,
        objective: `Проверить реквизиты и контактных лиц ${counterparty?.shortName ?? 'ЮЛ'}.`,
        checks: [
          'Сверить ИНН, КПП, ОГРН, адрес и сегмент контрагента',
          'Проверить основного контактного лица и ответственные подразделения',
          'Определить, какие сведения нужно подтвердить у контрагента'
        ],
        evidence: [
          counterparty ? `Карточка ЮЛ: ${counterparty.name}` : 'Карточка ЮЛ должна быть выбрана',
          document ? `Связанный файл: ${document.name}` : 'При необходимости загрузить подтверждающий файл',
          'Результат передается в задачу запроса подтверждения реквизитов'
        ],
        expectedResult: 'Реквизиты и контакты проверены, список уточнений сформирован.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: ИНН/КПП/ОГРН сверены, основной контакт подтвержден, нужно запросить актуальный адрес для СБП.'
      };
    case 'tt-legal-profile-request':
      return {
        ...base,
        objective: `Получить подтверждение реквизитов и контактных лиц от ${counterparty?.shortName ?? 'ЮЛ'}.`,
        checks: [
          'Указать адресата запроса и канал коммуникации',
          'Зафиксировать подтвержденные реквизиты и срок ответа',
          'При отсутствии ответа создать follow-up или поручение куратору'
        ],
        evidence: [
          communication ? `Коммуникация: ${communication.subject}` : 'Можно запланировать звонок или письмо из карточки',
          document ? `Подтверждающий документ: ${document.name}` : 'Полученный файл прикрепляется к карточке',
          'После подтверждения изменения публикуются в целевые системы'
        ],
        expectedResult: 'Подтвержденные реквизиты получены или создан контролируемый follow-up.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: запрос направлен основному контакту, подтверждены КПП и адрес, срок ответа по контактам 08.08.'
      };
    case 'tt-profile-actualization':
      return {
        ...base,
        objective: `Проверить состав профиля и согласий клиента ${counterparty?.shortName ?? 'ФЛ'}.`,
        checks: [
          'Проверить документ, канал связи и согласие на обработку ПДн',
          'Сверить карту/идентификатор клиента и категорию обращения',
          'Определить, какие данные нужно подтвердить у клиента'
        ],
        evidence: [
          counterparty?.consentStatus ? `Согласие ПДн: ${counterparty.consentStatus}` : 'Согласие ПДн должно быть заполнено',
          document ? `Материал профиля: ${document.name}` : 'При необходимости приложить подтверждающий материал',
          'Проверка ведет к запросу подтверждения данных'
        ],
        expectedResult: 'Профиль ФЛ проверен, недостающие подтверждения определены.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: канал чат подтвержден, согласие ПДн истекает 12.08, нужен запрос подтверждения email.'
      };
    case 'tt-consent-refresh':
      return {
        ...base,
        objective: `Запросить подтверждение данных и согласий у клиента ${counterparty?.shortName ?? 'ФЛ'}.`,
        checks: [
          'Выбрать канал запроса с учетом предпочтения клиента',
          'Зафиксировать подтверждение клиента и новый срок действия согласия',
          'Передать результат на публикацию изменений и журналирование'
        ],
        evidence: [
          counterparty?.preferredChannel ? `Предпочтительный канал: ${counterparty.preferredChannel}` : 'Канал нужно указать в результате',
          communication ? `Последняя коммуникация: ${communication.subject}` : 'Запрос может быть оформлен как коммуникация',
          'Результат должен быть понятен администратору публикации'
        ],
        expectedResult: 'Данные и согласия подтверждены либо создан повторный контролируемый запрос.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: клиент подтвердил данные через чат, согласие продлено до 06.08.2027, публикация разрешена.'
      };
    case 'tt-profile-publish':
      return {
        ...base,
        objective: `Опубликовать изменения профиля ${counterparty?.shortName ?? 'контрагента'} в целевые системы.`,
        checks: [
          'Проверить отсутствие дублей и результат контрольной валидации',
          'Передать изменения в DWH/целевые справочники',
          'Зафиксировать журналирование и результат публикации'
        ],
        evidence: [
          integration ? `Публикация: ${integration.system} - ${integration.status}` : 'Результат публикации появится после обмена',
          document ? `Основание изменения: ${document.name}` : 'Основание изменения должно быть привязано к карточке',
          'При ошибке создается инцидент администратору BPM'
        ],
        expectedResult: 'Профиль опубликован, изменения попали в журнал, процесс может быть завершен.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: дублей нет, DWH принял запись, изменение профиля зафиксировано в журнале.'
      };
    case 'tt-api-passport':
      return {
        ...base,
        objective: `Подтвердить технологическую готовность ${counterparty?.shortName ?? 'контрагента'} к подключению ${service?.service ?? 'сервиса'}.`,
        trigger: process ? `Предыдущий этап процесса ${process.id} закрыт, задача автоматически передана в технологическую интеграцию.` : base.trigger,
        checks: [
          'Сверить версию API-паспорта, endpoint, сертификаты и тестовые реквизиты',
          'Проверить наличие тестового стенда и согласованное окно прогона',
          'Зафиксировать контакт ИТ и канал эскалации на стороне контрагента'
        ],
        evidence: [
          document ? `API-паспорт: ${document.name}` : 'API-паспорт должен быть приложен к процессу',
          integration ? `Тестовый обмен: ${integration.system}, статус ${integration.status}` : 'Результат тестового обмена будет доступен после синхронизации',
          service ? `Сервис в карточке: ${service.service}, статус "${service.status}"` : 'Сервис должен быть указан в карточке контрагента'
        ],
        expectedResult: 'API-паспорт и тестовый стенд подтверждены, замечания либо закрыты, либо возвращены инициатору.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: API-паспорт v1 проверен, endpoint корректен, контакт ИТ подтвержден, повторный C2B-тест назначен на 07.08.'
      };
    case 'tt-appeal-resolution':
      return {
        ...base,
        objective: `Разобрать обращение клиента ${counterparty?.shortName ?? ''} и подготовить решение в пределах SLA.`,
        trigger: communication ? `Основание: ${communication.type.toLowerCase()} ${communication.id} - ${communication.subject}.` : base.trigger,
        checks: [
          'Сверить сумму, канал и идентификатор клиентской операции',
          'Проверить правило начисления, ответ партнера или банка-участника',
          'Сформулировать причину, решение и срок ответа клиенту'
        ],
        evidence: [
          document ? `Материалы обращения: ${document.name}` : 'Материалы обращения должны быть приложены к процессу',
          integration ? `Обмен по операции: ${integration.system}, статус ${integration.status}` : 'Проверить ответ целевой системы по операции',
          counterparty?.preferredChannel ? `Канал ответа клиенту: ${counterparty.preferredChannel}` : 'Канал ответа задается в карточке клиента'
        ],
        expectedResult: 'Причина обращения и решение заполнены, контактный центр получает основание для ответа клиенту.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: задержка начисления подтверждена, сумма кешбэка 145,50 руб., ответ клиенту подготовить до 06.08 через чат.'
      };
    case 'tt-contract-package':
      return {
        ...base,
        objective: `Проверить договорной пакет ${counterparty?.shortName ?? 'контрагента'} перед передачей юристам.`,
        checks: [
          'Сверить реквизиты контрагента с единым профилем',
          'Проверить перечень подключаемых сервисов и тарифный пакет',
          'Подтвердить подписанта и контакт для договорных вопросов'
        ],
        evidence: [
          document ? `Договорной пакет: ${document.name}` : 'Договорной пакет должен быть создан или приложен',
          service ? `Сервис: ${service.service}, текущий статус "${service.status}"` : 'Перечень сервисов берется из карточки контрагента',
          'Результат проверки фиксируется в истории процесса'
        ],
        expectedResult: 'Пакет готов для юридического согласования без переноса текста договора в CRM.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: реквизиты совпадают, сервисы СБП и лояльность подтверждены, подписант Виктория Румянцева.'
      };
    case 'tt-contract-terms':
      return {
        ...base,
        objective: `Согласовать условия обслуживания ${counterparty?.shortName ?? 'контрагента'} и статус карточки СЭД.`,
        checks: [
          'Проверить тарифный пакет и исключения по условиям обслуживания',
          'Сверить SLA, контрольные даты и ограничения промышленного запуска',
          'Получить или повторить статус карточки договора из СЭД'
        ],
        evidence: [
          document ? `Договорная карточка: ${document.name}` : 'Договорная карточка должна быть связана с процессом',
          integration ? `СЭД: ${integration.status}, обновление ${formatDateTime(integration.lastSync)}` : 'Статус СЭД ожидает обмена',
          'Позиция юристов фиксируется как результат задачи и поручения'
        ],
        expectedResult: 'Юридическая позиция зафиксирована, условия готовы к контролю подписания или возврату на доработку.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: тарифный пакет согласован, SLA 16 часов подтвержден, особые условия возвращены в СЭД без замечаний.'
      };
    case 'tt-manual-followup':
    case 'tt-communication-followup':
      return {
        ...base,
        objective: `Закрыть договоренность по коммуникации с ${counterparty?.shortName ?? 'контрагентом'}.`,
        trigger: communication ? `Follow-up создан из ${communication.type.toLowerCase()} ${communication.id}: ${communication.subject}.` : base.trigger,
        checks: [
          'Подтвердить, какая договоренность возникла по итогам контакта',
          'Назначить ответственного и контрольный срок следующего действия',
          'Связать результат с процессом или карточкой контрагента'
        ],
        evidence: [
          communication ? `Коммуникация: ${communication.summary}` : 'Нужна ссылка на звонок, встречу или письмо',
          process ? `Процесс: ${process.title}` : 'При необходимости выбрать связанный процесс',
          'Комментарий исполнителя будет сохранен в истории задачи'
        ],
        expectedResult: 'Договоренность закрыта или передана следующему исполнителю с понятным сроком.',
        completionEffect: nextEffect,
        resultPlaceholder: 'Например: окно тестирования подтверждено на 07.08, ответственный ИТ Артем Сафронов, результат передан технологической группе.'
      };
    case 'tt-manual-free':
      return {
        ...base,
        objective: `Выполнить универсальную рабочую задачу по ${counterparty?.shortName ?? 'объекту CRM'}.`,
        trigger: process ? base.trigger : 'Свободная задача создана вручную без обязательной привязки к процессу.',
        checks: [
          'Понять основание задачи и ожидаемый результат',
          'Проверить связанного контрагента, документы, коммуникации и активные задачи',
          'Зафиксировать результат, основание и следующий шаг'
        ],
        evidence: [
          counterparty ? `Контрагент: ${counterparty.name}` : 'Связанный контрагент не выбран',
          document ? `Материал: ${document.name}` : 'Материал можно добавить на вкладке Документы',
          'Комментарий исполнителя является главным результатом универсальной задачи'
        ],
        expectedResult: 'Рабочий результат зафиксирован, инициатор понимает, что изменилось и что делать дальше.',
        completionEffect: process ? nextEffect : 'После выполнения обновятся статус, комментарии и история задачи; процесс не будет продвигаться, если он не выбран.',
        resultPlaceholder: 'Например: проверка выполнена, рисков не выявлено, следующий шаг - запланировать звонок с ответственным контактом.'
      };
    case 'tt-internal-handoff':
      return {
        ...base,
        objective: `Отработать поручение подразделению по ${counterparty?.shortName ?? 'связанному объекту'}.`,
        checks: [
          'Понять запрос инициатора и связанный процесс',
          'Подготовить результат подразделения с рабочим комментарием',
          'Вернуть результат инициатору или отправить на проверку'
        ],
        evidence: [
          process ? `Процесс: ${process.id} - ${process.title}` : 'Поручение должно быть связано с объектом CRM',
          document ? `Материал: ${document.name}` : 'При необходимости приложить рабочий материал',
          'Статус поручения синхронизируется со связанной задачей'
        ],
        expectedResult: 'Инициатор видит результат подразделения, статус поручения и связанную историю.',
        completionEffect: 'После выполнения обновится поручение, связанная задача и история процесса.',
        resultPlaceholder: 'Например: особые условия проверены, рисков по SLA нет, карточка СЭД ожидает статус подписания.'
      };
    default:
      return base;
  }
}

function TaskDetailModal({
  data,
  role,
  taskId,
  onClose,
  updateTaskStatus,
  executeTask,
  advanceProcess,
  delegateTask,
  undoTask,
  navigate,
  openModal
}: {
  data: AppData;
  role: RoleKey;
  taskId: string;
  onClose: () => void;
  updateTaskStatus: (id: string, status?: TaskStatus) => void;
  executeTask: (id: string, completedFields: string[], result: string, spentHours: number, complete: boolean) => void;
  advanceProcess: (id: string, allowAutoComplete?: boolean) => void;
  delegateTask: (id: string) => void;
  undoTask: (id: string) => void;
  navigate: (route: RouteState) => void;
  openModal: (modal: ModalState) => void;
}) {
  const task = getTask(data, taskId);
  const completedKey = task?.completedFields.join('|') ?? '';
  const historyKey = task?.history.map((entry) => `${entry.at}:${entry.status ?? ''}:${entry.action}`).join('|') ?? '';
  const autoSpentHours = task ? calculateTaskFactHours(task) : 0;
  const [selectedFields, setSelectedFields] = useState<string[]>(task?.completedFields ?? []);
  const [result, setResult] = useState('');
  const [spentHours, setSpentHours] = useState(formatHoursInput(autoSpentHours));
  const [decision, setDecision] = useState<'Подтвердить' | 'Запросить данные' | 'Вернуть на доработку' | 'Эскалировать'>('Подтвердить');

  useEffect(() => {
    setSelectedFields(task?.completedFields ?? []);
    setResult('');
    setSpentHours(formatHoursInput(task ? calculateTaskFactHours(task) : 0));
    setDecision('Подтвердить');
  }, [task, completedKey, historyKey]);

  if (!task) return null;
  const counterparty = task.counterpartyId ? getCounterparty(data, task.counterpartyId) : undefined;
  const process = task.processId ? getProcess(data, task.processId) : undefined;
  const template = process ? data.processTemplates.find((item) => item.id === process.templateId) : undefined;
  const taskTemplate = data.taskTemplates.find((item) => item.id === task.templateId);
  const currentStage = process && template ? template.stages[process.stageIndex] : undefined;
  const nextStage = process && template ? template.stages[process.stageIndex + 1] : undefined;
  const relatedDocuments = data.documents.filter(
    (document) =>
      task.links.includes(document.id) ||
      document.linkedObjectId === task.id ||
      document.linkedObjectId === task.processId ||
      document.linkedObjectId === task.counterpartyId ||
      Boolean(process?.documentIds.includes(document.id))
  );
  const relatedIntegrations = data.integrations.filter(
    (integration) =>
      task.links.includes(integration.id) ||
      integration.objectId === task.id ||
      integration.objectId === task.processId ||
      integration.objectId === task.counterpartyId ||
      Boolean(process?.integrationIds.includes(integration.id))
  );
  const recentCommunications = data.communications
    .filter((communication) => communication.counterpartyId === task.counterpartyId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 3);
  const counterpartyRisk = counterparty ? calculateOperationalRisk(counterparty, data) : 0;
  const missingFields = task.requiredFields.filter((field) => !selectedFields.includes(field));
  const daysLeft = daysBetween(task.dueDate);
  const creationEvent =
    task.history.find((entry) => normalize(`${entry.action} ${entry.details}`).includes('создан')) ??
    task.history.find((entry) => normalize(`${entry.action} ${entry.details}`).includes('запуск')) ??
    task.history[0];
  const latestEvent = task.history.length
    ? task.history.reduce((latest, entry) => (new Date(entry.at).getTime() > new Date(latest.at).getTime() ? entry : latest), task.history[0])
    : undefined;
  const serviceSummary = counterparty?.services.map((service) => `${service.service}: ${service.status}`).join('; ') || 'нет активных сервисов';
  const warningSignals = [
    daysLeft < 0 ? `SLA просрочен на ${Math.abs(daysLeft)} дн.` : daysLeft <= 1 ? 'SLA истекает в ближайшие сутки' : '',
    counterparty && counterpartyRisk >= 60 ? `Контрагент требует контроля: ${counterpartyStatusLabels[counterparty.status]}` : '',
    counterparty?.consentStatus && counterparty.consentStatus !== 'Получено' ? `Согласие ПДн: ${counterparty.consentStatus}` : '',
    relatedIntegrations.some((integration) => integration.status === 'Ошибка') ? 'Есть ошибка интеграционного обмена' : '',
    missingFields.length ? `Не закрыто полей: ${missingFields.length}` : ''
  ].filter(Boolean);
  const workProfile = getTaskWorkProfile({ task, counterparty, process, currentStage, nextStage, relatedDocuments, relatedIntegrations, recentCommunications });
  const isClosedTask = ['Выполнена', 'Отменена'].includes(task.status);
  const isCurrentStageTask = Boolean(process && currentStage && task.templateId === currentStage.autoTaskTemplateId && !isClosedTask);
  const allRequiredSelected = task.requiredFields.every((field) => selectedFields.includes(field));
  const parsedHours = Number(spentHours.replace(',', '.'));
  const normalizedHours = Number.isFinite(parsedHours) && parsedHours >= 0 ? parsedHours : autoSpentHours;
  const hoursHint = task.timeSpentHours > 0 ? 'сохранено ранее' : autoSpentHours > 0 ? 'расчет по истории' : 'после принятия в работу';
  const visibleChecks = workProfile.checks.slice(0, 3);
  const visibleEvidence = workProfile.evidence.slice(0, 2);
  const systemResult = isCurrentStageTask
    ? nextStage
      ? `создать задачу группе "${nextStage.department}"`
      : 'подготовить процесс к закрытию'
    : process
      ? 'обновить задачу и историю процесса'
      : 'обновить задачу и историю карточки';
  const toggleField = (field: string) => {
    setSelectedFields((current) => (current.includes(field) ? current.filter((item) => item !== field) : [...current, field]));
  };
  const decisionResult = (fallback: string) => `${decision}: ${result || fallback}`;
  const completeTask = () => executeTask(task.id, task.requiredFields, decisionResult('Все обязательные результаты этапа подтверждены.'), normalizedHours, true);
  const passStage = () => {
    completeTask();
    if (task.processId) advanceProcess(task.processId, true);
  };
  const acceptInWork = () => updateTaskStatus(task.id, 'В работе');
  const canAcceptInWork = !isClosedTask && !['В работе', 'На проверке', 'Ожидание', 'Просрочена'].includes(task.status);
  const canWorkWithResult = !isClosedTask && !canAcceptInWork;
  const canReturnPreviousStatus = (role === 'owner' || role === 'admin') && task.history.some((entry) => entry.status && entry.status !== task.status);
  const saveDecision = () => {
    const fallbackByDecision: Record<typeof decision, string> = {
      Подтвердить: 'Рабочий результат сохранен.',
      'Запросить данные': `Запрошены недостающие данные: ${missingFields.join(', ') || task.requiredFields.join(', ')}. Контрольный срок ответа: ${formatDate(task.dueDate)}.`,
      'Вернуть на доработку': `Возврат на доработку: ${missingFields.join(', ') || 'требуется уточнить результат проверки'}.`,
      Эскалировать: `Эскалация: риск нарушения SLA по задаче ${task.id}. Требуется решение ответственной группы ${task.assigneeGroup ?? getUserName(data, task.assigneeId)}.`
    };
    executeTask(task.id, selectedFields, decisionResult(fallbackByDecision[decision]), normalizedHours, false);
    if (decision === 'Запросить данные') {
      updateTaskStatus(task.id, 'Ожидание');
    } else if (decision === 'Вернуть на доработку') {
      updateTaskStatus(task.id, 'В работе');
    } else if (decision === 'Эскалировать') {
      updateTaskStatus(task.id, daysLeft < 0 ? 'Просрочена' : 'В работе');
    }
  };

  return (
    <Modal title={`Задача ${task.id}`} onClose={onClose} width="large">
      <div className="modal-body">
        <div className="object-mini-header">
          <div>
            <h2>{task.title}</h2>
            <div className="badge-row">
              <Badge tone={statusTone(task.status)}>{task.status}</Badge>
              <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
              <Badge tone="cyan">{task.assigneeGroup ?? getUserName(data, task.assigneeId)}</Badge>
            </div>
          </div>
          <div className="actions">
            <Button icon={UsersRound} onClick={() => delegateTask(task.id)} disabled={isClosedTask}>
              Делегировать
            </Button>
            <Button icon={Network} onClick={() => openModal({ type: 'internalHandoff', counterpartyId: task.counterpartyId, processId: task.processId, taskId: task.id })} disabled={isClosedTask}>
              Поручение
            </Button>
            {canReturnPreviousStatus ? (
              <Button icon={RotateCcw} onClick={() => undoTask(task.id)}>
                Вернуть предыдущий статус
              </Button>
            ) : null}
          </div>
        </div>
        <div className="content-layout two-columns">
          <section>
            <div className="task-workbench-strip">
              <article>
                <span>Клиент</span>
                {counterparty && task.counterpartyId ? (
                  <button
                    className="task-client-link"
                    onClick={() => {
                      onClose();
                      navigate({ page: 'counterparty', id: task.counterpartyId!, tab: 'profile' });
                    }}
                  >
                    {counterparty.shortName}
                  </button>
                ) : (
                  <strong>нет связи</strong>
                )}
                <small>{counterparty ? `${isIndividualCounterparty(counterparty) ? 'ФЛ' : 'ЮЛ'} · ${counterpartyStatusLabels[counterparty.status]}` : 'ручная задача без клиента'}</small>
              </article>
              <article>
                <span>SLA</span>
                <strong className={daysLeft < 0 ? 'danger-text' : ''}>{daysLeft < 0 ? `-${Math.abs(daysLeft)} дн.` : `${daysLeft} дн.`}</strong>
                <small>{taskTemplate?.slaHours ?? currentStage?.slaHours ?? '-'} ч · срок {formatDate(task.dueDate)}</small>
              </article>
              <article>
                <span>Источник</span>
                <strong>{taskTemplate?.entityType ?? process?.type ?? 'Ручная задача'}</strong>
                <small>{creationEvent?.action ?? 'Создание в CRM'}</small>
              </article>
              <article>
                <span>Готовность</span>
                <strong>{selectedFields.length}/{task.requiredFields.length}</strong>
                <small>{latestEvent ? `${latestEvent.action} · ${formatDateTime(latestEvent.at)}` : 'обязательных результатов'}</small>
              </article>
            </div>

            <div className="task-briefing-card compact">
              <div className="task-briefing-head">
                <span>{taskTemplate?.entityType ?? process?.type ?? 'Задача'}</span>
                <h3>{workProfile.objective}</h3>
              </div>
              {warningSignals.length ? (
                <div className="signal-list">
                  {warningSignals.map((signal) => (
                    <Badge key={signal} tone={signal.includes('ошибка') || signal.includes('просроч') || signal.includes('Высокий') ? 'red' : 'amber'}>{signal}</Badge>
                  ))}
                </div>
              ) : null}
              <div className="task-guidance-grid compact">
                <article>
                  <h4>Проверить</h4>
                  {visibleChecks.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </article>
                <article>
                  <h4>Основания</h4>
                  {visibleEvidence.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </article>
              </div>
              <details className="task-context-details">
                <summary>Маршрут и основание</summary>
                <div className="task-context-grid">
                  <Info label="Источник" value={workProfile.source} />
                  <Info label="Основание" value={workProfile.trigger} />
                  <Info label="Контекст" value={counterparty ? `${counterparty.name}. ${counterparty.region}. ${serviceSummary}` : 'Задача без привязки к клиенту'} />
                  <Info label="Текущий этап" value={currentStage?.name ?? 'нет процесса'} />
                  <Info label="Следующий этап" value={nextStage?.name ?? (process ? 'Завершение процесса' : 'не применяется')} />
                  <Info label="Статус процесса" value={process?.status ?? 'без процесса'} />
                </div>
              </details>
            </div>

            <div className="task-execution-card">
              <div className="panel-subheader">
                <h3>Выполнение задачи</h3>
              </div>
              <div className="execution-checklist">
                {task.requiredFields.map((field) => (
                  <label key={field} className={selectedFields.includes(field) ? 'done' : ''}>
                    <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => toggleField(field)} disabled={isClosedTask} />
                    <span>{field}</span>
                  </label>
                ))}
              </div>
              <label className="field full">
                <span>Комментарий для истории и инициатора</span>
                <textarea
                  value={result}
                  onChange={(event) => setResult(event.target.value)}
                  placeholder={workProfile.resultPlaceholder}
                  disabled={isClosedTask}
                />
              </label>
              <div className="task-decision-row">
                <SelectField label="Итоговое решение" value={decision} options={['Подтвердить', 'Запросить данные', 'Вернуть на доработку', 'Эскалировать']} onChange={setDecision} />
                <label className="field task-hours-field">
                  <span>Факт, часов</span>
                  <input value={spentHours} onChange={(event) => setSpentHours(event.target.value)} disabled={isClosedTask} inputMode="decimal" />
                  <small>{hoursHint}</small>
                </label>
              </div>
              <div className="task-system-result">
                <span>После выполнения</span>
                <strong>{systemResult}</strong>
              </div>
              <div className="execution-actions">
                {canAcceptInWork ? (
                  <Button icon={PlayCircle} variant="primary" onClick={acceptInWork}>
                    Принять в работу
                  </Button>
                ) : null}
                <Button icon={Save} onClick={saveDecision} disabled={!canWorkWithResult}>
                  Сохранить решение
                </Button>
                {isCurrentStageTask ? (
                  <Button icon={Workflow} variant="primary" onClick={passStage} disabled={!canWorkWithResult || !allRequiredSelected}>
                    Выполнить этап и передать дальше
                  </Button>
                ) : (
                  <Button icon={CheckCircle2} variant="primary" onClick={completeTask} disabled={!canWorkWithResult || !allRequiredSelected}>
                    Выполнить задачу
                  </Button>
                )}
              </div>
            </div>

            <div className="actions">
              {task.processId ? (
                <Button
                  icon={Workflow}
                  onClick={() => {
                    onClose();
                    navigate({ page: 'process', id: task.processId, tab: 'route' });
                  }}
                >
                  Процесс
                </Button>
              ) : null}
            </div>
          </section>
          <section>
            <div className="panel-subheader">
              <h3>Связанные материалы</h3>
            </div>
            <div className="task-related-list">
              {relatedDocuments.slice(0, 4).map((document) => {
                const documentContext = getDocumentBusinessContext(data, document);
                return (
                  <button
                    key={document.id}
                    onClick={() => {
                      onClose();
                      navigate(task.processId ? { page: 'process', id: task.processId, tab: 'documents' } : { page: 'counterparty', id: task.counterpartyId, tab: 'documents' });
                    }}
                  >
                    <FileClock size={16} />
                    <span>
                      <strong>{document.name}</strong>
                      <small>{document.businessPurpose ?? `${document.status} · ${document.format}`}</small>
                      <small>{documentContext.service ? `${documentContext.service} · ${document.status}` : `${document.status} · ${document.format}`}</small>
                    </span>
                  </button>
                );
              })}
              {relatedIntegrations.slice(0, 3).map((integration) => (
                <button key={integration.id} onClick={() => openModal({ type: 'integrationLog', id: integration.id })}>
                  <Network size={16} />
                  <span>
                    <strong>{integration.system}</strong>
                    <small>{integration.operation}</small>
                  </span>
                  <Badge tone={statusTone(integration.status)}>{integration.status}</Badge>
                </button>
              ))}
              {!relatedDocuments.length && !relatedIntegrations.length ? <p className="muted-text">Материалы и обмены не привязаны к задаче.</p> : null}
            </div>

            {recentCommunications.length ? (
              <>
                <div className="panel-subheader">
                  <h3>Последние коммуникации</h3>
                </div>
                <div className="task-related-list">
                  {recentCommunications.map((communication) => (
                    <button
                      key={communication.id}
                      onClick={() => {
                        onClose();
                        navigate({ page: 'counterparty', id: communication.counterpartyId, tab: 'communications' });
                      }}
                    >
                      <Phone size={16} />
                      <span>
                        <strong>{communication.type}: {communication.subject}</strong>
                        <small>{communication.summary}</small>
                        <small>Следующий шаг: {communication.nextAction}</small>
                      </span>
                      <Badge tone={statusTone(communication.status ?? 'Проведена')}>{communication.status ?? 'Проведена'}</Badge>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {task.comments.length ? (
              <>
                <div className="panel-subheader">
                  <h3>Результаты и комментарии</h3>
                </div>
                <div className="comment-list">
                  {task.comments.slice(0, 4).map((comment, index) => (
                    <p key={index}>{comment}</p>
                  ))}
                </div>
              </>
            ) : null}
            <div className="panel-subheader">
              <h3>История изменений</h3>
            </div>
            <div className="timeline dense">
              {task.history.map((entry, index) => (
                <article key={index}>
                  <h3>{entry.action}</h3>
                  <p>{entry.details}</p>
                  <small>{formatDateTime(entry.at)} · {getUserName(data, entry.actorId)}</small>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}

function IntegrationLogModal({
  item,
  onClose,
  retryIntegration
}: {
  item?: IntegrationExchange;
  onClose: () => void;
  retryIntegration: (id: string) => void;
}) {
  if (!item) return null;
  return (
    <Modal title={`Лог обмена ${item.id}`} onClose={onClose}>
      <div className="modal-body">
        <div className="object-mini-header">
          <div>
            <h2>{item.system}</h2>
            <p>{item.operation}</p>
          </div>
          <Badge tone={statusTone(item.status)}>{item.status}</Badge>
        </div>
        <div className="timeline dense">
          {item.log.map((entry, index) => (
            <article key={index} className={entry.level === 'ERROR' ? 'error-event' : ''}>
              <h3>{entry.level}</h3>
              <p>{entry.message}</p>
              <small>{formatDateTime(entry.at)}</small>
            </article>
          ))}
        </div>
        <footer className="modal-actions">
          <Button onClick={onClose}>Закрыть</Button>
          <Button icon={RefreshCw} variant="primary" onClick={() => retryIntegration(item.id)}>
            Повторить обмен
          </Button>
        </footer>
      </div>
    </Modal>
  );
}

function WidgetSettingsModal({
  hiddenWidgets,
  setHiddenWidgets,
  role,
  onClose
}: {
  hiddenWidgets: string[];
  setHiddenWidgets: (widgets: string[]) => void;
  role: RoleKey;
  onClose: () => void;
}) {
  const widgets = [
    ['processRoute', 'Процессы на контроле'],
    ['risk', 'Риски контрагентов'],
    ['notifications', 'Нотификации'],
    ...(role === 'admin' ? [['integrations', 'Технические обмены']] : [])
  ];
  const toggle = (id: string) => {
    setHiddenWidgets(hiddenWidgets.includes(id) ? hiddenWidgets.filter((item) => item !== id) : [...hiddenWidgets, id]);
  };
  return (
    <Modal title="Настройка панели функциональных блоков" onClose={onClose}>
      <div className="settings-list">
        {widgets.map(([id, label]) => (
          <button key={id} className="setting-row" onClick={() => toggle(id)}>
            <span>{label}</span>
            <Badge tone={hiddenWidgets.includes(id) ? 'neutral' : 'green'}>{hiddenWidgets.includes(id) ? 'скрыт' : 'показан'}</Badge>
          </button>
        ))}
      </div>
      <footer className="modal-actions">
        <Button icon={Save} variant="primary" onClick={onClose}>
          Готово
        </Button>
      </footer>
    </Modal>
  );
}

function ImportModal({
  data,
  mutate,
  addAudit,
  notify,
  currentUserId,
  onClose
}: {
  data: AppData;
  mutate: (updater: (draft: AppData) => void) => void;
  addAudit: (draft: AppData, action: string, objectType: string, objectName: string, result?: AuditLog['result'], type?: AuditLog['logType']) => void;
  notify: (message: string, tone?: ToastTone) => void;
  currentUserId: string;
  onClose: () => void;
}) {
  const [fileName, setFileName] = useState('contacts_gts_2026-08.xlsx');
  const [result, setResult] = useState<{ status: string; rows: number; errors: string[] } | null>(null);

  const validate = () => {
    const errors = fileName.endsWith('.xlsx') || fileName.endsWith('.csv') || fileName.endsWith('.xml') ? ['Строка 18: дубль email k.melnikov@gts.example', 'Строка 24: не заполнена роль контакта'] : ['Расширение файла запрещено правилами импорта'];
    setResult({ status: errors.length ? 'Ошибка' : 'Валидирован', rows: 27, errors });
    mutate((draft) => {
      const integrationId = `INT-${660 + draft.integrations.length}`;
      draft.integrations.unshift({
        id: integrationId,
        system: 'Confluence',
        status: errors.length ? 'Ошибка' : 'Успешно',
        lastSync: '2026-08-04T13:05:00+07:00',
        objectType: 'Импорт',
        objectId: fileName,
        operation: 'Валидация и загрузка файла контактов',
        records: 27,
        errors,
        log: [
          { at: '2026-08-04T13:05:00+07:00', level: errors.length ? 'ERROR' : 'INFO', message: errors.length ? errors.join('; ') : 'Файл валидирован и загружен в операционный контур' }
        ]
      });
      if (errors.length) {
        draft.tasks.unshift({
          id: `TASK-${2150 + draft.tasks.length}`,
          title: `Разобрать ошибки импорта ${fileName}`,
          templateId: 'tt-verify-profile',
          status: 'Новая',
          priority: 'Средний',
          counterpartyId: 'ПР-000077',
          assigneeGroup: 'Операционный контроль',
          dueDate: '2026-08-07',
          createdAt: '2026-08-04T13:05:00+07:00',
          requiredFields: ['Исправленный файл', 'Проверка дублей'],
          completedFields: [],
          timeSpentHours: 0,
          links: ['ПР-000077', integrationId],
          comments: ['Создана автоматически по ошибке валидации импортируемого файла.'],
          history: [
            {
              at: '2026-08-04T13:05:00+07:00',
              actorId: currentUserId,
              action: 'Создана по ошибке импорта',
              details: errors.join('; '),
              status: 'Новая'
            }
          ]
        });
      }
      addAudit(draft, 'Валидация импортируемого файла', 'Импорт', fileName, errors.length ? 'Ошибка' : 'Успешно', 'Межсистемное взаимодействие');
    });
    notify(errors.length ? 'Файл проверен: найдены ошибки, создана задача на исправление' : 'Файл успешно загружен', errors.length ? 'warning' : 'success');
  };

  return (
    <Modal title="Импорт и обработка данных" onClose={onClose}>
      <div className="modal-body">
        <Field label="Имя файла" value={fileName} onChange={setFileName} />
        <div className="process-preview">
          <strong>Правила проверки</strong>
          <p>Разрешены XLSX, CSV, XML. Проверяются расширение, обязательные поля, уникальность ИНН/email и дубликаты строк.</p>
        </div>
        {result ? (
          <div className="import-result">
            <Badge tone={statusTone(result.status)}>{result.status}</Badge>
            <strong>Обработано строк: {result.rows}</strong>
            {result.errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        <footer className="modal-actions">
          <Button onClick={onClose}>Закрыть</Button>
          <Button icon={Upload} variant="primary" onClick={validate}>
            Проверить и загрузить
          </Button>
        </footer>
      </div>
    </Modal>
  );
}

export default App;
