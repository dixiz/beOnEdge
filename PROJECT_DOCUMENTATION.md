# BeOnEdge Schedule — подробная документация проекта

Документ описывает **текущее** состояние приложения: архитектуру, потоки данных, модули, UI и деплой. Актуален для каталога `schedule/` в репозитории beOnEdge.

---

## 1. Назначение

`BeOnEdge Schedule` — одностраничное React/TypeScript-приложение для отображения расписания трансляций и гоночных событий **Be On Edge**.

Приложение:

- загружает основное расписание из Google Sheets (CSV);
- загружает отдельный лист с сеткой комментаторов для длинных эндуранс-трансляций;
- подмешивает прогноз погоды из JSON-кэша;
- фильтрует, группирует и показывает события в адаптивном интерфейсе с hi-tech визуальным языком (тёмная/светлая тема, жёлтые акценты);
- поддерживает статусы **Live / Завершено / Отменено** и скрытие завершённых/отменённых по дням;
- даёт ссылки на платформы, календари, live timing, spotter guide и погоду.

### Основной пользовательский сценарий

1. Пользователь открывает сайт (GitHub Pages или локально).
2. Приложение параллельно запрашивает: `CSV_URL`, `COMMENTATOR_SCHEDULE_CSV_URL`, `WEATHER_CACHE_URL`.
3. Пользователь выбирает **МСК** или **Ваш пояс**.
4. Пользователь выбирает **Все дни** или **По дням** (на мобильном — свайп между днями в режиме «По дням»).
5. Пользователь открывает фильтры (серии, дни, трассы, комментаторы) и при необходимости снимает отдельные значения через плашки активных фильтров.
6. Пользователь просматривает карточки: время, статус, платформы, этап/трассу, сессию и комментаторов, погоду (если есть данные), опциональный блок «Важно», кнопки календаря.
7. Для отдельных событий (24h Le Mans / GTWEC) доступно **Расписание комментаторов** в модальном окне.
8. Для дней с завершёнными или отменёнными событиями — кнопка **Показать / Скрыть**; при любом нажатии страница быстро прокручивается вверх.

---

## 2. Технологии

| Категория | Версия / подход |
| --- | --- |
| React | 19.2.0 |
| React DOM | 19.2.0 |
| TypeScript | 4.9.5 |
| Create React App | react-scripts 5.0.1 |
| Стили | CSS без препроцессора; CSS Grid, Flexbox, CSS variables (`--boe-*` в `index.css`) |
| Шрифт | Google Fonts — **Tektur** (подключён в `public/index.html`) |
| Деплой | `gh-pages` → ветка `gh-pages` |
| CI | GitHub Actions — обновление `data/weather_cache.json` на `gh-pages` |

Тестирование: `@testing-library/react`, Jest (стандарт CRA). Production-сборка — статические файлы в `build/`.

---

## 3. Скрипты и окружение

Файл: `package.json`

```bash
npm install
npm start
npm run build
npm test
npm run deploy
```

| Скрипт | Действие |
| --- | --- |
| `npm start` | Dev-сервер CRA (обычно `http://localhost:3000`) |
| `npm run build` | Production-сборка в `build/` |
| `npm test` | Интерактивные тесты CRA |
| `npm run deploy` | `predeploy` → build, затем публикация `build/` в ветку `gh-pages` |

Переменные окружения (см. `.env.example`, `.env.development`, `.env.production`):

| Переменная | Назначение |
| --- | --- |
| `REACT_APP_WEATHER_CACHE_URL` | URL JSON с прогнозом; по умолчанию в коде — `./data/weather_cache.json` |

`homepage` в `package.json` задан как `"."` — относительные пути для GitHub Pages.

### 3.1. TypeScript / IDE

- Сборка CRA использует `typescript@^4.9.5` (см. `package.json`) — `target: es5`, `moduleResolution: node` в `tsconfig.json` не меняются.
- `tsconfig.json` содержит `"ignoreDeprecations": "6.0"` — подавляет предупреждения об устаревании `es5`/`node`-опций, которые показывает языковой сервис TypeScript 6+ в IDE (Cursor/VS Code используют более новый bundled TS, чем зависимость проекта). На сборку `npm run build` (TS 4.9.5) флаг не влияет.
- `src/react-app-env.d.ts` — помимо стандартной CRA-ссылки (`/// <reference types="react-scripts" />`) содержит `declare module` для `*.css`, `*.scss`, `*.sass`, `*.less`, `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp` — устраняет ложные ошибки типов IDE при импорте `App.css` и других статических ассетов.

