import type {
  AppData,
  AuditLog,
  BusinessDocument,
  Communication,
  Counterparty,
  CustomerNeed,
  Dictionary,
  EvdTemplate,
  InternalHandoff,
  IntegrationExchange,
  NotificationEvent,
  NotificationTemplate,
  ProcessInstance,
  ProcessTemplate,
  RoleDefinition,
  Task,
  TaskTemplate,
  User,
  WikiPage
} from '../types';

export const roles: RoleDefinition[] = [
  {
    key: 'curator',
    label: 'Куратор CRM',
    userId: 'u-001',
    workspace: 'Главная CRM',
    description: 'Ведет юридических и физических лиц, запускает процессы, фиксирует коммуникации и контролирует сервисы.'
  },
  {
    key: 'department',
    label: 'Исполнитель подразделения',
    userId: 'u-004',
    workspace: 'Мои задачи',
    description: 'Получает задачи из процессов, исполняет этапы и передает работу дальше по маршруту.'
  },
  {
    key: 'owner',
    label: 'Руководитель процесса',
    userId: 'u-006',
    workspace: 'Контроль процессов',
    description: 'Контролирует сроки, нагрузку подразделений, эскалации и качество исполнения процессов.'
  },
  {
    key: 'admin',
    label: 'Администратор BPM',
    userId: 'u-008',
    workspace: 'Настройка системы',
    description: 'Управляет шаблонами, справочниками, правилами, интеграциями и структурой логов.'
  }
];

const users: User[] = [
  {
    id: 'u-001',
    maskedId: 'USR-1842',
    name: 'Елена Морозова',
    role: 'curator',
    department: 'Дирекция сопровождения участников ПС МИР',
    email: 'morozova@example.corp'
  },
  {
    id: 'u-002',
    maskedId: 'USR-2671',
    name: 'Алексей Фомин',
    role: 'curator',
    department: 'Дирекция развития СБП',
    email: 'fomin@example.corp'
  },
  {
    id: 'u-003',
    maskedId: 'USR-3188',
    name: 'Мария Лебедева',
    role: 'curator',
    department: 'Управление партнерских программ',
    email: 'lebedeva@example.corp'
  },
  {
    id: 'u-004',
    maskedId: 'USR-4094',
    name: 'Дмитрий Орлов',
    role: 'department',
    department: 'Управление технологической интеграции',
    email: 'orlov@example.corp'
  },
  {
    id: 'u-005',
    maskedId: 'USR-5120',
    name: 'Светлана Павлова',
    role: 'department',
    department: 'Управление операционного сопровождения',
    email: 'pavlova@example.corp'
  },
  {
    id: 'u-006',
    maskedId: 'USR-6019',
    name: 'Игорь Казаков',
    role: 'owner',
    department: 'Офис управления процессами',
    email: 'kazakov@example.corp'
  },
  {
    id: 'u-007',
    maskedId: 'USR-7093',
    name: 'Наталья Соколова',
    role: 'department',
    department: 'Юридическое управление',
    email: 'sokolova@example.corp'
  },
  {
    id: 'u-008',
    maskedId: 'USR-8007',
    name: 'Павел Андреев',
    role: 'admin',
    department: 'Управление сопровождения корпоративных систем',
    email: 'andreev@example.corp'
  },
  {
    id: 'u-009',
    maskedId: 'USR-8462',
    name: 'Ольга Васильева',
    role: 'department',
    department: 'Центр клиентских коммуникаций',
    email: 'vasilieva@example.corp'
  },
  {
    id: 'u-010',
    maskedId: 'USR-8724',
    name: 'Андрей Ковалев',
    role: 'department',
    department: 'Управление партнерских программ',
    email: 'kovalev@example.corp'
  },
  {
    id: 'u-011',
    maskedId: 'USR-9056',
    name: 'Виктория Романова',
    role: 'department',
    department: 'Управление сопровождения корпоративных систем',
    email: 'romanova@example.corp'
  },
  {
    id: 'u-012',
    maskedId: 'USR-9341',
    name: 'Антон Чернов',
    role: 'department',
    department: 'Управление операционного сопровождения',
    email: 'chernov@example.corp'
  },
  {
    id: 'u-013',
    maskedId: 'USR-9478',
    name: 'Дарья Михайлова',
    role: 'department',
    department: 'Центр клиентских коммуникаций',
    email: 'mikhailova@example.corp'
  }
];

const counterparties: Counterparty[] = [
  {
    id: 'КО-000184',
    name: 'АО "Северный Расчетный Банк"',
    shortName: 'СРБ',
    partyKind: 'ЮЛ',
    type: 'КО',
    status: 'Активен',
    inn: '5408123456',
    kpp: '540801001',
    ogrn: '1025400001840',
    region: 'Новосибирская область',
    address: '630099, Новосибирск, Красный проспект, 22',
    curatorId: 'u-001',
    segment: 'Участник ПС МИР',
    riskScore: 18,
    lastTouch: '2026-08-01T12:30:00+07:00',
    nextControlDate: '2026-09-15',
    officialRequests: 2,
    penalties: 0,
    departments: ['Управление технологической интеграции', 'Управление операционного сопровождения', 'Управление партнерских программ'],
    services: [
      {
        service: 'ПС МИР',
        status: 'Подключен',
        stage: 'Промышленная эксплуатация',
        connectedAt: '2021-03-18',
        ownerDepartment: 'Управление операционного сопровождения',
        incidentCount: 1,
        monthlyOperations: 4820000,
        slaHours: 24
      },
      {
        service: 'СБП',
        status: 'Подключается',
        stage: 'Тестовый контур',
        ownerDepartment: 'Управление технологической интеграции',
        incidentCount: 0,
        monthlyOperations: 0,
        slaHours: 16
      },
      {
        service: 'Программа лояльности',
        status: 'Пилот',
        stage: 'Маркетинговая акция согласована',
        ownerDepartment: 'Управление партнерских программ',
        incidentCount: 0,
        monthlyOperations: 143000,
        slaHours: 48
      }
    ],
    contacts: [
      {
        id: 'c-001',
        name: 'Анна Воронцова',
        position: 'Директор по операционному взаимодействию',
        phone: '+7 383 222-18-40',
        email: 'a.vorontsova@srb.example',
        primary: true
      },
      {
        id: 'c-002',
        name: 'Петр Савин',
        position: 'Руководитель ИТ-интеграции',
        phone: '+7 383 222-18-41',
        email: 'p.savin@srb.example'
      }
    ]
  },
  {
    id: 'КО-000219',
    name: 'ПАО "Восточный Клиринговый Центр"',
    shortName: 'ВКЦ',
    partyKind: 'ЮЛ',
    type: 'КО',
    status: 'Риск',
    inn: '2536019870',
    kpp: '253601001',
    ogrn: '1042500002194',
    region: 'Приморский край',
    address: '690091, Владивосток, Светланская, 31',
    curatorId: 'u-001',
    segment: 'Участник ПС МИР',
    riskScore: 73,
    lastTouch: '2026-07-29T17:45:00+07:00',
    nextControlDate: '2026-10-02',
    officialRequests: 5,
    penalties: 1,
    departments: ['Управление операционного сопровождения', 'Юридическое управление', 'Управление технологической интеграции'],
    services: [
      {
        service: 'ПС МИР',
        status: 'Подключен',
        stage: 'Промышленная эксплуатация',
        connectedAt: '2019-11-26',
        ownerDepartment: 'Управление операционного сопровождения',
        incidentCount: 6,
        monthlyOperations: 3590000,
        slaHours: 24
      },
      {
        service: 'СБП',
        status: 'Приостановлен',
        stage: 'Предписание по тестовым сценариям',
        connectedAt: '2024-05-10',
        ownerDepartment: 'Управление технологической интеграции',
        incidentCount: 4,
        monthlyOperations: 1280000,
        slaHours: 8
      }
    ],
    contacts: [
      {
        id: 'c-003',
        name: 'Ольга Шестакова',
        position: 'Заместитель председателя правления',
        phone: '+7 423 240-09-18',
        email: 'o.shestakova@vkc.example',
        primary: true
      }
    ]
  },
  {
    id: 'ПР-000077',
    name: 'ООО "Городские Транспортные Сервисы"',
    shortName: 'ГТС',
    partyKind: 'ЮЛ',
    type: 'Партнер',
    status: 'Подключение',
    inn: '7705456712',
    kpp: '770501001',
    ogrn: '1167746000770',
    region: 'Москва',
    address: '115035, Москва, Садовническая, 14',
    curatorId: 'u-003',
    segment: 'Транспортная процессинговая платформа',
    riskScore: 41,
    lastTouch: '2026-08-02T10:20:00+07:00',
    nextControlDate: '2026-10-21',
    officialRequests: 1,
    penalties: 0,
    departments: ['Управление технологической интеграции', 'Юридическое управление', 'Управление партнерских программ'],
    services: [
      {
        service: 'Транспортная платформа',
        status: 'Подключается',
        stage: 'Проверка API-паспорта',
        ownerDepartment: 'Управление технологической интеграции',
        incidentCount: 0,
        monthlyOperations: 0,
        slaHours: 12
      },
      {
        service: 'Программа лояльности',
        status: 'На проверке',
        stage: 'Расчет бюджета акции',
        ownerDepartment: 'Управление партнерских программ',
        incidentCount: 0,
        monthlyOperations: 0,
        slaHours: 24
      }
    ],
    contacts: [
      {
        id: 'c-004',
        name: 'Кирилл Мельников',
        position: 'Директор по продукту',
        phone: '+7 495 718-20-77',
        email: 'k.melnikov@gts.example',
        primary: true
      }
    ]
  },
  {
    id: 'ТСП-000311',
    name: 'ООО "Сеть Маркетов Север"',
    shortName: 'СМС',
    partyKind: 'ЮЛ',
    type: 'ТСП',
    status: 'Пилот',
    inn: '7806420311',
    kpp: '780601001',
    ogrn: '1187847003111',
    region: 'Санкт-Петербург',
    address: '195027, Санкт-Петербург, Магнитогорская, 17',
    curatorId: 'u-003',
    segment: 'Партнер Программы лояльности',
    riskScore: 29,
    lastTouch: '2026-08-03T15:10:00+07:00',
    nextControlDate: '2026-11-12',
    officialRequests: 0,
    penalties: 0,
    departments: ['Управление партнерских программ', 'Управление операционного сопровождения'],
    services: [
      {
        service: 'Программа лояльности',
        status: 'Пилот',
        stage: 'Запуск акции "Кешбэк выходного дня"',
        ownerDepartment: 'Управление партнерских программ',
        incidentCount: 0,
        monthlyOperations: 87000,
        slaHours: 48
      }
    ],
    contacts: [
      {
        id: 'c-005',
        name: 'Виктория Синицына',
        position: 'Руководитель CRM-маркетинга',
        phone: '+7 812 677-03-11',
        email: 'v.sinitsyna@sms.example',
        primary: true
      }
    ]
  },
  {
    id: 'ПСП-000052',
    name: 'АО "Платежная система Контур"',
    shortName: 'ПС Контур',
    partyKind: 'ЮЛ',
    type: 'ПСП',
    status: 'Активен',
    inn: '7701800052',
    kpp: '770101001',
    ogrn: '1107746000528',
    region: 'Москва',
    address: '101000, Москва, Мясницкая, 24',
    curatorId: 'u-002',
    segment: 'Платежная система - партнер',
    riskScore: 22,
    lastTouch: '2026-07-30T11:05:00+07:00',
    nextControlDate: '2026-12-04',
    officialRequests: 1,
    penalties: 0,
    departments: ['Управление операционного сопровождения', 'Управление технологической интеграции'],
    services: [
      {
        service: 'МПС',
        status: 'Подключен',
        stage: 'Промышленный обмен',
        connectedAt: '2020-09-01',
        ownerDepartment: 'Управление операционного сопровождения',
        incidentCount: 2,
        monthlyOperations: 2140000,
        slaHours: 24
      }
    ],
    contacts: [
      {
        id: 'c-006',
        name: 'Роман Ковалев',
        position: 'Директор по операционным сервисам',
        phone: '+7 495 540-00-52',
        email: 'r.kovalev@konturps.example',
        primary: true
      }
    ]
  },
  {
    id: 'НКО-000143',
    name: 'НКО "Быстрый перевод"',
    shortName: 'Быстрый перевод',
    partyKind: 'ЮЛ',
    type: 'НКО',
    status: 'Подключение',
    inn: '7709143143',
    kpp: '770901001',
    ogrn: '1137700014300',
    region: 'Москва',
    address: '109028, Москва, Покровский бульвар, 6',
    curatorId: 'u-002',
    segment: 'Участник СБП',
    riskScore: 35,
    lastTouch: '2026-08-04T09:00:00+07:00',
    nextControlDate: '2027-01-20',
    officialRequests: 3,
    penalties: 0,
    departments: ['Управление технологической интеграции', 'Управление операционного сопровождения'],
    services: [
      {
        service: 'СБП',
        status: 'Подключается',
        stage: 'Подготовка тестового стенда',
        ownerDepartment: 'Управление технологической интеграции',
        incidentCount: 0,
        monthlyOperations: 0,
        slaHours: 8
      }
    ],
    contacts: [
      {
        id: 'c-007',
        name: 'Тимур Галиев',
        position: 'Начальник процессингового центра',
        phone: '+7 495 901-43-00',
        email: 't.galiev@fastpay.example',
        primary: true
      }
    ]
  }
];

const taskTemplates: TaskTemplate[] = [
  {
    id: 'tt-verify-profile',
    name: 'Проверить единый профиль контрагента',
    entityType: 'Контрагент',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена', 'Отменена']
  },
  {
    id: 'tt-api-passport',
    name: 'Проверить API-паспорт и тестовый контур',
    entityType: 'Процесс подключения',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['API-паспорт', 'Тестовый стенд', 'Контакт ИТ'],
    slaHours: 16,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-legal-notice',
    name: 'Подготовить уведомление по нарушению SLA',
    entityType: 'Уведомление/штраф',
    defaultPriority: 'Критичный',
    assigneeGroup: 'Юридическое управление',
    requiredFields: ['Основание', 'Расчет нарушения', 'Получатель'],
    slaHours: 12,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена', 'Отменена']
  },
  {
    id: 'tt-marketing-budget',
    name: 'Согласовать параметры маркетинговой акции',
    entityType: 'Маркетинговая акция',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление партнерских программ',
    requiredFields: ['Период акции', 'Бюджет', 'Механика начисления'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-marketing-launch-control',
    name: 'Проконтролировать запуск маркетинговой акции',
    entityType: 'Маркетинговая акция',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Дата старта акции', 'Готовность каналов', 'Метрики первого дня'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-launch-control',
    name: 'Провести контроль промышленного запуска',
    entityType: 'Процесс подключения',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Дата запуска', 'Метрики первого дня', 'Ответственный контрагента'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Выполнена']
  },
  {
    id: 'tt-penalty-response-control',
    name: 'Проконтролировать реакцию контрагента на уведомление',
    entityType: 'Уведомление/штраф',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Ответ контрагента', 'План корректирующих действий', 'Решение по штрафу'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-appeal-classify',
    name: 'Классифицировать обращение клиента',
    entityType: 'Клиентское обращение',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    slaHours: 4,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-appeal-resolution',
    name: 'Проверить обращение и подготовить решение',
    entityType: 'Клиентское обращение',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение', 'Срок ответа клиенту'],
    slaHours: 16,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-satisfaction-control',
    name: 'Закрыть обращение и проверить удовлетворенность',
    entityType: 'Клиентское обращение',
    defaultPriority: 'Средний',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Итоговый ответ', 'Канал ответа', 'Оценка/подтверждение клиента', 'Причина закрытия'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Выполнена', 'Отменена']
  },
  {
    id: 'tt-profile-actualization',
    name: 'Проверить состав данных профиля',
    entityType: 'Актуализация данных',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Реквизиты или документ', 'Контакты', 'Согласия'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-consent-refresh',
    name: 'Запросить подтверждение данных и согласий',
    entityType: 'Актуализация данных',
    defaultPriority: 'Средний',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Канал запроса', 'Подтверждение клиента', 'Срок действия согласия'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'Выполнена']
  },
  {
    id: 'tt-profile-publish',
    name: 'Опубликовать изменения профиля в целевых системах',
    entityType: 'Актуализация данных',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление сопровождения корпоративных систем',
    requiredFields: ['Результат DWH', 'Журналирование', 'Контроль дублей'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-legal-profile-check',
    name: 'Проверить реквизиты и контактных лиц ЮЛ',
    entityType: 'Актуализация данных ЮЛ',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['ИНН/КПП/ОГРН', 'Основной контакт', 'Связанные сервисы'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-legal-profile-request',
    name: 'Запросить подтверждение реквизитов у ЮЛ',
    entityType: 'Актуализация данных ЮЛ',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Адресат запроса', 'Подтвержденные реквизиты', 'Контрольный срок ответа'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'Выполнена']
  },
  {
    id: 'tt-communication-followup',
    name: 'Выполнить договоренности по коммуникации',
    entityType: 'Коммуникация',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Итог коммуникации', 'Следующий шаг', 'Ответственный'],
    slaHours: 24,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'Выполнена']
  },
  {
    id: 'tt-internal-handoff',
    name: 'Отработать межподразделенческое поручение',
    entityType: 'Внутреннее взаимодействие',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Запрошенное действие', 'Результат подразделения', 'Комментарий для инициатора'],
    slaHours: 16,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-control-date-review',
    name: 'Контрольная проверка карточки',
    entityType: 'Контроль карточки',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Проверен профиль контрагента', 'Проверены активные процессы и задачи', 'Зафиксирован результат контроля'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-contract-package',
    name: 'Проверить договорной пакет и реквизиты',
    entityType: 'Договорной процесс',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Реквизиты контрагента', 'Перечень сервисов', 'Контакт подписанта'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-contract-terms',
    name: 'Согласовать договорные условия обслуживания',
    entityType: 'Договорной процесс',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Юридическое управление',
    requiredFields: ['Тарифный пакет', 'SLA обслуживания', 'Ограничения и особые условия'],
    slaHours: 16,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'На проверке', 'Выполнена']
  },
  {
    id: 'tt-contract-signing',
    name: 'Зафиксировать статус подписания договора',
    entityType: 'Договорной процесс',
    defaultPriority: 'Высокий',
    assigneeGroup: 'Юридическое управление',
    requiredFields: ['Номер договора', 'Статус подписания в СЭД', 'Дата вступления в силу'],
    slaHours: 12,
    statusModel: ['Новая', 'Назначена', 'В работе', 'Ожидание', 'Выполнена']
  },
  {
    id: 'tt-contract-activation',
    name: 'Активировать договорные параметры в CRM',
    entityType: 'Договорной процесс',
    defaultPriority: 'Средний',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Карточка договора', 'Параметры сервиса', 'Контрольная дата'],
    slaHours: 8,
    statusModel: ['Новая', 'Назначена', 'В работе', 'На проверке', 'Выполнена']
  }
];

const notificationVariables = ['counterparty', 'processId', 'taskId', 'stage', 'nextStage', 'dueDate', 'assigneeGroup', 'curator', 'controlDate'];

const commonNotificationTemplates = (prefix: string, groupEmail: string): NotificationTemplate[] => [
  {
    id: `${prefix}-nt-start`,
    name: 'Старт процесса и первая задача',
    trigger: 'Запуск процесса',
    channel: 'Внутрисистемное',
    recipientRule: 'Группа текущего этапа',
    recipientFallback: 'Управление операционного сопровождения',
    subject: 'Запущен процесс {processId} по {counterparty}',
    body: 'Создана первая задача {taskId}. Контрольный срок процесса: {dueDate}. Текущий этап: {stage}.',
    variables: notificationVariables,
    enabled: true,
    deliveryControl: true
  },
  {
    id: `${prefix}-nt-transition`,
    name: 'Передача следующего этапа',
    trigger: 'Переход этапа',
    channel: 'Внутрисистемное',
    recipientRule: 'Группа следующего этапа',
    recipientFallback: 'Управление операционного сопровождения',
    subject: 'Новая задача {taskId}: {nextStage}',
    body: 'Процесс {processId} по {counterparty} перешел с этапа "{stage}" на "{nextStage}". Исполнитель: {assigneeGroup}.',
    variables: notificationVariables,
    enabled: true,
    deliveryControl: true
  },
  {
    id: `${prefix}-nt-overdue`,
    name: 'Просрочка SLA',
    trigger: 'Просрочка SLA',
    channel: 'email',
    recipientRule: 'Групповой email',
    recipientFallback: groupEmail,
    subject: 'Просрочка SLA по процессу {processId}',
    body: 'По контрагенту {counterparty} просрочен этап "{stage}". Задача: {taskId}. Контрольный срок: {dueDate}.',
    variables: notificationVariables,
    enabled: true,
    deliveryControl: true
  },
  {
    id: `${prefix}-nt-control-date`,
    name: 'Контрольная дата карточки',
    trigger: 'Контрольная дата',
    channel: 'Внутрисистемное',
    recipientRule: 'Куратор контрагента',
    recipientFallback: 'Управление операционного сопровождения',
    subject: 'Наступила контрольная дата по {counterparty}',
    body: 'Создана задача {taskId}. Контрольная дата карточки: {controlDate}. Нужно проверить профиль, процессы и открытые обязательства.',
    variables: notificationVariables,
    enabled: true,
    deliveryControl: true
  },
  {
    id: `${prefix}-nt-followup`,
    name: 'Follow-up по коммуникации',
    trigger: 'Follow-up коммуникации',
    channel: 'Внутрисистемное',
    recipientRule: 'Группа текущего этапа',
    recipientFallback: 'Управление операционного сопровождения',
    subject: 'Назначен follow-up {taskId} по {counterparty}',
    body: 'По итогам коммуникации создана задача {taskId}. Срок исполнения: {dueDate}. Ответственная группа: {assigneeGroup}.',
    variables: notificationVariables,
    enabled: true,
    deliveryControl: true
  },
  {
    id: `${prefix}-nt-handoff`,
    name: 'Внутреннее поручение подразделению',
    trigger: 'Внутреннее поручение',
    channel: 'Внутрисистемное',
    recipientRule: 'Подразделение поручения',
    recipientFallback: 'Управление операционного сопровождения',
    subject: 'Поручение по {counterparty}: {taskId}',
    body: 'В рамках процесса {processId} создано поручение подразделению {assigneeGroup}. Срок: {dueDate}.',
    variables: notificationVariables,
    enabled: true,
    deliveryControl: true
  }
];

