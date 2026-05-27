# BeOnEdge Schedule - подробная документация проекта

## 1. Назначение

`BeOnEdge Schedule` - React/TypeScript-приложение для отображения расписания трансляций и гоночных событий Be On Edge.

Приложение загружает расписание из опубликованной Google Sheets таблицы в формате CSV, преобразует строки в типизированные объекты, фильтрует их и отображает адаптивное расписание с карточками событий, фильтрами, переключением часового пояса, темой, масштабом и интеграциями с календарями.

Основной пользовательский сценарий:

1. Пользователь открывает сайт.
2. Приложение загружает CSV из `CSV_URL`.
3. Пользователь выбирает `МСК` или `Ваш пояс`.
4. Пользователь выбирает режим `Все дни` или `По дням`.
5. Пользователь применяет фильтры по сериям, дням, трассам и комментаторам.
6. Пользователь видит карточки событий, платформы трансляции, комментаторов, live timing, spotter guide и кнопки добавления в календарь.

## 2. Технологии

- `React 19.2.0`
- `TypeScript 4.9.5`
- `react-scripts 5.0.1`
- CSS без препроцессора
- CSS Grid
- Flexbox
- CSS variables
- `gh-pages` для деплоя

## 3. Скрипты

Файл: `package.json`

```bash
npm start
npm run build
npm test
npm run deploy
```

- `npm start` - запускает dev-сервер Create React App.
- `npm run build` - собирает production-версию в папку `build`.
- `npm test` - запускает тесты CRA.
- `npm run deploy` - собирает приложение и публикует папку `build` в ветку `gh-pages`.

## 4. Структура проекта

```text
schedule/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── indy500.png
│   ├── components/
│   │   ├── CalendarIcon.tsx
│   │   ├── Commentator.tsx
│   │   ├── Commentator.css
│   │   ├── DateDisplay.tsx
│   │   ├── DateDisplay.css
│   │   ├── DayOfWeekDisplay.tsx
│   │   ├── DayOfWeekDisplay.css
│   │   ├── DaySlider.tsx
│   │   ├── DaySlider.css
│   │   ├── DonationButtons.tsx
│   │   ├── EventLogo.tsx
│   │   ├── EventLogo.css
│   │   ├── Header.tsx
│   │   ├── Header.css
│   │   ├── Menu.tsx
│   │   ├── Menu.css
│   │   ├── Optionally.tsx
│   │   ├── Optionally.css
│   │   ├── ScheduleIcons.tsx
│   │   ├── ScheduleIcons.css
│   │   ├── ScheduleRow.tsx
│   │   └── ScheduleRow.css
│   ├── constants/
│   │   └── index.ts
│   ├── types/
│   │   └── schedule.ts
│   ├── utils/
│   │   ├── calendarUtils.ts
│   │   ├── csvParser.ts
│   │   ├── dataUtils.ts
│   │   ├── dateUtils.ts
│   │   ├── flagUtils.ts
│   │   ├── iconUtils.ts
│   │   ├── textUtils.ts
│   │   ├── timeUtils.ts
│   │   └── timezoneUtils.ts
│   ├── App.tsx
│   ├── App.css
│   ├── App.test.tsx
│   ├── index.tsx
│   ├── index.css
│   ├── react-app-env.d.ts
│   ├── reportWebVitals.ts
│   └── setupTests.ts
├── README.md
├── PROJECT_DOCUMENTATION.md
└── package.json
```

## 5. Архитектура и поток данных

```text
Google Sheets CSV
  ↓
constants/CSV_URL
  ↓
App.tsx fetch()
  ↓
utils/csvParser.ts
  ↓
ScheduleItem[]
  ↓
App.tsx:
  - Shed-фильтр
  - timezone conversion
  - date normalization
  - today/future filtering
  - carryover events
  - applied filters
  - grouping by day
  ↓
UI:
  Menu
  DaySlider
  Header + DateDisplay + DayOfWeekDisplay
  ScheduleRow
    ScheduleIcons
    Commentator
    CalendarIcon
    Optionally
```

## 6. Контракт CSV

Источник задается в `src/constants/index.ts`:

