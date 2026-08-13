export type RoleKey = 'curator' | 'department' | 'owner' | 'admin';

export type StatusTone =
  | 'neutral'
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'violet'
  | 'cyan';

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  userId: string;
  workspace: string;
  description: string;
}

export interface User {
  id: string;
  maskedId: string;
  name: string;
  role: RoleKey;
  department: string;
  email: string;
}

export interface Contact {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  primary?: boolean;
}

export type CounterpartyType = 'КО' | 'НКО' | 'ТСП' | 'ПСП' | 'Партнер' | 'ФЛ';

export type CounterpartyStatus =
  | 'Активен'
  | 'Подключение'
  | 'Пилот'
  | 'Риск'
  | 'Приостановлен'
  | 'Архив';

export type ServiceStatus =
  | 'Подключен'
  | 'Подключается'
  | 'Пилот'
  | 'На проверке'
  | 'Приостановлен';

export interface ServiceLink {
  service: string;
  status: ServiceStatus;
  stage: string;
  connectedAt?: string;
  ownerDepartment: string;
  incidentCount: number;
  monthlyOperations: number;
  slaHours: number;
}

export interface Counterparty {
  id: string;
  name: string;
  shortName: string;
  partyKind?: 'ЮЛ' | 'ФЛ';
  type: CounterpartyType;
  status: CounterpartyStatus;
  inn: string;
  kpp: string;
  ogrn: string;
  region: string;
  address: string;
  curatorId: string;
  segment: string;
  riskScore: number;
  lastTouch: string;
  nextControlDate: string;
  officialRequests: number;
  penalties: number;
  services: ServiceLink[];
  contacts: Contact[];
  departments: string[];
  birthDate?: string;
  identityDocument?: string;
  loyaltyId?: string;
  customerValue?: number;
  preferredChannel?: 'Телефон' | 'Email' | 'Чат' | 'Офис' | 'Форма сайта';
  consentStatus?: 'Получено' | 'Истекает' | 'Не получено';
  personalDataLevel?: 'Базовый' | 'Расширенный' | 'Чувствительный';
  maskedCard?: string;
  appealCategory?: string;
}

export type TaskStatus =
  | 'Новая'
  | 'Назначена'
  | 'В работе'
  | 'Ожидание'
  | 'На проверке'
  | 'Просрочена'
  | 'Выполнена'
  | 'Отменена';

export type Priority = 'Низкий' | 'Средний' | 'Высокий' | 'Критичный';

export interface TaskHistoryEntry {
  at: string;
  actorId: string;
  action: string;
  details: string;
  status?: TaskStatus;
}