const processTemplates: ProcessTemplate[] = [
  {
    id: 'pt-connect-sbp',
    name: 'Подключение контрагента к сервису СБП',
    processType: 'Подключение сервиса',
    partyKinds: ['ЮЛ'],
    version: 4,
    status: 'Актуальная',
    trigger: 'Ручной запуск',
    entityTypes: ['Юридическое лицо', 'Контрагент', 'Сервис', 'Задача', 'ЭВД'],
    attributes: [
      { id: 'attr-service', name: 'Сервис подключения', type: 'Справочник', required: true, source: 'Сервисы' },
      { id: 'attr-target-date', name: 'Плановая дата запуска', type: 'Дата', required: true },
      { id: 'attr-test-stand', name: 'Тестовый стенд готов', type: 'Да/Нет', required: true },
      { id: 'attr-risk', name: 'Индекс риска', type: 'Формула', required: false, formula: 'просрочки * 15 + инциденты * 8 + штрафы * 20' }
    ],
    stages: [
      {
        id: 's-profile',
        name: 'Проверка единого профиля',
        department: 'Управление операционного сопровождения',
        slaHours: 8,
        autoTaskTemplateId: 'tt-verify-profile',
        requiredAttributes: ['Реквизиты', 'Контакты'],
        escalationRule: 'email куратору и руководителю при просрочке 2 часа'
      },
      {
        id: 's-api',
        name: 'Технологическая проверка',
        department: 'Управление технологической интеграции',
        slaHours: 16,
        autoTaskTemplateId: 'tt-api-passport',
        requiredAttributes: ['API-паспорт', 'Тестовый стенд'],
        escalationRule: 'внутрисистемное уведомление группе интеграции'
      },
      {
        id: 's-launch',
        name: 'Промышленный запуск',
        department: 'Управление операционного сопровождения',
        slaHours: 24,
        autoTaskTemplateId: 'tt-launch-control',
        requiredAttributes: ['Дата запуска', 'Метрики первого дня'],
        escalationRule: 'уведомление владельцу процесса и групповому email'
      }
    ],
    validationRules: [
      'ИНН обязателен и проверяется на уникальность',
      'Плановая дата запуска не может быть раньше текущей даты',
      'На этапе запуска обязательно наличие валидированного API-паспорта'
    ],
    integrationRules: ['Синхронно проверить контрагента в СЭД', 'Передать событие запуска в DWH', 'Отправить email группе контрагента'],
    notificationTemplates: commonNotificationTemplates('connect-sbp', 'sbp-operations@example.corp')
  },
  {
    id: 'pt-marketing-campaign',
    name: 'Запуск совместной маркетинговой акции',
    processType: 'Маркетинговая акция',
    partyKinds: ['ЮЛ'],
    version: 2,
    status: 'Актуальная',
    trigger: 'Событие ИС',
    entityTypes: ['Юридическое лицо', 'Контрагент', 'Маркетинговая акция', 'Задача'],
    attributes: [
      { id: 'attr-budget', name: 'Бюджет акции', type: 'Число', required: true },
      { id: 'attr-mechanics', name: 'Механика начисления', type: 'Строка', required: true },
      { id: 'attr-period', name: 'Период акции', type: 'Дата', required: true }
    ],
    stages: [
      {
        id: 's-budget',
        name: 'Расчет и проверка бюджета',
        department: 'Управление партнерских программ',
        slaHours: 24,
        autoTaskTemplateId: 'tt-marketing-budget',
        requiredAttributes: ['Бюджет', 'Механика'],
        escalationRule: 'уведомить руководителя партнерских программ'
      },
      {
        id: 's-control',
        name: 'Контроль операционного запуска',
        department: 'Управление операционного сопровождения',
        slaHours: 24,
        autoTaskTemplateId: 'tt-marketing-launch-control',
        requiredAttributes: ['Дата старта акции', 'Готовность каналов'],
        escalationRule: 'эскалация в офис управления процессами'
      }
    ],
    validationRules: ['Бюджет больше 0', 'Период акции не пересекается с архивной кампанией'],
    integrationRules: ['Передать параметры акции в BI', 'Создать страницу итогов в Wiki'],
    notificationTemplates: commonNotificationTemplates('marketing', 'partner-programs@example.corp')
  },
  {
    id: 'pt-penalty-notice',
    name: 'Выставление уведомления и штрафа контрагенту',
    processType: 'Уведомление/штраф',
    partyKinds: ['ЮЛ'],
    version: 3,
    status: 'Актуальная',
    trigger: 'Событие ИС',
    entityTypes: ['Юридическое лицо', 'Контрагент', 'Уведомление', 'Штраф', 'ЭВД'],
    attributes: [
      { id: 'attr-violation', name: 'Тип нарушения', type: 'Справочник', required: true, source: 'Типы нарушений' },
      { id: 'attr-amount', name: 'Сумма штрафа', type: 'Формула', required: true, formula: 'база * коэффициент повторности' }
    ],
    stages: [
      {
        id: 's-notice',
        name: 'Подготовка основания',
        department: 'Юридическое управление',
        slaHours: 12,
        autoTaskTemplateId: 'tt-legal-notice',
        requiredAttributes: ['Основание', 'Расчет нарушения'],
        escalationRule: 'критичная эскалация через email и внутрисистемное уведомление'
      },
      {
        id: 's-control',
        name: 'Контроль реакции контрагента',
        department: 'Управление операционного сопровождения',
        slaHours: 24,
        autoTaskTemplateId: 'tt-penalty-response-control',
        requiredAttributes: ['Ответ контрагента', 'План корректирующих действий'],
        escalationRule: 'повторное уведомление через 24 часа'
      }
    ],
    validationRules: ['Нужна ссылка на инцидент или предписание', 'Сумма штрафа пересчитывается при изменении повторности'],
    integrationRules: ['Создать ЭВД по шаблону', 'Синхронно зарегистрировать исходящее событие в СЭД'],
    notificationTemplates: commonNotificationTemplates('penalty', 'legal-notices@example.corp')
  },
  {
    id: 'pt-client-appeal',
    name: 'Обработка обращения клиента',
    processType: 'Клиентское обращение',
    partyKinds: ['ФЛ', 'ЮЛ'],
    version: 1,
    status: 'Актуальная',
    trigger: 'Событие ИС',
    entityTypes: ['Физическое лицо', 'Юридическое лицо', 'Контрагент', 'Обращение', 'Задача', 'Коммуникация'],
    attributes: [
      { id: 'attr-appeal-summary', name: 'Суть обращения', type: 'Строка', required: true },
      { id: 'attr-appeal-category', name: 'Тип обращения', type: 'Справочник', required: true, source: 'Категории обращений' },
      { id: 'attr-channel', name: 'Канал обращения', type: 'Справочник', required: true, source: 'Каналы коммуникаций' },
      { id: 'attr-applicant', name: 'Контакт/заявитель', type: 'Строка', required: true },
      { id: 'attr-solution-method', name: 'Способ решения', type: 'Справочник', required: true, source: 'Способы решения обращений' },
      { id: 'attr-solution', name: 'Решение', type: 'Строка', required: true },
      { id: 'attr-client-answer-date', name: 'Срок ответа клиенту', type: 'Дата', required: true },
      { id: 'attr-appeal-risk', name: 'Риск просрочки обращения', type: 'Формула', required: false, formula: 'оставшиеся часы SLA < 4 ? высокий : средний' }
    ],
    stages: [
      {
        id: 's-appeal-classify',
        name: 'Регистрация и классификация обращения',
        department: 'Центр клиентских коммуникаций',
        slaHours: 4,
        autoTaskTemplateId: 'tt-appeal-classify',
        requiredAttributes: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
        escalationRule: 'при SLA меньше 1 часа уведомить старшего смены контактного центра'
      },
      {
        id: 's-appeal-resolution',
        name: 'Операционная проверка и подготовка решения',
        department: 'Управление операционного сопровождения',
        slaHours: 16,
        autoTaskTemplateId: 'tt-appeal-resolution',
        requiredAttributes: ['Причина обращения', 'Способ решения', 'Решение', 'Срок ответа клиенту'],
        escalationRule: 'при спорной операции направить уведомление владельцу процесса'
      },
      {
        id: 's-satisfaction',
        name: 'Закрытие и контроль удовлетворенности',
        department: 'Центр клиентских коммуникаций',
        slaHours: 8,
        autoTaskTemplateId: 'tt-satisfaction-control',
        requiredAttributes: ['Итоговый ответ', 'Канал ответа', 'Оценка/подтверждение клиента', 'Причина закрытия'],
        escalationRule: 'если оценка ниже 4, создать повторную задачу контроля качества'
      }
    ],
    validationRules: [
      'Для ФЛ обязательно наличие согласия на обработку ПДн',
      'Для ЮЛ обязательно указать контакт-заявителя и связанный сервис или договорный контекст',
      'Суть, тип и канал обращения обязательны до передачи в операционный контроль',
      'Срок ответа клиенту или контрагенту не может превышать норматив SLA категории'
    ],
    integrationRules: ['Получить обращение из Телефонии или Email Gateway', 'Передать итог обработки в DWH', 'Сохранить коммуникацию в карточке клиента'],
    notificationTemplates: commonNotificationTemplates('client-appeal', 'contact-center@example.corp')
  },
  {
    id: 'pt-profile-actualization',
    name: 'Актуализация профиля и согласий ФЛ',
    processType: 'Актуализация данных',
    partyKinds: ['ФЛ'],
    version: 1,
    status: 'Актуальная',
    trigger: 'Таймер',
    entityTypes: ['Физическое лицо', 'Контрагент', 'Профиль', 'Согласие', 'Задача'],
    attributes: [
      { id: 'attr-profile-kind', name: 'Тип профиля', type: 'Справочник', required: true, source: 'Типы контрагентов' },
      { id: 'attr-consent-expiration', name: 'Дата окончания согласия', type: 'Дата', required: true },
      { id: 'attr-data-completeness', name: 'Полнота данных', type: 'Формула', required: false, formula: 'заполненные поля / обязательные поля * 100' },
      { id: 'attr-publish-result', name: 'Результат публикации', type: 'Строка', required: false }
    ],
    stages: [
      {
        id: 's-profile-check',
        name: 'Проверка состава данных',
        department: 'Управление операционного сопровождения',
        slaHours: 8,
        autoTaskTemplateId: 'tt-profile-actualization',
        requiredAttributes: ['Реквизиты или документ', 'Контакты', 'Согласия'],
        escalationRule: 'если полнота ниже 80%, уведомить куратора карточки'
      },
      {
        id: 's-consent-refresh',
        name: 'Запрос подтверждения у клиента',
        department: 'Центр клиентских коммуникаций',
        slaHours: 24,
        autoTaskTemplateId: 'tt-consent-refresh',
        requiredAttributes: ['Канал запроса', 'Подтверждение клиента', 'Срок действия согласия'],
        escalationRule: 'повторить запрос через Email Gateway и внутрисистемное уведомление'
      },
      {
        id: 's-profile-publish',
        name: 'Публикация изменений и журналирование',
        department: 'Управление сопровождения корпоративных систем',
        slaHours: 8,
        autoTaskTemplateId: 'tt-profile-publish',
        requiredAttributes: ['Результат DWH', 'Журналирование', 'Контроль дублей'],
        escalationRule: 'при ошибке публикации создать инцидент администратору BPM'
      }
    ],
    validationRules: [
      'Для ФЛ проверяется срок действия согласия ПДн',
      'Публикация невозможна при найденных дублях профиля'
    ],
    integrationRules: ['Проверить дубли профиля в DWH', 'Отправить клиенту запрос подтверждения через Email Gateway', 'Записать изменение профиля в обезличенный журнал'],
    notificationTemplates: commonNotificationTemplates('profile-fl', 'client-profile-control@example.corp')
  },
  {
    id: 'pt-legal-profile-actualization',
    name: 'Актуализация реквизитов и контактных лиц ЮЛ',
    processType: 'Актуализация данных',
    partyKinds: ['ЮЛ'],
    version: 1,
    status: 'Актуальная',
    trigger: 'Таймер',
    entityTypes: ['Юридическое лицо', 'Контрагент', 'Реквизиты', 'Контактное лицо', 'Задача'],
    attributes: [
      { id: 'attr-legal-profile-kind', name: 'Тип ЮЛ', type: 'Справочник', required: true, source: 'Типы контрагентов' },
      { id: 'attr-legal-check-date', name: 'Дата плановой сверки', type: 'Дата', required: true },
      { id: 'attr-legal-data-completeness', name: 'Полнота реквизитов', type: 'Формула', required: false, formula: 'заполненные реквизиты / обязательные реквизиты * 100' },
      { id: 'attr-legal-publish-result', name: 'Результат публикации', type: 'Строка', required: false }
    ],
    stages: [
      {
        id: 's-legal-profile-check',
        name: 'Проверка реквизитов и контактов',
        department: 'Управление операционного сопровождения',
        slaHours: 8,
        autoTaskTemplateId: 'tt-legal-profile-check',
        requiredAttributes: ['ИНН/КПП/ОГРН', 'Основной контакт', 'Связанные сервисы'],
        escalationRule: 'если не заполнен основной контакт или КПП, уведомить куратора карточки'
      },
      {
        id: 's-legal-profile-request',
        name: 'Запрос подтверждения у контрагента',
        department: 'Управление операционного сопровождения',
        slaHours: 24,
        autoTaskTemplateId: 'tt-legal-profile-request',
        requiredAttributes: ['Адресат запроса', 'Подтвержденные реквизиты', 'Контрольный срок ответа'],
        escalationRule: 'при отсутствии ответа создать follow-up коммуникацию куратору'
      },
      {
        id: 's-legal-profile-publish',
        name: 'Публикация изменений и журналирование',
        department: 'Управление сопровождения корпоративных систем',
        slaHours: 8,
        autoTaskTemplateId: 'tt-profile-publish',
        requiredAttributes: ['Результат DWH', 'Журналирование', 'Контроль дублей'],
        escalationRule: 'при ошибке публикации создать инцидент администратору BPM'
      }
    ],
    validationRules: [
      'Для ЮЛ обязательны ИНН, КПП, ОГРН и основной контакт',
      'Публикация невозможна при найденных дублях профиля',
      'Контрольный срок ответа контрагента не может быть раньше даты запроса'
    ],
    integrationRules: ['Проверить дубли профиля в DWH', 'Отправить запрос подтверждения через Email Gateway', 'Записать изменение профиля в обезличенный журнал'],
    notificationTemplates: commonNotificationTemplates('profile-ul', 'legal-profile-control@example.corp')
  },
  {
    id: 'pt-contract-onboarding',
    name: 'Оформление договорных условий обслуживания',
    processType: 'Договорной процесс',
    partyKinds: ['ЮЛ'],
    version: 1,
    status: 'Актуальная',
    trigger: 'Ручной запуск',
    entityTypes: ['Юридическое лицо', 'Контрагент', 'Договорные условия', 'Документ', 'Задача'],
    attributes: [
      { id: 'attr-contract-kind', name: 'Тип договора', type: 'Справочник', required: true, source: 'Типы договоров' },
      { id: 'attr-service-list', name: 'Сервисы в договоре', type: 'Множественный выбор', required: true, source: 'Сервисы' },
      { id: 'attr-contract-number', name: 'Номер договора', type: 'Строка', required: false },
      { id: 'attr-effective-date', name: 'Дата вступления в силу', type: 'Дата', required: true }
    ],
    stages: [
      {
        id: 's-contract-package',
        name: 'Проверка договорного пакета',
        department: 'Управление операционного сопровождения',
        slaHours: 8,
        autoTaskTemplateId: 'tt-contract-package',
        requiredAttributes: ['Реквизиты контрагента', 'Перечень сервисов', 'Контакт подписанта'],
        escalationRule: 'если пакет неполный, создать поручение куратору и уведомить юридическое сопровождение'
      },
      {
        id: 's-contract-terms',
        name: 'Согласование условий обслуживания',
        department: 'Юридическое управление',
        slaHours: 16,
        autoTaskTemplateId: 'tt-contract-terms',
        requiredAttributes: ['Тарифный пакет', 'SLA обслуживания', 'Особые условия'],
        escalationRule: 'при замечаниях юристов вернуть задачу операционному контролю с комментарием'
      },
      {
        id: 's-contract-signing',
        name: 'Контроль подписания и регистрации',
        department: 'Юридическое управление',
        slaHours: 12,
        autoTaskTemplateId: 'tt-contract-signing',
        requiredAttributes: ['Номер договора', 'Статус подписания в СЭД', 'Дата вступления в силу'],
        escalationRule: 'если СЭД не вернул статус, повторить обмен и уведомить администратора BPM'
      },
      {
        id: 's-contract-activation',
        name: 'Активация договорных параметров в CRM',
        department: 'Управление операционного сопровождения',
        slaHours: 8,
        autoTaskTemplateId: 'tt-contract-activation',
        requiredAttributes: ['Карточка договора', 'Параметры сервиса', 'Контрольная дата'],
        escalationRule: 'если параметры не активированы, блокировать промышленный запуск сервиса'
      }
    ],
    validationRules: [
      'В CRM хранится карточка договорных условий, а не текст договора',
      'Номер договора обязателен только после подтверждения статуса подписания из СЭД',
      'Активация сервисных параметров невозможна без валидированного договорного пакета'
    ],
    integrationRules: ['Получить статус подписания из СЭД', 'Сохранить регистрационный номер и ссылку на карточку СЭД', 'Передать договорные параметры в DWH'],
    notificationTemplates: commonNotificationTemplates('contract', 'contract-operations@example.corp')
  }
];

const processes: ProcessInstance[] = [
  {
    id: 'BP-2026-0148',
    templateId: 'pt-connect-sbp',
    title: 'Подключение СРБ к СБП',
    type: 'Подключение сервиса',
    status: 'В работе',
    counterpartyId: 'КО-000184',
    stageIndex: 1,
    startedAt: '2026-07-30T09:15:00+07:00',
    dueDate: '2026-08-08',
    initiatorId: 'u-001',
    ownerDepartment: 'Офис управления процессами',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Высокий',
    elapsedHours: 42,
    businessObjectId: 'ЗК-0148',
    taskIds: ['TASK-2041', 'TASK-2042'],
    documentIds: ['DOC-901', 'DOC-902'],
    integrationIds: ['INT-501', 'INT-502'],
    history: [
      {
        at: '2026-07-30T09:15:00+07:00',
        actorId: 'u-001',
        action: 'Запущен процесс',
        details: 'Создана задача проверки единого профиля',
        status: 'В работе'
      },
      {
        at: '2026-07-30T17:20:00+07:00',
        actorId: 'u-005',
        action: 'Этап завершен',
        details: 'Профиль валидирован, создана задача технологической проверки'
      }
    ]
  },
  {
    id: 'BP-2026-0152',
    templateId: 'pt-penalty-notice',
    title: 'Уведомление ВКЦ по нарушению SLA СБП',
    type: 'Уведомление/штраф',
    status: 'Риск сроков',
    counterpartyId: 'КО-000219',
    stageIndex: 0,
    startedAt: '2026-08-01T13:40:00+07:00',
    dueDate: '2026-08-04',
    initiatorId: 'u-001',
    ownerDepartment: 'Офис управления процессами',
    currentGroup: 'Юридическое управление',
    priority: 'Критичный',
    elapsedHours: 69,
    businessObjectId: 'ШТ-0152',
    taskIds: ['TASK-2050'],
    documentIds: ['DOC-905'],
    integrationIds: ['INT-503'],
    history: [
      {
        at: '2026-08-01T13:40:00+07:00',
        actorId: 'u-001',
        action: 'Автозапуск по событию ИС',
        details: 'Зафиксировано превышение SLA по 4 инцидентам',
        status: 'Новая'
      },
      {
        at: '2026-08-04T08:10:00+07:00',
        actorId: 'u-006',
        action: 'Эскалация',
        details: 'Срок контрольной точки истекает сегодня'
      }
    ]
  },
  {
    id: 'BP-2026-0157',
    templateId: 'pt-marketing-campaign',
    title: 'Кешбэк выходного дня для СМС',
    type: 'Маркетинговая акция',
    status: 'Ожидание контрагента',
    counterpartyId: 'ТСП-000311',
    stageIndex: 0,
    startedAt: '2026-08-02T10:10:00+07:00',
    dueDate: '2026-08-13',
    initiatorId: 'u-003',
    ownerDepartment: 'Управление партнерских программ',
    currentGroup: 'Управление партнерских программ',
    priority: 'Средний',
    elapsedHours: 17,
    businessObjectId: 'АКЦ-0157',
    taskIds: ['TASK-2056'],
    documentIds: ['DOC-908'],
    integrationIds: ['INT-504'],
    history: [
      {
        at: '2026-08-02T10:10:00+07:00',
        actorId: 'u-003',
        action: 'Запущен процесс',
        details: 'Создана задача расчета бюджета акции',
        status: 'В работе'
      }
    ]
  },
  {
    id: 'BP-2026-0160',
    templateId: 'pt-connect-sbp',
    title: 'Подключение НКО "Быстрый перевод" к СБП',
    type: 'Подключение сервиса',
    status: 'Запущен',
    counterpartyId: 'НКО-000143',
    stageIndex: 0,
    startedAt: '2026-08-04T09:00:00+07:00',
    dueDate: '2026-08-10',
    initiatorId: 'u-002',
    ownerDepartment: 'Офис управления процессами',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Высокий',
    elapsedHours: 2,
    businessObjectId: 'ЗК-0160',
    taskIds: ['TASK-2062'],
    documentIds: ['DOC-912'],
    integrationIds: ['INT-505'],
    history: [
      {
        at: '2026-08-04T09:00:00+07:00',
        actorId: 'u-002',
        action: 'Ручной запуск',
        details: 'Создана первая задача по шаблону "Проверить единый профиль"',
        status: 'Новая'
      }
    ]
  },
  {
    id: 'BP-2026-0168',
    templateId: 'pt-client-appeal',
    title: 'Обращение Кузнецовой М.В. по спорной операции СБП',
    type: 'Клиентское обращение',
    status: 'В работе',
    counterpartyId: 'ФЛ-000002',
    stageIndex: 1,
    startedAt: '2026-08-03T19:25:00+07:00',
    dueDate: '2026-08-05',
    initiatorId: 'u-002',
    ownerDepartment: 'Центр клиентских коммуникаций',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Критичный',
    elapsedHours: 15,
    businessObjectId: 'ОБР-0168',
    taskIds: ['TASK-2090', 'TASK-2091'],
    documentIds: [],
    integrationIds: ['INT-507'],
    history: [
      {
        at: '2026-08-03T19:25:00+07:00',
        actorId: 'u-002',
        action: 'Автозапуск по обращению клиента',
        details: 'Обращение классифицировано как спорная операция СБП',
        status: 'В работе'
      },
      {
        at: '2026-08-03T22:10:00+07:00',
        actorId: 'u-005',
        action: 'Переход этапа',
        details: 'Создана задача операционной проверки обращения'
      }
    ]
  },
  {
    id: 'BP-2026-0171',
    templateId: 'pt-profile-actualization',
    title: 'Актуализация профиля и согласий Иванова А.С.',
    type: 'Актуализация данных',
    status: 'Запущен',
    counterpartyId: 'ФЛ-000001',
    stageIndex: 0,
    startedAt: '2026-08-04T10:15:00+07:00',
    dueDate: '2026-08-09',
    initiatorId: 'u-001',
    ownerDepartment: 'Управление операционного сопровождения',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Средний',
    elapsedHours: 2,
    businessObjectId: 'ПРФ-0171',
    taskIds: ['TASK-2092'],
    documentIds: [],
    integrationIds: ['INT-508'],
    history: [
      {
        at: '2026-08-04T10:15:00+07:00',
        actorId: 'u-001',
        action: 'Плановый запуск по таймеру',
        details: 'Согласие ПДн истекает в контрольном горизонте, создана задача проверки профиля',
        status: 'Новая'
      }
    ]
  },
  {
    id: 'BP-2026-0901',
    templateId: 'pt-connect-sbp',
    title: 'Подключение Норд Капитал Банк к СБП и программе лояльности',
    type: 'Подключение сервиса',
    status: 'В работе',
    counterpartyId: 'КО-009001',
    stageIndex: 1,
    startedAt: '2026-08-05T09:40:00+07:00',
    dueDate: '2026-08-12',
    initiatorId: 'u-001',
    ownerDepartment: 'Офис управления процессами',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Высокий',
    elapsedHours: 6,
    businessObjectId: 'ЗК-0901',
    taskIds: ['TASK-2901', 'TASK-2902'],
    documentIds: ['DOC-9901', 'DOC-9902'],
    integrationIds: ['INT-5901'],
    history: [
      {
        at: '2026-08-05T09:40:00+07:00',
        actorId: 'u-001',
        action: 'Запущен процесс',
        details: 'Создана задача проверки единого профиля Норд Капитал Банк',
        status: 'В работе'
      },
      {
        at: '2026-08-05T11:15:00+07:00',
        actorId: 'u-005',
        action: 'Этап завершен',
        details: 'Профиль Норд Капитал Банк подтвержден, создана задача проверки API-паспорта СБП'
      }
    ]
  },
  {
    id: 'BP-2026-0902',
    templateId: 'pt-client-appeal',
    title: 'Обращение Лебедевой А.П. по кешбэку и СБП',
    type: 'Клиентское обращение',
    status: 'В работе',
    counterpartyId: 'ФЛ-009001',
    stageIndex: 1,
    startedAt: '2026-08-05T10:05:00+07:00',
    dueDate: '2026-08-06',
    initiatorId: 'u-001',
    ownerDepartment: 'Центр клиентских коммуникаций',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Высокий',
    elapsedHours: 3,
    businessObjectId: 'ОБР-0902',
    taskIds: ['TASK-2903', 'TASK-2904'],
    documentIds: ['DOC-9903'],
    integrationIds: ['INT-5902'],
    history: [
      {
        at: '2026-08-05T10:05:00+07:00',
        actorId: 'u-002',
        action: 'Автозапуск по обращению клиента',
        details: 'Обращение из чата классифицировано как спорное начисление кешбэка по СБП',
        status: 'В работе'
      },
      {
        at: '2026-08-05T10:34:00+07:00',
        actorId: 'u-002',
        action: 'Переход этапа',
        details: 'Создана задача операционной проверки начисления'
      }
    ]
  },
  {
    id: 'BP-2026-0903',
    templateId: 'pt-client-appeal',
    title: 'Обращение Норд Капитал Банк по сроку тестового запуска СБП',
    type: 'Клиентское обращение',
    status: 'В работе',
    counterpartyId: 'КО-009001',
    stageIndex: 1,
    startedAt: '2026-08-05T16:05:00+07:00',
    dueDate: '2026-08-07',
    initiatorId: 'u-001',
    ownerDepartment: 'Центр клиентских коммуникаций',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Высокий',
    elapsedHours: 2,
    businessObjectId: 'ОБР-0903',
    taskIds: ['TASK-2930', 'TASK-2931'],
    documentIds: [],
    integrationIds: ['INT-5912'],
    history: [
      {
        at: '2026-08-05T16:05:00+07:00',
        actorId: 'u-001',
        action: 'Регистрация обращения ЮЛ',
        details: 'Норд Капитал Банк запросил перенос окна тестового запуска СБП и подтверждение влияния на план подключения',
        status: 'В работе'
      },
      {
        at: '2026-08-05T16:32:00+07:00',
        actorId: 'u-002',
        action: 'Переход этапа',
        details: 'Обращение классифицировано, создана задача операционной проверки срока запуска'
      }
    ]
  },
  {
    id: 'BP-2026-0910',
    templateId: 'pt-contract-onboarding',
    title: 'Договорные условия обслуживания Норд Капитал Банк',
    type: 'Договорной процесс',
    status: 'В работе',
    counterpartyId: 'КО-009001',
    stageIndex: 1,
    startedAt: '2026-08-05T12:00:00+07:00',
    dueDate: '2026-08-09',
    initiatorId: 'u-001',
    ownerDepartment: 'Офис управления процессами',
    currentGroup: 'Юридическое управление',
    priority: 'Высокий',
    elapsedHours: 4,
    businessObjectId: 'ДОГ-0910',
    taskIds: ['TASK-2910', 'TASK-2911'],
    documentIds: ['DOC-9910', 'DOC-9911'],
    integrationIds: ['INT-5910'],
    history: [
      {
        at: '2026-08-05T12:00:00+07:00',
        actorId: 'u-001',
        action: 'Запущен договорной процесс',
        details: 'Создана задача проверки договорного пакета Норд Капитал Банк',
        status: 'В работе'
      },
      {
        at: '2026-08-05T13:20:00+07:00',
        actorId: 'u-005',
        action: 'Этап завершен',
        details: 'Пакет и контакт подписанта подтверждены, создана задача согласования договорных условий'
      }
    ]
  }
];

const tasks: Task[] = [
  {
    id: 'TASK-2041',
    title: 'Проверить единый профиль СРБ',
    templateId: 'tt-verify-profile',
    status: 'Выполнена',
    priority: 'Средний',
    counterpartyId: 'КО-000184',
    processId: 'BP-2026-0148',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-07-30',
    createdAt: '2026-07-30T09:15:00+07:00',
    requiredFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    completedFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    timeSpentHours: 5.5,
    links: ['КО-000184', 'BP-2026-0148'],
    comments: ['Контакт ИТ подтвержден, реквизиты актуальны.'],
    history: [
      {
        at: '2026-07-30T09:16:00+07:00',
        actorId: 'u-005',
        action: 'Назначена',
        details: 'Задача назначена группе Управление операционного сопровождения',
        status: 'Назначена'
      },
      {
        at: '2026-07-30T17:20:00+07:00',
        actorId: 'u-005',
        action: 'Выполнена',
        details: 'Все обязательные поля заполнены',
        status: 'Выполнена'
      }
    ]
  },
  {
    id: 'TASK-2042',
    title: 'Проверить API-паспорт СБП для СРБ',
    templateId: 'tt-api-passport',
    status: 'В работе',
    priority: 'Высокий',
    counterpartyId: 'КО-000184',
    processId: 'BP-2026-0148',
    assigneeId: 'u-004',
    assigneeGroup: 'Управление технологической интеграции',
    dueDate: '2026-08-06',
    createdAt: '2026-07-30T17:22:00+07:00',
    requiredFields: ['API-паспорт', 'Тестовый стенд', 'Контакт ИТ'],
    completedFields: ['API-паспорт', 'Контакт ИТ'],
    timeSpentHours: 11,
    links: ['КО-000184', 'BP-2026-0148', 'DOC-901'],
    comments: ['Ожидаем повторный прогон тестового сценария C2B.'],
    history: [
      {
        at: '2026-07-30T17:22:00+07:00',
        actorId: 'u-004',
        action: 'Создана автоматически',
        details: 'Предыдущий этап процесса завершен',
        status: 'Новая'
      }
    ]
  },
  {
    id: 'TASK-2050',
    title: 'Подготовить уведомление ВКЦ по нарушению SLA',
    templateId: 'tt-legal-notice',
    status: 'В работе',
    priority: 'Критичный',
    counterpartyId: 'КО-000219',
    processId: 'BP-2026-0152',
    assigneeId: 'u-007',
    assigneeGroup: 'Юридическое управление',
    dueDate: '2026-08-03',
    createdAt: '2026-08-01T13:41:00+07:00',
    requiredFields: ['Основание', 'Расчет нарушения', 'Получатель'],
    completedFields: ['Основание', 'Получатель'],
    timeSpentHours: 7,
    links: ['КО-000219', 'BP-2026-0152', 'DOC-905'],
    comments: ['Не хватает финального расчета повторности нарушения.'],
    history: [
      {
        at: '2026-08-01T13:41:00+07:00',
        actorId: 'u-001',
        action: 'Создана автоматически',
        details: 'Событие превышения SLA',
        status: 'Новая'
      },
      {
        at: '2026-08-04T08:10:00+07:00',
        actorId: 'u-006',
        action: 'Эскалация',
        details: 'Просрочка 29 часов',
        status: 'В работе'
      }
    ]
  },
  {
    id: 'TASK-2056',
    title: 'Согласовать бюджет акции для СМС',
    templateId: 'tt-marketing-budget',
    status: 'Ожидание',
    priority: 'Средний',
    counterpartyId: 'ТСП-000311',
    processId: 'BP-2026-0157',
    assigneeId: 'u-010',
    assigneeGroup: 'Управление партнерских программ',
    dueDate: '2026-08-07',
    createdAt: '2026-08-02T10:11:00+07:00',
    requiredFields: ['Период акции', 'Бюджет', 'Механика начисления'],
    completedFields: ['Период акции', 'Механика начисления'],
    timeSpentHours: 3,
    links: ['ТСП-000311', 'BP-2026-0157'],
    comments: ['Контрагент уточняет лимит кешбэка на карту.'],
    history: [
      {
        at: '2026-08-02T10:11:00+07:00',
        actorId: 'u-003',
        action: 'Создана автоматически',
        details: 'Процесс маркетинговой акции запущен',
        status: 'Новая'
      }
    ]
  },
  {
    id: 'TASK-2062',
    title: 'Проверить единый профиль НКО "Быстрый перевод"',
    templateId: 'tt-verify-profile',
    status: 'Назначена',
    priority: 'Высокий',
    counterpartyId: 'НКО-000143',
    processId: 'BP-2026-0160',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-05',
    createdAt: '2026-08-04T09:00:00+07:00',
    requiredFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    completedFields: ['Реквизиты'],
    timeSpentHours: 1,
    links: ['НКО-000143', 'BP-2026-0160'],
    comments: ['Нужно подтвердить контакт ИТ и групповой email.'],
    history: [
      {
        at: '2026-08-04T09:00:00+07:00',
        actorId: 'u-002',
        action: 'Создана автоматически',
        details: 'Ручной запуск процесса подключения',
        status: 'Новая'
      }
    ]
  },
  {
    id: 'TASK-2065',
    title: 'Проверить импорт списка контактных лиц',
    templateId: 'tt-verify-profile',
    status: 'Новая',
    priority: 'Средний',
    counterpartyId: 'ПР-000077',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-08',
    createdAt: '2026-08-03T16:40:00+07:00',
    requiredFields: ['Файл XLSX', 'Проверка дублей'],
    completedFields: [],
    timeSpentHours: 0,
    links: ['ПР-000077', 'INT-506'],
    comments: [],
    history: [
      {
        at: '2026-08-03T16:40:00+07:00',
        actorId: 'u-008',
        action: 'Создана по ошибке импорта',
        details: 'Найдены 3 дубля контактов',
        status: 'Новая'
      }
    ]
  }
];