```ts
export const CSV_URL = "...";
```

Ожидаемые заголовки CSV:

```text
Shed, Live, Ended, Delay, Cancel, Date, Start, Championship, Stage,
Place, Session, PC, TG1, TG2, TG3, BCU1, BCU2, BCU3, RT,
Commentator1, Commentator2, Optionally, Duration, Live Timing,
RuTube, Spotter
```

Маппинг колонок:

```text
Shed          -> Shed
Live          -> Live
Ended         -> Ended
Delay         -> Delay
Cancel        -> Cancel
Date          -> date
Start / Time  -> time
Championship  -> championship
Stage         -> stage
Place         -> place
Session       -> session
PC            -> PC
TG1..TG3      -> TG1..TG3
BCU1..BCU3    -> BCU1..BCU3
RT            -> RT
Commentator1  -> Commentator1
Commentator2  -> Commentator2
Optionally    -> Optionally
Duration      -> Duration
Live Timing   -> LiveTiming
RuTube        -> RuTube
Spotter       -> Spotter
```

Строка считается валидной, если заполнены:

- `date`
- `time`
- `championship`
- `session`

`place` используется в интерфейсе и фильтрах, но текущий валидатор не требует его обязательного заполнения.

Истинные значения:

```ts
export const TRUE_VALUES = ['TRUE', 'true', '1', '✓'];
```

Для `Shed` дополнительно истинным считается значение `истина`.

## 7. Типы данных

Основной тип: `src/types/schedule.ts`.

```ts
export interface ScheduleItem {
  Shed?: string;
  Live?: string;
  Ended?: string;
  Delay?: string;
  Cancel?: string;
  date: string;
  day: string;
  time: string;
  championship: string;
  stage?: string;
  place: string;
  session: string;
  PC?: string;
  TG1?: string;
  TG2?: string;
  TG3?: string;
  BCU1?: string;
  BCU2?: string;
  BCU3?: string;
  RT?: string;
  Commentator1?: string;
  Commentator2?: string;
  Optionally?: string;
  Duration?: string;
  LiveTiming?: string;
  RuTube?: string;
  Spotter?: string;
}
```

Внутренние типы `App.tsx`:

- `DisplayScheduleItem` - расширяет `ScheduleItem` полями `displayTime`, `startedLabel`, `isCarryover`.
- `FloatingDayHeader` - данные fixed-заголовка дня.
- `ActiveFilterChip` - данные плашки активного фильтра.
- `SessionScrollMode` - `'all' | 'future'`.
- `RenderedRowMeta` - ключ строки и объект события.

## 8. Главный поток в `App.tsx`

### Загрузка

1. `loading = true`.
2. `fetch(CSV_URL)`.
3. Ответ читается как текст.
4. `parseCSV(text)`.
5. Результат сохраняется в `originalSchedule`.
6. Ошибка сохраняется в `error`.

### Подготовка расписания

`convertedSchedule`:

1. Берет `originalSchedule`.
2. Оставляет только строки, где `Shed` истинный.
3. Если включен `useLocalTime`, применяет `convertFromGMT3ToLocal`.
4. Оставляет даты сегодня и позже.
5. Дополнительно оставляет события, начавшиеся вчера и продолжающиеся сегодня.

`normalizedSchedule`:

- приводит дату к `DD.MM.YY`;
- используется для списков фильтров и группировки.

### Списки фильтров

Из `normalizedSchedule` вычисляются:

- `seriesList`
- `daysList`
- `tracksList`
- `commentatorsList`

Для комментаторов:

- если `Commentator1` и `Commentator2` пустые, используется `Оригинальная дорожка`.

### Применение фильтров

`filteredSchedule` строится из:

- `appliedSeries`
- `appliedDays`
- `appliedTracks`
- `appliedCommentators`

Если выбраны все значения категории, категория не ограничивает расписание.

### Carryover-события

Если событие началось вчера и по `Duration` продолжается сегодня:

- оно добавляется в сегодняшний день;
- в строке показывается время окончания;
- добавляется метка `с DD.MM.YY до`;
- вчерашний день скрывается из итогового списка.

