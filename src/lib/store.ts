import { cloneDefaultData } from '../data/mock';
import { DEMO_DATA_RESET_VERSION } from '../data/resetVersion';
import type { AppData, RoleKey, Task, TaskStatus } from '../types';

const STORAGE_KEY = 'operational-crm-state-v5';
const ROLE_KEY = 'operational-crm-role-v1';
const AUTH_USER_KEY = 'operational-crm-auth-user-v1';
const RESET_VERSION_KEY = 'operational-crm-reset-version-v1';

const mergeById = <T extends { id: string }>(current: T[] | undefined, defaults: T[]) => {
  const merged = [...(current ?? [])];
  const existingIds = new Set(merged.map((item) => item.id));
  defaults.forEach((item) => {
    if (!existingIds.has(item.id)) merged.push(item);
  });
  return merged;
};

const wikiStatuses = ['Черновик', 'Опубликована', 'Архив'] as const;
const wikiFormats = ['PDF', 'DOCX', 'XLSX', 'CSV', 'PNG', 'DRAWIO'] as const;
const wikiAttachmentKinds = ['Документ', 'Таблица', 'Схема процесса', 'Файл'] as const;

const isOneOf = <T extends readonly string[]>(value: unknown, list: T): value is T[number] =>
  typeof value === 'string' && list.includes(value);

const stringOr = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value : fallback);

const normalizeStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : fallback;

const normalizeWikiPages = (pages: AppData['wiki'], defaults: AppData['wiki'], fallbackAuthorId: string): AppData['wiki'] => {
  const defaultById = new Map(defaults.map((page) => [page.id, page]));

  return pages.map((rawPage, index) => {
    const fallback = defaultById.get(rawPage?.id);
    const id = stringOr(rawPage?.id, fallback?.id ?? `WIKI-${index + 1}`);
    const space = stringOr(rawPage?.space, fallback?.space ?? 'CRM+BPM');
    const title = stringOr(rawPage?.title, fallback?.title ?? 'Страница базы знаний');
    const content = stringOr(rawPage?.content, fallback?.content ?? 'Описание регламента будет заполнено ответственным подразделением.');
    const authorId = stringOr(rawPage?.authorId, fallback?.authorId ?? fallbackAuthorId);
    const updatedAt = stringOr(rawPage?.updatedAt, fallback?.updatedAt ?? new Date().toISOString());
    const status = isOneOf(rawPage?.status, wikiStatuses) ? rawPage.status : fallback?.status ?? 'Опубликована';
    const tags = normalizeStringArray(rawPage?.tags, fallback?.tags ?? ['операция']);

    const rawVersions = Array.isArray(rawPage?.versions) ? rawPage.versions : fallback?.versions ?? [];
    const versions = rawVersions.length
      ? rawVersions.map((version, versionIndex) => ({
          id: stringOr(version?.id, `${id}-v${versionIndex + 1}`),
          label: stringOr(version?.label, `v${versionIndex + 1}`),
          at: stringOr(version?.at, updatedAt),
          authorId: stringOr(version?.authorId, authorId),
          content: stringOr(version?.content, content),
          changeSummary: stringOr(version?.changeSummary, 'Версия восстановлена при миграции данных.')
        }))
      : [
          {
            id: `${id}-v1`,
            label: 'v1',
            at: updatedAt,
            authorId,
            content,
            changeSummary: 'Версия создана при восстановлении сохраненных данных.'
          }
        ];

    const rawAttachments = Array.isArray(rawPage?.attachments) ? rawPage.attachments : fallback?.attachments ?? [];
    const attachments = rawAttachments.map((attachment, attachmentIndex) => ({
      id: stringOr(attachment?.id, `WATT-${id}-${attachmentIndex + 1}`),
      name: stringOr(attachment?.name, `wiki-attachment-${attachmentIndex + 1}.pdf`),
      format: isOneOf(attachment?.format, wikiFormats) ? attachment.format : 'PDF',
      size: stringOr(attachment?.size, '0 КБ'),
      uploadedAt: stringOr(attachment?.uploadedAt, updatedAt),
      ownerId: stringOr(attachment?.ownerId, authorId),
      kind: isOneOf(attachment?.kind, wikiAttachmentKinds) ? attachment.kind : 'Документ',
      indexedText: typeof attachment?.indexedText === 'string' ? attachment.indexedText : undefined
    }));

    return {
      ...fallback,
      ...rawPage,
      id,
      space,
      parentId: typeof rawPage?.parentId === 'string' ? rawPage.parentId : fallback?.parentId,
      title,
      path: stringOr(rawPage?.path, fallback?.path ?? `${space} / ${title}`),
      content,
      updatedAt,
      authorId,
      status,
      tags,
      versions,
      attachments
    };
  });
};

