import { cloneDefaultData } from '../data/mock';
import { DEMO_DATA_RESET_VERSION } from '../data/resetVersion';
import type { AppData, RoleKey } from '../types';

const STORAGE_KEY = 'operational-crm-prototype-state-v5';
const ROLE_KEY = 'operational-crm-prototype-role-v1';
const RESET_VERSION_KEY = 'operational-crm-prototype-reset-version-v1';

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

const migrateData = (data: AppData): AppData => {
  const defaults = cloneDefaultData();
  const fallbackAuthorId = data.users?.[0]?.id ?? defaults.users[0]?.id ?? 'u-001';
  const mergedWiki = mergeById(data.wiki, defaults.wiki);
  const migrated: AppData = {
    ...defaults,
    ...data,
    users: mergeById(data.users, defaults.users),
    counterparties: mergeById(data.counterparties, defaults.counterparties),
    taskTemplates: mergeById(data.taskTemplates, defaults.taskTemplates),
    tasks: mergeById(data.tasks, defaults.tasks),
    processTemplates: mergeById(data.processTemplates, defaults.processTemplates),
    processes: mergeById(data.processes, defaults.processes),
    documents: mergeById(data.documents, defaults.documents),
    communications: mergeById(data.communications, defaults.communications),
    internalHandoffs: mergeById(data.internalHandoffs, defaults.internalHandoffs),
    notifications: mergeById(data.notifications, defaults.notifications),
    integrations: mergeById(data.integrations, defaults.integrations),
    dictionaries: mergeById(data.dictionaries, defaults.dictionaries),
    wiki: normalizeWikiPages(mergedWiki, defaults.wiki, fallbackAuthorId),
    auditLogs: mergeById(data.auditLogs, defaults.auditLogs),
    savedFilters: mergeById(data.savedFilters, defaults.savedFilters)
  };

  return migrated;
};

const persistData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const markResetVersion = () => {
  localStorage.setItem(RESET_VERSION_KEY, DEMO_DATA_RESET_VERSION);
};

export const loadData = (): AppData => {
  const storedResetVersion = localStorage.getItem(RESET_VERSION_KEY);
  if (storedResetVersion !== DEMO_DATA_RESET_VERSION) {
    const data = cloneDefaultData();
    persistData(data);
    markResetVersion();
    return data;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneDefaultData();

  try {
    const data = migrateData(JSON.parse(raw) as AppData);
    persistData(data);
    return data;
  } catch {
    return cloneDefaultData();
  }
};

export const saveData = (data: AppData) => {
  persistData(data);
};

export const resetData = () => {
  const data = cloneDefaultData();
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