### Группировка и сортировка

`byDay` группирует данные по ключу:

```ts
`${item.date}_${item.day}`
```

`rowsByDate` группирует данные только по дате и используется в режиме `По дням`.

`sortDayRows`:

1. Сначала поднимает carryover-события.
2. Затем сортирует по времени в минутах.

## 9. Состояние `App.tsx`

| State | Назначение |
| --- | --- |
| `originalSchedule` | Исходные данные из CSV |
| `loading` | Флаг загрузки |
| `error` | Ошибка загрузки или обработки |
| `isLightTheme` | Текущая тема |
| `useLocalTime` | `false` = МСК, `true` = локальный часовой пояс |
| `viewMode` | `all` или `byDay` |
| `selectedDay` | Выбранный день в режиме `byDay` |
| `menuHeight` | Измеренная высота меню |
| `isFilterOpen` | Открыта ли модалка фильтров |
| `applied*` | Примененные фильтры |
| `temp*` | Временные значения фильтров в модалке |
| `filterPage` | Активная вкладка фильтра |
| `filterError` | Ошибка в модалке фильтра |
| `contentScale` | Масштаб контента расписания |
| `sessionScrollMode` | `all` или `future` |
| `zoomControlsHeight` | Измеренная высота блока масштаба |
| `floatingDayHeaders` | Активные плавающие заголовки дней |

## 10. Фильтры

Фильтры находятся в модальном окне в `App.tsx`.

Вкладки:

- `Серии`
- `Дни`
- `Трассы`
- `Комментаторы`

У каждой вкладки есть чекбокс `Все ...`.

При открытии:

- если категория не активна, чекбоксы могут быть пустыми;
- если категория активна, отмечены текущие выбранные значения.

При применении:

- если не выбрано ничего во всех категориях, показывается ошибка;
- если категория пустая, она трактуется как `все значения`;
- после применения модалка закрывается и страница прокручивается вверх.

Активные фильтры представлены плашками:

```ts
{
  key: string;
  label: string;
  type: 'series' | 'days' | 'tracks' | 'commentators';
  value: string;
}
```

Плашки показывают только значение:

```text
Moto GP   Муджелло   29.05.26, пятница   Дима Искрыч
```

Плашки отображаются:

- на десктопе - под вторым рядом меню;
- на мобильной версии - под верхним рядом `DA` / `ODA`.

Удаление плашки:

- вызывает `removeFilterValue`;
- удаляет значение из соответствующего `applied*`;
- если в категории больше ничего не осталось, категория возвращается к состоянию `все`.

## 11. Режимы отображения

### `viewMode = 'all'`

Показывает все отфильтрованные дни колонками.

Каждая колонка:

- `Header`
- `DateDisplay`
- `DayOfWeekDisplay`
- список `ScheduleRow`

### `viewMode = 'byDay'`

Показывает:

- `DaySlider`;
- один выбранный день;
- строки выбранного дня.

`DaySlider` учитывает активные фильтры и показывает только даты, оставшиеся после фильтрации.

## 12. Режим будущих сессий

`sessionScrollMode = 'future'` не фильтрует строки.

Поведение:

1. Пользователь нажимает `Будущие`.
2. `App` ищет первую строку, время которой больше текущего времени.
3. Страница прокручивается к этой строке.

Это режим прокрутки, а не режим скрытия прошедших событий.

## 13. Масштабирование

Кнопки масштаба:

- `-`
- `100%`
- `+`

Константы:

```ts
const MIN_CONTENT_SCALE = 0.4;
const MAX_CONTENT_SCALE = 1;
const CONTENT_SCALE_STEP = 0.05;
```

Масштаб применяется к `.schedule-content-zoom` через CSS `zoom`. Меню и слайдер дней не масштабируются.

## 14. Плавающие заголовки дней

Работают в режиме `Все дни`.

Логика:

1. `App` хранит refs колонок дней и их заголовков.
2. При scroll/resize вычисляет, какие заголовки ушли под меню.
3. Для таких колонок показывает fixed-заголовок с датой.

Плавающий заголовок скрывается, если:

- колонка не видна по горизонтали;
- основной заголовок еще не ушел под меню;
- в колонке больше нет видимых строк.

## 15. Компоненты

### `Menu.tsx`

Фиксированное меню управления.

Desktop layout:

```text
Row 1:
[МСК / Ваш пояс] [Все дни / По дням] [Все сессии / Будущие]

Row 2:
[theme | filter]

Row 3:
active filter chips, если есть
```

Mobile layout:

```text
Top:
[DA] [ODA]
[active filter chips, если есть]

Bottom:
[Настройки]

Bottom sheet:
[МСК / Ваш пояс] [Все дни / По дням] [Все сессии / Будущие]
[theme | filter]
```

Особенности:

- `ResizeObserver` измеряет высоту меню и передает ее в `App`.
- Кнопка `Настройки` пульсирует.
- `prefers-reduced-motion: reduce` отключает пульсацию.

### `DonationButtons.tsx`

Показывает ссылки:

- `DA` -> DonationAlerts
- `ODA` -> `http://be-on-edge.oda.digital/`

На мобильной версии это единственный верхний ряд.

### `DaySlider.tsx`

Используется только в `viewMode = 'byDay'`.

Props:

```ts
days: DayOption[];
selectedDate: string | null;
onSelect?: (date: string) => void;
isLightTheme?: boolean;
topOffset?: number;
```

### `Header.tsx`, `DateDisplay.tsx`, `DayOfWeekDisplay.tsx`

`Header` - обертка для заголовка дня.

Обычно содержит:

- `DateDisplay`
- `DayOfWeekDisplay`

`DateDisplay` показывает дату в `DD.MM.YY`.

`DayOfWeekDisplay` показывает день недели.

### `ScheduleRow.tsx`

Карточка одного события.

Структура:

```text
schedule-row-wrapper
  time-container
    time-started
    time
    ScheduleIcons
    spotter-button

  content-container
    content-header
      content-text
        championship
        event-stage-row
          stage
          place chip
        event-meta
          session chip
        commentators-container
          Commentator[]
      calendar-buttons
        Google Calendar
        .ics
        live timing
    Optionally
```

Комментаторы:

- если оба поля пустые, выводится `Оригинальная дорожка`;
- если один или два комментатора заполнены, выводятся отдельные плашки;
- на маленьком экране текст может переноситься на две строки.

Календарь:

- `G` открывает Google Calendar;
- `.ics` скачивает файл iCalendar;
- секундомер открывает `LiveTiming`, если ссылка заполнена и не равна `нет`.

### `ScheduleIcons.tsx`

Показывает платформенные иконки.

Ссылки:

- PC/VK: `https://vk.com/be_on_edge`
- TG1: `https://t.me/BoE_LIVE_1`
- TG2: `https://t.me/BoE_LIVE_2`
- TG3: `https://t.me/BoE_LIVE_3`
- BCU: `https://bcumedia.su/`

Если `RT` включен:

- показывается иконка RuTube;
- если `RuTube` содержит ссылку, иконка кликабельна;
- если ссылка пустая или `нет`, иконка статическая.

### `Commentator.tsx`

Показывает плашку комментатора:

- иконка микрофона;
- имя комментатора;
- адаптивный перенос имени на две строки.

### `Optionally.tsx`

Показывает блок:

```text
Важно: {text}
```

### `CalendarIcon.tsx`

SVG-иконка календаря с текстом внутри:

- `G`
- `.ics`

Цвет задается CSS-классами родителя в `ScheduleRow.css`.

### `EventLogo.tsx`

Временный промо-компонент Indy 500:

- использует `src/assets/indy500.png`;
- имеет `HIDE_AFTER`;
- после даты скрытия возвращает `null`;
- переключает текстовые сообщения по таймеру.

## 16. Утилиты

### `csvParser.ts`

- парсит CSV-строки с учетом кавычек;
- мапит заголовки в поля `ScheduleItem`;
- валидирует обязательные поля;
- нормализует время через `normalizeTime`;
- вычисляет день недели через `getDayOfWeekFromDate`.

### `dateUtils.ts`

Функции:

- `parseDate`
- `getCurrentDate`
- `isDateEqualOrAfterToday`
- `getDayOfWeekFromDate`
- `convertFromGMT3ToLocal`

Важное поведение:

- `parseDate` создает дату с временем `12:00:00`.
- `convertFromGMT3ToLocal` создает дату как `...+03:00` и форматирует ее в локальные дату/время браузера.

### `timeUtils.ts`

`normalizeTime(timeStr)` приводит время к `HH:MM`.

### `flagUtils.ts`

`parseBooleanFlag(value)` сравнивает значение с `TRUE_VALUES`.

### `iconUtils.ts`

- `getTgNumbers(item)`
- `getBcuNumbers(item)`

Возвращают массивы активных номеров.

### `textUtils.ts`

- `formatChampionship` добавляет точку в конце, если ее нет.
- `formatStage` убирает точку в конце.

### `calendarUtils.ts`

Функции:

- `generateGoogleCalendarUrl`
- `generateICalendarFile`
- `downloadICalendarFile`

Дата начала события создается в GMT+3. Если `Duration` заполнен, окончание рассчитывается по нему. Если нет - используется fallback `2 часа`.

### `dataUtils.ts`

`groupBy` используется для группировки расписания по дням и датам.

### `timezoneUtils.ts`

`getUserTimeZone` возвращает строку вида `GMT +3`.

В текущем интерфейсе не используется.

## 17. Константы

Файл: `src/constants/index.ts`

- `CSV_URL` - используется в `App.tsx`.
- `DAYS_OF_WEEK` - используется в `dateUtils.ts`.
- `TRUE_VALUES` - используется в `flagUtils.ts`.
- `DEFAULT_TIMEZONE` - сейчас не используется.

## 18. Стили

### `App.css`

Отвечает за:

- фон приложения;
- контейнер расписания;
- zoom controls;
- плавающие заголовки дней;
- ширину колонок дней;
- grid строк расписания;
- модальное окно фильтров.

### `Menu.css`

Отвечает за:

- фиксированное меню;
- donation buttons;
- desktop-переключатели;
- quick actions;
- active filter chips;
- mobile bottom sheet;
- mobile settings trigger.

### `ScheduleRow.css`

Отвечает за:

- карточку события;
- левую колонку времени;
- метаданные события;
- кнопки календарей;
- spotter button.

### Остальные стили

- `Header.css` - форма заголовка дня.
- `DateDisplay.css` - крупная дата.
- `DayOfWeekDisplay.css` - день недели.
- `DaySlider.css` - fixed-слайдер дней.
- `ScheduleIcons.css` - сетка иконок.
- `Commentator.css` - плашка комментатора.
- `Optionally.css` - блок важной информации.
- `EventLogo.css` - промо-блок.

## 19. Адаптивность

Основной breakpoint:

```css
@media (max-width: 720px)
```

На мобильной версии:

- центральное меню скрыто;
- сверху остается только `DA` / `ODA`;
- активные фильтры показываются под верхним рядом;
- кнопка `Настройки` фиксируется снизу и пульсирует;
- bottom sheet открывается снизу;
- сетка настроек в bottom sheet состоит из трех равных колонок;
- колонка времени в расписании становится шире;
- время и иконки центрируются;
- карточка события занимает оставшуюся ширину;
- комментаторы могут переноситься в две строки.

## 20. Связи между модулями

```text
App.tsx
├── constants/index.ts
│   └── CSV_URL
├── utils/csvParser.ts
│   ├── utils/timeUtils.ts
│   └── utils/dateUtils.ts
├── utils/dateUtils.ts
│   ├── constants/index.ts
│   └── utils/timeUtils.ts
├── utils/dataUtils.ts
├── utils/flagUtils.ts
│   └── constants/index.ts
├── utils/iconUtils.ts
│   └── utils/flagUtils.ts
├── components/Menu.tsx
│   ├── DonationButtons.tsx
│   └── EventLogo.tsx
├── components/DaySlider.tsx
├── components/Header.tsx
│   ├── DateDisplay.tsx
│   └── DayOfWeekDisplay.tsx
└── components/ScheduleRow.tsx
    ├── ScheduleIcons.tsx
    ├── Commentator.tsx
    ├── Optionally.tsx
    ├── CalendarIcon.tsx
    ├── utils/timeUtils.ts
    ├── utils/calendarUtils.ts
    └── utils/textUtils.ts
```