const additionalCounterparties: Counterparty[] = [
  {
    id: 'КО-000326',
    name: 'АО "Уральский Банк Развития"',
    shortName: 'УБР',
    partyKind: 'ЮЛ',
    type: 'КО',
    status: 'Активен',
    inn: '6671180326',
    kpp: '667101001',
    ogrn: '1026600003260',
    region: 'Свердловская область',
    address: '620014, Екатеринбург, ул. Малышева, 44',
    curatorId: 'u-001',
    segment: 'Участник ПС МИР',
    riskScore: 24,
    lastTouch: '2026-08-02T12:10:00+07:00',
    nextControlDate: '2026-09-23',
    officialRequests: 1,
    penalties: 0,
    departments: ['Управление операционного сопровождения', 'Управление технологической интеграции'],
    services: [
      { service: 'ПС МИР', status: 'Подключен', stage: 'Промышленная эксплуатация', connectedAt: '2020-02-11', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 1, monthlyOperations: 2980000, slaHours: 24 },
      { service: 'СБП', status: 'Подключен', stage: 'Промышленная эксплуатация', connectedAt: '2024-04-15', ownerDepartment: 'Управление технологической интеграции', incidentCount: 0, monthlyOperations: 970000, slaHours: 16 }
    ],
    contacts: [{ id: 'c-101', name: 'Евгений Климов', position: 'Директор процессинга', phone: '+7 343 301-12-26', email: 'e.klimov@ubr.example', primary: true }]
  },
  {
    id: 'ТСП-000428',
    name: 'ООО "Аптечная сеть Забота"',
    shortName: 'Забота',
    partyKind: 'ЮЛ',
    type: 'ТСП',
    status: 'Подключение',
    inn: '7728428428',
    kpp: '772801001',
    ogrn: '1187746042800',
    region: 'Москва',
    address: '117437, Москва, ул. Профсоюзная, 93',
    curatorId: 'u-003',
    segment: 'Партнер Программы лояльности',
    riskScore: 31,
    lastTouch: '2026-08-01T16:25:00+07:00',
    nextControlDate: '2026-10-18',
    officialRequests: 0,
    penalties: 0,
    departments: ['Управление партнерских программ', 'Управление операционного сопровождения'],
    services: [{ service: 'Программа лояльности', status: 'Подключается', stage: 'Согласование механики кешбэка', ownerDepartment: 'Управление партнерских программ', incidentCount: 0, monthlyOperations: 0, slaHours: 48 }],
    contacts: [{ id: 'c-102', name: 'Алина Романова', position: 'CRM-директор', phone: '+7 495 228-42-80', email: 'a.romanova@zabota.example', primary: true }]
  },
  {
    id: 'ПСП-000119',
    name: 'ООО "Финтех Маршрут"',
    shortName: 'ФинМаршрут',
    partyKind: 'ЮЛ',
    type: 'ПСП',
    status: 'Риск',
    inn: '7705119119',
    kpp: '770501001',
    ogrn: '1167746011900',
    region: 'Москва',
    address: '115184, Москва, Озерковская наб., 30',
    curatorId: 'u-002',
    segment: 'Платежная система - партнер',
    riskScore: 62,
    lastTouch: '2026-07-31T18:10:00+07:00',
    nextControlDate: '2026-11-04',
    officialRequests: 4,
    penalties: 1,
    departments: ['Юридическое управление', 'Управление операционного сопровождения'],
    services: [{ service: 'МПС', status: 'На проверке', stage: 'Проверка операционного отчета', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 3, monthlyOperations: 640000, slaHours: 12 }],
    contacts: [{ id: 'c-103', name: 'Максим Громов', position: 'Операционный директор', phone: '+7 495 511-91-19', email: 'm.gromov@finroute.example', primary: true }]
  },
  {
    id: 'НКО-000260',
    name: 'НКО "Кошелек Плюс"',
    shortName: 'Кошелек Плюс',
    partyKind: 'ЮЛ',
    type: 'НКО',
    status: 'Пилот',
    inn: '7726260260',
    kpp: '772601001',
    ogrn: '1147746026000',
    region: 'Москва',
    address: '117105, Москва, Варшавское шоссе, 9',
    curatorId: 'u-002',
    segment: 'Участник СБП',
    riskScore: 37,
    lastTouch: '2026-08-03T10:40:00+07:00',
    nextControlDate: '2026-11-27',
    officialRequests: 2,
    penalties: 0,
    departments: ['Управление технологической интеграции', 'Управление операционного сопровождения'],
    services: [{ service: 'СБП', status: 'Пилот', stage: 'Пилот C2B-платежей', ownerDepartment: 'Управление технологической интеграции', incidentCount: 1, monthlyOperations: 42000, slaHours: 16 }],
    contacts: [{ id: 'c-104', name: 'Ирина Белова', position: 'Руководитель продукта', phone: '+7 495 260-26-00', email: 'i.belova@walletplus.example', primary: true }]
  },
  {
    id: 'ПР-000512',
    name: 'АО "Региональная транспортная карта"',
    shortName: 'РТК',
    partyKind: 'ЮЛ',
    type: 'Партнер',
    status: 'Активен',
    inn: '5402512512',
    kpp: '540201001',
    ogrn: '1125476005120',
    region: 'Новосибирская область',
    address: '630082, Новосибирск, ул. Дачная, 37',
    curatorId: 'u-003',
    segment: 'Транспортная процессинговая платформа',
    riskScore: 21,
    lastTouch: '2026-08-04T11:30:00+07:00',
    nextControlDate: '2026-12-16',
    officialRequests: 1,
    penalties: 0,
    departments: ['Управление технологической интеграции', 'Управление операционного сопровождения'],
    services: [{ service: 'Транспортная платформа', status: 'Подключен', stage: 'Промышленная эксплуатация', connectedAt: '2023-10-03', ownerDepartment: 'Управление технологической интеграции', incidentCount: 0, monthlyOperations: 386000, slaHours: 24 }],
    contacts: [{ id: 'c-105', name: 'Сергей Анисимов', position: 'Технический директор', phone: '+7 383 512-51-20', email: 's.anisimov@rtk.example', primary: true }]
  },
  {
    id: 'КО-000617',
    name: 'ПАО "Южный Коммерческий Банк"',
    shortName: 'ЮКБ',
    partyKind: 'ЮЛ',
    type: 'КО',
    status: 'Приостановлен',
    inn: '6163617617',
    kpp: '616301001',
    ogrn: '1026100006170',
    region: 'Ростовская область',
    address: '344002, Ростов-на-Дону, ул. Большая Садовая, 68',
    curatorId: 'u-001',
    segment: 'Участник ПС МИР',
    riskScore: 69,
    lastTouch: '2026-07-28T09:50:00+07:00',
    nextControlDate: '2027-01-14',
    officialRequests: 6,
    penalties: 2,
    departments: ['Юридическое управление', 'Управление операционного сопровождения'],
    services: [{ service: 'ПС МИР', status: 'Приостановлен', stage: 'Ожидание плана корректирующих действий', connectedAt: '2018-06-18', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 7, monthlyOperations: 720000, slaHours: 8 }],
    contacts: [{ id: 'c-106', name: 'Валерия Никитина', position: 'Руководитель операционного блока', phone: '+7 863 617-61-70', email: 'v.nikitina@ukb.example', primary: true }]
  },
  {
    id: 'ФЛ-000001',
    name: 'Александр Сергеевич Иванов',
    shortName: 'Иванов А.С.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Активен',
    inn: '540812900112',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Новосибирская область',
    address: 'Новосибирск, Заельцовский район',
    curatorId: 'u-001',
    segment: 'Держатель карты МИР',
    riskScore: 16,
    lastTouch: '2026-08-04T10:15:00+07:00',
    nextControlDate: '2026-09-30',
    officialRequests: 1,
    penalties: 0,
    departments: ['Центр клиентских коммуникаций', 'Управление операционного сопровождения'],
    birthDate: '1987-04-12',
    identityDocument: 'Паспорт **45 18',
    loyaltyId: 'MIR-384920',
    customerValue: 18400,
    preferredChannel: 'Чат',
    consentStatus: 'Получено',
    personalDataLevel: 'Расширенный',
    maskedCard: '2202 **** **** 4184',
    appealCategory: 'Начисление кешбэка',
    services: [{ service: 'Программа лояльности', status: 'Подключен', stage: 'Активный участник', connectedAt: '2025-09-12', ownerDepartment: 'Управление партнерских программ', incidentCount: 0, monthlyOperations: 18, slaHours: 24 }],
    contacts: [{ id: 'c-201', name: 'Александр Иванов', position: 'Клиент', phone: '+7 913 000-41-84', email: 'a.ivanov@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000002',
    name: 'Марина Викторовна Кузнецова',
    shortName: 'Кузнецова М.В.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Риск',
    inn: '772601234505',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Москва',
    address: 'Москва, район Чертаново Центральное',
    curatorId: 'u-002',
    segment: 'Пользователь СБП',
    riskScore: 58,
    lastTouch: '2026-08-03T19:25:00+07:00',
    nextControlDate: '2026-10-25',
    officialRequests: 3,
    penalties: 0,
    departments: ['Центр клиентских коммуникаций', 'Управление технологической интеграции'],
    birthDate: '1992-11-03',
    identityDocument: 'Паспорт **12 05',
    loyaltyId: 'SBP-102938',
    customerValue: 9200,
    preferredChannel: 'Телефон',
    consentStatus: 'Истекает',
    personalDataLevel: 'Чувствительный',
    maskedCard: '2202 **** **** 0905',
    appealCategory: 'Спорная операция СБП',
    services: [{ service: 'СБП', status: 'На проверке', stage: 'Разбор спорной операции', ownerDepartment: 'Управление технологической интеграции', incidentCount: 2, monthlyOperations: 9, slaHours: 8 }],
    contacts: [{ id: 'c-202', name: 'Марина Кузнецова', position: 'Клиент', phone: '+7 916 238-09-05', email: 'm.kuznetsova@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000003',
    name: 'Дмитрий Олегович Смирнов',
    shortName: 'Смирнов Д.О.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Подключение',
    inn: '781145678901',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Санкт-Петербург',
    address: 'Санкт-Петербург, Приморский район',
    curatorId: 'u-003',
    segment: 'Участник акции лояльности',
    riskScore: 22,
    lastTouch: '2026-08-02T14:20:00+07:00',
    nextControlDate: '2026-11-18',
    officialRequests: 1,
    penalties: 0,
    departments: ['Управление партнерских программ'],
    birthDate: '1981-07-24',
    identityDocument: 'Паспорт **78 01',
    loyaltyId: 'MIR-775410',
    customerValue: 12600,
    preferredChannel: 'Email',
    consentStatus: 'Получено',
    personalDataLevel: 'Базовый',
    maskedCard: '2200 **** **** 7011',
    appealCategory: 'Подключение акции',
    services: [{ service: 'Программа лояльности', status: 'Подключается', stage: 'Проверка участия в акции', ownerDepartment: 'Управление партнерских программ', incidentCount: 0, monthlyOperations: 4, slaHours: 24 }],
    contacts: [{ id: 'c-203', name: 'Дмитрий Смирнов', position: 'Клиент', phone: '+7 921 445-70-11', email: 'd.smirnov@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000004',
    name: 'Екатерина Андреевна Соколова',
    shortName: 'Соколова Е.А.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Пилот',
    inn: '667100456789',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Свердловская область',
    address: 'Екатеринбург, Верх-Исетский район',
    curatorId: 'u-001',
    segment: 'Тестовая группа транспортной платформы',
    riskScore: 19,
    lastTouch: '2026-08-01T09:30:00+07:00',
    nextControlDate: '2026-12-09',
    officialRequests: 0,
    penalties: 0,
    departments: ['Управление технологической интеграции'],
    birthDate: '1996-02-18',
    identityDocument: 'Паспорт **66 89',
    loyaltyId: 'TR-660018',
    customerValue: 5400,
    preferredChannel: 'Чат',
    consentStatus: 'Получено',
    personalDataLevel: 'Расширенный',
    maskedCard: '2202 **** **** 6689',
    appealCategory: 'Транспортная карта',
    services: [{ service: 'Транспортная платформа', status: 'Пилот', stage: 'Тестирование поездок по QR', ownerDepartment: 'Управление технологической интеграции', incidentCount: 0, monthlyOperations: 22, slaHours: 24 }],
    contacts: [{ id: 'c-204', name: 'Екатерина Соколова', position: 'Клиент', phone: '+7 912 840-66-89', email: 'e.sokolova@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000005',
    name: 'Роман Игоревич Волков',
    shortName: 'Волков Р.И.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Приостановлен',
    inn: '616300987654',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Ростовская область',
    address: 'Ростов-на-Дону, Кировский район',
    curatorId: 'u-002',
    segment: 'Пользователь СБП',
    riskScore: 64,
    lastTouch: '2026-07-30T20:00:00+07:00',
    nextControlDate: '2027-02-05',
    officialRequests: 2,
    penalties: 0,
    departments: ['Центр клиентских коммуникаций', 'Управление операционного сопровождения'],
    birthDate: '1979-05-30',
    identityDocument: 'Паспорт **61 54',
    loyaltyId: 'SBP-654321',
    customerValue: 3100,
    preferredChannel: 'Телефон',
    consentStatus: 'Не получено',
    personalDataLevel: 'Чувствительный',
    maskedCard: '2202 **** **** 6154',
    appealCategory: 'Блокировка операций',
    services: [{ service: 'СБП', status: 'Приостановлен', stage: 'Ожидание подтверждения личности', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 2, monthlyOperations: 0, slaHours: 8 }],
    contacts: [{ id: 'c-205', name: 'Роман Волков', position: 'Клиент', phone: '+7 928 761-61-54', email: 'r.volkov@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000006',
    name: 'Наталья Петровна Орлова',
    shortName: 'Орлова Н.П.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Активен',
    inn: '253600123456',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Приморский край',
    address: 'Владивосток, Ленинский район',
    curatorId: 'u-001',
    segment: 'Держатель карты МИР',
    riskScore: 12,
    lastTouch: '2026-08-03T12:05:00+07:00',
    nextControlDate: '2027-03-12',
    officialRequests: 0,
    penalties: 0,
    departments: ['Центр клиентских коммуникаций'],
    birthDate: '1988-09-16',
    identityDocument: 'Паспорт **25 56',
    loyaltyId: 'MIR-560012',
    customerValue: 21400,
    preferredChannel: 'Форма сайта',
    consentStatus: 'Получено',
    personalDataLevel: 'Базовый',
    maskedCard: '2202 **** **** 2556',
    appealCategory: 'Справка по операциям',
    services: [{ service: 'ПС МИР', status: 'Подключен', stage: 'Активный держатель', connectedAt: '2022-01-15', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 0, monthlyOperations: 36, slaHours: 24 }],
    contacts: [{ id: 'c-206', name: 'Наталья Орлова', position: 'Клиент', phone: '+7 924 018-25-56', email: 'n.orlova@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000007',
    name: 'Павел Максимович Беляев',
    shortName: 'Беляев П.М.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Риск',
    inn: '770100765432',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Москва',
    address: 'Москва, район Басманный',
    curatorId: 'u-002',
    segment: 'Пользователь СБП',
    riskScore: 55,
    lastTouch: '2026-08-04T08:45:00+07:00',
    nextControlDate: '2027-04-07',
    officialRequests: 4,
    penalties: 0,
    departments: ['Центр клиентских коммуникаций', 'Управление технологической интеграции'],
    birthDate: '1990-12-08',
    identityDocument: 'Паспорт **77 32',
    loyaltyId: 'SBP-770032',
    customerValue: 7600,
    preferredChannel: 'Чат',
    consentStatus: 'Истекает',
    personalDataLevel: 'Расширенный',
    maskedCard: '2202 **** **** 7732',
    appealCategory: 'Ошибочный перевод',
    services: [{ service: 'СБП', status: 'На проверке', stage: 'Запрос возврата ошибочного перевода', ownerDepartment: 'Управление технологической интеграции', incidentCount: 1, monthlyOperations: 12, slaHours: 8 }],
    contacts: [{ id: 'c-207', name: 'Павел Беляев', position: 'Клиент', phone: '+7 916 122-77-32', email: 'p.belyaev@example.mail', primary: true }]
  },
  {
    id: 'ФЛ-000008',
    name: 'Ольга Николаевна Захарова',
    shortName: 'Захарова О.Н.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Активен',
    inn: '540200678901',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Новосибирская область',
    address: 'Новосибирск, Октябрьский район',
    curatorId: 'u-003',
    segment: 'Участник акции лояльности',
    riskScore: 15,
    lastTouch: '2026-08-02T17:45:00+07:00',
    nextControlDate: '2027-05-19',
    officialRequests: 1,
    penalties: 0,
    departments: ['Управление партнерских программ', 'Центр клиентских коммуникаций'],
    birthDate: '1985-03-21',
    identityDocument: 'Паспорт **54 91',
    loyaltyId: 'MIR-118540',
    customerValue: 16800,
    preferredChannel: 'Email',
    consentStatus: 'Получено',
    personalDataLevel: 'Базовый',
    maskedCard: '2202 **** **** 5491',
    appealCategory: 'Кешбэк у партнера',
    services: [{ service: 'Программа лояльности', status: 'Подключен', stage: 'Активная акция', connectedAt: '2025-12-20', ownerDepartment: 'Управление партнерских программ', incidentCount: 0, monthlyOperations: 14, slaHours: 24 }],
    contacts: [{ id: 'c-208', name: 'Ольга Захарова', position: 'Клиент', phone: '+7 913 760-54-91', email: 'o.zakharova@example.mail', primary: true }]
  },
  {
    id: 'КО-009001',
    name: 'АО "Норд Капитал Банк"',
    shortName: 'Норд Капитал Банк',
    partyKind: 'ЮЛ',
    type: 'КО',
    status: 'Подключение',
    inn: '5408199001',
    kpp: '540801001',
    ogrn: '1025400009001',
    region: 'Новосибирская область',
    address: '630099, Новосибирск, Красный проспект, 29',
    curatorId: 'u-001',
    segment: 'Банк-участник СБП и ПС МИР',
    riskScore: 28,
    lastTouch: '2026-08-05T09:40:00+07:00',
    nextControlDate: '2026-09-08',
    officialRequests: 2,
    penalties: 0,
    departments: ['Управление операционного сопровождения', 'Управление технологической интеграции', 'Управление партнерских программ'],
    services: [
      { service: 'ПС МИР', status: 'Подключен', stage: 'Промышленная эксплуатация', connectedAt: '2021-06-18', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 0, monthlyOperations: 3860000, slaHours: 24 },
      { service: 'СБП', status: 'Подключается', stage: 'Проверка API-паспорта и тестового стенда', ownerDepartment: 'Управление технологической интеграции', incidentCount: 1, monthlyOperations: 0, slaHours: 16 },
      { service: 'Программа лояльности', status: 'На проверке', stage: 'Согласование правил начисления кешбэка', ownerDepartment: 'Управление партнерских программ', incidentCount: 0, monthlyOperations: 0, slaHours: 48 }
    ],
    contacts: [
      { id: 'c-901', name: 'Виктория Румянцева', position: 'Заместитель директора операционного блока', phone: '+7 383 900-19-01', email: 'v.rumyantseva@nordcapital.example', primary: true },
      { id: 'c-902', name: 'Артем Сафронов', position: 'Руководитель ИТ-интеграции', phone: '+7 383 900-19-02', email: 'a.safronov@nordcapital.example', primary: false }
    ]
  },
  {
    id: 'ФЛ-009001',
    name: 'Анна Павловна Лебедева',
    shortName: 'Лебедева А.П.',
    partyKind: 'ФЛ',
    type: 'ФЛ',
    status: 'Активен',
    inn: '540802990144',
    kpp: 'не применяется',
    ogrn: 'не применяется',
    region: 'Новосибирская область',
    address: 'Новосибирск, Центральный район',
    curatorId: 'u-001',
    segment: 'Премиальный пользователь СБП и лояльности',
    riskScore: 18,
    lastTouch: '2026-08-05T10:05:00+07:00',
    nextControlDate: '2026-10-07',
    officialRequests: 1,
    penalties: 0,
    departments: ['Центр клиентских коммуникаций', 'Управление операционного сопровождения', 'Управление партнерских программ'],
    birthDate: '1991-08-17',
    identityDocument: 'Паспорт **54 44',
    loyaltyId: 'MIR-900144',
    customerValue: 34200,
    preferredChannel: 'Чат',
    consentStatus: 'Получено',
    personalDataLevel: 'Расширенный',
    maskedCard: '2202 **** **** 0144',
    appealCategory: 'Не начислен кешбэк по операции СБП',
    services: [
      { service: 'СБП', status: 'На проверке', stage: 'Проверка начисления кешбэка по операции C2B', ownerDepartment: 'Управление операционного сопровождения', incidentCount: 1, monthlyOperations: 26, slaHours: 8 },
      { service: 'Программа лояльности', status: 'Подключен', stage: 'Премиальный уровень участия', connectedAt: '2024-11-02', ownerDepartment: 'Управление партнерских программ', incidentCount: 0, monthlyOperations: 31, slaHours: 24 }
    ],
    contacts: [{ id: 'c-903', name: 'Анна Лебедева', position: 'Клиент', phone: '+7 913 900-01-44', email: 'a.lebedeva@example.mail', primary: true }]
  }
];

const additionalTasks: Task[] = [
  {
    id: 'TASK-2090',
    title: 'Классифицировать обращение Кузнецовой М.В.',
    templateId: 'tt-appeal-classify',
    status: 'Выполнена',
    priority: 'Высокий',
    counterpartyId: 'ФЛ-000002',
    processId: 'BP-2026-0168',
    assigneeId: 'u-009',
    assigneeGroup: 'Центр клиентских коммуникаций',
    dueDate: '2026-08-04',
    createdAt: '2026-08-03T19:25:00+07:00',
    requiredFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    completedFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    fieldResults: {
      'Суть обращения': 'Клиент сообщает, что перевод СБП на 8 400 руб. списан дважды, получатель подтверждает только одно зачисление.',
      'Тип обращения': 'Спорная операция СБП',
      'Канал обращения': 'Телефон, запись call-20260803-1925.mp3',
      'Контакт/заявитель': 'Кузнецова Марина Викторовна, идентификация по карте и кодовому слову пройдена.'
    },
    timeSpentHours: 1.2,
    links: ['ФЛ-000002', 'BP-2026-0168'],
    comments: ['Обращение зарегистрировано из телефонии, согласие на обработку ПДн подтверждено.'],
    history: [{ at: '2026-08-03T19:26:00+07:00', actorId: 'u-002', action: 'Создана автоматически', details: 'Входящее обращение распознано телефонией', status: 'Новая' }, { at: '2026-08-03T22:10:00+07:00', actorId: 'u-002', action: 'Выполнена', details: 'Обращение передано в операционный контроль', status: 'Выполнена' }]
  },
  {
    id: 'TASK-2091',
    title: 'Проверить обращение Кузнецовой М.В. и подготовить решение',
    templateId: 'tt-appeal-resolution',
    status: 'В работе',
    priority: 'Критичный',
    counterpartyId: 'ФЛ-000002',
    processId: 'BP-2026-0168',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-05',
    createdAt: '2026-08-03T22:10:00+07:00',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение', 'Срок ответа клиенту'],
    completedFields: ['Причина обращения', 'Способ решения'],
    fieldResults: {
      'Причина обращения': 'В журнале СБП есть повторный callback от банка-получателя, требуется сверка статуса возврата.',
      'Способ решения': 'Операционная проверка статуса платежа и запрос уточнения в банк-получатель.'
    },
    timeSpentHours: 4.5,
    links: ['ФЛ-000002', 'BP-2026-0168', 'INT-507'],
    comments: ['Нужно сверить ответ банка-участника, выбрать решение и подготовить итог клиенту до 05.08.'],
    history: [{ at: '2026-08-03T22:10:00+07:00', actorId: 'u-005', action: 'Создана автоматически', details: 'Завершен этап классификации обращения', status: 'Новая' }]
  },
  { id: 'TASK-2092', title: 'Проверить состав данных профиля Иванова А.С.', templateId: 'tt-profile-actualization', status: 'Назначена', priority: 'Средний', counterpartyId: 'ФЛ-000001', processId: 'BP-2026-0171', assigneeId: 'u-005', assigneeGroup: 'Управление операционного сопровождения', dueDate: '2026-08-05', createdAt: '2026-08-04T10:15:00+07:00', requiredFields: ['Реквизиты или документ', 'Контакты', 'Согласия'], completedFields: ['Контакты'], timeSpentHours: 0.8, links: ['ФЛ-000001', 'BP-2026-0171', 'INT-508'], comments: ['Проверить срок согласия ПДн и актуальность email перед запросом подтверждения.'], history: [{ at: '2026-08-04T10:15:00+07:00', actorId: 'u-001', action: 'Создана автоматически', details: 'Плановая актуализация профиля по таймеру', status: 'Новая' }] },
  { id: 'TASK-2071', title: 'Проверить согласие ПДн Иванова А.С.', templateId: 'tt-verify-profile', status: 'В работе', priority: 'Средний', counterpartyId: 'ФЛ-000001', assigneeId: 'u-009', assigneeGroup: 'Центр клиентских коммуникаций', dueDate: '2026-08-06', createdAt: '2026-08-04T09:10:00+07:00', requiredFields: ['Согласие ПДн', 'Канал связи'], completedFields: ['Канал связи'], timeSpentHours: 1.5, links: ['ФЛ-000001'], comments: ['Клиент подтвердил канал в чате.'], history: [{ at: '2026-08-04T09:10:00+07:00', actorId: 'u-001', action: 'Создана через обращение ФЛ', details: 'Проверка согласия на обработку ПДн', status: 'Новая' }] },
  { id: 'TASK-2072', title: 'Разобрать спорную операцию СБП Кузнецовой М.В.', templateId: 'tt-api-passport', status: 'Ожидание', priority: 'Критичный', counterpartyId: 'ФЛ-000002', assigneeId: 'u-004', assigneeGroup: 'Управление технологической интеграции', dueDate: '2026-08-03', createdAt: '2026-08-02T18:30:00+07:00', requiredFields: ['ID операции', 'Ответ банка', 'Решение'], completedFields: ['ID операции'], timeSpentHours: 5, links: ['ФЛ-000002'], comments: ['Ожидается ответ банка-участника.'], history: [{ at: '2026-08-04T08:30:00+07:00', actorId: 'u-006', action: 'Эскалация', details: 'Просрочка клиентского обращения', status: 'Ожидание' }] },
  { id: 'TASK-2073', title: 'Подключить Смирнова Д.О. к акции лояльности', templateId: 'tt-marketing-budget', status: 'Назначена', priority: 'Средний', counterpartyId: 'ФЛ-000003', assigneeId: 'u-010', assigneeGroup: 'Управление партнерских программ', dueDate: '2026-08-09', createdAt: '2026-08-04T09:30:00+07:00', requiredFields: ['Условия акции', 'Лимит кешбэка'], completedFields: [], timeSpentHours: 0, links: ['ФЛ-000003'], comments: [], history: [{ at: '2026-08-04T09:30:00+07:00', actorId: 'u-003', action: 'Создана по форме сайта', details: 'Клиент запросил участие в акции', status: 'Новая' }] },
  { id: 'TASK-2074', title: 'Проверить пилот транспортной карты Соколовой Е.А.', templateId: 'tt-launch-control', status: 'В работе', priority: 'Низкий', counterpartyId: 'ФЛ-000004', assigneeId: 'u-004', assigneeGroup: 'Управление технологической интеграции', dueDate: '2026-08-10', createdAt: '2026-08-01T09:35:00+07:00', requiredFields: ['QR-поездка', 'Логи валидации'], completedFields: ['QR-поездка'], timeSpentHours: 2, links: ['ФЛ-000004'], comments: ['Первая поездка прошла успешно.'], history: [{ at: '2026-08-01T09:35:00+07:00', actorId: 'u-004', action: 'Назначена', details: 'Пилотный клиент транспортной платформы', status: 'Назначена' }] },
  { id: 'TASK-2075', title: 'Подтвердить личность Волкова Р.И.', templateId: 'tt-verify-profile', status: 'Ожидание', priority: 'Высокий', counterpartyId: 'ФЛ-000005', assigneeId: 'u-013', assigneeGroup: 'Центр клиентских коммуникаций', dueDate: '2026-08-05', createdAt: '2026-08-03T20:10:00+07:00', requiredFields: ['Документ', 'Контрольный звонок'], completedFields: ['Контрольный звонок'], timeSpentHours: 1, links: ['ФЛ-000005'], comments: ['Клиенту отправлена ссылка подтверждения.'], history: [{ at: '2026-08-03T20:10:00+07:00', actorId: 'u-002', action: 'Создана по блокировке операций', details: 'Требуется подтверждение личности', status: 'Новая' }] },
  { id: 'TASK-2076', title: 'Подготовить справку по операциям Орловой Н.П.', templateId: 'tt-verify-profile', status: 'Новая', priority: 'Низкий', counterpartyId: 'ФЛ-000006', assigneeGroup: 'Центр клиентских коммуникаций', dueDate: '2026-08-11', createdAt: '2026-08-03T12:10:00+07:00', requiredFields: ['Период операций', 'Канал выдачи'], completedFields: [], timeSpentHours: 0, links: ['ФЛ-000006'], comments: [], history: [{ at: '2026-08-03T12:10:00+07:00', actorId: 'u-001', action: 'Создана из формы сайта', details: 'Запрос справки по операциям', status: 'Новая' }] },
  { id: 'TASK-2077', title: 'Запросить возврат ошибочного перевода Беляева П.М.', templateId: 'tt-api-passport', status: 'В работе', priority: 'Высокий', counterpartyId: 'ФЛ-000007', assigneeId: 'u-004', assigneeGroup: 'Управление технологической интеграции', dueDate: '2026-08-06', createdAt: '2026-08-04T08:50:00+07:00', requiredFields: ['Банк получателя', 'ID перевода', 'Статус запроса'], completedFields: ['ID перевода'], timeSpentHours: 2, links: ['ФЛ-000007'], comments: ['Запрос ушел в банк получателя.'], history: [{ at: '2026-08-04T08:50:00+07:00', actorId: 'u-002', action: 'Создана по обращению', details: 'Ошибочный перевод СБП', status: 'Новая' }] },
  { id: 'TASK-2078', title: 'Проверить кешбэк Захаровой О.Н. у партнера', templateId: 'tt-marketing-budget', status: 'На проверке', priority: 'Средний', counterpartyId: 'ФЛ-000008', assigneeId: 'u-010', assigneeGroup: 'Управление партнерских программ', dueDate: '2026-08-07', createdAt: '2026-08-02T17:50:00+07:00', requiredFields: ['Чек', 'Правило акции', 'Решение'], completedFields: ['Чек', 'Правило акции'], timeSpentHours: 3, links: ['ФЛ-000008', 'ТСП-000311'], comments: ['Проверяется MCC партнера.'], history: [{ at: '2026-08-02T17:50:00+07:00', actorId: 'u-003', action: 'Создана по обращению', details: 'Не начислен кешбэк', status: 'Новая' }] },
  { id: 'TASK-2079', title: 'Согласовать SLA по УБР', templateId: 'tt-launch-control', status: 'Новая', priority: 'Средний', counterpartyId: 'КО-000326', assigneeId: 'u-012', assigneeGroup: 'Управление операционного сопровождения', dueDate: '2026-08-12', createdAt: '2026-08-04T10:00:00+07:00', requiredFields: ['SLA-метрики', 'Ответственный банка'], completedFields: [], timeSpentHours: 0, links: ['КО-000326'], comments: [], history: [{ at: '2026-08-04T10:00:00+07:00', actorId: 'u-001', action: 'Создана вручную', details: 'Плановый контроль SLA', status: 'Новая' }] },
  { id: 'TASK-2080', title: 'Проверить механику акции сети Забота', templateId: 'tt-marketing-budget', status: 'Назначена', priority: 'Средний', counterpartyId: 'ТСП-000428', assigneeId: 'u-010', assigneeGroup: 'Управление партнерских программ', dueDate: '2026-08-11', createdAt: '2026-08-01T16:40:00+07:00', requiredFields: ['Механика', 'Бюджет', 'Период'], completedFields: ['Механика'], timeSpentHours: 1, links: ['ТСП-000428'], comments: ['Уточняется лимит кешбэка.'], history: [{ at: '2026-08-01T16:40:00+07:00', actorId: 'u-003', action: 'Создана по процессу акции', details: 'Подключение партнера', status: 'Новая' }] },
  { id: 'TASK-2081', title: 'Подготовить уведомление ФинМаршрут', templateId: 'tt-legal-notice', status: 'В работе', priority: 'Критичный', counterpartyId: 'ПСП-000119', assigneeId: 'u-007', assigneeGroup: 'Юридическое управление', dueDate: '2026-08-05', createdAt: '2026-08-01T18:15:00+07:00', requiredFields: ['Основание', 'Расчет', 'Срок ответа'], completedFields: ['Основание'], timeSpentHours: 4, links: ['ПСП-000119', 'TASK-2925'], taskRelations: [{ taskId: 'TASK-2925', relationType: 'Порождает', comment: 'После уведомления нужен контроль реакции контрагента и решения по штрафу.', createdAt: '2026-08-05T11:45:00+07:00', createdBy: 'u-007' }], comments: ['Нужен финальный расчет повторности нарушения.'], history: [{ at: '2026-08-01T18:15:00+07:00', actorId: 'u-001', action: 'Создана по нарушению SLA', details: 'Инциденты в операционном отчете', status: 'Новая' }] },
  { id: 'TASK-2082', title: 'Проверить C2B-пилот Кошелек Плюс', templateId: 'tt-api-passport', status: 'Ожидание', priority: 'Высокий', counterpartyId: 'НКО-000260', assigneeId: 'u-004', assigneeGroup: 'Управление технологической интеграции', dueDate: '2026-08-08', createdAt: '2026-08-03T10:45:00+07:00', requiredFields: ['Тестовый сценарий', 'Логи платежей'], completedFields: ['Тестовый сценарий'], timeSpentHours: 2.5, links: ['НКО-000260'], comments: ['Ждем повторный прогон от НКО.'], history: [{ at: '2026-08-03T10:45:00+07:00', actorId: 'u-004', action: 'Назначена', details: 'Пилотный C2B-сценарий', status: 'Назначена' }] },
  { id: 'TASK-2083', title: 'Обновить регламент обмена с РТК', templateId: 'tt-verify-profile', status: 'Выполнена', priority: 'Низкий', counterpartyId: 'ПР-000512', assigneeId: 'u-005', assigneeGroup: 'Управление операционного сопровождения', dueDate: '2026-08-02', createdAt: '2026-07-30T11:00:00+07:00', requiredFields: ['Регламент', 'Ответственный'], completedFields: ['Регламент', 'Ответственный'], timeSpentHours: 3, links: ['ПР-000512'], comments: ['Регламент обновлен в wiki.'], history: [{ at: '2026-08-01T15:00:00+07:00', actorId: 'u-005', action: 'Выполнена', details: 'Регламент обмена обновлен', status: 'Выполнена' }] },
  { id: 'TASK-2084', title: 'Контроль плана корректирующих действий ЮКБ', templateId: 'tt-legal-notice', status: 'Ожидание', priority: 'Критичный', counterpartyId: 'КО-000617', assigneeId: 'u-007', assigneeGroup: 'Юридическое управление', dueDate: '2026-08-03', createdAt: '2026-07-29T09:55:00+07:00', requiredFields: ['План КД', 'Подтверждение банка'], completedFields: ['План КД'], timeSpentHours: 8, links: ['КО-000617'], comments: ['Банк не подтвердил срок восстановления.'], history: [{ at: '2026-08-04T08:00:00+07:00', actorId: 'u-006', action: 'Эскалация', details: 'Просрочка плана корректирующих действий', status: 'Ожидание' }] },
  {
    id: 'TASK-2901',
    title: 'Проверить единый профиль Норд Капитал Банк перед подключением СБП',
    templateId: 'tt-verify-profile',
    status: 'Выполнена',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0901',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-05',
    createdAt: '2026-08-05T09:40:00+07:00',
    requiredFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    completedFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    timeSpentHours: 1.6,
    links: ['КО-009001', 'BP-2026-0901', 'DOC-9901'],
    comments: [
      'Профиль заполнен: ИНН, КПП, ОГРН, основной контакт операционного блока и ИТ-контакт подтверждены.',
      'Действующий сервис ПС МИР без инцидентов, по СБП открыто подключение в рамках BP-2026-0901.'
    ],
    history: [
      { at: '2026-08-05T09:40:00+07:00', actorId: 'u-001', action: 'Создана автоматически', details: 'Запуск процесса подключения Норд Капитал Банк к СБП', status: 'Новая' },
      { at: '2026-08-05T10:05:00+07:00', actorId: 'u-005', action: 'Взята в работу', details: 'Проверены реквизиты, карточка контактов и сервисы', status: 'В работе' },
      { at: '2026-08-05T11:15:00+07:00', actorId: 'u-005', action: 'Выполнена', details: 'Профиль валидирован, процесс переведен на технологическую проверку', status: 'Выполнена' }
    ]
  },
  {
    id: 'TASK-2902',
    title: 'Проверить API-паспорт СБП и тестовый стенд Норд Капитал Банк',
    templateId: 'tt-api-passport',
    status: 'В работе',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0901',
    assigneeId: 'u-004',
    assigneeGroup: 'Управление технологической интеграции',
    dueDate: '2026-08-07',
    createdAt: '2026-08-05T11:15:00+07:00',
    requiredFields: ['API-паспорт', 'Тестовый стенд', 'Контакт ИТ'],
    completedFields: ['API-паспорт', 'Контакт ИТ'],
    timeSpentHours: 2.3,
    links: ['КО-009001', 'BP-2026-0901', 'DOC-9902', 'INT-5901', 'TASK-2915'],
    taskRelations: [{ taskId: 'TASK-2915', relationType: 'Зависит от', comment: 'Повторный C2B-прогон зависит от подтвержденного окна тестирования.', createdAt: '2026-08-05T11:42:00+07:00', createdBy: 'u-004' }],
    comments: [
      'API-паспорт v1 получен, ответственный ИТ подтвержден. Остался повторный прогон C2B-сценария на тестовом стенде.',
      'После выполнения система должна создать задачу промышленного запуска для операционного контроля.'
    ],
    history: [
      { at: '2026-08-05T11:15:00+07:00', actorId: 'u-005', action: 'Создана автоматически', details: 'Завершена проверка единого профиля Норд Капитал Банк', status: 'Новая' },
      { at: '2026-08-05T11:40:00+07:00', actorId: 'u-004', action: 'Взята в работу', details: 'Проверяются endpoint, сертификат и тестовый стенд', status: 'В работе' }
    ]
  },
  {
    id: 'TASK-2903',
    title: 'Классифицировать обращение Лебедевой А.П. по кешбэку СБП',
    templateId: 'tt-appeal-classify',
    status: 'Выполнена',
    priority: 'Высокий',
    counterpartyId: 'ФЛ-009001',
    processId: 'BP-2026-0902',
    assigneeId: 'u-009',
    assigneeGroup: 'Центр клиентских коммуникаций',
    dueDate: '2026-08-05',
    createdAt: '2026-08-05T10:05:00+07:00',
    requiredFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    completedFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    fieldResults: {
      'Суть обращения': 'Клиент прислал чек C2B-операции на 4 850 руб.; ожидаемый кешбэк по акции партнера не начислен.',
      'Тип обращения': 'Не начислен кешбэк по операции СБП',
      'Канал обращения': 'Чат, запись chat-20260805-1005.txt',
      'Контакт/заявитель': 'Лебедева Анна Павловна, идентификация по loyaltyId MIR-900144.'
    },
    timeSpentHours: 0.7,
    links: ['ФЛ-009001', 'BP-2026-0902', 'DOC-9903', 'TASK-2904'],
    taskRelations: [{ taskId: 'TASK-2904', relationType: 'Порождает', comment: 'После классификации создана задача операционной проверки и ответа клиенту.', createdAt: '2026-08-05T10:34:00+07:00', createdBy: 'u-002' }],
    comments: [
      'Обращение зарегистрировано из чата: чек получен, тип определен, согласие ПДн подтверждено.'
    ],
    history: [
      { at: '2026-08-05T10:05:00+07:00', actorId: 'u-002', action: 'Создана автоматически', details: 'Чат сопоставил обращение с карточкой ФЛ-009001', status: 'Новая' },
      { at: '2026-08-05T10:34:00+07:00', actorId: 'u-002', action: 'Выполнена', details: 'Обращение передано на операционную проверку начисления', status: 'Выполнена' }
    ]
  },
  {
    id: 'TASK-2904',
    title: 'Проверить начисление кешбэка Лебедевой А.П. и подготовить ответ',
    templateId: 'tt-appeal-resolution',
    status: 'В работе',
    priority: 'Высокий',
    counterpartyId: 'ФЛ-009001',
    processId: 'BP-2026-0902',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-06',
    createdAt: '2026-08-05T10:34:00+07:00',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение', 'Срок ответа клиенту'],
    completedFields: ['Причина обращения', 'Способ решения'],
    fieldResults: {
      'Причина обращения': 'Операция прошла как C2B, но правило акции не применилось из-за задержки выгрузки партнера.',
      'Способ решения': 'Сверить выгрузку партнера, подтвердить право на кешбэк и подготовить доначисление.'
    },
    timeSpentHours: 1.9,
    links: ['ФЛ-009001', 'BP-2026-0902', 'INT-5902', 'TASK-2903'],
    taskRelations: [{ taskId: 'TASK-2903', relationType: 'Основание', comment: 'Основание для операционной проверки - классифицированное обращение клиента.', createdAt: '2026-08-05T10:34:00+07:00', createdBy: 'u-002' }],
    comments: [
      'Причина обращения предварительно подтверждена: операция прошла как C2B, но правило акции не применилось из-за задержки выгрузки партнера.',
      'Нужно заполнить способ решения, итоговое решение и срок ответа, чтобы создать задачу закрытия обращения в контактном центре.'
    ],
    history: [
      { at: '2026-08-05T10:34:00+07:00', actorId: 'u-002', action: 'Создана автоматически', details: 'Завершена классификация клиентского обращения', status: 'Новая' },
      { at: '2026-08-05T11:05:00+07:00', actorId: 'u-005', action: 'Взята в работу', details: 'Проверяются операция СБП, правило акции и ответ партнера', status: 'В работе' }
    ]
  },
  {
    id: 'TASK-2910',
    title: 'Проверить договорной пакет Норд Капитал Банк',
    templateId: 'tt-contract-package',
    status: 'Выполнена',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0910',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-05',
    createdAt: '2026-08-05T12:00:00+07:00',
    requiredFields: ['Реквизиты контрагента', 'Перечень сервисов', 'Контакт подписанта'],
    completedFields: ['Реквизиты контрагента', 'Перечень сервисов', 'Контакт подписанта'],
    timeSpentHours: 1.4,
    links: ['КО-009001', 'BP-2026-0910', 'DOC-9910'],
    comments: ['Пакет проверен: сервисы СБП и лояльность, подписант Виктория Румянцева, реквизиты совпадают с единым профилем.'],
    history: [
      { at: '2026-08-05T12:00:00+07:00', actorId: 'u-001', action: 'Создана автоматически', details: 'Запущен договорной процесс Норд Капитал Банк', status: 'Новая' },
      { at: '2026-08-05T13:20:00+07:00', actorId: 'u-005', action: 'Выполнена', details: 'Договорной пакет передан в юридическое сопровождение', status: 'Выполнена' }
    ]
  },
  {
    id: 'TASK-2911',
    title: 'Согласовать договорные условия обслуживания Норд Капитал Банк',
    templateId: 'tt-contract-terms',
    status: 'В работе',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0910',
    assigneeId: 'u-007',
    assigneeGroup: 'Юридическое управление',
    dueDate: '2026-08-06',
    createdAt: '2026-08-05T13:20:00+07:00',
    requiredFields: ['Тарифный пакет', 'SLA обслуживания', 'Ограничения и особые условия'],
    completedFields: ['Тарифный пакет'],
    timeSpentHours: 2.2,
    links: ['КО-009001', 'BP-2026-0910', 'DOC-9910', 'INT-5910', 'TASK-2916'],
    taskRelations: [{ taskId: 'TASK-2916', relationType: 'Порождает', comment: 'Для проверки особых условий создано внутреннее поручение юридическому управлению.', createdAt: '2026-08-05T13:30:00+07:00', createdBy: 'u-005' }],
    comments: ['Юридическое управление проверяет SLA 16 часов по СБП и особые условия по программе лояльности. Текст договора ведется во внешней СЭД.'],
    history: [
      { at: '2026-08-05T13:20:00+07:00', actorId: 'u-005', action: 'Создана автоматически', details: 'Завершена проверка договорного пакета', status: 'Новая' },
      { at: '2026-08-05T13:35:00+07:00', actorId: 'u-007', action: 'Взята в работу', details: 'Проверяются тарифный пакет, SLA и особые условия обслуживания', status: 'В работе' }
    ]
  },
  {
    id: 'TASK-2915',
    title: 'Уточнить окно тестирования СБП после встречи с Норд Капитал Банк',
    templateId: 'tt-communication-followup',
    status: 'Назначена',
    priority: 'Средний',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0901',
    assigneeId: 'u-004',
    assigneeGroup: 'Управление технологической интеграции',
    dueDate: '2026-08-06',
    createdAt: '2026-08-05T09:25:00+07:00',
    requiredFields: ['Итог коммуникации', 'Следующий шаг', 'Ответственный'],
    completedFields: ['Итог коммуникации'],
    timeSpentHours: 0.3,
    links: ['КО-009001', 'BP-2026-0901', 'COM-7901', 'TASK-2902'],
    taskRelations: [{ taskId: 'TASK-2902', relationType: 'Блокирует', comment: 'Без подтверждения окна тестирования нельзя закрыть технологическую проверку API-паспорта.', createdAt: '2026-08-05T11:42:00+07:00', createdBy: 'u-004' }],
    comments: ['Follow-up создан по итогам встречи: подтвердить окно повторного C2B-теста 07.08 и ответственного ИТ.'],
    history: [{ at: '2026-08-05T09:25:00+07:00', actorId: 'u-001', action: 'Создана из коммуникации', details: 'Итоги встречи Норд Капитал Банк требуют действия технологической интеграции', status: 'Новая' }]
  },
  {
    id: 'TASK-2916',
    title: 'Подготовить позицию юристов по условиям договора Норд Капитал Банк',
    templateId: 'tt-internal-handoff',
    status: 'В работе',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0910',
    assigneeId: 'u-007',
    assigneeGroup: 'Юридическое управление',
    dueDate: '2026-08-06',
    createdAt: '2026-08-05T13:30:00+07:00',
    requiredFields: ['Запрошенное действие', 'Результат подразделения', 'Комментарий для инициатора'],
    completedFields: ['Запрошенное действие'],
    timeSpentHours: 1.1,
    links: ['КО-009001', 'BP-2026-0910', 'HND-9101', 'TASK-2911'],
    taskRelations: [{ taskId: 'TASK-2911', relationType: 'Основание', comment: 'Поручение создано из задачи согласования договорных условий.', createdAt: '2026-08-05T13:30:00+07:00', createdBy: 'u-005' }],
    comments: ['Поручение от операционного контроля: проверить особые условия договора без переноса текста договора в CRM.'],
    history: [{ at: '2026-08-05T13:30:00+07:00', actorId: 'u-005', action: 'Создана по внутреннему поручению', details: 'Требуется позиция юридического сопровождения по условиям Норд Капитал Банк', status: 'Новая' }]
  },
  {
    id: 'TASK-2920',
    title: 'Закрыть обращение Лебедевой А.П. и проверить удовлетворенность',
    templateId: 'tt-satisfaction-control',
    status: 'Назначена',
    priority: 'Средний',
    counterpartyId: 'ФЛ-009001',
    processId: 'BP-2026-0902',
    assigneeId: 'u-013',
    assigneeGroup: 'Центр клиентских коммуникаций',
    dueDate: '2026-08-07',
    createdAt: '2026-08-05T15:20:00+07:00',
    requiredFields: ['Итоговый ответ', 'Канал ответа', 'Оценка/подтверждение клиента', 'Причина закрытия'],
    completedFields: ['Итоговый ответ', 'Канал ответа'],
    fieldResults: {
      'Итоговый ответ': 'Клиенту подготовлен ответ о доначислении кешбэка после подтверждения операции партнером.',
      'Канал ответа': 'Чат'
    },
    timeSpentHours: 0.4,
    links: ['ФЛ-009001', 'BP-2026-0902', 'COM-7902'],
    comments: ['Клиенту подготовлен ответ о доначислении кешбэка. Нужно зафиксировать оценку и закрыть обращение.'],
    history: [{ at: '2026-08-05T15:20:00+07:00', actorId: 'u-005', action: 'Создана автоматически', details: 'Управление операционного сопровождения подготовило решение по обращению', status: 'Новая' }]
  },
  {
    id: 'TASK-2930',
    title: 'Классифицировать обращение Норд Капитал Банк по сроку тестового запуска СБП',
    templateId: 'tt-appeal-classify',
    status: 'Выполнена',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0903',
    assigneeId: 'u-009',
    assigneeGroup: 'Центр клиентских коммуникаций',
    dueDate: '2026-08-05',
    createdAt: '2026-08-05T16:05:00+07:00',
    requiredFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    completedFields: ['Суть обращения', 'Тип обращения', 'Канал обращения', 'Контакт/заявитель'],
    fieldResults: {
      'Суть обращения': 'ЮЛ просит перенести окно тестового запуска СБП с 07.08 на 09.08 и подтвердить, не сорвет ли перенос план подключения.',
      'Тип обращения': 'Изменение срока операционного этапа',
      'Канал обращения': 'Email Gateway, письмо от 05.08 16:04',
      'Контакт/заявитель': 'Виктория Румянцева, заместитель директора операционного блока Норд Капитал Банк.'
    },
    timeSpentHours: 0.6,
    links: ['КО-009001', 'BP-2026-0903', 'COM-7905', 'INT-5912', 'TASK-2931'],
    taskRelations: [{ taskId: 'TASK-2931', relationType: 'Порождает', comment: 'После классификации создана задача подготовки решения по переносу тестового запуска.', createdAt: '2026-08-05T16:32:00+07:00', createdBy: 'u-002' }],
    comments: ['Обращение ЮЛ зарегистрировано из входящего письма и связано с процессом подключения СБП BP-2026-0901.'],
    history: [
      { at: '2026-08-05T16:05:00+07:00', actorId: 'u-001', action: 'Создана автоматически', details: 'Email Gateway сопоставил письмо с карточкой Норд Капитал Банк', status: 'Новая' },
      { at: '2026-08-05T16:32:00+07:00', actorId: 'u-002', action: 'Выполнена', details: 'Обращение ЮЛ передано в операционный контроль для решения по сроку', status: 'Выполнена' }
    ]
  },
  {
    id: 'TASK-2931',
    title: 'Подготовить решение по обращению Норд Капитал Банк о переносе тестового запуска СБП',
    templateId: 'tt-appeal-resolution',
    status: 'В работе',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0903',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-07',
    createdAt: '2026-08-05T16:32:00+07:00',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение', 'Срок ответа клиенту'],
    completedFields: ['Причина обращения'],
    fieldResults: {
      'Причина обращения': 'На стороне банка не подтверждено окно доступности ИТ-команды 07.08, требуется оценить влияние переноса на промышленный запуск.'
    },
    timeSpentHours: 1.1,
    links: ['КО-009001', 'BP-2026-0903', 'BP-2026-0901', 'COM-7905', 'INT-5912', 'TASK-2930'],
    taskRelations: [{ taskId: 'TASK-2930', relationType: 'Основание', comment: 'Решение готовится на основании классифицированного обращения ЮЛ.', createdAt: '2026-08-05T16:32:00+07:00', createdBy: 'u-002' }],
    comments: ['Нужно согласовать перенос с технологической интеграцией, выбрать способ решения и подготовить официальный ответ ЮЛ до 07.08.'],
    history: [
      { at: '2026-08-05T16:32:00+07:00', actorId: 'u-002', action: 'Создана автоматически', details: 'Завершена классификация обращения Норд Капитал Банк', status: 'Новая' },
      { at: '2026-08-05T16:45:00+07:00', actorId: 'u-005', action: 'Взята в работу', details: 'Проверяется влияние переноса окна тестирования на маршрут подключения СБП', status: 'В работе' }
    ]
  },
  {
    id: 'TASK-2921',
    title: 'Запросить подтверждение согласия ПДн у Смирнова Д.О.',
    templateId: 'tt-consent-refresh',
    status: 'Ожидание',
    priority: 'Средний',
    counterpartyId: 'ФЛ-000003',
    assigneeId: 'u-009',
    assigneeGroup: 'Центр клиентских коммуникаций',
    dueDate: '2026-08-08',
    createdAt: '2026-08-05T09:50:00+07:00',
    requiredFields: ['Канал запроса', 'Подтверждение клиента', 'Срок действия согласия'],
    completedFields: ['Канал запроса'],
    timeSpentHours: 0.6,
    links: ['ФЛ-000003'],
    comments: ['Запрос направлен в мобильный чат. Ждем подтверждение расширенного согласия для участия в акции лояльности.'],
    history: [{ at: '2026-08-05T09:50:00+07:00', actorId: 'u-001', action: 'Создана по актуализации профиля', details: 'Перед подключением акции нужно обновить согласие клиента', status: 'Новая' }]
  },
  {
    id: 'TASK-2922',
    title: 'Опубликовать изменения профиля Иванова А.С. в целевых системах',
    templateId: 'tt-profile-publish',
    status: 'В работе',
    priority: 'Средний',
    counterpartyId: 'ФЛ-000001',
    processId: 'BP-2026-0171',
    assigneeId: 'u-011',
    assigneeGroup: 'Управление сопровождения корпоративных систем',
    dueDate: '2026-08-07',
    createdAt: '2026-08-05T12:10:00+07:00',
    requiredFields: ['Результат DWH', 'Журналирование', 'Контроль дублей'],
    completedFields: ['Журналирование'],
    timeSpentHours: 1.3,
    links: ['ФЛ-000001', 'BP-2026-0171', 'INT-508'],
    comments: ['Изменения контактов приняты, проверяется публикация в DWH и отсутствие дублей профиля.'],
    history: [{ at: '2026-08-05T12:10:00+07:00', actorId: 'u-005', action: 'Создана автоматически', details: 'Завершен этап проверки состава данных профиля', status: 'Новая' }]
  },
  {
    id: 'TASK-2923',
    title: 'Запросить подтверждение реквизитов у ЮКБ',
    templateId: 'tt-legal-profile-request',
    status: 'Ожидание',
    priority: 'Высокий',
    counterpartyId: 'КО-000617',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-09',
    createdAt: '2026-08-05T14:05:00+07:00',
    requiredFields: ['Адресат запроса', 'Подтвержденные реквизиты', 'Контрольный срок ответа'],
    completedFields: ['Адресат запроса', 'Контрольный срок ответа'],
    timeSpentHours: 1,
    links: ['КО-000617', 'COM-7021'],
    comments: ['Запрос направлен операционному директору ЮКБ. Подтверждение нужно до обновления карточки и плана корректирующих действий.'],
    history: [{ at: '2026-08-05T14:05:00+07:00', actorId: 'u-001', action: 'Создана вручную', details: 'Из коммуникации выявлены расхождения в контактных лицах ЮКБ', status: 'Новая' }]
  },
  {
    id: 'TASK-2924',
    title: 'Проконтролировать запуск акции сети Забота',
    templateId: 'tt-marketing-launch-control',
    status: 'На проверке',
    priority: 'Средний',
    counterpartyId: 'ТСП-000428',
    assigneeId: 'u-010',
    assigneeGroup: 'Управление партнерских программ',
    dueDate: '2026-08-10',
    createdAt: '2026-08-05T16:30:00+07:00',
    requiredFields: ['Дата старта акции', 'Готовность каналов', 'Метрики первого дня'],
    completedFields: ['Дата старта акции', 'Готовность каналов'],
    timeSpentHours: 1.8,
    links: ['ТСП-000428', 'DOC-930'],
    comments: ['Каналы готовы, ожидаются метрики первого дня по операциям и начислению кешбэка.'],
    history: [{ at: '2026-08-05T16:30:00+07:00', actorId: 'u-003', action: 'Создана по процессу акции', details: 'Параметры акции согласованы, нужен контроль запуска', status: 'Новая' }]
  },
  {
    id: 'TASK-2925',
    title: 'Проконтролировать реакцию ФинМаршрут на уведомление SLA',
    templateId: 'tt-penalty-response-control',
    status: 'В работе',
    priority: 'Критичный',
    counterpartyId: 'ПСП-000119',
    assigneeId: 'u-012',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-06',
    createdAt: '2026-08-05T11:45:00+07:00',
    requiredFields: ['Ответ контрагента', 'План корректирующих действий', 'Решение по штрафу'],
    completedFields: ['Ответ контрагента'],
    timeSpentHours: 2.1,
    links: ['ПСП-000119', 'TASK-2081', 'DOC-905'],
    taskRelations: [{ taskId: 'TASK-2081', relationType: 'Основание', comment: 'Контроль реакции открыт после подготовки юридического уведомления.', createdAt: '2026-08-05T11:45:00+07:00', createdBy: 'u-007' }],
    comments: ['Получен предварительный ответ без плана корректирующих действий. Нужно определить решение по штрафу.'],
    history: [{ at: '2026-08-05T11:45:00+07:00', actorId: 'u-007', action: 'Создана автоматически', details: 'Юридическое уведомление отправлено контрагенту', status: 'Новая' }]
  },
  {
    id: 'TASK-2926',
    title: 'Зафиксировать статус подписания договора Норд Капитал Банк',
    templateId: 'tt-contract-signing',
    status: 'Ожидание',
    priority: 'Высокий',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0910',
    assigneeId: 'u-007',
    assigneeGroup: 'Юридическое управление',
    dueDate: '2026-08-08',
    createdAt: '2026-08-05T17:00:00+07:00',
    requiredFields: ['Номер договора', 'Статус подписания в СЭД', 'Дата вступления в силу'],
    completedFields: ['Номер договора'],
    timeSpentHours: 0.9,
    links: ['КО-009001', 'BP-2026-0910', 'DOC-9910', 'INT-5910'],
    comments: ['Номер договора зарезервирован, ожидается статус подписания из СЭД. Текст договора в CRM не хранится.'],
    history: [{ at: '2026-08-05T17:00:00+07:00', actorId: 'u-007', action: 'Создана автоматически', details: 'Условия договора согласованы, требуется контроль подписания', status: 'Новая' }]
  },
  {
    id: 'TASK-2927',
    title: 'Активировать договорные параметры Норд Капитал Банк в CRM',
    templateId: 'tt-contract-activation',
    status: 'Новая',
    priority: 'Средний',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0910',
    assigneeId: 'u-005',
    assigneeGroup: 'Управление операционного сопровождения',
    dueDate: '2026-08-11',
    createdAt: '2026-08-05T17:20:00+07:00',
    requiredFields: ['Карточка договора', 'Параметры сервиса', 'Контрольная дата'],
    completedFields: [],
    timeSpentHours: 0,
    links: ['КО-009001', 'BP-2026-0910', 'DOC-9910'],
    comments: ['Задача появится в работе после подтверждения подписания договора. В демо показана как следующий обязательный шаг процесса.'],
    history: [{ at: '2026-08-05T17:20:00+07:00', actorId: 'u-007', action: 'Создана автоматически', details: 'Подготовлен следующий шаг договорного процесса', status: 'Новая' }]
  }
];

const evdTemplates: EvdTemplate[] = [
  {
    id: 'evdt-process-basis',
    name: 'ЭВД: внутреннее основание процесса',
    status: 'Актуальный',
    version: 2,
    businessPurpose: 'Фиксация внутреннего основания для запуска, изменения или закрытия операционного процесса.',
    format: 'DOCX',
    autoCreate: false,
    autoCreateTrigger: 'Ручной запуск',
    entityTypes: ['Процесс', 'Контрагент', 'Задача'],
    processTypes: ['Подключение сервиса', 'Клиентское обращение', 'Актуализация данных', 'Договорной процесс', 'Уведомление/штраф', 'Маркетинговая акция'],
    attributes: [
      { id: 'evda-basis', name: 'Основание', type: 'Строка', required: true, requiredInStatuses: ['На проверке'], validationRule: 'Заполняется до отправки на проверку' },
      { id: 'evda-process', name: 'Номер процесса', type: 'Строка', required: true },
      { id: 'evda-counterparty', name: 'Контрагент', type: 'Справочник', required: true, source: 'Контрагенты' },
      { id: 'evda-result', name: 'Ожидаемый результат', type: 'Строка', required: true }
    ],
    linkRules: [
      { id: 'evdl-process', relationType: 'Основание', targetType: 'Процесс', required: true, description: 'ЭВД всегда связан с экземпляром процесса' },
      { id: 'evdl-counterparty', relationType: 'Связанный документ', targetType: 'Контрагент', required: true, description: 'Связь с карточкой ФЛ или ЮЛ берется из процесса' },
      { id: 'evdl-task', relationType: 'Приложение', targetType: 'Задача', required: false, description: 'При необходимости связывается с задачей этапа' }
    ],
    approvalRoute: [
      { id: 'evdar-owner', name: 'Проверка владельцем процесса', approverType: 'Роль', approverValue: 'Руководитель процесса', ruleKind: 'Жесткое правило', slaHours: 8, required: true },
      { id: 'evdar-curator', name: 'Подтверждение куратором', approverType: 'Роль', approverValue: 'Куратор CRM', ruleKind: 'Гибкое правило', condition: 'если процесс запущен вручную', slaHours: 8, required: false }
    ],
    hardApproverRules: ['Первый согласующий всегда владелец процесса'],
    flexibleApproverRules: ['Куратор добавляется, если инициатор не является куратором контрагента'],
    validationRules: ['Основание и связанный процесс обязательны', 'Нельзя валидировать ЭВД без хотя бы одного согласующего'],
    statusModel: ['Загружен', 'На проверке', 'Валидирован', 'Ошибка', 'Архив'],
    bodyTemplate: 'Основание по процессу {processId} для {counterparty}: {basis}. Ожидаемый результат: {result}.',
    variables: ['processId', 'counterparty', 'basis', 'result', 'curator']
  },
  {
    id: 'evdt-penalty-notice',
    name: 'ЭВД: расчет основания уведомления',
    status: 'Актуальный',
    version: 3,
    businessPurpose: 'Расчет и внутреннее согласование основания уведомления или штрафа контрагенту.',
    format: 'XLSX',
    autoCreate: true,
    autoCreateTrigger: 'Событие ИС',
    entityTypes: ['Процесс', 'Контрагент', 'Уведомление', 'Штраф', 'Задача'],
    processTypes: ['Уведомление/штраф'],
    attributes: [
      { id: 'evda-violation', name: 'Тип нарушения', type: 'Справочник', required: true, source: 'Типы нарушений', requiredInStatuses: ['На проверке'] },
      { id: 'evda-incident-count', name: 'Количество инцидентов', type: 'Число', required: true, validationRule: 'Больше 0' },
      { id: 'evda-penalty-amount', name: 'Сумма штрафа', type: 'Формула', required: true, formula: 'база * коэффициент повторности' },
      { id: 'evda-response-date', name: 'Срок реакции контрагента', type: 'Дата', required: true }
    ],
    linkRules: [
      { id: 'evdl-penalty-process', relationType: 'Основание', targetType: 'Процесс', required: true, description: 'Связь с процессом выставления уведомления/штрафа' },
      { id: 'evdl-penalty-task', relationType: 'Приложение', targetType: 'Задача', required: true, description: 'Связь с задачей подготовки основания' },
      { id: 'evdl-penalty-source', relationType: 'Связанный документ', targetType: 'ЭВД', required: false, description: 'Может ссылаться на предыдущий расчет или версию основания' }
    ],
    approvalRoute: [
      { id: 'evdar-legal', name: 'Юридическая проверка', approverType: 'Подразделение', approverValue: 'Юридическое управление', ruleKind: 'Жесткое правило', slaHours: 12, required: true },
      { id: 'evdar-owner-high', name: 'Контроль владельца процесса', approverType: 'Роль', approverValue: 'Руководитель процесса', ruleKind: 'Гибкое правило', condition: 'если сумма штрафа >= 100000 или риск контрагента >= 60', slaHours: 8, required: false }
    ],
    hardApproverRules: ['Юридическое управление обязательно для всех уведомлений и штрафов'],
    flexibleApproverRules: ['Руководитель процесса добавляется при крупной сумме или высоком риске контрагента'],
    validationRules: ['Нужна ссылка на инцидент или предписание', 'Сумма штрафа пересчитывается при изменении повторности'],
    statusModel: ['Загружен', 'На проверке', 'Валидирован', 'Ошибка', 'Архив'],
    bodyTemplate: 'По {counterparty} подтверждено нарушение {violation}. Инцидентов: {incidentCount}. Сумма: {penaltyAmount}.',
    variables: ['counterparty', 'violation', 'incidentCount', 'penaltyAmount', 'processId', 'taskId']
  },
  {
    id: 'evdt-contract-terms',
    name: 'ЭВД: карточка договорных условий',
    status: 'Актуальный',
    version: 1,
    businessPurpose: 'Внутренняя карточка договорных параметров без хранения текста договора в CRM.',
    format: 'DOCX',
    autoCreate: true,
    autoCreateTrigger: 'Переход этапа',
    entityTypes: ['Процесс', 'Контрагент', 'Договор', 'Сервис'],
    processTypes: ['Договорной процесс'],
    attributes: [
      { id: 'evda-contract-type', name: 'Тип договора', type: 'Справочник', required: true, source: 'Типы договоров' },
      { id: 'evda-services', name: 'Сервисы', type: 'Множественный выбор', required: true, source: 'Сервисы' },
      { id: 'evda-sla', name: 'SLA обслуживания', type: 'Число', required: true },
      { id: 'evda-effective-date', name: 'Дата вступления в силу', type: 'Дата', required: true }
    ],
    linkRules: [
      { id: 'evdl-contract-process', relationType: 'Основание', targetType: 'Процесс', required: true, description: 'Связь с договорным процессом' },
      { id: 'evdl-contract-sed', relationType: 'Связанный документ', targetType: 'Договор', required: true, description: 'Ссылка на карточку договора в СЭД без переноса текста договора' },
      { id: 'evdl-contract-service', relationType: 'Приложение', targetType: 'Сервис', required: true, description: 'Связь с сервисами, параметры которых активируются в CRM' }
    ],
    approvalRoute: [
      { id: 'evdar-contract-ops', name: 'Проверка операционным контролем', approverType: 'Подразделение', approverValue: 'Управление операционного сопровождения', ruleKind: 'Жесткое правило', slaHours: 8, required: true },
      { id: 'evdar-contract-legal', name: 'Юридическое управление', approverType: 'Подразделение', approverValue: 'Юридическое управление', ruleKind: 'Жесткое правило', slaHours: 16, required: true },
      { id: 'evdar-contract-bpm', name: 'Администратор BPM', approverType: 'Роль', approverValue: 'Администратор BPM', ruleKind: 'Гибкое правило', condition: 'если СЭД не вернул статус подписания', slaHours: 4, required: false }
    ],
    hardApproverRules: ['Управление операционного сопровождения и юридическое управление согласуют все карточки договорных условий'],
    flexibleApproverRules: ['Администратор BPM подключается при ошибке обмена с СЭД'],
    validationRules: ['Номер договора обязателен только после подтверждения статуса из СЭД', 'Дата вступления в силу не может быть раньше даты регистрации'],
    statusModel: ['Загружен', 'На проверке', 'Валидирован', 'Ошибка', 'Архив'],
    bodyTemplate: 'Карточка договорных условий {counterparty}: сервисы {services}, SLA {sla}, дата вступления {effectiveDate}.',
    variables: ['counterparty', 'services', 'sla', 'effectiveDate', 'processId']
  },
  {
    id: 'evdt-api-request',
    name: 'ЭВД: входящий API-запрос на изменение данных',
    status: 'Актуальный',
    version: 1,
    businessPurpose: 'Автоматически созданный внутренний документ по API-событию внешней ИС.',
    format: 'XML',
    autoCreate: true,
    autoCreateTrigger: 'API',
    entityTypes: ['Процесс', 'Контрагент', 'API', 'Задача'],
    processTypes: ['Подключение сервиса', 'Актуализация данных', 'Договорной процесс'],
    attributes: [
      { id: 'evda-api-source', name: 'Система-источник', type: 'Справочник', required: true, source: 'Интеграционные системы' },
      { id: 'evda-api-object', name: 'Объект API', type: 'Строка', required: true },
      { id: 'evda-api-operation', name: 'Операция', type: 'Справочник', required: true, source: 'Операции API' },
      { id: 'evda-api-result', name: 'Результат обработки', type: 'Строка', required: false }
    ],
    linkRules: [
      { id: 'evdl-api-process', relationType: 'Основание', targetType: 'Процесс', required: true, description: 'API-событие должно быть связано с процессом или создать его' },
      { id: 'evdl-api-counterparty', relationType: 'Связанный документ', targetType: 'Контрагент', required: true, description: 'Контрагент определяется из полезной нагрузки API' }
    ],
    approvalRoute: [
      { id: 'evdar-api-admin', name: 'Проверка администратором BPM', approverType: 'Роль', approverValue: 'Администратор BPM', ruleKind: 'Жесткое правило', slaHours: 4, required: true },
      { id: 'evdar-api-owner', name: 'Владелец процесса при критичном событии', approverType: 'Роль', approverValue: 'Руководитель процесса', ruleKind: 'Гибкое правило', condition: 'если API-событие критичное или повторное', slaHours: 8, required: false }
    ],
    hardApproverRules: ['Администратор BPM проверяет каждое API-создание ЭВД'],
    flexibleApproverRules: ['Руководитель процесса добавляется при критичном или повторном API-событии'],
    validationRules: ['Система-источник и операция API обязательны', 'Дубликат API-события не должен создавать второй активный ЭВД'],
    statusModel: ['Загружен', 'На проверке', 'Валидирован', 'Ошибка', 'Архив'],
    bodyTemplate: 'API-событие {apiSource}: {apiOperation} по {counterparty}. Объект: {apiObject}.',
    variables: ['apiSource', 'apiOperation', 'apiObject', 'counterparty', 'processId']
  }
];

const documents: BusinessDocument[] = [
  {
    id: 'DOC-901',
    name: 'API-паспорт СРБ СБП v2.xlsx',
    kind: 'Файл',
    format: 'XLSX',
    size: '248 КБ',
    status: 'Валидирован',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0148',
    ownerId: 'u-004',
    createdAt: '2026-07-30T16:50:00+07:00',
    businessPurpose: 'Технический паспорт API для подключения СРБ к СБП',
    service: 'СБП',
    version: 'v2',
    relatedTaskId: 'TASK-2042',
    nextAction: 'Дождаться повторного прогона C2B-сценария на тестовом стенде'
  },
  {
    id: 'DOC-902',
    name: 'Карточка подключения СБП СРБ.pdf',
    kind: 'Печатная форма',
    format: 'PDF',
    size: '612 КБ',
    status: 'Загружен',
    linkedObjectType: 'Контрагент',
    linkedObjectId: 'КО-000184',
    ownerId: 'u-001',
    createdAt: '2026-07-31T10:00:00+07:00',
    templateName: 'Карточка подключения сервиса',
    businessPurpose: 'Заявка и реквизиты для подключения сервиса СБП',
    service: 'СБП',
    version: '1.0',
    relatedTaskId: 'TASK-2041',
    nextAction: 'Используется как основание для технологической проверки'
  },
  {
    id: 'DOC-905',
    name: 'Расчет нарушения SLA ВКЦ.xlsx',
    kind: 'ЭВД',
    format: 'XLSX',
    size: '184 КБ',
    status: 'На проверке',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0152',
    ownerId: 'u-007',
    createdAt: '2026-08-01T14:30:00+07:00',
    templateName: 'ЭВД: расчет основания уведомления',
    businessPurpose: 'Расчет основания для уведомления ВКЦ о нарушении SLA',
    service: 'СБП',
    version: 'расчет 08.2026',
    relatedTaskId: 'TASK-2050',
    nextAction: 'Юридическое управление проверяет расчет перед отправкой уведомления',
    evdTemplateId: 'evdt-penalty-notice',
    evdTemplateVersion: 3,
    evdAttributes: {
      'Тип нарушения': 'Нарушение SLA СБП',
      'Количество инцидентов': 4,
      'Сумма штрафа': 180000,
      'Срок реакции контрагента': '2026-08-07'
    },
    evdApprovalRoute: [
      { id: 'DOC-905-apr-1', name: 'Юридическая проверка', approver: 'Юридическое управление', ruleKind: 'Жесткое правило', status: 'Ожидает', dueDate: '2026-08-05' },
      { id: 'DOC-905-apr-2', name: 'Контроль владельца процесса', approver: 'Руководитель процесса', ruleKind: 'Гибкое правило', status: 'Ожидает', dueDate: '2026-08-06' }
    ],
    relatedDocumentIds: ['DOC-902'],
    relationType: 'Основание'
  },
  {
    id: 'DOC-908',
    name: 'Механика акции СМС.docx',
    kind: 'Файл',
    format: 'DOCX',
    size: '96 КБ',
    status: 'Загружен',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0157',
    ownerId: 'u-003',
    createdAt: '2026-08-02T11:12:00+07:00',
    businessPurpose: 'Условия маркетинговой акции и правила начисления кешбэка',
    service: 'Программа лояльности',
    version: 'проект 1',
    relatedTaskId: 'TASK-2056',
    validUntil: '2026-09-30',
    nextAction: 'Ожидается подтверждение бюджета акции от ТСП'
  },
  {
    id: 'DOC-912',
    name: 'Заявка на подключение НКО Быстрый перевод.xml',
    kind: 'Файл',
    format: 'XML',
    size: '42 КБ',
    status: 'Валидирован',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0160',
    ownerId: 'u-002',
    createdAt: '2026-08-04T09:03:00+07:00',
    businessPurpose: 'XML-заявка на подключение НКО к СБП',
    service: 'СБП',
    version: 'импорт 2026-08-04',
    relatedTaskId: 'TASK-2062',
    nextAction: 'Проверить реквизиты и контакт технического владельца'
  },
  {
    id: 'DOC-9901',
    name: 'Карточка подключения Норд Капитал Банк к СБП.pdf',
    kind: 'Печатная форма',
    format: 'PDF',
    size: '684 КБ',
    status: 'Валидирован',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0901',
    ownerId: 'u-001',
    createdAt: '2026-08-05T09:45:00+07:00',
    templateName: 'Карточка подключения сервиса',
    businessPurpose: 'Основание для подключения Норд Капитал Банк к СБП и программе лояльности',
    service: 'СБП + Программа лояльности',
    version: '1.0',
    relatedTaskId: 'TASK-2901',
    nextAction: 'Карточка подтверждена, используется на технологической проверке'
  },
  {
    id: 'DOC-9902',
    name: 'API-паспорт Норд Капитал Банк СБП v1.xlsx',
    kind: 'Файл',
    format: 'XLSX',
    size: '312 КБ',
    status: 'На проверке',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0901',
    ownerId: 'u-004',
    createdAt: '2026-08-05T11:18:00+07:00',
    businessPurpose: 'API-паспорт и параметры тестового стенда для подключения Норд Капитал Банк к СБП',
    service: 'СБП',
    version: 'v1',
    relatedTaskId: 'TASK-2902',
    nextAction: 'Управление технологической интеграции должно подтвердить тестовый стенд'
  },
  {
    id: 'DOC-9903',
    name: 'Материалы обращения Лебедевой А.П..pdf',
    kind: 'ЭВД',
    format: 'PDF',
    size: '428 КБ',
    status: 'Загружен',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0902',
    ownerId: 'u-002',
    createdAt: '2026-08-05T10:08:00+07:00',
    templateName: 'Карточка клиентского обращения',
    businessPurpose: 'Материалы обращения ФЛ по спорному начислению кешбэка',
    service: 'СБП + Программа лояльности',
    version: 'обращение 2026-08-05',
    relatedTaskId: 'TASK-2903',
    nextAction: 'Управление операционного сопровождения готовит решение и срок ответа клиенту',
    evdTemplateId: 'evdt-process-basis',
    evdTemplateVersion: 2,
    evdAttributes: {
      'Основание': 'Спорное начисление кешбэка',
      'Номер процесса': 'BP-2026-0902',
      'Контрагент': 'Лебедева А.П.',
      'Ожидаемый результат': 'Подготовить ответ клиенту'
    },
    evdApprovalRoute: [
      { id: 'DOC-9903-apr-1', name: 'Проверка владельцем процесса', approver: 'Руководитель процесса', ruleKind: 'Жесткое правило', status: 'Согласовано', dueDate: '2026-08-05' },
      { id: 'DOC-9903-apr-2', name: 'Подтверждение куратором', approver: 'Куратор CRM', ruleKind: 'Гибкое правило', status: 'Ожидает', dueDate: '2026-08-06' }
    ],
    relatedDocumentIds: [],
    relationType: 'Основание'
  },
  {
    id: 'DOC-9910',
    name: 'Договорной пакет Норд Капитал Банк: реквизиты и сервисы.docx',
    kind: 'Файл',
    format: 'DOCX',
    size: '156 КБ',
    status: 'Валидирован',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0910',
    ownerId: 'u-005',
    createdAt: '2026-08-05T12:18:00+07:00',
    templateName: 'Карточка договорных условий CRM',
    businessPurpose: 'Договорной пакет для обслуживания Норд Капитал Банк по СБП и программе лояльности',
    service: 'СБП + Программа лояльности',
    contractNumber: 'ДОГ-0910/26',
    version: 'проект 2',
    relatedTaskId: 'TASK-2910',
    validUntil: '2027-08-04',
    nextAction: 'Юридическое управление согласует тарифы, SLA и особые условия'
  },
  {
    id: 'DOC-9911',
    name: 'Регистрационная карточка договора Норд Капитал Банк CRM.pdf',
    kind: 'Печатная форма',
    format: 'PDF',
    size: '224 КБ',
    status: 'На проверке',
    linkedObjectType: 'Процесс',
    linkedObjectId: 'BP-2026-0910',
    ownerId: 'u-007',
    createdAt: '2026-08-05T13:32:00+07:00',
    templateName: 'Печатная форма регистрационных реквизитов договора',
    businessPurpose: 'Печатная форма регистрационных реквизитов договора Норд Капитал Банк',
    service: 'Договорное сопровождение',
    contractNumber: 'ДОГ-0910/26',
    version: 'на проверке',
    relatedTaskId: 'TASK-2911',
    validUntil: '2027-08-04',
    nextAction: 'Дождаться статуса подписания из СЭД и активировать параметры обслуживания'
  }
];

const communications: Communication[] = [
  {
    id: 'COM-701',
    counterpartyId: 'КО-000184',
    type: 'Встреча',
    subject: 'План подключения СБП и пилот лояльности',
    at: '2026-07-29T11:00:00+07:00',
    responsibleId: 'u-001',
    summary: 'Согласованы тестовые сценарии C2B и перечень контактных лиц для ночных проверок.',
    nextAction: 'Получить протокол повторного теста до 06.08',
    status: 'Проведена',
    channel: 'ВКС',
    processId: 'BP-2026-0148',
    agenda: ['Тестовый контур СБП', 'Контакты ночной смены', 'План промышленного запуска'],
    participants: ['Елена Морозова', 'Анна Воронцова', 'Петр Савин'],
    outcome: 'Протокол тестирования должен быть передан в технологическую интеграцию.'
  },
  {
    id: 'COM-702',
    counterpartyId: 'КО-000219',
    type: 'Звонок',
    subject: 'Обсуждение предписания по SLA',
    at: '2026-08-01T15:25:00+07:00',
    responsibleId: 'u-001',
    summary: 'Контрагент подтвердил сбой маршрутизации запросов СБП.',
    nextAction: 'Отправить уведомление и получить план корректирующих действий',
    status: 'Требует follow-up',
    channel: 'Телефон',
    processId: 'BP-2026-0152',
    agenda: ['Причина нарушения SLA', 'План корректирующих действий', 'Срок ответа контрагента'],
    participants: ['Елена Морозова', 'Ольга Шестакова'],
    outcome: 'Нужно завершить юридическое уведомление и зафиксировать срок реакции контрагента.',
    recording: 'call-20260801-1525.mp3'
  },
  {
    id: 'COM-703',
    counterpartyId: 'ПР-000077',
    type: 'Письмо',
    subject: 'Уточнение API-паспорта транспортной платформы',
    at: '2026-08-02T09:15:00+07:00',
    responsibleId: 'u-003',
    summary: 'Партнер прислал обновленный список endpoint и контакт дежурной смены.',
    nextAction: 'Проверить файл импорта и передать в интеграцию',
    status: 'Проведена',
    channel: 'Email',
    agenda: ['API-паспорт', 'Контакт дежурной смены'],
    participants: ['Мария Лебедева', 'Оксана Гусева'],
    outcome: 'Файл передан на проверку импорта.'
  },
  {
    id: 'COM-704',
    counterpartyId: 'ТСП-000311',
    type: 'Обращение',
    subject: 'Изменение условий акции',
    at: '2026-08-03T14:10:00+07:00',
    responsibleId: 'u-003',
    summary: 'ТСП просит изменить лимит кешбэка с 500 до 700 рублей на карту.',
    nextAction: 'Пересчитать бюджет и согласовать механику',
    status: 'Требует follow-up',
    channel: 'Email',
    processId: 'BP-2026-0157',
    agenda: ['Лимит кешбэка', 'Бюджет акции', 'Период запуска'],
    participants: ['Мария Лебедева', 'Даниил Сорокин'],
    outcome: 'Требуется пересчитать бюджет и передать в партнерские программы.'
  },
  {
    id: 'COM-7901',
    counterpartyId: 'КО-009001',
    type: 'Встреча',
    subject: 'Согласование тестового запуска СБП для Норд Капитал Банк',
    at: '2026-08-05T09:20:00+07:00',
    responsibleId: 'u-001',
    summary: 'Норд Капитал Банк подтвердил готовность API-паспорта, контакт ИТ и окно для повторного C2B-теста 07.08.',
    nextAction: 'Дождаться результата технологической проверки и назначить промышленный запуск',
    status: 'Проведена',
    channel: 'ВКС',
    processId: 'BP-2026-0901',
    agenda: ['Готовность API-паспорта', 'Окно повторного тестирования', 'Ответственный ИТ'],
    participants: ['Елена Морозова', 'Виктория Румянцева', 'Артем Сафронов'],
    outcome: 'Создан follow-up для технологической интеграции по окну тестирования.',
    linkedTaskIds: ['TASK-2915']
  },
  {
    id: 'COM-7902',
    counterpartyId: 'ФЛ-009001',
    type: 'Обращение',
    subject: 'Не начислен кешбэк по СБП-операции',
    at: '2026-08-05T10:05:00+07:00',
    responsibleId: 'u-002',
    summary: 'Клиент прислал чек, сумму операции 4 850 руб. и ожидание кешбэка по акции партнера.',
    nextAction: 'Проверить правило начисления и подготовить ответ клиенту до 06.08',
    status: 'Требует follow-up',
    channel: 'Чат',
    processId: 'BP-2026-0902',
    agenda: ['Чек операции', 'Правило начисления', 'Срок ответа'],
    participants: ['Алексей Фомин', 'Анна Лебедева'],
    outcome: 'Обращение передано в операционный контроль для проверки начисления.',
    linkedTaskIds: ['TASK-2904'],
    recording: 'chat-20260805-1005.txt'
  },
  {
    id: 'COM-7903',
    counterpartyId: 'КО-009001',
    type: 'Звонок',
    subject: 'Подготовить звонок по договорным условиям Норд Капитал Банк',
    at: '2026-08-06T11:00:00+07:00',
    responsibleId: 'u-001',
    summary: 'Плановая коммуникация перед отправкой договорных условий на подписание.',
    nextAction: 'Согласовать с Норд Капитал Банк SLA обслуживания и дату вступления условий в силу',
    status: 'Запланирована',
    channel: 'Телефон',
    processId: 'BP-2026-0910',
    agenda: ['SLA обслуживания СБП', 'Дата вступления условий', 'Контакт подписанта'],
    participants: ['Елена Морозова', 'Виктория Румянцева', 'Наталья Соколова']
  },
  {
    id: 'COM-7904',
    counterpartyId: 'КО-009001',
    type: 'Встреча',
    subject: 'Внутреннее согласование договора Норд Капитал Банк',
    at: '2026-08-05T13:25:00+07:00',
    responsibleId: 'u-005',
    summary: 'Управление операционного сопровождения передало юридическому управлению пакет условий и список сервисов.',
    nextAction: 'Юридическому управлению подтвердить особые условия и статус карточки СЭД',
    status: 'Требует follow-up',
    channel: 'ВКС',
    processId: 'BP-2026-0910',
    agenda: ['Проверка пакета', 'Особые условия', 'Карточка СЭД'],
    participants: ['Светлана Павлова', 'Наталья Соколова'],
    outcome: 'Создано внутреннее поручение HND-9101 и связанная задача TASK-2916.',
    linkedTaskIds: ['TASK-2916']
  },
  {
    id: 'COM-7905',
    counterpartyId: 'КО-009001',
    type: 'Обращение',
    subject: 'Перенос окна тестового запуска СБП',
    at: '2026-08-05T16:04:00+07:00',
    responsibleId: 'u-001',
    summary: 'Норд Капитал Банк просит перенести тестовый запуск СБП на 09.08 и подтвердить влияние на общий план подключения.',
    nextAction: 'Операционному контролю согласовать способ решения и подготовить ответ до 07.08',
    status: 'Требует follow-up',
    channel: 'Email',
    processId: 'BP-2026-0903',
    agenda: ['Перенос окна тестирования', 'Влияние на подключение СБП', 'Срок официального ответа'],
    participants: ['Елена Морозова', 'Виктория Румянцева', 'Артем Сафронов'],
    outcome: 'Обращение ЮЛ зарегистрировано и передано в операционный контроль.',
    linkedTaskIds: ['TASK-2931']
  }
];

const portfolioFillers = [
  {
    counterpartyId: 'ПР-000077',
    ownerId: 'u-003',
    assigneeId: 'u-004',
    processId: 'BP-2026-0920',
    taskId: 'TASK-2940',
    docId: 'DOC-9940',
    commId: 'COM-7940',
    needId: 'NEED-420',
    processTemplateId: 'pt-connect-sbp',
    taskTemplateId: 'tt-api-passport',
    processTitle: 'Подключение транспортной платформы ГТС к проверке QR-платежей',
    processType: 'Подключение сервиса',
    businessObjectId: 'ЗК-0920',
    processStatus: 'В работе',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Высокий',
    startedAt: '2026-08-02T10:20:00+07:00',
    dueDate: '2026-08-14',
    taskTitle: 'Проверить API-паспорт QR-платежей ГТС',
    taskStatus: 'В работе',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['API-паспорт', 'Тестовый стенд', 'Контакт ИТ'],
    completedFields: ['API-паспорт'],
    documentName: 'API-паспорт QR-платежей ГТС v1.xlsx',
    documentFormat: 'XLSX',
    documentKind: 'Файл',
    documentStatus: 'На проверке',
    documentPurpose: 'Технические параметры транспортной платформы для проверки QR-платежей',
    service: 'Транспортная платформа',
    communicationType: 'Письмо',
    channel: 'Email',
    subject: 'API-паспорт и тестовое окно QR-платежей',
    summary: 'ГТС направил обновленный API-паспорт, перечень endpoint и окно для тестового прогона QR-платежей.',
    nextAction: 'Подтвердить готовность тестового стенда и назначить контрольный прогон QR-платежей',
    needTitle: 'Подтвердить готовность ГТС к контрольному прогону QR-платежей',
    needCategory: 'Подключение продукта или сервиса',
    needStage: 'Оформление',
    expectedEffect: 130000
  },
  {
    counterpartyId: 'ПСП-000052',
    ownerId: 'u-002',
    assigneeId: 'u-012',
    processId: 'BP-2026-0921',
    taskId: 'TASK-2941',
    docId: 'DOC-9941',
    commId: 'COM-7941',
    needId: 'NEED-421',
    processTemplateId: 'pt-profile-actualization',
    taskTemplateId: 'tt-verify-profile',
    processTitle: 'Плановая актуализация операционного профиля ПС Контур',
    processType: 'Актуализация данных',
    businessObjectId: 'ПРФ-0921',
    processStatus: 'Запущен',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Средний',
    startedAt: '2026-08-01T10:30:00+07:00',
    dueDate: '2026-08-15',
    taskTitle: 'Проверить профиль и контакты ПС Контур',
    taskStatus: 'Назначена',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Реквизиты', 'Контакты', 'Связанные сервисы'],
    completedFields: ['Контакты'],
    documentName: 'Операционная карточка ПС Контур.pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'Загружен',
    documentPurpose: 'Плановая карточка сверки профиля и операционных контактов платежной системы',
    service: 'МПС',
    communicationType: 'Звонок',
    channel: 'Телефон',
    subject: 'Сверка операционных контактов ПС Контур',
    summary: 'Контрагент подтвердил актуальность основного контакта и попросил добавить резервный канал для ночных инцидентов.',
    nextAction: 'Внести резервный контакт ночной смены и подтвердить канал для инцидентов',
    needTitle: 'Добавить резервный контакт ПС Контур для ночных инцидентов',
    needCategory: 'Актуализация данных',
    needStage: 'Уточнение',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'КО-000326',
    ownerId: 'u-001',
    assigneeId: 'u-012',
    processId: 'BP-2026-0922',
    taskId: 'TASK-2942',
    docId: 'DOC-9942',
    commId: 'COM-7942',
    needId: 'NEED-422',
    processTemplateId: 'pt-contract-onboarding',
    taskTemplateId: 'tt-contract-terms',
    processTitle: 'Согласование SLA обслуживания УБР',
    processType: 'Договорной процесс',
    businessObjectId: 'ДОГ-0922',
    processStatus: 'В работе',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Средний',
    startedAt: '2026-08-04T10:00:00+07:00',
    dueDate: '2026-08-16',
    taskTitle: 'Подтвердить SLA-метрики по УБР',
    taskStatus: 'Новая',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['SLA-метрики', 'Ответственный банка', 'Контрольная дата'],
    completedFields: [],
    documentName: 'Матрица SLA УБР и контактные роли.xlsx',
    documentFormat: 'XLSX',
    documentKind: 'ЭВД',
    documentStatus: 'На проверке',
    documentPurpose: 'Матрица SLA, ответственных и контрольных точек для регулярного сопровождения УБР',
    service: 'ПС МИР',
    communicationType: 'Встреча',
    channel: 'ВКС',
    subject: 'Согласование SLA и ответственных УБР',
    summary: 'УБР предложил обновить SLA-матрицу и закрепить ответственного за ночные инциденты ПС МИР.',
    nextAction: 'Согласовать SLA-матрицу, ответственных и дату следующего контрольного замера',
    needTitle: 'Согласовать SLA-матрицу обслуживания УБР',
    needCategory: 'Изменение условий',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ТСП-000428',
    ownerId: 'u-003',
    assigneeId: 'u-010',
    processId: 'BP-2026-0923',
    taskId: 'TASK-2943',
    docId: 'DOC-9943',
    commId: 'COM-7943',
    needId: 'NEED-423',
    processTemplateId: 'pt-marketing-campaign',
    taskTemplateId: 'tt-marketing-budget',
    processTitle: 'Запуск акции лояльности для сети Забота',
    processType: 'Маркетинговая акция',
    businessObjectId: 'АКЦ-0923',
    processStatus: 'В работе',
    currentGroup: 'Управление партнерских программ',
    priority: 'Средний',
    startedAt: '2026-08-01T16:40:00+07:00',
    dueDate: '2026-08-18',
    taskTitle: 'Согласовать бюджет акции сети Забота',
    taskStatus: 'Назначена',
    assigneeGroup: 'Управление партнерских программ',
    requiredFields: ['Период акции', 'Бюджет', 'Механика начисления'],
    completedFields: ['Механика начисления'],
    documentName: 'Механика кешбэка сети Забота.docx',
    documentFormat: 'DOCX',
    documentKind: 'Файл',
    documentStatus: 'Загружен',
    documentPurpose: 'Описание механики кешбэка, периода акции и ограничений по аптечной сети',
    service: 'Программа лояльности',
    communicationType: 'Письмо',
    channel: 'Email',
    subject: 'Механика акции и лимиты кешбэка сети Забота',
    summary: 'Партнер прислал механику акции, просит подтвердить бюджет и период запуска.',
    nextAction: 'Подтвердить период, лимит бюджета и передать параметры акции в операционный контроль',
    needTitle: 'Согласовать параметры акции для сети Забота',
    needCategory: 'Изменение условий',
    needStage: 'Подбор решения',
    expectedEffect: 90000
  },
  {
    counterpartyId: 'ПСП-000119',
    ownerId: 'u-002',
    assigneeId: 'u-007',
    processId: 'BP-2026-0924',
    taskId: 'TASK-2944',
    docId: 'DOC-9944',
    commId: 'COM-7944',
    needId: 'NEED-424',
    processTemplateId: 'pt-penalty-notice',
    taskTemplateId: 'tt-penalty-response-control',
    processTitle: 'Контроль реакции ФинМаршрут на уведомление SLA',
    processType: 'Уведомление/штраф',
    businessObjectId: 'ШТ-0924',
    processStatus: 'Риск сроков',
    currentGroup: 'Юридическое управление',
    priority: 'Критичный',
    startedAt: '2026-08-01T18:15:00+07:00',
    dueDate: '2026-08-06',
    taskTitle: 'Проконтролировать ответ ФинМаршрут по уведомлению SLA',
    taskStatus: 'В работе',
    assigneeGroup: 'Юридическое управление',
    requiredFields: ['План КД', 'Подтверждение контрагента', 'Решение по штрафу'],
    completedFields: ['План КД'],
    documentName: 'Уведомление ФинМаршрут о нарушении SLA.pdf',
    documentFormat: 'PDF',
    documentKind: 'ЭВД',
    documentStatus: 'На проверке',
    documentPurpose: 'Основание для контроля реакции контрагента на повторное нарушение SLA',
    service: 'МПС',
    communicationType: 'Звонок',
    channel: 'Телефон',
    subject: 'Реакция на уведомление о нарушении SLA',
    summary: 'ФинМаршрут подтвердил получение уведомления, но запросил дополнительный срок на план корректирующих действий.',
    nextAction: 'Получить утвержденный план корректирующих действий и зафиксировать решение по штрафу',
    needTitle: 'Закрыть нарушение SLA ФинМаршрут по плану корректирующих действий',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'НКО-000260',
    ownerId: 'u-002',
    assigneeId: 'u-004',
    processId: 'BP-2026-0925',
    taskId: 'TASK-2945',
    docId: 'DOC-9945',
    commId: 'COM-7945',
    needId: 'NEED-425',
    processTemplateId: 'pt-connect-sbp',
    taskTemplateId: 'tt-api-passport',
    processTitle: 'Пилот C2B-платежей Кошелек Плюс',
    processType: 'Подключение сервиса',
    businessObjectId: 'ЗК-0925',
    processStatus: 'Ожидание контрагента',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Высокий',
    startedAt: '2026-08-03T10:45:00+07:00',
    dueDate: '2026-08-15',
    taskTitle: 'Проверить повторный прогон C2B Кошелек Плюс',
    taskStatus: 'Ожидание',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['Тестовый сценарий', 'Логи платежей', 'Контакт ИТ'],
    completedFields: ['Тестовый сценарий'],
    documentName: 'Протокол пилота C2B Кошелек Плюс.xlsx',
    documentFormat: 'XLSX',
    documentKind: 'Файл',
    documentStatus: 'На проверке',
    documentPurpose: 'Результаты пилотного C2B-сценария и список операций для сверки',
    service: 'СБП',
    communicationType: 'Письмо',
    channel: 'Email',
    subject: 'Повторный прогон C2B-пилота',
    summary: 'НКО направила протокол первого прогона и запросила повторную проверку после исправления callback.',
    nextAction: 'Получить логи повторного прогона и оформить решение по технологической готовности',
    needTitle: 'Завершить C2B-пилот Кошелек Плюс после исправления callback',
    needCategory: 'Подключение продукта или сервиса',
    needStage: 'Оформление',
    expectedEffect: 120000
  },
  {
    counterpartyId: 'ПР-000512',
    ownerId: 'u-003',
    assigneeId: 'u-005',
    processId: 'BP-2026-0926',
    taskId: 'TASK-2946',
    docId: 'DOC-9946',
    commId: 'COM-7946',
    needId: 'NEED-426',
    processTemplateId: 'pt-profile-actualization',
    taskTemplateId: 'tt-verify-profile',
    processTitle: 'Обновление регламента обмена РТК',
    processType: 'Актуализация данных',
    businessObjectId: 'ПРФ-0926',
    processStatus: 'Завершен',
    currentGroup: 'Управление операционного сопровождения',
    priority: 'Низкий',
    startedAt: '2026-07-30T11:00:00+07:00',
    dueDate: '2026-08-02',
    taskTitle: 'Проверить публикацию регламента обмена РТК',
    taskStatus: 'Выполнена',
    assigneeGroup: 'Управление операционного сопровождения',
    requiredFields: ['Регламент', 'Ответственный', 'Дата публикации'],
    completedFields: ['Регламент', 'Ответственный', 'Дата публикации'],
    documentName: 'Регламент обмена с РТК v3.pdf',
    documentFormat: 'PDF',
    documentKind: 'Файл',
    documentStatus: 'Валидирован',
    documentPurpose: 'Актуальный регламент обмена по транспортной платформе и ответственным ролям',
    service: 'Транспортная платформа',
    communicationType: 'Встреча',
    channel: 'ВКС',
    subject: 'Публикация регламента обмена РТК',
    summary: 'РТК подтвердил новую редакцию регламента, контакт дежурной смены и дату вступления в силу.',
    nextAction: 'Закрепить новую редакцию регламента как основание для планового контроля обмена',
    needTitle: 'Зафиксировать новую редакцию регламента обмена РТК',
    needCategory: 'Актуализация данных',
    needStage: 'Реализована',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'КО-000617',
    ownerId: 'u-001',
    assigneeId: 'u-007',
    processId: 'BP-2026-0927',
    taskId: 'TASK-2947',
    docId: 'DOC-9947',
    commId: 'COM-7947',
    needId: 'NEED-427',
    processTemplateId: 'pt-penalty-notice',
    taskTemplateId: 'tt-legal-notice',
    processTitle: 'Контроль плана корректирующих действий ЮКБ',
    processType: 'Уведомление/штраф',
    businessObjectId: 'ШТ-0927',
    processStatus: 'Риск сроков',
    currentGroup: 'Юридическое управление',
    priority: 'Критичный',
    startedAt: '2026-07-29T09:55:00+07:00',
    dueDate: '2026-08-06',
    taskTitle: 'Подготовить позицию по плану корректирующих действий ЮКБ',
    taskStatus: 'Ожидание',
    assigneeGroup: 'Юридическое управление',
    requiredFields: ['Основание', 'План КД', 'Срок ответа'],
    completedFields: ['Основание'],
    documentName: 'План корректирующих действий ЮКБ.pdf',
    documentFormat: 'PDF',
    documentKind: 'ЭВД',
    documentStatus: 'На проверке',
    documentPurpose: 'План восстановления сервиса и основания для дальнейшего контроля приостановленного участника',
    service: 'ПС МИР',
    communicationType: 'Письмо',
    channel: 'Email',
    subject: 'План корректирующих действий ЮКБ',
    summary: 'ЮКБ направил предварительный план восстановления, но не подтвердил финальную дату промышленного возврата.',
    nextAction: 'Получить подтвержденную дату восстановления и зафиксировать решение по ограничению сервиса',
    needTitle: 'Согласовать восстановление обслуживания ЮКБ',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000003',
    ownerId: 'u-003',
    assigneeId: 'u-010',
    processId: 'BP-2026-0928',
    taskId: 'TASK-2948',
    docId: 'DOC-9948',
    commId: 'COM-7948',
    needId: 'NEED-428',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Подключение Смирнова Д.О. к акции лояльности',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0928',
    processStatus: 'В работе',
    currentGroup: 'Управление партнерских программ',
    priority: 'Средний',
    startedAt: '2026-08-04T09:30:00+07:00',
    dueDate: '2026-08-09',
    taskTitle: 'Подтвердить условия участия Смирнова Д.О. в акции',
    taskStatus: 'Назначена',
    assigneeGroup: 'Управление партнерских программ',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение'],
    completedFields: ['Причина обращения'],
    documentName: 'Заявка Смирнова Д.О. на участие в акции.pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'Загружен',
    documentPurpose: 'Заявка клиента на участие в программе лояльности и согласие с условиями акции',
    service: 'Программа лояльности',
    communicationType: 'Обращение',
    channel: 'Форма сайта',
    subject: 'Участие в акции лояльности',
    summary: 'Клиент запросил подключение к акции и просит подтвердить лимит кешбэка до первой покупки.',
    nextAction: 'Проверить право участия и отправить клиенту подтверждение по выбранному каналу',
    needTitle: 'Оформить участие Смирнова Д.О. в акции после проверки правил',
    needCategory: 'Подключение продукта или сервиса',
    needStage: 'Подбор решения',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000004',
    ownerId: 'u-001',
    assigneeId: 'u-004',
    processId: 'BP-2026-0929',
    taskId: 'TASK-2949',
    docId: 'DOC-9949',
    commId: 'COM-7949',
    needId: 'NEED-429',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Пилот транспортной карты Соколовой Е.А.',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0929',
    processStatus: 'В работе',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Низкий',
    startedAt: '2026-08-01T09:35:00+07:00',
    dueDate: '2026-08-10',
    taskTitle: 'Проверить результат пилотной поездки Соколовой Е.А.',
    taskStatus: 'В работе',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение'],
    completedFields: ['Причина обращения', 'Способ решения'],
    documentName: 'Протокол пилотной QR-поездки Соколовой Е.А..pdf',
    documentFormat: 'PDF',
    documentKind: 'Файл',
    documentStatus: 'Валидирован',
    documentPurpose: 'Подтверждение успешной пилотной поездки и логов валидации QR',
    service: 'Транспортная платформа',
    communicationType: 'Звонок',
    channel: 'Телефон',
    subject: 'Итог пилотной QR-поездки',
    summary: 'Клиент подтвердил успешную оплату поездки, требуется сверить логи и включить следующий сценарий пилота.',
    nextAction: 'Сверить логи валидации и подтвердить клиенту результат пилотной поездки',
    needTitle: 'Проверить результат пилотной QR-поездки Соколовой Е.А.',
    needCategory: 'Сервисный запрос',
    needStage: 'Оформление',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000005',
    ownerId: 'u-002',
    assigneeId: 'u-013',
    processId: 'BP-2026-0930',
    taskId: 'TASK-2950',
    docId: 'DOC-9950',
    commId: 'COM-7950',
    needId: 'NEED-430',
    processTemplateId: 'pt-profile-actualization',
    taskTemplateId: 'tt-consent-refresh',
    processTitle: 'Подтверждение личности и согласий Волкова Р.И.',
    processType: 'Актуализация данных',
    businessObjectId: 'ПРФ-0930',
    processStatus: 'Ожидание контрагента',
    currentGroup: 'Центр клиентских коммуникаций',
    priority: 'Высокий',
    startedAt: '2026-08-03T20:10:00+07:00',
    dueDate: '2026-08-08',
    taskTitle: 'Получить подтверждение личности Волкова Р.И.',
    taskStatus: 'Ожидание',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Согласие ПДн', 'Канал связи', 'Контрольный звонок'],
    completedFields: ['Контрольный звонок'],
    documentName: 'Запрос подтверждения личности Волкова Р.И..pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'Загружен',
    documentPurpose: 'Основание для восстановления обслуживания после подтверждения личности',
    service: 'СБП',
    communicationType: 'Звонок',
    channel: 'Телефон',
    subject: 'Подтверждение личности для восстановления СБП',
    summary: 'Клиент прошел контрольный звонок, но еще не подтвердил согласие ПДн по ссылке.',
    nextAction: 'Дождаться подтверждения согласия и снять временное ограничение по операциям',
    needTitle: 'Восстановить операции Волкова Р.И. после подтверждения личности',
    needCategory: 'Актуализация данных',
    needStage: 'Уточнение',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000006',
    ownerId: 'u-001',
    assigneeId: 'u-009',
    processId: 'BP-2026-0931',
    taskId: 'TASK-2951',
    docId: 'DOC-9951',
    commId: 'COM-7951',
    needId: 'NEED-431',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Подготовка справки по операциям Орловой Н.П.',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0931',
    processStatus: 'Запущен',
    currentGroup: 'Центр клиентских коммуникаций',
    priority: 'Низкий',
    startedAt: '2026-08-03T12:10:00+07:00',
    dueDate: '2026-08-11',
    taskTitle: 'Сформировать справку по операциям Орловой Н.П.',
    taskStatus: 'Новая',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение'],
    completedFields: [],
    documentName: 'Запрос справки по операциям Орловой Н.П..pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'Загружен',
    documentPurpose: 'Заявление клиента на получение справки по операциям за выбранный период',
    service: 'ПС МИР',
    communicationType: 'Обращение',
    channel: 'Форма сайта',
    subject: 'Справка по операциям за июль',
    summary: 'Клиент запросил справку по операциям карты МИР за июль и выбрал выдачу через форму сайта.',
    nextAction: 'Подготовить справку и отправить клиенту ссылку на получение',
    needTitle: 'Подготовить справку по операциям Орловой Н.П.',
    needCategory: 'Документы и договор',
    needStage: 'Уточнение',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000007',
    ownerId: 'u-002',
    assigneeId: 'u-004',
    processId: 'BP-2026-0932',
    taskId: 'TASK-2952',
    docId: 'DOC-9952',
    commId: 'COM-7952',
    needId: 'NEED-432',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Возврат ошибочного перевода Беляева П.М.',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0932',
    processStatus: 'В работе',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Высокий',
    startedAt: '2026-08-04T08:50:00+07:00',
    dueDate: '2026-08-06',
    taskTitle: 'Проверить возврат ошибочного перевода Беляева П.М.',
    taskStatus: 'В работе',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение'],
    completedFields: ['Причина обращения'],
    documentName: 'Заявление Беляева П.М. на возврат ошибочного перевода.pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'На проверке',
    documentPurpose: 'Заявление клиента и реквизиты ошибочного перевода для запроса возврата',
    service: 'СБП',
    communicationType: 'Обращение',
    channel: 'Чат',
    subject: 'Ошибочный перевод СБП',
    summary: 'Клиент указал банк получателя и ID перевода, запрос на возврат передан на технологическую проверку.',
    nextAction: 'Получить статус запроса у участника перевода и подготовить ответ клиенту',
    needTitle: 'Возврат ошибочного перевода Беляева П.М.',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000008',
    ownerId: 'u-003',
    assigneeId: 'u-010',
    processId: 'BP-2026-0933',
    taskId: 'TASK-2953',
    docId: 'DOC-9953',
    commId: 'COM-7953',
    needId: 'NEED-433',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Проверка кешбэка Захаровой О.Н. у партнера',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0933',
    processStatus: 'В работе',
    currentGroup: 'Управление партнерских программ',
    priority: 'Средний',
    startedAt: '2026-08-02T17:50:00+07:00',
    dueDate: '2026-08-07',
    taskTitle: 'Согласовать решение по кешбэку Захаровой О.Н.',
    taskStatus: 'На проверке',
    assigneeGroup: 'Управление партнерских программ',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение'],
    completedFields: ['Причина обращения', 'Способ решения'],
    documentName: 'Чек и правило акции Захаровой О.Н..jpg',
    documentFormat: 'JPG',
    documentKind: 'Файл',
    documentStatus: 'Валидирован',
    documentPurpose: 'Чек покупки и правило акции для проверки начисления кешбэка',
    service: 'Программа лояльности',
    communicationType: 'Письмо',
    channel: 'Email',
    subject: 'Не начислен кешбэк у партнера',
    summary: 'Клиент направил чек покупки, партнер подтверждает участие точки, требуется финальное решение по начислению.',
    nextAction: 'Подтвердить MCC партнера и принять решение по начислению кешбэка',
    needTitle: 'Проверить начисление кешбэка Захаровой О.Н. по покупке',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'КО-000219',
    ownerId: 'u-001',
    assigneeId: 'u-007',
    processId: 'BP-2026-0934',
    taskId: 'TASK-2954',
    docId: 'DOC-9954',
    commId: 'COM-7954',
    needId: 'NEED-434',
    processTemplateId: 'pt-penalty-notice',
    taskTemplateId: 'tt-penalty-response-control',
    processTitle: 'Закрытие плана корректирующих действий ВКЦ',
    processType: 'Уведомление/штраф',
    businessObjectId: 'ШТ-0934',
    processStatus: 'Риск сроков',
    currentGroup: 'Юридическое управление',
    priority: 'Критичный',
    startedAt: '2026-08-04T11:20:00+07:00',
    dueDate: '2026-08-08',
    taskTitle: 'Проверить финальный план корректирующих действий ВКЦ',
    taskStatus: 'В работе',
    assigneeGroup: 'Юридическое управление',
    requiredFields: ['План КД', 'Подтверждение срока', 'Решение по штрафу'],
    completedFields: ['План КД', 'Подтверждение срока'],
    documentName: 'Финальный план корректирующих действий ВКЦ.pdf',
    documentFormat: 'PDF',
    documentKind: 'ЭВД',
    documentStatus: 'На проверке',
    documentPurpose: 'Финальный план восстановления SLA и основание для решения по штрафу',
    service: 'ПС МИР',
    communicationType: 'Встреча',
    channel: 'ВКС',
    subject: 'Финальный план восстановления SLA ВКЦ',
    summary: 'ВКЦ подтвердил финальную дату восстановления SLA, просит закрыть уведомление после контрольного периода.',
    nextAction: 'Проверить исполнение плана в контрольный период и принять решение по штрафу',
    needTitle: 'Закрыть контрольный период восстановления SLA ВКЦ',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'НКО-000143',
    ownerId: 'u-002',
    assigneeId: 'u-004',
    processId: 'BP-2026-0935',
    taskId: 'TASK-2955',
    docId: 'DOC-9955',
    commId: 'COM-7955',
    needId: 'NEED-435',
    processTemplateId: 'pt-connect-sbp',
    taskTemplateId: 'tt-api-passport',
    processTitle: 'Повторная проверка профиля СБП НКО Быстрый перевод',
    processType: 'Подключение сервиса',
    businessObjectId: 'ЗК-0935',
    processStatus: 'Ожидание контрагента',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Высокий',
    startedAt: '2026-08-03T09:15:00+07:00',
    dueDate: '2026-08-13',
    taskTitle: 'Сверить тестовые логи СБП НКО Быстрый перевод',
    taskStatus: 'Ожидание',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['Тестовые логи', 'Контакт ИТ', 'Решение по повторному тесту'],
    completedFields: ['Контакт ИТ'],
    documentName: 'Протокол повторной проверки СБП Быстрый перевод.xlsx',
    documentFormat: 'XLSX',
    documentKind: 'Файл',
    documentStatus: 'На проверке',
    documentPurpose: 'Тестовые операции, ошибки и контакт ИТ для повторной проверки подключения СБП',
    service: 'СБП',
    communicationType: 'Звонок',
    channel: 'Телефон',
    subject: 'Повторная проверка тестовых логов СБП',
    summary: 'НКО сообщила о готовности к повторной проверке и подтвердила ответственного ИТ на тестовое окно.',
    nextAction: 'Получить тестовые логи и оформить решение по повторной проверке',
    needTitle: 'Завершить повторную проверку СБП для НКО Быстрый перевод',
    needCategory: 'Подключение продукта или сервиса',
    needStage: 'Оформление',
    expectedEffect: 110000
  },
  {
    counterpartyId: 'ФЛ-000001',
    ownerId: 'u-001',
    assigneeId: 'u-009',
    processId: 'BP-2026-0936',
    taskId: 'TASK-2956',
    docId: 'DOC-9956',
    commId: 'COM-7956',
    needId: 'NEED-436',
    processTemplateId: 'pt-profile-actualization',
    taskTemplateId: 'tt-consent-refresh',
    processTitle: 'Актуализация согласий Иванова А.С.',
    processType: 'Актуализация данных',
    businessObjectId: 'ПРФ-0936',
    processStatus: 'В работе',
    currentGroup: 'Центр клиентских коммуникаций',
    priority: 'Средний',
    startedAt: '2026-08-04T09:10:00+07:00',
    dueDate: '2026-08-12',
    taskTitle: 'Получить обновленное согласие Иванова А.С.',
    taskStatus: 'В работе',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Согласие ПДн', 'Канал связи', 'Результат контакта'],
    completedFields: ['Канал связи'],
    documentName: 'Согласие Иванова А.С. на обработку данных.pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'Загружен',
    documentPurpose: 'Обновление согласия клиента перед продолжением обработки обращения и коммуникаций',
    service: 'СБП',
    communicationType: 'Звонок',
    channel: 'Телефон',
    subject: 'Подтверждение канала связи и согласия ПДн',
    summary: 'Клиент подтвердил телефон как основной канал, согласие ПДн ожидается по защищенной ссылке.',
    nextAction: 'Получить согласие по ссылке и снять ограничение на дальнейшую коммуникацию',
    needTitle: 'Получить обновленное согласие Иванова А.С.',
    needCategory: 'Актуализация данных',
    needStage: 'Уточнение',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-000002',
    ownerId: 'u-002',
    assigneeId: 'u-004',
    processId: 'BP-2026-0937',
    taskId: 'TASK-2957',
    docId: 'DOC-9957',
    commId: 'COM-7957',
    needId: 'NEED-437',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Разбор спорной операции Кузнецовой М.В.',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0937',
    processStatus: 'В работе',
    currentGroup: 'Управление технологической интеграции',
    priority: 'Критичный',
    startedAt: '2026-08-02T18:30:00+07:00',
    dueDate: '2026-08-06',
    taskTitle: 'Подготовить решение по спорной операции Кузнецовой М.В.',
    taskStatus: 'Ожидание',
    assigneeGroup: 'Управление технологической интеграции',
    requiredFields: ['ID операции', 'Ответ участника', 'Решение'],
    completedFields: ['ID операции'],
    documentName: 'Заявление Кузнецовой М.В. по спорной операции.pdf',
    documentFormat: 'PDF',
    documentKind: 'Печатная форма',
    documentStatus: 'Загружен',
    documentPurpose: 'Заявление клиента, ID операции и основание для запроса участнику платежа',
    service: 'СБП',
    communicationType: 'Обращение',
    channel: 'Чат',
    subject: 'Спорная операция СБП',
    summary: 'Клиент передала ID операции и скрин подтверждения, ожидается ответ участника платежа.',
    nextAction: 'Получить ответ участника и зафиксировать итоговое решение для клиента',
    needTitle: 'Подготовить решение по спорной операции Кузнецовой М.В.',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  },
  {
    counterpartyId: 'ФЛ-009001',
    ownerId: 'u-002',
    assigneeId: 'u-009',
    processId: 'BP-2026-0938',
    taskId: 'TASK-2958',
    docId: 'DOC-9958',
    commId: 'COM-7958',
    needId: 'NEED-438',
    processTemplateId: 'pt-client-appeal',
    taskTemplateId: 'tt-appeal-resolution',
    processTitle: 'Компенсация поездки Лебедевой А.П. по QR-оплате',
    processType: 'Клиентское обращение',
    businessObjectId: 'ОБР-0938',
    processStatus: 'В работе',
    currentGroup: 'Центр клиентских коммуникаций',
    priority: 'Средний',
    startedAt: '2026-08-05T10:05:00+07:00',
    dueDate: '2026-08-09',
    taskTitle: 'Согласовать компенсацию поездки Лебедевой А.П.',
    taskStatus: 'На проверке',
    assigneeGroup: 'Центр клиентских коммуникаций',
    requiredFields: ['Причина обращения', 'Способ решения', 'Решение'],
    completedFields: ['Причина обращения', 'Способ решения'],
    documentName: 'Скрин списания и маршрут Лебедевой А.П..jpg',
    documentFormat: 'JPG',
    documentKind: 'Файл',
    documentStatus: 'Валидирован',
    documentPurpose: 'Скрин списания и маршрут поездки для проверки компенсации клиенту',
    service: 'Транспортная платформа',
    communicationType: 'Обращение',
    channel: 'Чат',
    subject: 'Компенсация поездки по QR-оплате',
    summary: 'Клиент направила скрин списания и маршрут, причина сбоя подтверждена технологической проверкой.',
    nextAction: 'Согласовать компенсацию и отправить клиенту результат обращения',
    needTitle: 'Компенсация поездки Лебедевой А.П.',
    needCategory: 'Сервисный запрос',
    needStage: 'Согласование',
    expectedEffect: undefined
  }
] as const;

const portfolioProcesses: ProcessInstance[] = portfolioFillers.map((item) => ({
  id: item.processId,
  templateId: item.processTemplateId,
  title: item.processTitle,
  type: item.processType,
  status: item.processStatus,
  counterpartyId: item.counterpartyId,
  stageIndex: item.processStatus === 'Завершен' ? 2 : 1,
  startedAt: item.startedAt,
  dueDate: item.dueDate,
  initiatorId: item.ownerId,
  ownerDepartment: 'Офис управления процессами',
  currentGroup: item.currentGroup,
  priority: item.priority,
  elapsedHours: item.processStatus === 'Завершен' ? 18 : 6,
  businessObjectId: item.businessObjectId,
  taskIds: [item.taskId],
  documentIds: [item.docId],
  integrationIds: [],
  history: [
    { at: item.startedAt, actorId: item.ownerId, action: 'Запущен рабочий кейс из карточки', details: item.summary, status: 'Новая' }
  ]
}));

const portfolioTasks: Task[] = portfolioFillers.map((item) => ({
  id: item.taskId,
  title: item.taskTitle,
  templateId: item.taskTemplateId,
  status: item.taskStatus,
  priority: item.priority,
  counterpartyId: item.counterpartyId,
  processId: item.processId,
  assigneeId: item.assigneeId,
  assigneeGroup: item.assigneeGroup,
  dueDate: item.dueDate,
  createdAt: item.startedAt,
  requiredFields: [...item.requiredFields],
  completedFields: [...item.completedFields],
  fieldResults: Object.fromEntries(item.completedFields.map((field) => [field, item.summary])),
  timeSpentHours: item.taskStatus === 'Выполнена' ? 3 : item.completedFields.length ? 1.5 : 0,
  links: [item.counterpartyId, item.processId, item.docId, item.commId, item.needId],
  comments: [item.summary, `Следующий шаг: ${item.nextAction}`],
  history: [
    { at: item.startedAt, actorId: item.ownerId, action: 'Создана из клиентской потребности', details: item.nextAction, status: 'Новая' }
  ]
}));

const portfolioDocuments: BusinessDocument[] = portfolioFillers.map((item) => ({
  id: item.docId,
  name: item.documentName,
  kind: item.documentKind,
  format: item.documentFormat,
  size: item.documentFormat === 'XLSX' ? '124 КБ' : item.documentFormat === 'DOCX' ? '86 КБ' : item.documentFormat === 'JPG' ? '340 КБ' : '214 КБ',
  status: item.documentStatus,
  linkedObjectType: 'Процесс',
  linkedObjectId: item.processId,
  ownerId: item.ownerId,
  createdAt: item.startedAt,
  businessPurpose: item.documentPurpose,
  service: item.service,
  version: 'рабочая версия',
  relatedTaskId: item.taskId,
  nextAction: item.nextAction
}));

const portfolioCommunications: Communication[] = portfolioFillers.map((item) => ({
  id: item.commId,
  counterpartyId: item.counterpartyId,
  type: item.communicationType,
  subject: item.subject,
  at: item.startedAt,
  responsibleId: item.ownerId,
  summary: item.summary,
  nextAction: item.nextAction,
  status: item.taskStatus === 'Выполнена' ? 'Проведена' : 'Требует follow-up',
  channel: item.channel,
  processId: item.processId,
  agenda: ['Суть запроса', 'Ответственный и срок', 'Следующий шаг'],
  participants: ['Ответственный CRM', 'Контакт клиента'],
  outcome: item.summary,
  linkedTaskIds: [item.taskId],
  requestCategory: item.needCategory === 'Документы и договор' ? 'Документы или договор' : item.needCategory === 'Актуализация данных' ? 'Актуализация данных' : item.needCategory === 'Сервисный запрос' ? 'Обращение по операции' : 'Консультация',
  detectedIntent: item.summary,
  routeGroup: item.currentGroup
}));

const portfolioNeeds: CustomerNeed[] = portfolioFillers.map((item) => ({
  id: item.needId,
  counterpartyId: item.counterpartyId,
  title: item.needTitle,
  category: item.needCategory,
  stage: item.needStage,
  priority: item.priority,
  source: `${item.communicationType} · ${item.channel}`,
  ownerId: item.ownerId,
  createdAt: item.startedAt,
  dueDate: item.dueDate,
  expectedEffect: item.expectedEffect,
  nextAction: item.nextAction,
  result: item.needStage === 'Реализована' ? 'Потребность закрыта, результат отражен в связанных документах и истории.' : undefined,
  communicationIds: [item.commId],
  taskIds: [item.taskId],
  processIds: [item.processId],
  history: [
    { at: item.startedAt, actorId: item.ownerId, action: 'Потребность зафиксирована из коммуникации', details: item.summary, status: 'Новая' }
  ]
}));

const internalHandoffs: InternalHandoff[] = [
  {
    id: 'HND-9101',
    title: 'Проверить особые условия договора Норд Капитал Банк',
    sourceDepartment: 'Управление операционного сопровождения',
    targetDepartment: 'Юридическое управление',
    status: 'В работе',
    priority: 'Высокий',
    createdAt: '2026-08-05T13:30:00+07:00',
    dueDate: '2026-08-06',
    responsibleId: 'u-007',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0910',
    taskId: 'TASK-2916',
    comment: 'Проверить SLA 16 часов по СБП, особые условия лояльности и корректность ссылки на карточку договора в СЭД.',
    history: [
      { at: '2026-08-05T13:30:00+07:00', actorId: 'u-005', action: 'Создано поручение', details: 'Управление операционного сопровождения передало договорные условия в юридическое управление', status: 'Новая' },
      { at: '2026-08-05T13:35:00+07:00', actorId: 'u-007', action: 'Принято в работу', details: 'Юридическое управление проверяет особые условия договора', status: 'В работе' }
    ]
  },
  {
    id: 'HND-9001',
    title: 'Подтвердить окно повторного C2B-тестирования Норд Капитал Банк',
    sourceDepartment: 'Дирекция сопровождения участников ПС МИР',
    targetDepartment: 'Управление технологической интеграции',
    status: 'Ожидает',
    priority: 'Средний',
    createdAt: '2026-08-05T09:25:00+07:00',
    dueDate: '2026-08-06',
    responsibleId: 'u-004',
    counterpartyId: 'КО-009001',
    processId: 'BP-2026-0901',
    taskId: 'TASK-2915',
    comment: 'По итогам встречи с Норд Капитал Банк нужно подтвердить тестовое окно 07.08 и зафиксировать ответственного ИТ.',
    history: [{ at: '2026-08-05T09:25:00+07:00', actorId: 'u-001', action: 'Создано из коммуникации', details: 'Follow-up встречи передан технологической интеграции', status: 'Новая' }]
  },
  {
    id: 'HND-7021',
    title: 'Подготовить расчет повторности нарушения SLA ВКЦ',
    sourceDepartment: 'Юридическое управление',
    targetDepartment: 'Управление операционного сопровождения',
    status: 'Просрочено',
    priority: 'Критичный',
    createdAt: '2026-08-02T10:00:00+07:00',
    dueDate: '2026-08-03',
    responsibleId: 'u-005',
    counterpartyId: 'КО-000219',
    processId: 'BP-2026-0152',
    taskId: 'TASK-2050',
    comment: 'Нужно подтвердить количество повторных нарушений SLA перед отправкой уведомления и штрафа.',
    history: [{ at: '2026-08-04T08:10:00+07:00', actorId: 'u-006', action: 'Эскалация', details: 'Поручение просрочено, процесс в риске сроков', status: 'В работе' }]
  },
  {
    id: 'HND-7042',
    title: 'Передать параметры акции СМС в BI',
    sourceDepartment: 'Управление партнерских программ',
    targetDepartment: 'Управление сопровождения корпоративных систем',
    status: 'На проверке',
    priority: 'Средний',
    createdAt: '2026-08-03T16:20:00+07:00',
    dueDate: '2026-08-06',
    responsibleId: 'u-008',
    counterpartyId: 'ТСП-000311',
    processId: 'BP-2026-0157',
    comment: 'Параметры акции подготовлены, ожидается контроль публикации набора в BI.',
    history: [{ at: '2026-08-04T10:00:00+07:00', actorId: 'u-008', action: 'Передано на проверку', details: 'Набор параметров акции загружен в BI', status: 'На проверке' }]
  }
];

const notifications: NotificationEvent[] = [
  {
    id: 'NTF-301',
    channel: 'Внутрисистемное',
    status: 'Доставлено',
    recipient: 'Юридическое управление',
    trigger: 'Просрочка контрольной точки',
    objectId: 'TASK-2050',
    at: '2026-08-04T08:10:00+07:00'
  },
  {
    id: 'NTF-302',
    channel: 'email',
    status: 'Отправлено',
    recipient: 'ops-control@example.corp',
    trigger: 'Автосоздание задачи',
    objectId: 'TASK-2062',
    at: '2026-08-04T09:00:04+07:00'
  },
  {
    id: 'NTF-303',
    channel: 'email',
    status: 'Ошибка',
    recipient: 'integration-night-shift@example.corp',
    trigger: 'Повторная технологическая проверка',
    objectId: 'TASK-2042',
    at: '2026-08-04T10:05:00+07:00'
  },
  {
    id: 'NTF-3901',
    channel: 'Внутрисистемное',
    status: 'Доставлено',
    recipient: 'Управление технологической интеграции',
    trigger: 'Автосоздание задачи проверки API-паспорта',
    objectId: 'TASK-2902',
    at: '2026-08-05T11:15:05+07:00'
  },
  {
    id: 'NTF-3902',
    channel: 'email',
    status: 'Отправлено',
    recipient: 'ops-control@example.corp',
    trigger: 'Передача клиентского обращения в операционный контроль',
    objectId: 'TASK-2904',
    at: '2026-08-05T10:34:06+07:00'
  }
];

const integrations: IntegrationExchange[] = [
  {
    id: 'INT-501',
    system: 'СЭД',
    status: 'Успешно',
    lastSync: '2026-07-30T09:16:00+07:00',
    objectType: 'Контрагент',
    objectId: 'КО-000184',
    operation: 'Проверка зарегистрированных обращений',
    records: 2,
    errors: [],
    log: [
      { at: '2026-07-30T09:16:00+07:00', level: 'INFO', message: 'Запрос карточки контрагента выполнен' },
      { at: '2026-07-30T09:16:02+07:00', level: 'INFO', message: 'Найдено 2 входящих обращения' }
    ]
  },
  {
    id: 'INT-502',
    system: 'DWH',
    status: 'Ожидает',
    lastSync: '2026-07-30T17:25:00+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0148',
    operation: 'Передача метрик процесса',
    records: 0,
    errors: [],
    log: [{ at: '2026-07-30T17:25:00+07:00', level: 'INFO', message: 'Ожидание завершения технологического этапа' }]
  },
  {
    id: 'INT-503',
    system: 'Email Gateway',
    status: 'Ошибка',
    lastSync: '2026-08-04T08:11:00+07:00',
    objectType: 'Задача',
    objectId: 'TASK-2050',
    operation: 'Отправка эскалационного уведомления',
    records: 1,
    errors: ['Групповой адрес юридического блока временно недоступен'],
    log: [
      { at: '2026-08-04T08:11:00+07:00', level: 'ERROR', message: 'SMTP 451 temporary local problem' }
    ]
  },
  {
    id: 'INT-504',
    system: 'BI',
    status: 'Успешно',
    lastSync: '2026-08-03T08:00:00+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0157',
    operation: 'Передача параметров маркетинговой акции',
    records: 1,
    errors: [],
    log: [{ at: '2026-08-03T08:00:00+07:00', level: 'INFO', message: 'Параметры акции переданы в витрину CRM_OPER' }]
  },
  {
    id: 'INT-505',
    system: 'Jira',
    status: 'В процессе',
    lastSync: '2026-08-04T09:01:00+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0160',
    operation: 'Создание связанной технологической задачи',
    records: 1,
    errors: [],
    log: [{ at: '2026-08-04T09:01:00+07:00', level: 'INFO', message: 'Создан draft задачи INT-SBP-8841' }]
  },
  {
    id: 'INT-506',
    system: 'Confluence',
    status: 'Ошибка',
    lastSync: '2026-08-03T16:39:00+07:00',
    objectType: 'Импорт',
    objectId: 'ПР-000077',
    operation: 'Миграция контактных лиц из wiki',
    records: 27,
    errors: ['3 дубля по email', '1 контакт без роли'],
    log: [
      { at: '2026-08-03T16:39:00+07:00', level: 'WARN', message: 'Найдены дубли по email' },
      { at: '2026-08-03T16:39:03+07:00', level: 'ERROR', message: 'Запись 18: отсутствует обязательное поле "Роль контакта"' }
    ]
  },
  {
    id: 'INT-507',
    system: 'Телефония',
    status: 'Успешно',
    lastSync: '2026-08-03T19:25:03+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0168',
    operation: 'Распознавание входящего обращения и открытие карточки ФЛ',
    records: 1,
    errors: [],
    log: [
      { at: '2026-08-03T19:25:01+07:00', level: 'INFO', message: 'Номер клиента сопоставлен с ФЛ-000002' },
      { at: '2026-08-03T19:25:03+07:00', level: 'INFO', message: 'Создано обращение категории "Спорная операция СБП"' }
    ]
  },
  {
    id: 'INT-508',
    system: 'DWH',
    status: 'Ожидает',
    lastSync: '2026-08-04T10:15:04+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0171',
    operation: 'Проверка дублей профиля и срока действия согласий',
    records: 2,
    errors: [],
    log: [
      { at: '2026-08-04T10:15:02+07:00', level: 'INFO', message: 'Дублей профиля не найдено' },
      { at: '2026-08-04T10:15:04+07:00', level: 'INFO', message: 'Согласие ПДн попало в контрольный горизонт актуализации' }
    ]
  },
  {
    id: 'INT-5901',
    system: 'Jira',
    status: 'В процессе',
    lastSync: '2026-08-05T11:16:00+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0901',
    operation: 'Создание технологической задачи по API-паспорту СБП',
    records: 1,
    errors: [],
    log: [
      { at: '2026-08-05T11:15:08+07:00', level: 'INFO', message: 'Создана задача INT-SBP-9901 для проверки тестового стенда Норд Капитал Банк' },
      { at: '2026-08-05T11:16:00+07:00', level: 'INFO', message: 'Ответственный ИТ-контакт передан в карточку задачи' }
    ]
  },
  {
    id: 'INT-5902',
    system: 'Телефония',
    status: 'Успешно',
    lastSync: '2026-08-05T10:05:03+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0902',
    operation: 'Распознавание обращения и открытие карточки ФЛ',
    records: 1,
    errors: [],
    log: [
      { at: '2026-08-05T10:05:01+07:00', level: 'INFO', message: 'Клиент найден по loyaltyId MIR-900144' },
      { at: '2026-08-05T10:05:03+07:00', level: 'INFO', message: 'Создано обращение категории "Не начислен кешбэк по операции СБП"' }
    ]
  },
  {
    id: 'INT-5910',
    system: 'СЭД',
    status: 'Ожидает',
    lastSync: '2026-08-05T13:33:00+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0910',
    operation: 'Получение статуса подписания договора Норд Капитал Банк',
    records: 1,
    errors: [],
    log: [
      { at: '2026-08-05T13:32:00+07:00', level: 'INFO', message: 'В CRM сохранена регистрационная карточка договора ДОГ-0910' },
      { at: '2026-08-05T13:33:00+07:00', level: 'INFO', message: 'Ожидается статус подписания из СЭД, текст договора не хранится в CRM' }
    ]
  },
  {
    id: 'INT-5912',
    system: 'Email Gateway',
    status: 'Успешно',
    lastSync: '2026-08-05T16:05:02+07:00',
    objectType: 'Процесс',
    objectId: 'BP-2026-0903',
    operation: 'Регистрация входящего обращения ЮЛ',
    records: 1,
    errors: [],
    log: [
      { at: '2026-08-05T16:04:58+07:00', level: 'INFO', message: 'Письмо от v.rumyantseva@nordcapital.example получено и связано с КО-009001' },
      { at: '2026-08-05T16:05:02+07:00', level: 'INFO', message: 'Создано обращение категории "Изменение срока операционного этапа"' }
    ]
  }
];

const dictionaries: Dictionary[] = [
  {
    id: 'dict-counterparty',
    name: 'Типы контрагентов',
    description: 'Классификация юридических лиц и партнеров в единой базе.',
    ownerId: 'u-008',
    fields: [
      { id: 'f-code', name: 'Код', type: 'Строка', required: true },
      { id: 'f-name', name: 'Наименование', type: 'Строка', required: true },
      { id: 'f-risk', name: 'Коэффициент риска', type: 'Число', required: false }
    ],
    records: [
      { code: 'КО', name: 'Кредитная организация', risk: 1.2 },
      { code: 'НКО', name: 'Небанковская кредитная организация', risk: 1.1 },
      { code: 'ТСП', name: 'Торгово-сервисное предприятие', risk: 0.9 },
      { code: 'ПСП', name: 'Платежная система - партнер', risk: 1.0 },
      { code: 'ФЛ', name: 'Физическое лицо', risk: 0.8 }
    ]
  },
  {
    id: 'dict-services',
    name: 'Сервисы и продукты',
    description: 'Продукты и сервисы, к которым подключаются контрагенты.',
    ownerId: 'u-008',
    fields: [
      { id: 'f-service', name: 'Сервис', type: 'Строка', required: true },
      { id: 'f-owner', name: 'Подразделение-владелец', type: 'Справочник', required: true, source: 'Подразделения' },
      { id: 'f-sla', name: 'Норматив SLA, часов', type: 'Число', required: true }
    ],
    records: [
      { service: 'ПС МИР', owner: 'Управление операционного сопровождения', sla: 24 },
      { service: 'СБП', owner: 'Управление технологической интеграции', sla: 16 },
      { service: 'Программа лояльности', owner: 'Управление партнерских программ', sla: 48 },
      { service: 'Транспортная платформа', owner: 'Управление технологической интеграции', sla: 24 }
    ]
  },
  {
    id: 'dict-violations',
    name: 'Типы нарушений',
    description: 'Основания для уведомлений, предписаний и штрафов.',
    ownerId: 'u-007',
    fields: [
      { id: 'f-violation', name: 'Нарушение', type: 'Строка', required: true },
      { id: 'f-base', name: 'Базовая сумма', type: 'Число', required: true },
      { id: 'f-repeat', name: 'Коэффициент повторности', type: 'Число', required: true },
      { id: 'f-amount', name: 'Итоговая сумма', type: 'Формула', required: false, formula: 'Базовая сумма * Коэффициент повторности' }
    ],
    records: [
      { violation: 'Нарушение SLA обработки СБП', base: 125000, repeat: 1.4, amount: 175000 },
      { violation: 'Несвоевременное обновление контактов', base: 30000, repeat: 1.0, amount: 30000 }
    ]
  }
];

const wikiArticleTexts = {
  processes: `
## Назначение
Раздел описывает общий порядок ведения операционных процессов CRM+BPM. Инструкция нужна куратору, исполнителю подразделения и руководителю процесса, чтобы одинаково понимать старт процесса, обязательные задачи, контроль SLA и фиксацию результата.

## Когда применять
- запуск подключения юридического лица к сервису;
- обработка обращения физического лица;
- актуализация профиля, реквизитов и контактных лиц;
- выставление уведомления или штрафа;
- договорное сопровождение без переноса текста договора из СЭД;
- запуск внутреннего поручения подразделению.

## Базовая логика маршрута
1. Куратор открывает карточку клиента или контрагента и запускает подходящий шаблон процесса.
2. Система создает первую задачу только для группы, указанной в первом этапе.
3. Исполнитель принимает задачу в работу, заполняет обязательные результаты и закрывает этап.
4. После закрытия обязательного этапа создается следующая задача маршрута.
5. Руководитель процесса контролирует просрочки, возвраты и эскалации.
6. Завершенный процесс попадает в историю карточки, отчеты и журнал действий.

| Объект | Где используется | Что обязательно проверить |
|---|---|---|
| Контрагент или клиент | Старт процесса, задачи, документы, коммуникации | Статус, куратор, контакты, профильные признаки |
| Процесс | Маршрут и контроль SLA | Текущий этап, группа исполнителя, срок, статус |
| Задача | Исполнение этапа | Обязательные результаты, комментарий, итоговое решение |
| Документ | Подтверждение операции | Бизнес-контекст, версия, связь с сервисом или договором |
| Коммуникация | Встреча, звонок, письмо, обращение | Итог, следующий шаг, ответственный, срок follow-up |

## Правила статусов
- Новая: задача создана, но исполнитель еще не начал работу.
- В работе: исполнитель принял задачу и несет ответственность за результат.
- Ожидание: требуется ответ контрагента, клиента или внешней системы.
- На проверке: результат передан на контроль качества или руководителю.
- Выполнена: обязательные результаты заполнены, этап закрыт.
- Нарушение срока SLA не заменяет рабочий статус задачи. Система подсвечивает срок, отправляет нотификацию и показывает задачу в отчетах по просрочке.

> Контрольный принцип: следующая задача процесса не должна появляться раньше завершения предыдущего обязательного этапа.
`.trim(),
  sbp: `
## Цель инструкции
Регламент применяется при подключении юридического лица к сервису СБП. Цель - провести контрагента от проверки профиля до промышленного запуска без ручной передачи статуса между подразделениями.

## Входные условия
- в карточке ЮЛ заполнены ИНН, КПП, ОГРН, основной контакт и подразделение-владелец;
- выбран сервис подключения: СБП C2B, B2C или технологический контур партнера;
- есть плановая дата запуска и контакт ИТ со стороны контрагента;
- документы подключения привязаны к карточке или процессу.

## Маршрут процесса
| Этап | Исполнитель | SLA | Результат |
|---|---|---|---|
| Проверка единого профиля | Управление операционного сопровождения | 8 часов | Подтверждены реквизиты, контакты и связанные сервисы |
| Технологическая проверка | Управление технологической интеграции | 16 часов | Проверены API-паспорт, тестовый стенд и контакт ИТ |
| Промышленный запуск | Управление операционного сопровождения | 24 часа | Зафиксированы дата запуска, метрики первого дня и ответственный |

## Порядок работы куратора
1. Открыть карточку ЮЛ и проверить блок основных контактов.
2. Нажать Запустить процесс и выбрать шаблон подключения к сервису СБП.
3. Указать плановую дату запуска и понятное название процесса.
4. Открыть первую задачу и проверить обязательные результаты профиля.
5. После выполнения этапа убедиться, что следующая задача создана технологической интеграции.

## Порядок работы технологической интеграции
1. Принять задачу в работу.
2. Проверить API-паспорт, тестовый стенд и канал связи с ИТ-контактом.
3. Зафиксировать результат проверки в комментарии.
4. Выполнить этап и передать процесс на промышленный запуск.

## Если есть отклонение
- если API-паспорт неактуален, выбрать итоговое решение Запросить данные;
- если тестовый стенд недоступен, перевести задачу в Ожидание и указать контакт для повторной проверки;
- если срок SLA приближается к нарушению, руководитель процесса видит риск на Главной и в реестре задач.

> Завершением процесса считается не факт технической проверки, а подтвержденный промышленный запуск с метриками первого дня.
`.trim(),
  appeal: `
## Назначение
Инструкция описывает обработку обращения физического лица: от регистрации контакта до ответа клиенту и контроля удовлетворенности. Процесс применяется для обращений по СБП, кешбэку, спорным операциям, справкам и актуализации данных.

## Каналы поступления
- звонок в контактный центр;
- email;
- чат;
- форма сайта;
- офис банка или обращение через операциониста.

## Обязательные данные обращения
| Поле | Зачем нужно |
|---|---|
| Категория обращения | Определяет SLA и маршрут |
| Канал обращения | Нужен для ответа клиенту и истории коммуникаций |
| Согласие ПДн | Обязательно для обработки профиля ФЛ |
| Описание ситуации | Передается исполнителю задачи |
| Срок ответа клиенту | Контролируется руководителем процесса |

## Порядок обработки
1. Зарегистрировать обращение и связать его с карточкой ФЛ.
2. Проверить согласие на обработку персональных данных.
3. Выбрать категорию обращения и канал ответа.
4. Передать задачу в операционный контроль, если нужна проверка операции или партнера.
5. Подготовить решение, зафиксировать комментарий и приложить подтверждающий документ.
6. Закрыть обращение, отправить ответ и зафиксировать удовлетворенность клиента.

## Правила ответа клиенту
- ответ должен содержать результат проверки, срок исполнения следующего шага и канал обратной связи;
- если решение зависит от другого банка или партнера, клиенту сообщается контрольный срок;
- если обращение спорное, задача переводится в На проверке и контролируется руководителем процесса.

> Для ФЛ нельзя запускать ЮЛ-процессы подключения сервисов, штрафов и договорного обслуживания. Доступны только клиентские обращения и актуализация профиля/согласий.
`.trim(),
  profile: `
## Назначение
Единый профиль нужен, чтобы операционист видел актуальные данные ФЛ и ЮЛ в одной логике, но с разным составом полей. Профиль используется в процессах, задачах, документах, коммуникациях и отчетах.

## Общие правила ведения
1. Любое изменение карточки фиксируется в журнале действий.
2. Основной контакт должен быть указан до запуска процесса, где нужен ответ от контрагента или клиента.
3. Документы прикрепляются с бизнес-контекстом: к сервису, договору, задаче, коммуникации или процессу.
4. Контрольная дата используется для плановой проверки профиля или договорных параметров.
5. При неполном профиле куратор создает задачу актуализации.

## Отличия ФЛ и ЮЛ
| Признак | ФЛ | ЮЛ |
|---|---|---|
| Идентификация | Документ, дата рождения, клиентский ID, маскированная карта | ИНН, КПП, ОГРН, тип организации |
| Контакты | Предпочтительный канал и согласие ПДн | Контактное лицо, должность, email, телефон |
| Процессы | Обращения и согласия | Сервисы, договоры, реквизиты, уведомления |
| Контроль | Срок ответа клиенту и согласие ПДн | SLA сервисов, документы, официальные запросы |

## Что проверять перед запуском процесса
- статус карточки не Архив;
- заполнен куратор;
- указан основной контакт;
- есть связанный сервис или причина обращения;
- документы привязаны к правильному объекту;
- нет просроченной контрольной даты без задачи.
`.trim(),
  profileIndividual: `
## Цель проверки
Проверка профиля ФЛ нужна перед обработкой обращения, ответом по спорной операции, актуализацией согласий или передачей данных в целевую систему.

## Рабочий чек-лист
1. Сверить ФИО и дату рождения с документом в карточке.
2. Проверить статус согласия ПДн.
3. Проверить предпочтительный канал связи.
4. Убедиться, что маскированная карта или клиентский идентификатор относится к текущему клиенту.
5. Посмотреть активные обращения и коммуникации за последние 30 дней.
6. Если согласие истекает, запустить процесс актуализации профиля и согласий ФЛ.

## Когда нельзя продолжать
- согласие ПДн не получено;
- клиент просит изменить канал ответа, но канал не подтвержден;
- по клиенту есть дубли профиля;
- обращение требует документа, которого нет в карточке.

## Итог задачи
| Результат | Что делает система |
|---|---|
| Подтвердить | Задача закрывается, процесс переходит дальше |
| Запросить данные | Задача переводится в ожидание, создается коммуникация или follow-up |
| Вернуть на доработку | Фиксируется причина возврата и комментарий для инициатора |

> В комментарии к задаче указывайте только деловую суть: что проверено, какой результат получен и какой следующий шаг нужен клиенту.
`.trim(),
  profileLegal: `
## Цель проверки
Инструкция используется при проверке юридического лица перед подключением сервиса, договорным процессом, актуализацией реквизитов или официальным уведомлением.

## Обязательные реквизиты
- ИНН;
- КПП;
- ОГРН;
- юридический адрес;
- основной контакт и должность;
- подразделение-владелец;
- список подключенных или планируемых сервисов.

## Порядок проверки
1. Сверить реквизиты карточки с последним подтвержденным документом.
2. Проверить, что основной контакт относится к текущему контрагенту и имеет рабочий email/телефон.
3. Открыть вкладку Документы и убедиться, что каждый файл привязан к процессу, сервису или договору.
4. Проверить блок продуктов и сервисов: статус, владелец, SLA и количество инцидентов.
5. Если есть официальные запросы, просрочки или ошибки обменов, открыть источники данных и определить следующий шаг.
6. При неполных данных создать задачу Запрос данных/документов или запустить процесс актуализации реквизитов ЮЛ.

## Контрольные признаки риска
| Признак | Что означает | Действие |
|---|---|---|
| Просроченная контрольная дата | Плановая проверка не выполнена | Создать контрольную задачу |
| Ошибка обмена | Неуспешный обмен с СЭД, DWH, Email Gateway или Jira | Повторить обмен или передать администратору |
| Инциденты сервиса | По сервису есть зарегистрированные нарушения SLA | Проверить сервисную задачу и ответственного |
| Официальные запросы | Есть письма или документы, требующие ответа | Проверить срок и зафиксировать коммуникацию |
`.trim(),
  communicationTemplates: `
## Назначение
Раздел содержит правила деловой коммуникации с клиентами и контрагентами: как планировать звонки и встречи, фиксировать итог, создавать follow-up задачи и использовать утвержденные формулировки.

## Что фиксировать по каждому контакту
- тип контакта: звонок, встреча, письмо или обращение;
- канал: телефон, ВКС, email, офис, чат или форма сайта;
- тему контакта;
- участников;
- краткий итог;
- следующий шаг;
- ответственного и срок follow-up.

## Шаблон итога звонка
| Блок | Формулировка |
|---|---|
| Результат | Подтверждена готовность к промышленному запуску СБП 14.08.2026 |
| Риски | Контрагент ожидает финальную дату от ИТ-подразделения |
| Следующий шаг | Получить письмо-подтверждение и приложить его к процессу |
| Ответственный | Куратор CRM |

## Правила follow-up
1. Если после контакта есть действие, создается задача.
2. Если действие относится к процессу, задача связывается с процессом и контрагентом.
3. Если нужен ответ другого подразделения, создается поручение.
4. Если контакт завершает вопрос, статус коммуникации меняется на Проведена.

> Хорошая запись коммуникации должна отвечать на три вопроса: о чем договорились, кто отвечает и до какого срока.
`.trim(),
  exchangeRetry: `
## Назначение
Инструкция используется администратором BPM при ошибке межсистемного обмена. Бизнес-пользователь видит итоговый статус в задаче или процессе, а техническая диагностика выполняется в контуре администратора.

## Основные источники обменов
- СЭД: регистрация договоров, карточек документов и статусов подписания;
- Email Gateway: отправка уведомлений и запросов данных;
- DWH/BI: передача итоговых метрик процессов и задач;
- Jira Integration: сервисные инциденты и технические запросы.

## Порядок диагностики
1. Открыть Тех. обмены и найти запись по объекту: процесс, задача, документ или коммуникация.
2. Проверить систему-источник, операцию, дату последнего обмена и текст ошибки.
3. Открыть лог и определить, ошибка временная или требует изменения данных.
4. При временной ошибке нажать Повторить обмен.
5. При ошибке данных вернуть задачу исполнителю или создать поручение ответственному подразделению.
6. После успешного повтора проверить, что история объекта обновилась.

## Типовые решения
| Ошибка | Причина | Действие |
|---|---|---|
| Timeout | Система-получатель не ответила | Повторить обмен |
| Validation failed | Не заполнено обязательное поле | Вернуть задачу на уточнение данных |
| Duplicate object | Найден дубль карточки | Передать на проверку профиля |
| Access denied | Нет прав у сервисной учетной записи | Эскалировать администратору интеграции |

> Повтор обмена не должен скрывать бизнес-проблему. Если ошибка вызвана неполными данными, сначала исправляется карточка или задача.
`.trim(),
  communicationProcess: `
## Цель инструкции
Инструкция помогает куратору вести встречи, звонки и письма как управляемый процесс, а не как личные заметки. Каждая коммуникация связывается с клиентом или контрагентом, при необходимости с процессом и задачей.

## Планирование контакта
1. Открыть раздел Коммуникации или вкладку Коммуникации в карточке.
2. Нажать Запланировать.
3. Выбрать контрагента или клиента.
4. Указать тип, канал, дату, тему и участников.
5. Если контакт относится к процессу, выбрать связанный процесс.
6. Оставить создание follow-up задачи, если после контакта нужен контроль действия.

## Фиксация итога
- кратко описать, что обсуждалось;
- указать принятое решение;
- зафиксировать следующий шаг;
- назначить ответственного;
- указать срок;
- приложить файл, если итог подтвержден документом.

## Когда создавать задачу
| Ситуация | Тип задачи |
|---|---|
| Контрагент должен прислать документы | Запрос данных/документов |
| Нужно проверить сервисный сбой | Сервисный инцидент |
| Требуется ответ другого подразделения | Поручение подразделению |
| Нужно проконтролировать срок ответа | Follow-up по коммуникации |

> Если действие не требует работы после контакта, коммуникация просто фиксируется как проведенная и остается в истории карточки.
`.trim(),
  handoffs: `
## Назначение
Поручение используется, когда в рамках текущей задачи или процесса нужен вклад другого внутреннего подразделения. Это не следующий этап маршрута, а управляемый запрос с адресатом, сроком и результатом.

## Когда создавать поручение
- юридическому сопровождению нужно уточнить особые условия договора;
- технологической интеграции нужен повторный прогон тестового сценария;
- операционному контролю нужно сверить реквизиты или документы;
- контактному центру нужно получить подтверждение от клиента;
- администратору целевой системы нужно проверить публикацию данных.

## Порядок создания
1. Открыть задачу или процесс, где возникла потребность во внутреннем запросе.
2. Нажать Поручение.
3. Указать тему, подразделение-отправитель, подразделение-получатель, срок и приоритет.
4. Оставить создание связанной задачи, если подразделение должно выполнить действие.
5. Сохранить поручение и проверить, что оно появилось в реестре Поручения подразделениям.

## Как закрывается поручение
| Статус | Кто меняет | Что означает |
|---|---|---|
| Ожидает | Инициатор | Поручение создано и направлено адресату |
| В работе | Получатель | Подразделение приняло запрос |
| На проверке | Получатель | Результат подготовлен и ждет подтверждения |
| Закрыто | Инициатор или руководитель | Результат принят |

> Поручение должно быть связано с контрагентом, процессом или задачей. Иначе по нему сложно восстановить бизнес-контекст.
`.trim(),
  contract: `
## Цель процесса
Договорный процесс в CRM контролирует бизнес-состояние договорных условий обслуживания ЮЛ. Текст договора, юридически значимое подписание и хранение оригинала остаются в СЭД.

## Что ведет CRM
- договорной пакет и перечень сервисов;
- реквизиты и контакт подписанта;
- тарифный пакет, SLA и особые условия;
- статус подписания из СЭД;
- регистрационный номер и дата вступления в силу;
- контрольная дата проверки договорных параметров.

## Маршрут
| Этап | Исполнитель | Результат |
|---|---|---|
| Проверка договорного пакета | Управление операционного сопровождения | Подтверждены реквизиты, сервисы и подписант |
| Согласование условий обслуживания | Юридическое управление | Зафиксированы тариф, SLA и особые условия |
| Контроль подписания и регистрации | Юридическое управление | Получен номер договора и статус СЭД |
| Активация договорных параметров | Управление операционного сопровождения | Параметры сервиса активированы в CRM |

## Как работать с документами
1. Открыть вкладку Документы в карточке контрагента или процесса.
2. Проверить, к какому сервису и процессу относится документ.
3. Убедиться, что статус документа соответствует этапу процесса.
4. При ошибке СЭД открыть связанный обмен и повторить его под ролью администратора BPM.
5. После регистрации договора заполнить номер и дату вступления в силу.

## Граница с СЭД
CRM показывает бизнес-статус и управляет задачами. СЭД остается системой юридического хранения, согласования текста и подписания договора.

> Завершать договорный процесс можно только после активации договорных параметров и установки контрольной даты.
`.trim()
};

const wiki: WikiPage[] = [
  {
    id: 'WIKI-101',
    space: 'CRM+BPM',
    title: 'Процессы CRM и BPM',
    path: 'CRM+BPM / Процессы CRM и BPM',
    content: wikiArticleTexts.processes,
    updatedAt: '2026-08-01T09:00:00+07:00',
    authorId: 'u-006',
    status: 'Опубликована',
    tags: ['BPM', 'регламенты', 'задачи'],
    versions: [
      { id: 'WIKI-101-v3', label: 'v3 от 01.08.2026', at: '2026-08-01T09:00:00+07:00', authorId: 'u-006', content: 'Актуальная структура раздела CRM+BPM с маршрутами процессов и SLA.', changeSummary: 'Добавлены ссылки на клиентские обращения и актуализацию профиля.' },
      { id: 'WIKI-101-v2', label: 'v2 от 18.07.2026', at: '2026-07-18T12:20:00+07:00', authorId: 'u-008', content: 'Структура раздела CRM+BPM для подключения сервисов и маркетинговых акций.', changeSummary: 'Обновлена навигация по процессам.' }
    ],
    attachments: [
      { id: 'WATT-101', name: 'process-map-crm-bpm.drawio', format: 'DRAWIO', size: '76 КБ', uploadedAt: '2026-08-01T09:10:00+07:00', ownerId: 'u-008', kind: 'Схема процесса', indexedText: 'Схема CRM+BPM: старт из карточки, автосоздание задачи, проверка обязательных результатов, переход этапа, завершение процесса, журнал действий.' }
    ]
  },
  {
    id: 'WIKI-102',
    space: 'CRM+BPM',
    parentId: 'WIKI-101',
    title: 'Регламент подключения контрагента к СБП',
    path: 'CRM+BPM / Процессы CRM и BPM / Подключение СБП',
    content: wikiArticleTexts.sbp,
    updatedAt: '2026-07-26T18:20:00+07:00',
    authorId: 'u-004',
    status: 'Опубликована',
    tags: ['СБП', 'подключение', 'API-паспорт', 'SLA'],
    versions: [
      { id: 'WIKI-102-v4', label: 'v4 от 26.07.2026', at: '2026-07-26T18:20:00+07:00', authorId: 'u-004', content: 'Добавлены критерии проверки тестового контура и порядок передачи в промышленный запуск.', changeSummary: 'Уточнен технологический этап.' },
      { id: 'WIKI-102-v3', label: 'v3 от 10.06.2026', at: '2026-06-10T11:00:00+07:00', authorId: 'u-005', content: 'Регламент подключения СБП с профилем контрагента и API-паспортом.', changeSummary: 'Добавлены обязательные поля профиля.' },
      { id: 'WIKI-102-v2', label: 'v2 от 14.03.2026', at: '2026-03-14T15:30:00+07:00', authorId: 'u-008', content: 'Первичная версия регламента подключения СБП.', changeSummary: 'Базовый маршрут процесса.' }
    ],
    attachments: [
      { id: 'WATT-102', name: 'bpmn-connect-sbp.png', format: 'PNG', size: '214 КБ', uploadedAt: '2026-07-26T18:25:00+07:00', ownerId: 'u-004', kind: 'Схема процесса', indexedText: 'BPMN подключения СБП: профиль контрагента, API-паспорт, тестовый стенд, промышленный запуск, DWH, СЭД, Email Gateway.' },
      { id: 'WATT-103', name: 'sla-rules.xlsx', format: 'XLSX', size: '48 КБ', uploadedAt: '2026-07-26T18:26:00+07:00', ownerId: 'u-005', kind: 'Таблица', indexedText: 'Таблица SLA подключения СБП: профиль 8 часов, технологическая проверка 16 часов, промышленный запуск 24 часа, эскалация руководителю.' }
    ]
  },
  {
    id: 'WIKI-103',
    space: 'CRM+BPM',
    parentId: 'WIKI-101',
    title: 'Обработка обращения клиента',
    path: 'CRM+BPM / Процессы CRM и BPM / Обработка обращения клиента',
    content: wikiArticleTexts.appeal,
    updatedAt: '2026-08-03T10:15:00+07:00',
    authorId: 'u-002',
    status: 'Опубликована',
    tags: ['ФЛ', 'обращение', 'ПДн', 'контактный центр'],
    versions: [
      { id: 'WIKI-103-v2', label: 'v2 от 03.08.2026', at: '2026-08-03T10:15:00+07:00', authorId: 'u-002', content: 'Добавлен контроль удовлетворенности и правила эскалации спорных операций.', changeSummary: 'Расширен этап закрытия обращения.' },
      { id: 'WIKI-103-v1', label: 'v1 от 20.07.2026', at: '2026-07-20T13:40:00+07:00', authorId: 'u-005', content: 'Базовая инструкция обработки клиентских обращений.', changeSummary: 'Первичная публикация.' }
    ],
    attachments: [
      { id: 'WATT-104', name: 'appeal-classification.csv', format: 'CSV', size: '18 КБ', uploadedAt: '2026-08-03T10:20:00+07:00', ownerId: 'u-002', kind: 'Таблица', indexedText: 'Классификация обращений ФЛ: кешбэк, спорная операция СБП, справка по операциям, актуализация профиля, норматив SLA и канал ответа.' },
      { id: 'WATT-105', name: 'client-answer-template.docx', format: 'DOCX', size: '62 КБ', uploadedAt: '2026-08-03T10:22:00+07:00', ownerId: 'u-002', kind: 'Документ', indexedText: 'Шаблон ответа клиенту: результат проверки, срок исполнения, канал обратной связи, номер обращения, дальнейший шаг.' }
    ]
  },
  {
    id: 'WIKI-104',
    space: 'Управление операционного сопровождения',
    title: 'Контрагенты и единый профиль',
    path: 'Управление операционного сопровождения / Контрагенты и единый профиль',
    content: wikiArticleTexts.profile,
    updatedAt: '2026-08-01T12:00:00+07:00',
    authorId: 'u-005',
    status: 'Опубликована',
    tags: ['контрагенты', 'профиль', 'ФЛ', 'ЮЛ'],
    versions: [
      { id: 'WIKI-104-v7', label: 'v7 от 01.08.2026', at: '2026-08-01T12:00:00+07:00', authorId: 'u-005', content: 'Актуализированы правила проверки профиля ФЛ и ЮЛ.', changeSummary: 'Добавлены признаки ФЛ.' },
      { id: 'WIKI-104-v6', label: 'v6 от 05.07.2026', at: '2026-07-05T16:10:00+07:00', authorId: 'u-006', content: 'Профиль считается достаточным при заполнении реквизитов, контакта и сервисов.', changeSummary: 'Уточнены критерии полноты.' }
    ],
    attachments: [
      { id: 'WATT-106', name: 'profile-checklist.pdf', format: 'PDF', size: '132 КБ', uploadedAt: '2026-08-01T12:05:00+07:00', ownerId: 'u-005', kind: 'Документ', indexedText: 'Чек-лист единого профиля: идентификация ФЛ, реквизиты ЮЛ, основной контакт, документы, контрольная дата, риск дублей.' }
    ]
  },
  {
    id: 'WIKI-105',
    space: 'Управление операционного сопровождения',
    parentId: 'WIKI-104',
    title: 'Проверка профиля ФЛ',
    path: 'Управление операционного сопровождения / Контрагенты и единый профиль / Проверка профиля ФЛ',
    content: wikiArticleTexts.profileIndividual,
    updatedAt: '2026-08-04T09:35:00+07:00',
    authorId: 'u-001',
    status: 'Опубликована',
    tags: ['ФЛ', 'ПДн', 'актуализация', 'операционист'],
    versions: [
      { id: 'WIKI-105-v1', label: 'v1 от 04.08.2026', at: '2026-08-04T09:35:00+07:00', authorId: 'u-001', content: 'Инструкция проверки профиля физического лица и согласий ПДн.', changeSummary: 'Первичная публикация для CRM.' }
    ],
    attachments: [
      { id: 'WATT-107', name: 'personal-data-consent-template.docx', format: 'DOCX', size: '54 КБ', uploadedAt: '2026-08-04T09:40:00+07:00', ownerId: 'u-001', kind: 'Документ', indexedText: 'Шаблон согласия ПДн: цель обработки, срок действия, канал подтверждения, отзыв согласия, фиксация в CRM.' }
    ]
  },
  {
    id: 'WIKI-106',
    space: 'Управление операционного сопровождения',
    parentId: 'WIKI-104',
    title: 'Проверка профиля ЮЛ',
    path: 'Управление операционного сопровождения / Контрагенты и единый профиль / Проверка профиля ЮЛ',
    content: wikiArticleTexts.profileLegal,
    updatedAt: '2026-08-04T10:05:00+07:00',
    authorId: 'u-005',
    status: 'Опубликована',
    tags: ['ЮЛ', 'реквизиты', 'контроль', 'контрагент'],
    versions: [
      { id: 'WIKI-106-v1', label: 'v1 от 04.08.2026', at: '2026-08-04T10:05:00+07:00', authorId: 'u-005', content: 'Инструкция проверки юридического лица в едином профиле.', changeSummary: 'Первичная публикация для CRM.' }
    ],
    attachments: [
      { id: 'WATT-108', name: 'legal-profile-checklist.xlsx', format: 'XLSX', size: '39 КБ', uploadedAt: '2026-08-04T10:10:00+07:00', ownerId: 'u-005', kind: 'Таблица', indexedText: 'Чек-лист ЮЛ: ИНН, КПП, ОГРН, контакт подписанта, сервисы, официальные запросы, ошибки обменов, контрольная дата.' }
    ]
  },
  {
    id: 'WIKI-107',
    space: 'Шаблоны коммуникаций',
    title: 'Ответы клиентам и контрагентам',
    path: 'Шаблоны коммуникаций / Ответы клиентам и контрагентам',
    content: wikiArticleTexts.communicationTemplates,
    updatedAt: '2026-08-02T15:00:00+07:00',
    authorId: 'u-003',
    status: 'Опубликована',
    tags: ['шаблоны', 'коммуникации', 'email', 'телефония'],
    versions: [
      { id: 'WIKI-107-v2', label: 'v2 от 02.08.2026', at: '2026-08-02T15:00:00+07:00', authorId: 'u-003', content: 'Добавлены шаблоны запросов данных и закрытия обращения.', changeSummary: 'Расширены шаблоны ответов.' },
      { id: 'WIKI-107-v1', label: 'v1 от 18.07.2026', at: '2026-07-18T10:15:00+07:00', authorId: 'u-002', content: 'Базовые шаблоны клиентских коммуникаций.', changeSummary: 'Первичная публикация.' }
    ],
    attachments: [
      { id: 'WATT-109', name: 'email-answer-templates.docx', format: 'DOCX', size: '88 КБ', uploadedAt: '2026-08-02T15:05:00+07:00', ownerId: 'u-003', kind: 'Документ', indexedText: 'Шаблоны email: запрос документов, подтверждение запуска сервиса, ответ по обращению, уведомление о контрольном сроке.' },
      { id: 'WATT-110', name: 'call-script-appeals.pdf', format: 'PDF', size: '116 КБ', uploadedAt: '2026-08-02T15:06:00+07:00', ownerId: 'u-002', kind: 'Документ', indexedText: 'Сценарий звонка: идентификация клиента, цель обращения, фиксация договоренности, следующий шаг, согласование канала ответа.' }
    ]
  },
  {
    id: 'WIKI-108',
    space: 'Технический контур',
    title: 'Правила повторного обмена с Email Gateway',
    path: 'Технический контур / Email Gateway / Повтор отправки',
    content: wikiArticleTexts.exchangeRetry,
    updatedAt: '2026-07-28T09:45:00+07:00',
    authorId: 'u-008',
    status: 'Опубликована',
    tags: ['технический контур', 'Email Gateway', 'обмен', 'администратор'],
    versions: [
      { id: 'WIKI-108-v2', label: 'v2 от 28.07.2026', at: '2026-07-28T09:45:00+07:00', authorId: 'u-008', content: 'Добавлен порядок повторного обмена и фиксации результата в журнале.', changeSummary: 'Уточнен технический сценарий.' },
      { id: 'WIKI-108-v1', label: 'v1 от 12.05.2026', at: '2026-05-12T14:20:00+07:00', authorId: 'u-008', content: 'Коды ошибок Email Gateway и правила диагностики.', changeSummary: 'Первичная версия.' }
    ],
    attachments: [
      { id: 'WATT-111', name: 'email-error-codes.csv', format: 'CSV', size: '22 КБ', uploadedAt: '2026-07-28T09:50:00+07:00', ownerId: 'u-008', kind: 'Таблица', indexedText: 'Коды ошибок Email Gateway: timeout, validation failed, duplicate object, access denied, повтор обмена, диагностика логов.' }
    ]
  },
  {
    id: 'WIKI-109',
    space: 'Шаблоны коммуникаций',
    parentId: 'WIKI-107',
    title: 'Встречи, звонки и follow-up задачи',
    path: 'Шаблоны коммуникаций / Ответы клиентам и контрагентам / Встречи, звонки и follow-up задачи',
    content: wikiArticleTexts.communicationProcess,
    updatedAt: '2026-08-05T11:30:00+07:00',
    authorId: 'u-001',
    status: 'Опубликована',
    tags: ['коммуникации', 'follow-up', 'звонок', 'встреча'],
    versions: [
      { id: 'WIKI-109-v1', label: 'v1 от 05.08.2026', at: '2026-08-05T11:30:00+07:00', authorId: 'u-001', content: wikiArticleTexts.communicationProcess, changeSummary: 'Добавлена инструкция по планированию контактов и созданию follow-up задач.' }
    ],
    attachments: [
      { id: 'WATT-112', name: 'communication-result-template.docx', format: 'DOCX', size: '58 КБ', uploadedAt: '2026-08-05T11:34:00+07:00', ownerId: 'u-001', kind: 'Документ', indexedText: 'Шаблон итога коммуникации: тема, участники, результат, следующий шаг, ответственный, срок follow-up, ссылка на процесс.' },
      { id: 'WATT-113', name: 'call-follow-up-checklist.xlsx', format: 'XLSX', size: '36 КБ', uploadedAt: '2026-08-05T11:36:00+07:00', ownerId: 'u-003', kind: 'Таблица', indexedText: 'Контроль follow-up: запланирован контакт, зафиксирован итог, создана задача, назначен ответственный, указан срок.' }
    ]
  },
  {
    id: 'WIKI-110',
    space: 'CRM+BPM',
    parentId: 'WIKI-101',
    title: 'Внутренние поручения подразделениям',
    path: 'CRM+BPM / Процессы CRM и BPM / Внутренние поручения подразделениям',
    content: wikiArticleTexts.handoffs,
    updatedAt: '2026-08-05T14:00:00+07:00',
    authorId: 'u-006',
    status: 'Опубликована',
    tags: ['поручения', 'подразделения', 'задачи', 'SLA'],
    versions: [
      { id: 'WIKI-110-v1', label: 'v1 от 05.08.2026', at: '2026-08-05T14:00:00+07:00', authorId: 'u-006', content: wikiArticleTexts.handoffs, changeSummary: 'Описан порядок создания и закрытия внутренних поручений.' }
    ],
    attachments: [
      { id: 'WATT-114', name: 'internal-handoff-registry-rules.pdf', format: 'PDF', size: '104 КБ', uploadedAt: '2026-08-05T14:08:00+07:00', ownerId: 'u-006', kind: 'Документ', indexedText: 'Регламент поручений подразделениям: инициатор, адресат, связанная задача, срок, статус Ожидает, В работе, На проверке, Закрыто.' }
    ]
  },
  {
    id: 'WIKI-111',
    space: 'CRM+BPM',
    parentId: 'WIKI-101',
    title: 'Договорные условия обслуживания ЮЛ',
    path: 'CRM+BPM / Процессы CRM и BPM / Договорные условия обслуживания ЮЛ',
    content: wikiArticleTexts.contract,
    updatedAt: '2026-08-05T16:20:00+07:00',
    authorId: 'u-006',
    status: 'Опубликована',
    tags: ['договор', 'ЮЛ', 'СЭД', 'сервисы'],
    versions: [
      { id: 'WIKI-111-v1', label: 'v1 от 05.08.2026', at: '2026-08-05T16:20:00+07:00', authorId: 'u-006', content: wikiArticleTexts.contract, changeSummary: 'Добавлен договорный процесс с границей CRM и СЭД.' }
    ],
    attachments: [
      { id: 'WATT-115', name: 'contract-service-conditions-checklist.xlsx', format: 'XLSX', size: '42 КБ', uploadedAt: '2026-08-05T16:24:00+07:00', ownerId: 'u-005', kind: 'Таблица', indexedText: 'Чек-лист договорных условий: реквизиты, сервисы, подписант, тарифный пакет, SLA, статус СЭД, номер договора, контрольная дата.' },
      { id: 'WATT-116', name: 'crm-sed-contract-boundary.pdf', format: 'PDF', size: '96 КБ', uploadedAt: '2026-08-05T16:26:00+07:00', ownerId: 'u-008', kind: 'Документ', indexedText: 'Граница CRM и СЭД: CRM контролирует процесс, задачи, статус и параметры сервиса; СЭД хранит текст договора и юридически значимое подписание.' }
    ]
  }
];

const auditLogs: AuditLog[] = [
  {
    id: 'LOG-0001',
    userIdMasked: 'USR-1842',
    at: '2026-08-04T09:00:00+07:00',
    action: 'Ручной запуск процесса',
    objectType: 'Процесс',
    objectName: 'BP-2026-0160',
    objectLink: 'BP-2026-0160',
    logType: 'Действие пользователя',
    result: 'Успешно'
  },
  {
    id: 'LOG-0002',
    userIdMasked: 'USR-8007',
    at: '2026-08-03T16:39:03+07:00',
    action: 'Импорт контактов',
    objectType: 'Импорт',
    objectName: 'ПР-000077',
    objectLink: 'ПР-000077',
    logType: 'Межсистемное взаимодействие',
    result: 'Ошибка'
  },
  {
    id: 'LOG-0003',
    userIdMasked: 'USR-6019',
    at: '2026-08-04T08:10:00+07:00',
    action: 'Эскалация просроченной задачи',
    objectType: 'Задача',
    objectName: 'TASK-2050',
    objectLink: 'TASK-2050',
    logType: 'Системное событие',
    result: 'Предупреждение'
  },
  {
    id: 'LOG-0004',
    userIdMasked: 'USR-4094',
    at: '2026-08-04T10:05:00+07:00',
    action: 'Изменение статуса задачи',
    objectType: 'Задача',
    objectName: 'TASK-2042',
    objectLink: 'TASK-2042',
    logType: 'Действие пользователя',
    result: 'Успешно'
  },
  {
    id: 'LOG-0005',
    userIdMasked: 'USR-8007',
    at: '2026-07-31T15:30:00+07:00',
    action: 'Публикация версии процесса',
    objectType: 'Шаблон БП',
    objectName: 'Подключение контрагента к сервису СБП v4',
    objectLink: 'pt-connect-sbp',
    logType: 'Действие администратора',
    result: 'Успешно'
  }
];

const customerNeeds: CustomerNeed[] = [
  {
    id: 'NEED-401',
    counterpartyId: 'КО-000184',
    title: 'Завершить подключение СРБ к C2B-сценарию СБП',
    category: 'Подключение продукта или сервиса',
    stage: 'Оформление',
    priority: 'Высокий',
    source: 'Встреча · ВКС',
    ownerId: 'u-001',
    createdAt: '2026-07-29T11:00:00+07:00',
    dueDate: '2026-08-08',
    expectedEffect: 180000,
    nextAction: 'Получить протокол UAT, согласовать окно запуска и назначить ответственного за промышленный старт',
    communicationIds: ['COM-701'],
    taskIds: ['TASK-2042'],
    processIds: ['BP-2026-0148'],
    history: [
      { at: '2026-07-29T11:00:00+07:00', actorId: 'u-001', action: 'Потребность зафиксирована из встречи', details: 'СРБ подтвердил интерес к C2B-сценарию СБП и готовность тестового окна.', status: 'Новая' },
      { at: '2026-07-30T17:22:00+07:00', actorId: 'u-004', action: 'Передано в оформление', details: 'Создана технологическая задача TASK-2042 по API-паспорту.', status: 'В работе' }
    ]
  },
  {
    id: 'NEED-402',
    counterpartyId: 'КО-009001',
    title: 'Подключить Норд Капитал Банк к СБП и сервису лояльности',
    category: 'Подключение продукта или сервиса',
    stage: 'Согласование',
    priority: 'Высокий',
    source: 'Встреча · ВКС',
    ownerId: 'u-001',
    createdAt: '2026-08-05T09:20:00+07:00',
    dueDate: '2026-08-12',
    expectedEffect: 260000,
    nextAction: 'Получить результат технологической проверки и передать согласованные параметры в договорный процесс',
    communicationIds: ['COM-7901'],
    taskIds: ['TASK-2915'],
    processIds: ['BP-2026-0901', 'BP-2026-0910'],
    history: [
      { at: '2026-08-05T09:20:00+07:00', actorId: 'u-001', action: 'Потребность зафиксирована из встречи', details: 'Клиент подтвердил интерес к двум сервисам и готовность API-паспорта.', status: 'Новая' }
    ]
  },
  {
    id: 'NEED-403',
    counterpartyId: 'ТСП-000311',
    title: 'Согласовать изменение условий акции СМС',
    category: 'Изменение условий',
    stage: 'Подбор решения',
    priority: 'Средний',
    source: 'Обращение · Email',
    ownerId: 'u-003',
    createdAt: '2026-08-03T14:10:00+07:00',
    dueDate: '2026-08-09',
    expectedEffect: 95000,
    nextAction: 'Пересчитать бюджет и согласовать механику с партнерскими программами',
    communicationIds: ['COM-704'],
    taskIds: ['TASK-2056'],
    processIds: ['BP-2026-0157'],
    history: [
      { at: '2026-08-03T14:10:00+07:00', actorId: 'u-003', action: 'Потребность зафиксирована из обращения', details: 'ТСП просит изменить лимит кешбэка с 500 до 700 рублей.', status: 'Новая' }
    ]
  },
  {
    id: 'NEED-404',
    counterpartyId: 'ФЛ-000001',
    title: 'Подтвердить согласия и канал связи Иванова А.С.',
    category: 'Актуализация данных',
    stage: 'Уточнение',
    priority: 'Средний',
    source: 'Звонок · Телефон',
    ownerId: 'u-001',
    createdAt: '2026-08-04T09:10:00+07:00',
    dueDate: '2026-08-06',
    expectedEffect: undefined,
    nextAction: 'Проверить срок действия согласия ПДн и подтвердить выбранный клиентом канал связи',
    communicationIds: [],
    taskIds: ['TASK-2071', 'TASK-2092'],
    processIds: ['BP-2026-0171'],
    history: [
      { at: '2026-08-04T09:10:00+07:00', actorId: 'u-001', action: 'Потребность создана по обращению ФЛ', details: 'Нужно подтвердить согласие ПДн перед продолжением обслуживания.', status: 'Новая' }
    ]
  },
  {
    id: 'NEED-405',
    counterpartyId: 'ФЛ-000002',
    title: 'Закрыть обращение Кузнецовой М.В. по спорной операции',
    category: 'Сервисный запрос',
    stage: 'Согласование',
    priority: 'Критичный',
    source: 'Обращение · Чат',
    ownerId: 'u-002',
    createdAt: '2026-08-02T18:30:00+07:00',
    dueDate: '2026-08-03',
    expectedEffect: undefined,
    nextAction: 'Получить ответ участника, выбрать способ урегулирования и направить клиенту итог',
    communicationIds: [],
    taskIds: ['TASK-2072'],
    processIds: [],
    history: [
      { at: '2026-08-02T18:30:00+07:00', actorId: 'u-002', action: 'Потребность создана по спорной операции', details: 'Клиент просит проверить статус операции и срок ответа.', status: 'Новая' },
      { at: '2026-08-04T08:30:00+07:00', actorId: 'u-006', action: 'Эскалация по сроку', details: 'Требуется ответ банка-участника.', status: 'Ожидание' }
    ]
  },
  {
    id: 'NEED-406',
    counterpartyId: 'ФЛ-000003',
    title: 'Консультация Смирнова Д.О. по условиям акции лояльности',
    category: 'Консультация',
    stage: 'Реализована',
    priority: 'Средний',
    source: 'Форма сайта',
    ownerId: 'u-003',
    createdAt: '2026-08-04T09:30:00+07:00',
    dueDate: '2026-08-09',
    expectedEffect: undefined,
    nextAction: 'Консультация проведена, повторный контакт нужен только при новом обращении',
    communicationIds: [],
    taskIds: ['TASK-2073'],
    processIds: [],
    history: [
      { at: '2026-08-04T09:30:00+07:00', actorId: 'u-003', action: 'Потребность создана из формы сайта', details: 'Клиент запросил участие в акции лояльности.', status: 'Новая' }
    ]
  }
];

export const defaultData: AppData = {
  users,
  counterparties: [...counterparties, ...additionalCounterparties],
  customerNeeds: [...customerNeeds, ...portfolioNeeds],
  taskTemplates,
  tasks: [...tasks, ...additionalTasks, ...portfolioTasks],
  processTemplates,
  processes: [...processes, ...portfolioProcesses],
  documents: [...documents, ...portfolioDocuments],
  communications: [...communications, ...portfolioCommunications],
  internalHandoffs,
  notifications,
  integrations,
  evdTemplates,
  dictionaries,
  wiki,
  auditLogs,
  savedFilters: [
    {
      id: 'sf-1',
      ownerRole: 'curator',
      name: 'Контрагенты с риском',
      target: 'counterparties',
      query: '{"riskLimit":50,"sort":"risk","partyKind":"Все","type":"Все","status":"Все","logic":"AND"}'
    },
    {
      id: 'sf-2',
      ownerRole: 'owner',
      name: 'Процессы с риском сроков',
      target: 'processes',
      query: 'status=Риск сроков OR overdueTasks>0'
    }
  ]
};

export const cloneDefaultData = (): AppData => JSON.parse(JSON.stringify(defaultData)) as AppData;