---

## 4. Структура проекта (файлы и папки)

```text
schedule/
├── .github/
│   └── workflows/
│       └── update-weather.yml      # CI: скачивание weather_cache.json на gh-pages
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── package-lock.json
├── tsconfig.json                   # ignoreDeprecations: 6.0 — тишина IDE-предупреждений TS6+ по es5/node (см. §3.1)
├── README.md
├── PROJECT_DOCUMENTATION.md        # этот файл
├── GIT_BRANCHES_FIX.md             # заметки по веткам git (операционное)
├── fix-git-branches.ps1
├── public/
│   ├── index.html                  # точка входа HTML, шрифт Tektur
│   ├── favicon.svg / favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   ├── CNAME                       # домен GitHub Pages (если настроен)
│   ├── logo192.png, logo512.png
│   └── data/
│       └── weather_cache.json      # локальный/дефолтный кэш погоды для dev и fallback
└── src/
    ├── index.tsx                   # монтирование React
    ├── index.css                   # глобальные токены --boe-*, body/html
    ├── App.tsx                     # оркестрация: данные, фильтры, режимы, модалки
    ├── App.css                     # layout, фильтры, sticky, by-day toggle, zoom
    ├── App.test.tsx
    ├── react-app-env.d.ts          # CRA reference + declare module для *.css/*.svg/*.png/... (типизация статических импортов)
    ├── reportWebVitals.ts
    ├── setupTests.ts
    ├── logo.svg                    # legacy CRA (в UI не используется)
    ├── assets/
    │   └── indy500.png             # промо EventLogo
    ├── constants/
    │   └── index.ts                # URL источников, TRUE_VALUES, DAYS_OF_WEEK
    ├── types/
    │   ├── schedule.ts             # ScheduleItem, CommentatorScheduleData
    │   └── weather.ts              # WeatherCacheData, WeatherForecastPoint
    ├── hooks/
    │   └── useBodyScrollLock.ts    # блокировка scroll body при модалках
    ├── utils/
    │   ├── csvParser.ts            # parseCSV, parseCommentatorScheduleCSV
    │   ├── weatherUtils.ts         # ключи событий, parseWeatherCache, tooltip
    │   ├── dateUtils.ts
    │   ├── timeUtils.ts
    │   ├── flagUtils.ts
    │   ├── iconUtils.ts
    │   ├── textUtils.ts
    │   ├── calendarUtils.ts
    │   ├── dataUtils.ts
    │   └── timezoneUtils.ts        # не используется в UI
    └── components/
        ├── Menu.tsx / Menu.css
        ├── DonationButtons.tsx
        ├── EventLogo.tsx / EventLogo.css
        ├── DaySlider.tsx / DaySlider.css
        ├── Header.tsx / Header.css
        ├── DateDisplay.tsx / DateDisplay.css
        ├── DayOfWeekDisplay.tsx / DayOfWeekDisplay.css
        ├── ScheduleRow.tsx / ScheduleRow.css
        ├── ScheduleIcons.tsx / ScheduleIcons.css
        ├── Commentator.tsx / Commentator.css
        ├── CalendarIcon.tsx
        ├── Optionally.tsx / Optionally.css
        └── WeatherBadge.tsx / WeatherBadge.css
```

---

## 5. Архитектура и поток данных (обзор)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                     │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
   CSV_URL              COMMENTATOR_SCHEDULE_CSV_URL   WEATHER_CACHE_URL
         │                    │                         │
         ▼                    ▼                         ▼
  parseCSV()         parseCommentatorScheduleCSV()   parseWeatherCache()
         │                    │                         │
         ▼                    ▼                         ▼
 originalSchedule     commentatorSchedule         weatherLookupMap
         │                    │                         │
         └──────────► convertedSchedule ◄──────────────┘
                    (Shed, timezone, dates, weatherForecast)
                              │
                              ▼
                    normalizedSchedule (dd.mm.yy)
                              │
                              ▼
                    filteredSchedule (applied filters)
                              │
                              ▼
                    scheduleWithCarryover (+ isCarryover, startedLabel)
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        displaySchedule                  byDay / rowsByDate
   (скрытые Ended/Cancel)              (группировка для UI)
              │
              ▼
         ScheduleRow (+ WeatherBadge, modals, statuses)