## 21. Render tree

```text
App
├── Menu
│   ├── DonationButtons
│   ├── active filter chips mobile
│   ├── desktop controls
│   ├── active filter chips desktop
│   ├── EventLogo
│   └── mobile settings bottom sheet
├── zoom-controls
├── DaySlider?
├── floating-day-header[]
├── schedule-container
│   └── schedule-content-zoom
│       └── day-column[]
│           ├── Header
│           │   ├── DateDisplay
│           │   └── DayOfWeekDisplay
│           └── day-rows-container
│               └── ScheduleRow[]
│                   ├── ScheduleIcons
│                   ├── Commentator[]
│                   ├── CalendarIcon[]
│                   └── Optionally?
└── filter modal?
```

## 22. Темы

Тема задается через `isLightTheme`.

Основные классы:

- `app-container--light`
- `app-container--dark`
- `menu--light`
- `menu--dark`
- `schedule-row--light`
- `schedule-row--dark`

Цветовая схема:

- светлая тема: желтый фон, черные акценты;
- темная тема: темный фон, желтые акценты.

## 23. Интеграции

### Google Calendar

Кнопка `G` вызывает:

```ts
generateGoogleCalendarUrl(scheduleItem)
window.open(url, '_blank')
```

### iCalendar / Яндекс Календарь

Кнопка `.ics` вызывает:

```ts
downloadICalendarFile(scheduleItem)
```

### Live Timing

Если `LiveTiming` заполнен и не равен `нет`, показывается кнопка секундомера.

### Spotter Guide

Если `Spotter` заполнен и не равен `нет`, под иконками слева показывается кнопка `SPOTTER GUIDE`.

## 24. Важные особенности поведения

- `sessionScrollMode = future` не фильтрует строки, а только прокручивает к ближайшей будущей сессии.
- `Shed` должен быть истинным, иначе строка не попадет в расписание.
- При пустых комментаторах событие считается `Оригинальная дорожка`.
- Активные фильтры показываются только если выбрана не вся категория.
- Удаление последней плашки категории возвращает категорию в состояние `все`.
- Мобильный `Menu` остается источником высоты верхнего offset, потому ряд `DA` / `ODA` влияет на отступ расписания.
- Масштаб применяется через CSS `zoom`, а не `transform`.

## 25. Технический долг

### Безопасный

- Удалить или задействовать `timezoneUtils.ts`.
- Удалить или задействовать `DEFAULT_TIMEZONE`.
- Удалить устаревший `logo.svg`, если он не используется.
- Переписать или удалить CRA-тест `App.test.tsx`.
- Удалить `EventLogo`, если промо-блок больше не нужен.

### Средний

- Вынести `FilterModal` из `App.tsx`.
- Вынести повторяющиеся переключатели из `Menu.tsx`:
  - `TimeToggle`
  - `ViewModeToggle`
  - `SessionScrollToggle`
  - `QuickActions`
  - `ActiveFilterChips`
- Вынести общий форматтер дня для фильтров.
- Вынести общий рендер `ScheduleRow`, потому props дублируются в двух ветках `viewMode`.

### Осторожный

- Объединить date/time parsing между `App.tsx` и `calendarUtils.ts`.
- Пересмотреть carryover-логику с учетом локального часового пояса.
- Заменить CSS `zoom` на `transform: scale`, если потребуется более стандартное поведение. Это может затронуть плавающие заголовки и scroll-позиционирование.

## 26. Проверка после изменений

Рекомендуемый минимум:

```bash
npm run build
```

Что проверить вручную:

- загрузка расписания;
- переключение `МСК` / `Ваш пояс`;
- режимы `Все дни` / `По дням`;
- открытие и применение фильтров;
- удаление плашек активных фильтров;
- mobile bottom sheet;
- кнопки масштаба;
- календарные кнопки;
- live timing / spotter guide;
- отображение carryover-событий.