const normalizeProcessTemplates = (templates: AppData['processTemplates'], defaults: AppData['processTemplates']): AppData['processTemplates'] => {
  const defaultById = new Map(defaults.map((template) => [template.id, template]));

  return mergeById(templates, defaults).map((template) => {
    const fallback = defaultById.get(template.id);
    if (!fallback) return template;

    return {
      ...fallback,
      ...template,
      notificationTemplates: template.notificationTemplates?.length
        ? mergeById(template.notificationTemplates, fallback.notificationTemplates ?? [])
        : fallback.notificationTemplates ?? []
    };
  });
};

const normalizeTaskTemplates = (templates: AppData['taskTemplates'], defaults: AppData['taskTemplates']): AppData['taskTemplates'] => {
  const defaultById = new Map(defaults.map((template) => [template.id, template]));

  return mergeById(templates, defaults).map((template) => {
    const fallback = defaultById.get(template.id);
    if (!fallback) return template;
    if (template.id !== 'tt-control-date-review') return template;

    return {
      ...template,
      name: fallback.name,
      entityType: fallback.entityType,
      requiredFields: fallback.requiredFields,
      slaHours: fallback.slaHours,
      statusModel: fallback.statusModel
    };
  });
};

const normalizeCounterparties = (
  counterparties: AppData['counterparties'],
  defaults: AppData['counterparties'],
  resetStatusIds: Set<string>
): AppData['counterparties'] => {
  const defaultById = new Map(defaults.map((counterparty) => [counterparty.id, counterparty]));

  return mergeById(counterparties, defaults).map((counterparty) => {
    const fallback = defaultById.get(counterparty.id);
    if (!fallback) return counterparty;

    const shouldReplaceLegacyDate = !counterparty.nextControlDate || counterparty.nextControlDate.startsWith('2026-08-');
    return {
      ...counterparty,
      status: resetStatusIds.has(counterparty.id) ? fallback.status : counterparty.status,
      nextControlDate: shouldReplaceLegacyDate ? fallback.nextControlDate : counterparty.nextControlDate
    };
  });
};

const inferRealTaskStatus = (task: Task): TaskStatus => {
  const historical = task.history.find(
    (entry) => entry.status && !['Просрочена', 'Новая', 'Выполнена', 'Отменена'].includes(entry.status)
  )?.status;
  if (historical) return historical;

  const taskText = `${task.title} ${task.comments.join(' ')} ${task.history.map((entry) => `${entry.action} ${entry.details}`).join(' ')}`.toLowerCase();
  const requiredCount = task.requiredFields.length;
  const completedCount = task.completedFields.length;

  if (taskText.includes('ожида') || taskText.includes('запрош') || taskText.includes('ответ')) return 'Ожидание';
  if (requiredCount > 0 && completedCount >= requiredCount) return 'На проверке';
  if (completedCount > 0) return 'В работе';
  return 'Назначена';
};

const normalizeTaskStatuses = (tasks: AppData['tasks']): AppData['tasks'] =>
  tasks.map((task) => {
    const hasLegacyOverdueStatus = task.status === 'Просрочена' || task.history.some((entry) => entry.status === 'Просрочена');
    if (!hasLegacyOverdueStatus) return task;

    const inferredStatus = task.status === 'Просрочена' ? inferRealTaskStatus(task) : task.status;
    const history = task.history.map((entry) => (entry.status === 'Просрочена' ? { ...entry, status: inferredStatus } : entry));
    return {
      ...task,
      status: inferredStatus,
      history
    };
  });

const isStartupControlDateTask = (task: Task) =>
  task.templateId === 'tt-control-date-review' &&
  task.history.some((entry) => `${entry.action} ${entry.details}`.includes('Контрольная дата наступила при открытии CRM'));