```

### Параллельные источники данных

1. **Расписание** — обязательно; при ошибке показывается `error`, меню скрыто (`showMenu = false`).
2. **Расписание комментаторов** — опционально для UX; ошибка только в модалке на спец-событиях.
3. **Погода** — опционально; при ошибке `weatherLookupMap` пуст, карточки без бейджа погоды.

---

## 6. Источники данных и константы

Файл: `src/constants/index.ts`

| Константа | Назначение |
| --- | --- |
| `CSV_URL` | Pub CSV основного листа Google Sheets |
| `COMMENTATOR_SCHEDULE_CSV_URL` | CSV того же документа, лист `gid=1952221950` — сетка комментаторов по времени |
| `WEATHER_CACHE_URL` | `process.env.REACT_APP_WEATHER_CACHE_URL` или `./data/weather_cache.json` |
| `DAYS_OF_WEEK` | Русские названия дней для `dateUtils` |
| `TRUE_VALUES` | `['TRUE', 'true', '1', '✓']` для флагов |
| `DEFAULT_TIMEZONE` | `'GMT +3'` — **не используется** в текущем UI |

---

## 7. Контракт CSV (основное расписание)

Ожидаемые заголовки (регистр при парсинге не важен — нормализуется к lowercase):

```text
Shed, Live, Ended, Delay, Cancel, Date, Start, Championship, Stage,
Place, Session, PC, TG1, TG2, TG3, BCU1, BCU2, BCU3, RT,
Commentator1, Commentator2, Optionally, Duration, Live Timing,
RuTube, Spotter
```

Маппинг в `csvParser.ts` (`HEADER_MAP`):

| Колонка CSV | Поле `ScheduleItem` |
| --- | --- |
| Shed | Shed |
| Live | Live |
| Ended | Ended |
| Delay | Delay |
| Cancel | Cancel |
| Date | date |
| Start / Time | time |
| Championship | championship |
| Stage | stage |
| Place | place |
| Session | session |
| PC | PC |
| TG1..TG3 | TG1..TG3 |
| BCU1..BCU3 | BCU1..BCU3 |
| RT | RT |
| Commentator1 / Commentator2 | Commentator1 / Commentator2 |
| Optionally | Optionally |
| Duration | Duration |
| Live Timing | LiveTiming |
| RuTube | RuTube |
| Spotter | Spotter |

**Валидная строка:** заполнены `date`, `time`, `championship`, `session`.  
`place` не обязателен для парсера, но используется в UI и фильтре «Трассы».

**Shed:** строка попадает в расписание, если `parseBooleanFlag(Shed)` или значение `истина` (без учёта регистра).

**Истинные флаги:** см. `TRUE_VALUES`; для Shed дополнительно слово `истина`.

---

## 8. Контракт CSV (расписание комментаторов)

Парсер: `parseCommentatorScheduleCSV` в `csvParser.ts`.

- Первая колонка — имя комментатора.
- Колонки времени начинаются с индекса 3; заголовок колонки должен совпадать с `HH:MM` или `H:MM`.
- Ячейка считается «активной» (комментатор в эфире в этот слот), если значение не пустое и не `0`, `false`, `нет`.

Результат: `{ times: string[], rows: { commentator, slots: boolean[] }[] }`.

---

## 9. Контракт JSON (погода)

Типы: `src/types/weather.ts`.

```ts
WeatherCacheData {
  last_updated?: string;
  events: WeatherCacheEvent[];
}

WeatherCacheEvent {
  Date, Start, Championship, Stage?;
  latitude?, longitude?;
  forecast: WeatherForecastPoint[];
}