export interface Task {
  id: string;
  title: string;
  templateId: string;
  status: TaskStatus;
  priority: Priority;
  counterpartyId?: string;
  processId?: string;
  assigneeId?: string;
  assigneeGroup?: string;
  dueDate: string;
  createdAt: string;
  requiredFields: string[];
  completedFields: string[];
  fieldResults?: Record<string, string>;
  timeSpentHours: number;
  links: string[];
  comments: string[];
  history: TaskHistoryEntry[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  entityType: string;
  defaultPriority: Priority;
  assigneeGroup: string;
  requiredFields: string[];
  slaHours: number;
  statusModel: TaskStatus[];
  attributes?: TaskTemplateAttribute[];
  requiredByStatusRole?: TaskRequiredRule[];
  validationRules?: string[];
  linkRules?: TaskLinkRule[];
  autoCreateTriggers?: ('Запуск процесса' | 'Переход этапа' | 'Follow-up коммуникации' | 'Контрольная дата' | 'Внутреннее поручение' | 'API')[];
}

export interface TaskTemplateAttribute {
  id: string;
  name: string;
  type: 'Строка' | 'Число' | 'Дата' | 'Время' | 'Справочник' | 'Множественный выбор' | 'Формула' | 'Да/Нет';
  required: boolean;
  source?: string;
  validationRule?: string;
}

export interface TaskRequiredRule {
  id: string;
  status: TaskStatus;
  role: RoleKey | 'Любая роль';
  fields: string[];
}

export interface TaskLinkRule {
  id: string;
  relationType: 'Основание' | 'Блокирует' | 'Зависит от' | 'Порождает' | 'Связанная задача';
  targetType: 'Контрагент' | 'Процесс' | 'Задача' | 'Документ' | 'Коммуникация' | 'Поручение';
  required: boolean;
  description: string;
}

export type ProcessStatus =
  | 'Черновик'
  | 'Запущен'
  | 'В работе'
  | 'Ожидание контрагента'
  | 'Риск сроков'
  | 'Ошибка интеграции'
  | 'Завершен'
  | 'Остановлен';

export interface ProcessStage {
  id: string;
  name: string;
  department: string;
  slaHours: number;
  autoTaskTemplateId: string;
  requiredAttributes: string[];
  escalationRule: string;
  formFields?: string[];
  errorHandler?: string;
}

export interface ProcessTransition {
  id: string;
  fromStageId: string;
  toStageId: string;
  condition: string;
  actionLabel: string;
  createsTask: boolean;
  role: RoleKey | 'Любая роль';
}

export type NotificationChannel = 'email' | 'Внутрисистемное';

export type NotificationDeliveryStatus = 'Отправлено' | 'Доставлено' | 'Ошибка' | 'Ожидает';

export type NotificationTriggerKind =
  | 'Запуск процесса'
  | 'Переход этапа'
  | 'Просрочка SLA'
  | 'Контрольная дата'
  | 'Follow-up коммуникации'
  | 'Внутреннее поручение'
  | 'Ошибка интеграции';

export type NotificationRecipientRule =
  | 'Группа текущего этапа'
  | 'Группа следующего этапа'
  | 'Куратор контрагента'
  | 'Владелец процесса'
  | 'Подразделение поручения'
  | 'Групповой email'
  | 'Персональный email';

export interface NotificationTemplate {
  id: string;
  name: string;
  trigger: NotificationTriggerKind;
  channel: NotificationChannel;
  recipientRule: NotificationRecipientRule;
  recipientFallback: string;
  subject: string;
  body: string;
  variables: string[];
  enabled: boolean;
  deliveryControl: boolean;
}

export interface ProcessTemplateSnapshot {
  name: string;
  processType?: string;
  partyKinds?: ('ЮЛ' | 'ФЛ')[];
  trigger: 'Ручной запуск' | 'Событие ИС' | 'Таймер' | 'API';
  entityTypes: string[];
  attributes: DictionaryField[];
  stages: ProcessStage[];
  statusModel?: ProcessStatus[];
  transitions?: ProcessTransition[];
  validationRules: string[];
  businessRules?: string[];
  escalationRules?: string[];
  integrationRules: string[];
  errorHandlingRules?: string[];
  notificationTemplates?: NotificationTemplate[];
}

export interface ProcessTemplateVersion {
  version: number;
  status: 'Актуальная' | 'Черновик' | 'Архивная';
  changedAt: string;
  authorId: string;
  changeSummary: string;
  stagesCount: number;
  snapshot?: ProcessTemplateSnapshot;
}

export interface ProcessTemplate {
  id: string;
  name: string;
  processType?: string;
  partyKinds?: ('ЮЛ' | 'ФЛ')[];
  version: number;
  status: 'Актуальная' | 'Черновик' | 'Архивная';
  trigger: 'Ручной запуск' | 'Событие ИС' | 'Таймер' | 'API';
  entityTypes: string[];
  attributes: DictionaryField[];
  stages: ProcessStage[];
  statusModel?: ProcessStatus[];
  transitions?: ProcessTransition[];
  validationRules: string[];
  businessRules?: string[];
  escalationRules?: string[];
  integrationRules: string[];
  errorHandlingRules?: string[];
  notificationTemplates?: NotificationTemplate[];
  versionHistory?: ProcessTemplateVersion[];
}

export interface ProcessInstance {
  id: string;
  templateId: string;
  title: string;
  type: string;
  status: ProcessStatus;
  counterpartyId: string;
  stageIndex: number;
  startedAt: string;
  dueDate: string;
  initiatorId: string;
  ownerDepartment: string;
  currentGroup: string;
  priority: Priority;
  elapsedHours: number;
  businessObjectId: string;
  taskIds: string[];
  documentIds: string[];
  integrationIds: string[];
  history: TaskHistoryEntry[];
}

export type DocumentStatus =
  | 'Загружен'
  | 'На проверке'
  | 'Валидирован'
  | 'Ошибка'
  | 'Архив';

export type EvdTemplateStatus = 'Черновик' | 'Актуальный' | 'Архивный';

export type EvdAutoCreateTrigger = 'Ручной запуск' | 'Запуск процесса' | 'Переход этапа' | 'Событие ИС' | 'API';

export type EvdApproverRuleKind = 'Жесткое правило' | 'Гибкое правило';

export type EvdApproverType = 'Пользователь' | 'Роль' | 'Подразделение' | 'Выражение';

export type EvdRelationType = 'Основание' | 'Приложение' | 'Версия' | 'Заменяет' | 'Связанный документ';

export interface EvdTemplateAttribute {
  id: string;
  name: string;
  type: DictionaryField['type'];
  required: boolean;
  source?: string;
  formula?: string;
  requiredInStatuses?: DocumentStatus[];
  validationRule?: string;
}

export interface EvdLinkRule {
  id: string;
  relationType: EvdRelationType;
  targetType: 'Процесс' | 'Контрагент' | 'Задача' | 'Документ' | 'ЭВД' | 'Сервис' | 'Договор';
  required: boolean;
  description: string;
}

export interface EvdApprovalStep {
  id: string;
  name: string;
  approverType: EvdApproverType;
  approverValue: string;
  ruleKind: EvdApproverRuleKind;
  condition?: string;
  slaHours: number;
  required: boolean;
}

export interface EvdTemplate {
  id: string;
  name: string;
  status: EvdTemplateStatus;
  version: number;
  businessPurpose: string;
  format: BusinessDocument['format'];
  autoCreate: boolean;
  autoCreateTrigger: EvdAutoCreateTrigger;
  entityTypes: string[];
  processTypes?: string[];
  attributes: EvdTemplateAttribute[];
  linkRules: EvdLinkRule[];
  approvalRoute: EvdApprovalStep[];
  hardApproverRules: string[];
  flexibleApproverRules: string[];
  validationRules: string[];
  statusModel: DocumentStatus[];
  bodyTemplate: string;
  variables: string[];
}

export interface EvdApprovalRuntimeStep {
  id: string;
  name: string;
  approver: string;
  ruleKind: EvdApproverRuleKind;
  status: 'Ожидает' | 'Согласовано' | 'Отклонено';
  dueDate: string;
}

export interface BusinessDocument {
  id: string;
  name: string;
  kind: 'Файл' | 'ЭВД' | 'Шаблон экспорта' | 'Печатная форма';
  format: 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'JPG' | 'PNG' | 'XML' | 'ZIP' | 'TXT' | 'OTHER';
  size: string;
  status: DocumentStatus;
  linkedObjectType: string;
  linkedObjectId: string;
  ownerId: string;
  createdAt: string;
  templateName?: string;
  businessPurpose?: string;
  service?: string;
  contractNumber?: string;
  validUntil?: string;
  version?: string;
  relatedTaskId?: string;
  nextAction?: string;
  sourceFileName?: string;
  contentDataUrl?: string;
  evdTemplateId?: string;
  evdTemplateVersion?: number;
  evdAttributes?: Record<string, string | number | boolean>;
  evdApprovalRoute?: EvdApprovalRuntimeStep[];
  relatedDocumentIds?: string[];
  relationType?: EvdRelationType;
}

export type CommunicationStatus = 'Запланирована' | 'Проведена' | 'Требует follow-up' | 'Отменена';

export interface Communication {
  id: string;
  counterpartyId: string;
  type: 'Звонок' | 'Встреча' | 'Письмо' | 'Обращение';
  subject: string;
  at: string;
  responsibleId: string;
  summary: string;
  nextAction: string;
  status?: CommunicationStatus;
  channel?: 'Телефон' | 'ВКС' | 'Email' | 'Офис' | 'Чат' | 'Форма сайта';
  processId?: string;
  agenda?: string[];
  participants?: string[];
  outcome?: string;
  linkedTaskIds?: string[];
  recording?: string;
}

export type InternalHandoffStatus = 'Ожидает' | 'В работе' | 'На проверке' | 'Закрыто' | 'Просрочено';

export interface InternalHandoff {
  id: string;
  title: string;
  sourceDepartment: string;
  targetDepartment: string;
  status: InternalHandoffStatus;
  priority: Priority;
  createdAt: string;
  dueDate: string;
  responsibleId: string;
  counterpartyId?: string;
  processId?: string;
  taskId?: string;
  comment: string;
  result?: string;
  history: TaskHistoryEntry[];
}

export interface NotificationEvent {
  id: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  recipient: string;
  trigger: string;
  objectId: string;
  at: string;
  templateId?: string;
  subject?: string;
  body?: string;
  deliveryDetails?: string;
}

export interface IntegrationLogEntry {
  at: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface IntegrationExchange {
  id: string;
  system: 'СЭД' | 'BI' | 'Jira' | 'Redmine' | 'Confluence' | 'Телефония' | 'Email Gateway' | 'DWH' | 'API CRM Gateway';
  status: 'Успешно' | 'Ошибка' | 'В процессе' | 'Ожидает';
  lastSync: string;
  objectType: string;
  objectId: string;
  operation: string;
  records: number;
  errors: string[];
  log: IntegrationLogEntry[];
}

export interface DictionaryField {
  id: string;
  name: string;
  type: 'Строка' | 'Число' | 'Дата' | 'Время' | 'Справочник' | 'Множественный выбор' | 'Формула' | 'Да/Нет';
  required: boolean;
  source?: string;
  formula?: string;
}

export interface Dictionary {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  fields: DictionaryField[];
  records: Record<string, string | number | boolean>[];
}

export type WikiStatus = 'Черновик' | 'Опубликована' | 'Архив';

export interface WikiVersion {
  id: string;
  label: string;
  at: string;
  authorId: string;
  content: string;
  changeSummary: string;
}

export interface WikiAttachment {
  id: string;
  name: string;
  format: 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'PNG' | 'DRAWIO';
  size: string;
  uploadedAt: string;
  ownerId: string;
  kind: 'Документ' | 'Таблица' | 'Схема процесса' | 'Файл';
  indexedText?: string;
}

export interface WikiPage {
  id: string;
  space: string;
  parentId?: string;
  title: string;
  path: string;
  content: string;
  updatedAt: string;
  authorId: string;
  status: WikiStatus;
  tags: string[];
  versions: WikiVersion[];
  attachments: WikiAttachment[];
}

export interface AuditLog {
  id: string;
  userIdMasked: string;
  at: string;
  action: string;
  objectType: string;
  objectName: string;
  objectLink: string;
  logType: 'Действие пользователя' | 'Действие администратора' | 'Системное событие' | 'Межсистемное взаимодействие' | 'Ошибка';
  result: 'Успешно' | 'Ошибка' | 'Предупреждение';
}

export interface SavedFilter {
  id: string;
  ownerRole: RoleKey;
  name: string;
  target: string;
  query: string;
}

export interface AppData {
  users: User[];
  counterparties: Counterparty[];
  taskTemplates: TaskTemplate[];
  tasks: Task[];
  processTemplates: ProcessTemplate[];
  processes: ProcessInstance[];
  documents: BusinessDocument[];
  communications: Communication[];
  internalHandoffs: InternalHandoff[];
  notifications: NotificationEvent[];
  integrations: IntegrationExchange[];
  evdTemplates: EvdTemplate[];
  dictionaries: Dictionary[];
  wiki: WikiPage[];
  auditLogs: AuditLog[];
  savedFilters: SavedFilter[];
}