const normalizeTaskPortfolio = (tasks: AppData['tasks']): AppData['tasks'] =>
  normalizeTaskStatuses(tasks.filter((task) => !isStartupControlDateTask(task)));

const migrateData = (data: AppData): AppData => {
  const defaults = cloneDefaultData();
  const fallbackAuthorId = data.users?.[0]?.id ?? defaults.users[0]?.id ?? 'u-001';
  const mergedWiki = mergeById(data.wiki, defaults.wiki);
  const mergedTasks = mergeById(data.tasks, defaults.tasks);
  const removedStartupTasks = mergedTasks.filter(isStartupControlDateTask);
  const removedTaskIds = new Set(removedStartupTasks.map((task) => task.id));
  const affectedCounterpartyIds = new Set(removedStartupTasks.map((task) => task.counterpartyId).filter((id): id is string => Boolean(id)));
  const migrated: AppData = {
    ...defaults,
    ...data,
    users: mergeById(data.users, defaults.users),
    counterparties: normalizeCounterparties(data.counterparties, defaults.counterparties, affectedCounterpartyIds),
    taskTemplates: normalizeTaskTemplates(data.taskTemplates, defaults.taskTemplates),
    tasks: normalizeTaskPortfolio(mergedTasks),
    processTemplates: normalizeProcessTemplates(data.processTemplates, defaults.processTemplates),
    processes: mergeById(data.processes, defaults.processes),
    documents: mergeById(data.documents, defaults.documents),
    communications: mergeById(data.communications, defaults.communications),
    internalHandoffs: mergeById(data.internalHandoffs, defaults.internalHandoffs),
    notifications: mergeById(data.notifications, defaults.notifications).filter((notification) => !removedTaskIds.has(notification.objectId)),
    integrations: mergeById(data.integrations, defaults.integrations),
    evdTemplates: mergeById(data.evdTemplates, defaults.evdTemplates),
    dictionaries: mergeById(data.dictionaries, defaults.dictionaries),
    wiki: normalizeWikiPages(mergedWiki, defaults.wiki, fallbackAuthorId),
    auditLogs: mergeById(data.auditLogs, defaults.auditLogs).filter((log) => !removedTaskIds.has(log.objectName) && !removedTaskIds.has(log.objectLink)),
    savedFilters: mergeById(data.savedFilters, defaults.savedFilters)
  };

  return migrated;
};

const persistData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, tasks: normalizeTaskPortfolio(data.tasks) }));
};

const markResetVersion = () => {
  localStorage.setItem(RESET_VERSION_KEY, DEMO_DATA_RESET_VERSION);
};

export const loadData = (): AppData => {
  const storedResetVersion = localStorage.getItem(RESET_VERSION_KEY);
  if (storedResetVersion !== DEMO_DATA_RESET_VERSION) {
    const defaultData = cloneDefaultData();
    const data = { ...defaultData, tasks: normalizeTaskPortfolio(defaultData.tasks) };
    persistData(data);
    markResetVersion();
    return data;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const defaultData = cloneDefaultData();
    return { ...defaultData, tasks: normalizeTaskPortfolio(defaultData.tasks) };
  }

  try {
    const data = migrateData(JSON.parse(raw) as AppData);
    persistData(data);
    return data;
  } catch {
    const defaultData = cloneDefaultData();
    return { ...defaultData, tasks: normalizeTaskPortfolio(defaultData.tasks) };
  }
};

export const saveData = (data: AppData) => {
  persistData(data);
};

export const resetData = () => {
  const defaultData = cloneDefaultData();
  const data = { ...defaultData, tasks: normalizeTaskPortfolio(defaultData.tasks) };
  saveData(data);
  markResetVersion();
  return data;
};

export const loadRole = (): RoleKey => {
  const raw = localStorage.getItem(ROLE_KEY);
  if (raw === 'curator' || raw === 'department' || raw === 'owner' || raw === 'admin') return raw;
  return 'curator';
};

export const saveRole = (role: RoleKey) => {
  localStorage.setItem(ROLE_KEY, role);
};

export const loadAuthUserId = () => {
  return localStorage.getItem(AUTH_USER_KEY) ?? '';
};

export const saveAuthUserId = (userId: string) => {
  localStorage.setItem(AUTH_USER_KEY, userId);
};

export const clearAuthUserId = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};