WeatherForecastPoint {
  forecast_time_msk, forecast_time_local,
  temperature_2m, relative_humidity_2m,
  precipitation, wind_speed_10m, weather_code
}
```

Сопоставление с событием расписания: `buildWeatherEventKey` в `weatherUtils.ts` — нормализованные `date`, `time`, `championship`, `stage` (без точки в конце stage), joined через `|`.

---

## 10. Типы данных

### `ScheduleItem` (`src/types/schedule.ts`)

Поля CSV + опционально `weatherForecast?: WeatherForecastPoint[]` (добавляется в `App`, не из CSV).

### Внутренние типы `App.tsx`

| Тип | Назначение |
| --- | --- |
| `DisplayScheduleItem` | `ScheduleItem` + `displayTime?`, `startedLabel?`, `isCarryover?` |
| `ActiveFilterChip` | Плашка активного фильтра: `key`, `label`, `type`, `value` |
| `DayOption` | Элемент слайдера дней: `date`, `dayName`, `shortLabel`, `dayNumber` |

### `CommentatorScheduleData`

Используется в `ScheduleRow` для модальной таблицы.

---

## 11. Главный поток в `App.tsx`

### 11.1. Загрузка данных

Три `useEffect` при монтировании:

1. `fetch(CSV_URL)` → `parseCSV` → `originalSchedule` или `error`.
2. `fetch(COMMENTATOR_SCHEDULE_CSV_URL)` → `parseCommentatorScheduleCSV` → state комментаторов или error string.
3. `fetch(WEATHER_CACHE_URL)` → `parseWeatherCache` → `buildWeatherLookupMap` или пустая Map (без блокировки UI).

`useBodyScrollLock(isFilterOpen)` — блокировка прокрутки при модалке фильтров.

### 11.2. `convertedSchedule`

1. Фильтр `Shed` (истина / TRUE / ✓ / 1 / «истина»).
2. Обогащение `weatherForecast` из Map.
3. При `useLocalTime` — `convertFromGMT3ToLocal` для каждой строки.
4. Фильтр дат: сегодня и позже **или** carryover из вчера (см. ниже).

### 11.3. `normalizedSchedule`

Дата приводится к короткому виду `DD.MM.YY` через `normalizeDateShort`.

### 11.4. Списки для фильтров

| Список | Источник |
| --- | --- |
| `seriesList` | Уникальные `championship`; сортировка: `PRIORITY_SERIES` сверху, остальные `localeCompare('ru')` |
| `daysList` | Уникальные `date`, сортировка по `parseDate` |
| `tracksList` | Уникальные непустые `place` |
| `commentatorsList` | Commentator1/2; если оба пусты — виртуальное значение **`Оригинальная дорожка`** |

`PRIORITY_SERIES` в `App.tsx`: `Формула 1`, `Индикар`, `НАСКАР Кубок`, `WEC`.

### 11.5. `filteredSchedule`

Пересечение по:

- серии (`appliedSeries` или все, если пусто/полный набор);
- день;
- трасса (`place`), если фильтр трасс активен не на «все»;
- комментатор (включая «Оригинальная дорожка»).

Если в категории выбраны **все** значения списка, категория не сужает выборку (логика «как без фильтра»).

### 11.6. Carryover-события

`addCarryoverItems`:

- событие началось **вчера**, по `Duration` заканчивается **сегодня или позже**;
- копия добавляется на сегодня с `isCarryover: true`, `startedLabel` вида «с DD.MM.YY до», `displayTime` — время окончания;
- из итогового списка **удаляется** вчерашний день (`yesterdayStr`), чтобы не дублировать колонку.

Вспомогательные функции: `parseDurationMs`, `getStartDate`, `formatDateShort`.

### 11.7. Статусы и видимость строк

| Функция | Логика |
| --- | --- |
| `isScheduleItemEnded` | `Ended` истинный |
| `isScheduleItemCancelled` | `Cancel` истинный и **не** ended |
| `isScheduleItemLive` | `Live` истинный и **не** ended |
| `isScheduleItemHiddenByStatus` | ended **или** cancel (без проверки ended для cancel в скрытии — cancel скрывается отдельно) |

**По умолчанию** завершённые и отменённые **не показываются** в `displaySchedule` и в строках `byDay`, если дата **не** в `shownHiddenDays`.

`endedDays` / `cancelledDays` — Set дат для отображения кнопки toggle.

`handleToggleHiddenForDay(date)` — переключает дату в `shownHiddenDays`; **всегда** вызывает `scrollToPageTop({ fast: true })` (~280 ms ease-out или мгновенно при `prefers-reduced-motion`).

### 11.8. Группировка и сортировка

- `byDay` — ключ `` `${date}_${day}` ``, строки с учётом скрытия статусов.
- `rowsByDate` — из `displaySchedule` по `date` (режим «По дням»).
- `sortDayRows` — сначала carryover, затем по минутам времени.

### 11.9. Отступы под fixed UI

```ts
DAY_SLIDER_HEIGHT = 76
DAY_SLIDER_OVERLAP = 4
menuOffsetValue = menuHeight + sliderHeight - overlap (если слайдер виден)
--menu-offset, --sticky-day-header-top на schedule-container
```

`showMenu = !loading && !error && originalSchedule.length > 0` — меню, zoom и слайдер только при успешных данных.

---

## 12. Состояние `App.tsx`

| State | Назначение |
| --- | --- |
| `originalSchedule` | Сырые данные после parseCSV |
| `loading`, `error` | Загрузка / ошибка CSV |
| `commentatorSchedule`, `commentatorScheduleLoading`, `commentatorScheduleError` | Данные сетки комментаторов |
| `weatherLookupMap` | Map ключ → массив точек прогноза |
| `isLightTheme` | Светлая / тёмная тема |
| `useLocalTime` | false = МСК, true = локальный пояс браузера |
| `viewMode` | `'all'` \| `'byDay'` |
| `selectedDay` | Дата в режиме byDay |
| `menuHeight` | Высота Menu (ResizeObserver) |
| `isFilterOpen` | Модалка фильтров |
| `appliedSeries/Days/Tracks/Commentators` | Применённые фильтры |
| `tempSeries/Days/Tracks/Commentators` | Черновик в модалке |
| `filterPage` | `'series' \| 'days' \| 'tracks' \| 'commentators'` |
| `filterError` | Ошибка валидации «ничего не выбрано» |
| `contentScale` | Масштаб `.schedule-content-zoom` |
| `shownHiddenDays` | Set дат, где показаны скрытые ended/cancel |
| `zoomControlsHeight` | Для `--zoom-controls-offset` |
| `touchStartRef` | Свайп между днями (mobile byDay) |

---

## 13. Фильтры

Модальное окно рендерится в `App.tsx` (не отдельный компонент).

**Вкладки:** Серии, Дни, Трассы, Комментаторы.  
**Чекбокс «Все …»** на каждой вкладке.

**Применение (`handleApplyFilter`):**

- если во всех четырёх категориях пусто — `filterError`;
- пустая категория при apply трактуется как «все значения списка»;
- закрытие модалки + `scrollToPageTop()` (smooth).

**Сброс:** все категории → полные списки, закрытие, scroll top.

**Приоритетные серии** в UI: класс `filter-item--priority` для `PRIORITY_SERIES`.

**Активные плашки** (`activeFilterLabels`):

- только если выбрано **строго меньше**, чем всего в категории;
- desktop — под `menu-center` (второй ряд EventLogo area);
- mobile — под `DA` / `ODA`;
- удаление → `removeFilterValue`; если в категории 0 значений — снова «все».

---

## 14. Режимы отображения

### `viewMode = 'all'`

- Колонки по дням из `byDay` (отсортированные по дате).
- Заголовок дня: `day-header-sticky` + `Header` (sticky под меню, `--sticky-day-header-top`).
- В `Header` — кнопка show/hide ended/cancel для этого дня (если есть такие события).
- Список `ScheduleRow`.

### `viewMode = 'byDay'`

- Fixed `DaySlider` под меню (`topOffset`, overlap 4px).
- Одна колонка `selectedDay`; строки из `rowsByDate`.
- Кнопка show/hide — блок `.by-day-ended-toggle` (**sticky**, `top: var(--menu-offset)`).
- **Свайп** по контейнеру приложения (ширина ≤720px): горизонтальный жест >50px переключает соседний день.

`DaySlider` строится из `dayOptions`, derived from `filteredDaysList` после фильтров (не из «сырых» дней CSV).

---

## 15. Статусы на карточке (`ScheduleRow`)

Под временем (колонка слева):

| UI | Условие |
| --- | --- |
| LIVE | `isLive` |
| ОТМЕНЕНО | `isCancelled` |
| ЗАВЕРШЕНО | `isEnded` (приоритет над live/cancel в логике отображения статусов) |

Погода **не** показывается для ended/cancel.

---

## 16. Масштабирование

Константы:

```ts
MIN_CONTENT_SCALE = 0.4
MAX_CONTENT_SCALE = 1
CONTENT_SCALE_STEP = 0.05
```

Блок `.zoom-controls` fixed снизу; масштаб через CSS `zoom` на `.schedule-content-zoom`. Меню и DaySlider **не** масштабируются.

Кнопки **−** / **+** меняют `contentScale` с шагом `CONTENT_SCALE_STEP`; центральная показывает **текущий** масштаб в процентах (подпись, `title` и часть `aria-label`) и по клику сбрасывает до 100% (неактивна при `contentScale === 1`).

---

## 17. Погода (`WeatherBadge`)

- Компонент: `WeatherBadge.tsx` + `WeatherBadge.css`.
- Показ: полоска/кнопка под контентом карточки; клик открывает модалку (portal), `useBodyScrollLock`.
- Иконки по WMO-like `weather_code`; палитра cyan/blue отличима от жёлтого акцента BOE.
- Tooltip/детали: `formatWeatherTooltip`, `getWeatherDescription` в `weatherUtils.ts`.

---

## 18. Расписание комментаторов на карточке

Условие `isCommentatorScheduleEvent` в `App.tsx`:

- WEC + session `94-я гонка "24 часа Ле-Мана"`;
- `ГТВЧ Европа (Эндуранс)` + session `Гонка (24 часа)`.

На таких строках показывается кнопка «Расписание комментаторов»; данные — общий `commentatorSchedule` из App. Модалка: desktop table + mobile table, цвета строк через CSS variable `--commentator-schedule-color`.

---

## 19. Компоненты (назначение и связи)

### `Menu.tsx`

- Fixed верхнее меню; измеряет высоту → `onHeightChange`.
- **Desktop:** слева `DonationButtons`; центр `menu-center`:
  - row primary: `[МСК/пояс] [filter quick-actions] [Все дни/По дням]`;
  - active filters desktop;
  - `EventLogo`.
- **Mobile (≤720px):** `menu-center` скрыт; сверху DA/ODA + mobile chips; кнопка «Настройки» + bottom sheet (время, режим, filter; theme в sheet, но theme-кнопка скрыта CSS).
- Переключатель темы в DOM есть, класс `.quick-actions__button--theme { display: none }` — временно скрыт.
- `useBodyScrollLock(isMobileSettingsOpen)`.

### `DonationButtons.tsx`

- `DA` → DonationAlerts; `ODA` → be-on-edge.oda.digital.

### `EventLogo.tsx`

- Промо Indy 500 до `HIDE_AFTER` (25.05.2026); ротация текстов; `indy500.png`.

### `DaySlider.tsx`

- Props: `days`, `selectedDate`, `onSelect`, `isLightTheme`, `topOffset`.
- Fixed, z-index 950.

### `Header.tsx`

- Обёртка дня + опциональная `header__ended-toggle` (текст Show/Hide внутри компонента; в byDay используется общий класс и `getHiddenEventsToggleLabel` из App).

### `DateDisplay.tsx` / `DayOfWeekDisplay.tsx`

- Дата `DD.MM.YY` и день недели.

### `ScheduleRow.tsx`

Структура (логическая):

```text
schedule-row-wrapper
├── time-container
│   ├── time (+ startedLabel для carryover)
│   ├── event-status-strip (LIVE / ЗАВЕРШЕНО / ОТМЕНЕНО)
│   ├── ScheduleIcons
│   └── spotter-button?
└── content-container
    ├── championship, event-stage-row (stage + place текст)
    ├── event-session-block (session + commentators-container)
    ├── commentator-schedule-trigger? (спец-события)
    ├── calendar-buttons (G, .ics, live timing)
    ├── Optionally?
    └── WeatherBadge?
```

Комментаторы: пустые оба поля → одна строка «Оригинальная дорожка» (логика в useMemo commentators).

### `ScheduleIcons.tsx`

Платформы: PC/VK, TG1-3, BCU, RuTube при RT.

### `Commentator.tsx`

Иконка микрофона на жёлтом фоне + имя.

### `Optionally.tsx`

«Важно: …» с жёлтой левой границей.

### `CalendarIcon.tsx`

SVG для G / .ics.

### `WeatherBadge.tsx`

См. §17.

---

## 20. Утилиты

| Модуль | Назначение |
| --- | --- |
| `csvParser.ts` | CSV строки с кавычками; `parseCSV`, `parseCommentatorScheduleCSV` |
| `weatherUtils.ts` | Ключи, map, parse JSON, описания погоды |
| `dateUtils.ts` | parseDate, today filter, getDayOfWeekFromDate, convertFromGMT3ToLocal — см. §20.1 (логирование ошибок) |
| `timeUtils.ts` | normalizeTime → HH:MM |
| `flagUtils.ts` | parseBooleanFlag |
| `iconUtils.ts` | getTgNumbers, getBcuNumbers |
| `textUtils.ts` | formatChampionship, formatStage |
| `calendarUtils.ts` | Google Calendar URL, iCal download (GMT+3, Duration или +2h) |
| `dataUtils.ts` | groupBy |
| `timezoneUtils.ts` | getUserTimeZone — **не используется** |

### `useBodyScrollLock.ts`

Reference-counted lock: несколько модалок могут держать lock; компенсация ширины scrollbar через `padding-right`.

### 20.1. `dateUtils.ts` — обработка невалидных дат и логирование

- `parseDate` при отсутствующих/некорректных компонентах строки возвращает `new Date(NaN)` **без** побочных эффектов (не бросает, не логирует) — это ожидаемый «пустой» результат для строк, которые ещё не соответствуют формату `DD.MM.YY(YY)`.
- `isDateEqualOrAfterToday` и `getDayOfWeekFromDate` **тихо** возвращают безопасное значение по умолчанию (`false` / `'неизвестно'`), если `parseDate` дал `NaN` — это штатный случай (например, пустая/не полностью введённая дата), поэтому `console.error` **не** вызывается.
- `console.error` в `catch`-блоках всех трёх функций (`isDateEqualOrAfterToday`, `getDayOfWeekFromDate`, `convertFromGMT3ToLocal`) остаётся **только** для непредвиденных исключений (не для рутинного invalid-date парсинга) — это убирает спам в консоли браузера/IDE при обычной работе с расписанием и сохраняет диагностику реальных багов.

---

## 21. Стили (слои)

| Файл | Зона ответственности |
| --- | --- |
| `index.css` | Design tokens `--boe-*`, Tektur, body background grid |
| `App.css` | app-container themes, schedule padding `--menu-offset`, sticky day header, by-day-ended-toggle, filter modal hi-tech, zoom, empty/loading |
| `Menu.css` | fixed menu, donation, toggles, filter button, chips, mobile sheet |
| `ScheduleRow.css` | карточка, session block, statuses, commentator modal, calendar buttons |
| `Header.css` | форма заголовка дня, ended toggle pulse |
| `DaySlider.css` | fixed slider |
| `WeatherBadge.css` | badge + weather modal (cyan accent) |
| Остальные component CSS | локальные блоки |

Breakpoint основной: **`max-width: 720px`**. Дополнительно menu: `max-width: 960px` (wrap donation row).

---

## 22. Адаптивность (mobile)

- Центральное desktop-меню скрыто.
- Фильтры и время — в bottom sheet «Настройки».
- Active filters под DA/ODA.
- Grid настроек в sheet: **2 колонки** (`repeat(2, minmax(0, 1fr))`).
- У schedule-row шире колонка времени; backdrop-filter на menu может быть отключён для perf.
- Свайп дней в byDay.

---

## 23. Связи между модулями (import graph)

```text
App.tsx
├── constants/index.ts          (CSV_URL, COMMENTATOR_*, WEATHER_*)
├── types/schedule.ts, types/weather.ts
├── hooks/useBodyScrollLock.ts
├── utils/csvParser.ts
│   ├── timeUtils.ts
│   └── dateUtils.ts
├── utils/weatherUtils.ts
│   └── timeUtils.ts
├── utils/dateUtils.ts, dataUtils.ts, flagUtils.ts
├── components/Menu.tsx
│   ├── DonationButtons.tsx
│   ├── EventLogo.tsx
│   └── useBodyScrollLock
├── components/DaySlider.tsx
├── components/Header.tsx
│   ├── DateDisplay.tsx
│   └── DayOfWeekDisplay.tsx
└── components/ScheduleRow.tsx
    ├── ScheduleIcons.tsx
    ├── Commentator.tsx
    ├── Optionally.tsx
    ├── CalendarIcon.tsx
    ├── WeatherBadge.tsx
    ├── calendarUtils.ts, textUtils.ts, timeUtils.ts
    └── useBodyScrollLock
```

---

## 24. Render tree (упрощённо)

```text
App (app-container, touch handlers for swipe)
├── Menu?
├── zoom-controls?
├── DaySlider?
├── schedule-container (--menu-offset)
│   └── schedule-content-zoom (zoom)
│       ├── loading / error / empty
│       ├── [viewMode=all] day-column[]
│       │   ├── day-header-sticky → Header → DateDisplay, DayOfWeekDisplay, ended toggle
│       │   └── ScheduleRow[]
│       └── [viewMode=byDay] day-column
│           ├── by-day-ended-toggle?
│           └── ScheduleRow[]
└── filter-overlay? (modal)
```

Порталы: weather modal, commentator schedule modal (внутри ScheduleRow).

---

## 25. Темы

`isLightTheme` переключает классы:

- `app-container--light` / `--dark`
- `menu--light` / `--dark`
- `schedule-row--light` / `--dark`
- и аналоги у дочерних блоков

Светлая: жёлтый фон `#E9C900`, чёрные акценты.  
Тёмная: `--boe-color-bg`, жёлтый акcent `#FFD600`.

---

## 26. Интеграции

| Интеграция | Реализация |
| --- | --- |
| Google Calendar | `generateGoogleCalendarUrl` + `window.open` |
| iCalendar / Яндекс | `downloadICalendarFile` |
| Live Timing | кнопка-секундомер если URL есть и ≠ `нет` |
| Spotter Guide | кнопка под иконками если Spotter заполнен |
| Платформы | фиксированные URL в ScheduleIcons |
| Погода | JSON cache + modal |

---

## 27. CI: обновление погоды

Файл: `.github/workflows/update-weather.yml`

- Триггер: cron каждый час (`15 * * * *`) и `workflow_dispatch`.
- Checkout ветки **`gh-pages`**.
- `curl` weather JSON с внешнего сервера → `data/weather_cache.json`.
- Commit/push при изменениях.

Production-сайт читает `./data/weather_cache.json` относительно корня Pages; локально — копия в `public/data/`.

---

## 28. Важные особенности поведения

- Завершённые и отменённые **скрыты по умолчанию**; показ — per-day через `shownHiddenDays`.
- **Ended** блокирует трактовку Live и Cancelled на карточке.
- Toggle show/hide **всегда** прокручивает страницу вверх (fast scroll).
- Carryover не показывает вчерашнюю колонку, только сегодняшнюю копию.
- `showMenu` false при loading/error/пустом CSV — пользователь видит только loading/error UI.
- Масштаб — CSS `zoom`, не `transform`.
- Фильтр трасс сопоставляет `place`; пустой place не матчится при активном узком фильтре трасс.
- Комментатор «Оригинальная дорожка» — синтетическая опция фильтра, не поле CSV.

---

## 29. Технический долг

### Безопасный

- Удалить или использовать `timezoneUtils.ts`, `DEFAULT_TIMEZONE`.
- Удалить неиспользуемый `src/logo.svg`.
- Актуализировать/удалить `App.test.tsx`.
- Убрать или включить переключатель темы (сейчас скрыт CSS).
- Удалить `EventLogo` после окончания промо-периода.

### Средний

- Вынести `FilterModal` из `App.tsx`.
- Вынести повторяющиеся toggles из `Menu.tsx` в подкомпоненты.
- Унифицировать текст ended-toggle (`Header` vs `getHiddenEventsToggleLabel`).
- Общий рендер props `ScheduleRow` (две ветки viewMode дублируют props).

### Осторожный

- Единый parsing date/time между App и `calendarUtils`.
- Carryover при `useLocalTime` — перепроверка границ «вчера/сегодня».
- Замена CSS `zoom` на `transform: scale` (влияет на sticky и scroll).

---

## 30. Проверка после изменений

```bash
npm run build
```

Ручной чеклист:

- загрузка CSV, ошибки сети;
- МСК / локальный пояс;
- Все дни / По дням, слайдер, свайп на mobile;
- фильтры: apply, reset, priority series, плашки, удаление;
- скрытие/показ ended/cancel + scroll top;
- sticky заголовки дня и by-day toggle;
- carryover (метка «с … до», время окончания);
- иконки платформ, RT, spotter, live timing;
- календарь G / .ics;
- погода (badge + modal), отсутствие при ended/cancel;
- расписание комментаторов на Le Mans / GTWEC 24h;
- zoom controls;
- mobile bottom sheet и блокировка scroll в модалках.

---

## 31. Связанные документы

- `README.md` — краткий обзор и быстрый старт.
- `SUBAGENT_PROJECT_STRUCTURE.md` — полное дерево файлов и папок для субагентов (explore / Task).
- `.env.example` — переменная погоды для CRA.

---

*Последняя синхронизация документа с кодовой базой: актуальное состояние репозитория schedule (React 19, weather, statuses, sticky UI, без режима «Будущие сессии» и без JS floating day headers). Учтены IDE/консольные фиксы: `react-app-env.d.ts` declare-модули для статических ассетов, `tsconfig.json` `ignoreDeprecations: "6.0"`, тихая обработка невалидных дат в `dateUtils.ts` (см. §3.1, §20.1).*
