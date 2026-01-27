# BeOnEdge Schedule - Документация проекта

## Общее описание проекта

**BeOnEdge Schedule** — веб-приложение на React для отображения расписания спортивных событий. Приложение загружает данные из Google Sheets в формате CSV, обрабатывает их и отображает в удобном виде с возможностью переключения темы (светлая/темная) и часового пояса (МСК/локальный).

### Основные возможности:
- Загрузка расписания из Google Sheets (CSV)
- Переключение вида расписания: `Все дни` (группировка по дням) / `По дням` (слайдер дней с выбором конкретной даты)
- Слайдер дней синхронизирован с фильтрами: показывает только даты, оставшиеся после применённых фильтров
- Фильтрация: показ только текущих и будущих событий
- Переключение темы (светлая/темная)
- Переключение часового пояса (МСК / локальный)
- Добавление событий в Google Calendar и Яндекс Календарь
- Отображение перенесённых событий, начавшихся вчера и продолжающихся сегодня (с пометкой `с DD.MM.YY`)
- Адаптивный дизайн

### Технологический стек:
- React 19.2.0
- TypeScript 4.9.5
- CSS (Grid, Flexbox, CSS Variables)
- gh-pages для деплоя на GitHub Pages

---

## Структура проекта

```
schedule/
├── src/
│   ├── components/          # React компоненты
│   ├── utils/              # Утилиты для обработки данных
│   ├── types/              # TypeScript типы
│   ├── constants/          # Константы
│   ├── App.tsx             # Главный компонент
│   └── App.css             # Глобальные стили
├── public/                 # Статические файлы
└── package.json            # Зависимости и скрипты
```

---

## Модули проекта

### 1. `src/App.tsx` - Главный компонент приложения

**Назначение:** Управляет состоянием приложения, загружает данные, обрабатывает их и рендерит интерфейс.

**Состояние (основные поля):**
- `originalSchedule` - исходные данные из CSV
- `loading` / `error` - загрузка и ошибки
- `isLightTheme` - тема (false = темная, true = светлая)
- `useLocalTime` - использование локального времени (false = МСК, true = локальный)
- `viewMode` - вид расписания (`all` / `byDay`), по умолчанию `all`
- `selectedDay` - выбранный день в режиме `byDay`
- `menuHeight` - измеренная высота меню (для вычисления отступа контента)
- Состояния фильтра: `isFilterOpen`, `applied*` и `temp*` для серий/дней/трасс/комментаторов, `filterPage`, `filterError`

**Логика:**
1. При монтировании (`useEffect`) загружает CSV из `CSV_URL`
2. Парсит CSV через `parseCSV()`
3. Фильтрует вход: оставляет только строки, где `Shed` = true (TRUE/1/✓/"истина")
4. Конвертирует время через `convertFromGMT3ToLocal()` при `useLocalTime === true`
5. Фильтрует события через `isDateEqualOrAfterToday()` (только текущие и будущие)
6. Нормализует даты (в CSV `DD.MM.YYYY`) к виду `DD.MM.YY` для вывода и дедупликации
7. Строит `filteredSchedule` по активным фильтрам (серии/дни/трассы/комментаторы)
8. Формирует `dayOptions` для слайдера дней из отфильтрованных дат; короткие названия дней (Пн, Вт, …), низ — `dd.mm`

9. Управляет видами:
   - `viewMode = all`: группирует по дням (`byDay`) и выводит все дни
   - `viewMode = byDay`: показывает слайдер дней (учитывает фильтры) и отображает выбранный день
10. Для событий, начавшихся вчера и продолжающихся сегодня, добавляет строку в список за сегодня:
   - отображает время окончания
   - показывает метку `с DD.MM.YY`
   - такие строки всегда в начале списка дня
11. Вычисляет отступ контейнера расписания по высоте меню + (опционально) слайдера дней через CSS-переменную `--menu-offset`

**Связи:**
- Использует: `constants/index.ts` (CSV_URL), `utils/csvParser.ts`, `utils/dataUtils.ts`, `utils/dateUtils.ts`, `utils/flagUtils.ts`, `utils/iconUtils.ts`
- Рендерит: `Menu`, `DaySlider` (в `viewMode = byDay`), `Header`, `DateDisplay`, `DayOfWeekDisplay`, `ScheduleRow`
- Передает в `ScheduleRow`: данные события, `isLightTheme`, массивы номеров иконок (`getTgNumbers`, `getBcuNumbers`), `Duration`, `LiveTiming`

**Мемоизация:**
- `convertedSchedule` - конвертированное и отфильтрованное расписание
- `byDay` - группировка по дням
- `handleToggleTheme`, `handleToggleTime` - обработчики

---

### 2. `src/constants/index.ts` - Константы

**Назначение:** Хранит глобальные константы приложения.

**Константы:**
- `CSV_URL` - URL для загрузки CSV из Google Sheets
  - Формат: `https://docs.google.com/spreadsheets/d/e/{ID}/pub?output=csv`
  - Используется в `App.tsx` для загрузки данных
- `DAYS_OF_WEEK` - массив дней недели на русском
  - `['воскресенье', 'понедельник', ..., 'суббота']`
  - Используется в `dateUtils.ts` для вычисления дня недели
- `TRUE_VALUES` - значения, считающиеся `true` для флагов
  - `['TRUE', 'true', '1', '✓']`
  - Используется в `flagUtils.ts` для парсинга булевых флагов
- `DEFAULT_TIMEZONE` - часовой пояс по умолчанию (не используется в текущей версии)

**Связи:**
- Используется в: `App.tsx`, `dateUtils.ts`, `flagUtils.ts`

---

### 3. `src/types/schedule.ts` - TypeScript типы

**Назначение:** Определяет структуру данных расписания.

**Интерфейс `ScheduleItem`:**
```typescript
{
  Shed?: string;          // Статус "запланировано" (опционально)
  Live?: string;          // Статус "в эфире" (опционально)
  Ended?: string;         // Статус "завершено" (опционально)
  Delay?: string;         // Статус "задержка" (опционально)
  Cancel?: string;        // Статус "отменено" (опционально)
  date: string;           // Формат: "DD.MM.YY" или "DD.MM.YYYY"
  day: string;            // День недели (вычисляется из date)
  time: string;           // Формат: "HH:MM"
  championship: string;   // Название чемпионата
  stage?: string;         // Название этапа (опционально)
  place: string;          // Место проведения
  session: string;         // Название сессии
  PC?: string;            // Флаг показа иконки компьютера
  TG1?, TG2?, TG3?: string;  // Флаги для иконок Telegram (1-3)
  BCU1?, BCU2?, BCU3?: string; // Флаги для иконок телевизора (1-3)
  Commentator1?, Commentator2?: string; // Имена комментаторов
  Optionally?: string;    // Дополнительная информация
  Duration?: string;      // Длительность (HH:MM:SS или HH:MM)
  LiveTiming?: string;    // Ссылка на live timing или "нет"
}
```

**Связи:**
- Используется во всех модулях для типизации данных расписания

---

### 4. `src/utils/csvParser.ts` - Парсер CSV

**Назначение:** Парсит CSV-текст в массив `ScheduleItem[]`.

**Ожидаемый порядок колонок (заголовков):**
`Shed, Live, Ended, Delay, Cancel, Date, Start, Championship, Stage, Place, Session, PC, TG1, TG2, TG3, BCU1, BCU2, BCU3, Commentator1, Commentator2, Optionally, Duration, Live Timing`

- Колонки `Shed`, `Live`, `Ended`, `Delay`, `Cancel`, `Duration`, `Live Timing` опциональны: парсер загружает их в поля `ScheduleItem`, и они используются частично (Duration влияет на календари и перенос, Live Timing — на кнопку секундомера).
- Колонка `Start` мапится в поле `time` и нормализуется.
- Обязательные поля для валидации: `Date`, `Start`, `Championship`, `Place`, `Session`.

**Функции:**
- `parseCSVLine(line: string): string[]` - парсит строку CSV с учетом кавычек
  - Обрабатывает экранированные кавычки (`""`)
  - Разделяет по запятым вне кавычек
- `validateScheduleItem(item): boolean` - валидирует обязательные поля
  - Проверяет: `date`, `time`, `championship`, `place`, `session`
- `parseCSV(text: string): ScheduleItem[]` - главная функция парсинга
  - Разбивает текст на строки
  - Первая строка = заголовки
  - Остальные строки = данные
  - Нормализует время через `normalizeTime()`
  - Вычисляет день недели через `getDayOfWeekFromDate()`

**Логика:**
1. Разделяет CSV на строки
2. Парсит заголовки
3. Для каждой строки данных:
   - Парсит значения с учетом кавычек
   - Создает объект по заголовкам
   - Валидирует обязательные поля
   - Нормализует время и вычисляет день недели

**Связи:**
- Использует: `utils/timeUtils.ts` (normalizeTime), `utils/dateUtils.ts` (getDayOfWeekFromDate)
- Используется в: `App.tsx`

---

### 5. `src/utils/dateUtils.ts` - Утилиты для работы с датами

**Назначение:** Обработка дат: парсинг, конвертация часовых поясов, фильтрация.

**Функции:**
- `parseDate(dateStr: string): Date` - парсит дату из `DD.MM.YY` или `DD.MM.YYYY`
  - Поддерживает 2- и 4-значные годы
  - Создает объект `Date` с временем 12:00:00
- `getCurrentDate(): Date` - возвращает текущую дату без времени
- `isDateEqualOrAfterToday(dateStr: string): boolean` - проверяет, что дата >= сегодня
  - Используется для фильтрации прошедших событий
- `getDayOfWeekFromDate(dateStr: string): string` - вычисляет день недели
  - Использует `DAYS_OF_WEEK` из констант
  - Возвращает русское название дня
- `convertFromGMT3ToLocal(item: ScheduleItem): ScheduleItem` - конвертирует время из GMT+3 в локальный часовой пояс
  - Парсит дату и время из `ScheduleItem`
  - Создает дату в GMT+3
  - Конвертирует в локальный часовой пояс браузера
  - Обновляет `date`, `time`, `day` в объекте

**Логика конвертации времени:**
1. Парсит дату и время из `ScheduleItem`
2. Создает `Date` в формате `YYYY-MM-DDTHH:mm:ss+03:00`
3. JavaScript автоматически конвертирует в локальный часовой пояс
 4. Форматирует обратно в `DD.MM.YY` и `HH:MM`
5. Вычисляет новый день недели

**Связи:**
- Использует: `constants/index.ts` (DAYS_OF_WEEK), `utils/timeUtils.ts` (normalizeTime)
- Используется в: `App.tsx`, `csvParser.ts`, `calendarUtils.ts`

---

### 6. `src/utils/timeUtils.ts` - Утилиты для работы со временем

**Назначение:** Нормализация формата времени.

**Функции:**
- `normalizeTime(timeStr: string): string` - нормализует время к формату `HH:MM`
  - Добавляет ведущие нули для часов и минут
  - Пример: `"9:5"` → `"09:05"`

**Связи:**
- Используется в: `csvParser.ts`, `dateUtils.ts`

---

### 7. `src/utils/timezoneUtils.ts` - Утилиты для часовых поясов

**Назначение:** Получение информации о часовом поясе пользователя.

**Функции:**
- `getUserTimeZone(): string` - возвращает строку типа `"GMT +3"`
  - Использует `Date.getTimezoneOffset()`
  - Вычисляет смещение в часах
  - Форматирует в `GMT ±N`

**Примечание:** В текущей версии не используется, но может быть полезно для отображения информации о часовом поясе.

---

### 8. `src/utils/dataUtils.ts` - Утилиты для работы с данными

**Назначение:** Общие утилиты для обработки массивов данных.

**Функции:**
- `groupBy<T>(arr: T[], keyGetter: (item: T) => string): Record<string, T[]>`
  - Группирует массив по ключу
  - Возвращает объект `{ [key]: T[] }`
  - Используется для группировки событий по дням

**Пример использования:**
```typescript
groupBy(schedule, r => `${r.date}_${r.day}`)
// Результат: { "28.12.2025_суббота": [event1, event2], ... }
```

**Связи:**
- Используется в: `App.tsx`

---

### 9. `src/utils/flagUtils.ts` - Парсинг булевых флагов

**Назначение:** Преобразует строковые значения в булевы флаги.

**Функции:**
- `parseBooleanFlag(value?: string): boolean`
  - Проверяет, входит ли значение в `TRUE_VALUES`
  - Возвращает `true` если значение = `'TRUE'`, `'true'`, `'1'`, `'✓'`

**Связи:**
- Использует: `constants/index.ts` (TRUE_VALUES)
- Используется в: `iconUtils.ts`

---

### 10. `src/utils/iconUtils.ts` - Утилиты для иконок

**Назначение:** Формирует массивы номеров для иконок Telegram и телевизора.

**Функции:**
- `getTgNumbers(item: ScheduleItem): number[]`
  - Проверяет флаги `TG1`, `TG2`, `TG3`
  - Возвращает массив номеров активных иконок
  - Пример: если `TG1=true`, `TG2=true` → `[1, 2]`
- `getBcuNumbers(item: ScheduleItem): number[]`
  - Аналогично для `BCU1`, `BCU2`, `BCU3`

**Логика:**
1. Проверяет каждый флаг через `parseBooleanFlag()`
2. Если флаг `true`, добавляет номер в массив
3. Фильтрует `false` значения

**Связи:**
- Использует: `utils/flagUtils.ts` (parseBooleanFlag)
- Используется в: `App.tsx`

---

### 11. `src/utils/textUtils.ts` - Форматирование текста

**Назначение:** Форматирует названия чемпионатов и этапов.

**Функции:**
- `formatChampionship(championship?: string): string`
  - Добавляет точку в конце, если её нет
  - Пример: `"Formula 1"` → `"Formula 1."`
- `formatStage(stage?: string): string`
  - Убирает точку в конце, если она есть
  - Пример: `"Этап 1."` → `"Этап 1"`

**Связи:**
- Используется в: `ScheduleRow.tsx`

---

### 12. `src/utils/calendarUtils.ts` - Интеграция с календарями

**Назначение:** Генерация URL для Google Calendar и файлов .ics для Яндекс Календаря.

**Функции:**
- `formatDateForCalendar(date: Date): string`
  - Форматирует дату в формат `YYYYMMDDTHHmmssZ` (UTC)
  - Используется для календарных форматов
- `parseScheduleDateTime(item: ScheduleItem): { startDate: Date; endDate: Date }`
  - Парсит дату и время из `ScheduleItem`
  - Создает дату начала в GMT+3
  - Создает дату окончания (по `Duration`, иначе +2 часа)
- `buildEventDescription(item: ScheduleItem): string`
  - Формирует описание события из полей `ScheduleItem`
  - Включает: этап, сессию, место, комментаторов, опциональную информацию
- `generateGoogleCalendarUrl(item: ScheduleItem): string`
  - Генерирует URL для добавления события в Google Calendar
  - Формат: `https://calendar.google.com/calendar/render?action=TEMPLATE&...`
  - Параметры: `text`, `dates`, `details`, `location`
- `escapeICS(text: string): string`
  - Экранирует специальные символы для формата iCalendar
  - Обрабатывает: `\`, `;`, `,`, `\n`, `\r`
- `generateICalendarFile(item: ScheduleItem): string`
  - Генерирует содержимое .ics файла
  - Формат: стандарт iCalendar (RFC 5545)
  - Включает: UID, DTSTART, DTEND, SUMMARY, DESCRIPTION, LOCATION
- `downloadICalendarFile(item: ScheduleItem): void`
  - Создает Blob с .ics содержимым
  - Генерирует имя файла из чемпионата, этапа, сессии, даты
  - Инициирует скачивание файла

**Логика генерации событий:**
1. Парсит дату и время из `ScheduleItem`
2. Создает дату начала в GMT+3
3. Добавляет длительность из `Duration` (если есть, формат `HH:MM:SS` или `HH:MM`), иначе +2 часа
4. Форматирует в нужный формат (URL или .ics)
5. Для Google Calendar: открывает URL в новой вкладке
6. Для Яндекс Календаря: скачивает .ics файл

**Связи:**
- Использует: `types/schedule.ts` (ScheduleItem)
- Используется в: `ScheduleRow.tsx`

---

### 13. `src/components/Menu.tsx` - Компонент меню

**Назначение:** Отображает переключатели темы/часового пояса и кнопку фильтра серий.

**Props:**
- `isLightTheme?: boolean` - текущая тема
- `onToggleTheme?: () => void` - обработчик переключения темы
- `useLocalTime?: boolean` - использование локального времени
- `onToggleTime?: (useLocal: boolean) => void` - обработчик переключения времени

**Логика:**
- Отображает кнопку переключения темы (солнце/луна)
- Отображает переключатель времени: "МСК" / "Ваш часовой пояс"
- Активная опция подсвечивается
- Кнопка фильтра (иконка) открывает поп-ап:
  - Вкладки: "Серии" (список серий, алфавит), "Дни" (даты по возрастанию, `DD.MM.YY, <день недели>`), "Трассы" (места, есть пункт "Особая трасса" для пустого `place`), "Комментаторы" (Commentator1/2 + "Оригинальная дорожка" для пустых)
  - Чекбоксы "Все серии" / "Все дни" / "Все трассы" / "Все комментаторы" — включают/выключают все
  - При открытии: чекбоксы пустые, если фильтр не активен; если активен — отмечены текущие элементы
  - Правила OK:
    - если ничего не выбрано → предупреждение "Не выбрана ни одна серия"
    - если выбраны дни, но серий нет → показываются все серии выбранных дней
    - если выбраны серии, но дней нет → показываются выбранные серии по всем дням
    - если выбраны только трассы → показываются строки выбранных трасс (включая "Особая трасса" для пустого `place`)
    - если выбраны только комментаторы → показываются строки выбранных комментаторов (учитываются оба поля Commentator1/2 и "Оригинальная дорожка" при их отсутствии)
  - Кнопка "Сброс": снимает все фильтры, показывает все данные
  - Крестик: закрывает поп-ап без перерисовки страницы
  - При отсутствии результатов после фильтрации выводится под меню: "Упс! Ни одна гоночная серия не подходит для установленных отборов"

**Связи:**
- Используется в: `App.tsx`
- Стили: `Menu.css`

---

### 14. `src/components/Header.tsx` - Компонент заголовка

**Назначение:** Обертка для заголовка колонки дня.

**Props:**
- `children: ReactNode` - содержимое (обычно `DateDisplay` и `DayOfWeekDisplay`)
- `isLightTheme?: boolean` - тема

**Связи:**
- Используется в: `App.tsx`
- Стили: `Header.css`

---

### 15. `src/components/DateDisplay.tsx` - Отображение даты

**Назначение:** Отображает дату в формате `DD.MM.YY` (усекает год до двух цифр).

**Props:**
- `date: string` - дата, отображается как `DD.MM.YY` (вход может быть с 2 или 4 цифрами года)
- `isLightTheme?: boolean` - тема

**Связи:**
- Используется в: `App.tsx` (через `Header`)
- Стили: `DateDisplay.css`

---

### 16. `src/components/DayOfWeekDisplay.tsx` - Отображение дня недели

**Назначение:** Отображает день недели на русском языке.

**Props:**
- `day: string` - день недели (например, "понедельник")
- `isLightTheme?: boolean` - тема

**Связи:**
- Используется в: `App.tsx` (через `Header`)
- Стили: `DayOfWeekDisplay.css`

---

### 17. `src/components/ScheduleRow.tsx` - Строка расписания

**Назначение:** Отображает одно событие расписания со всей информацией.

**Props:**
- Все поля из `ScheduleItem` (date, time, championship, stage, place, session, ...)
- `isLightTheme?: boolean` - тема
- `showPC?: boolean` - показывать иконку компьютера
- `tgNumbers?: number[]` - номера иконок Telegram (например, `[1, 2]`)
- `bcuNumbers?: number[]` - номера иконок телевизора
- `commentator1?, commentator2?: string` - комментаторы
- `optionally?: string` - дополнительная информация
- `duration?: string` - длительность (используется для календарей)
- `liveTiming?: string` - ссылка на live timing, если есть
- `displayTime?: string` - отображаемое время (для перенесённых событий)
- `startedLabel?: string` - метка старта (например, `с 26.01.26`)

**Логика:**
1. Нормализует время через `normalizeTime()`
2. Форматирует чемпионат и этап через `formatChampionship()`, `formatStage()`
3. Обрабатывает комментаторов:
   - Если оба пустые → показывает "Оригинальная дорожка"
   - Иначе показывает список комментаторов
4. Создает объект `ScheduleItem` для календарей
5. Обработчики:
   - `handleAddToGoogleCalendar()` - открывает URL Google Calendar
   - `handleAddToYandexCalendar()` - скачивает .ics файл
   - `handleOpenLiveTiming()` - открывает ссылку из `Live Timing`

**Структура рендера:**
```
schedule-row-wrapper
├── time-container
│   ├── time (время)
│   └── ScheduleIcons (иконки PC, TG, BCU)
└── content-container
    ├── content-header
    │   ├── content-text
    │   │   ├── championship (чемпионат)
    │   │   ├── stage (этап, если есть)
    │   │   ├── place-session (место. сессия)
    │   │   └── commentators-container (комментаторы)
    │   └── calendar-buttons (кнопки календарей)
    └── Optionally (важная информация, если есть)
```

**Мемоизация:**
- `commentators` - список комментаторов
- `normalizedTime` - нормализованное время
- `formattedChampionship`, `formattedStage` - отформатированный текст
- `scheduleItem` - объект для календарей
- `handleAddToGoogleCalendar`, `handleAddToYandexCalendar`, `handleOpenLiveTiming` - обработчики

**Связи:**
- Использует: `ScheduleIcons`, `Commentator`, `Optionally`, `CalendarIcon`
- Использует: `utils/timeUtils.ts`, `utils/calendarUtils.ts`, `utils/textUtils.ts`
- Используется в: `App.tsx`
- Стили: `ScheduleRow.css`

---

### 18. `src/components/ScheduleIcons.tsx` - Иконки расписания

**Назначение:** Отображает иконки PC, Telegram, TV с номерами.

**Props:**
- `showPC?: boolean` - показывать иконку компьютера
- `tgNumbers?: number[]` - массив номеров Telegram (например, `[1, 2]`)
- `bcuNumbers?: number[]` - массив номеров телевизора
- `isLightTheme?: boolean` - тема

**Логика:**
- Рендерит иконки в три ряда:
  1. Ряд 1: иконка PC (если `showPC === true`), обернута в ссылку `https://vk.com/be_on_edge` с подсветкой фона при hover/focus на жёлтый (`#ffe44d`)
  2. Ряд 2: иконки Telegram с номерами (если `tgNumbers.length > 0`), каждая обернута в ссылку:
     - `1 → https://t.me/BoE_LIVE_1`
     - `2 → https://t.me/BoE_LIVE_2`
     - `3 → https://t.me/BoE_LIVE_3`
     - при hover/focus фон иконки меняется на голубой (`#33a9e1`)
  3. Ряд 3: иконки телевизора с номерами (если `bcuNumbers.length > 0`), каждая обернута в ссылку `https://bcumedia.su/` с подсветкой фона при hover/focus на оранжевый (`#ff8533`)
- Если в ряду несколько иконок, они отображаются рядом
- Если нет ни одной иконки, компонент не рендерится

**Связи:**
- Используется в: `ScheduleRow.tsx`
- Стили: `ScheduleIcons.css`

---

### 19. `src/components/CalendarIcon.tsx` - Иконка календаря

**Назначение:** Переиспользуемый компонент иконки календаря с буквой/текстом внутри.

**Props:**
- `letter: string` - текст для отображения внутри (например, "G" или ".ics")
- `fontSize?: string` - размер шрифта (по умолчанию "10")
- `isLightTheme: boolean` - тема

**Логика:**
- Рисует SVG календаря с рамкой
- Внутри отображает текст (`letter`)
- Цвета зависят от темы:
  - Светлая тема: обводка черная, акцент желтый, буква черная
  - Темная тема: обводка желтая, акцент черный, буква желтая

**Связи:**
- Используется в: `ScheduleRow.tsx`
- Стили: через CSS классы (определяются в `ScheduleRow.css`)

---

### 20. `src/components/Commentator.tsx` - Компонент комментатора

**Назначение:** Отображает имя комментатора с иконкой микрофона.

**Props:**
- `name: string` - имя комментатора

**Связи:**
- Используется в: `ScheduleRow.tsx`
- Стили: `Commentator.css`

---

### 21. `src/components/Optionally.tsx` - Компонент важной информации

**Назначение:** Отображает дополнительную важную информацию.

**Props:**
- `text: string` - текст информации
- `isLightTheme?: boolean` - тема

**Формат:** "Важно: {text}"

**Связи:**
- Используется в: `ScheduleRow.tsx`
- Стили: `Optionally.css`

---

### 22. `src/App.css` - Глобальные стили

**Назначение:** Определяет общую структуру и стили приложения.

**Основные классы:**
- `.app-container` - контейнер приложения
  - `.app-container--light` - светлая тема (фон `#FFD600`, текст черный)
  - `.app-container--dark` - темная тема (фон `#181818`, текст белый)
  - CSS переменная `--text-color` для цвета текста
- `.schedule-container` - контейнер расписания
  - Flexbox с центрированием
  - Адаптивные отступы
- `.day-column` - колонка одного дня
  - Фиксированная ширина с адаптивностью
- `.day-rows-container` - контейнер строк расписания
  - CSS Grid: `grid-template-columns: clamp(80px, 10vw, 100px) 1fr`
  - Левая колонка: время и иконки
  - Правая колонка: контент события

**Адаптивность:**
- Использует `clamp()` для адаптивных размеров
- Поддерживает различные размеры экранов

---

## Поток данных

### Загрузка и обработка данных:

1. **Загрузка CSV:**
   ```
   App.tsx (useEffect) 
   → fetch(CSV_URL) 
   → parseCSV(text) 
   → ScheduleItem[]
   ```

2. **Конвертация времени:**
   ```
   originalSchedule 
   → convertFromGMT3ToLocal() (если useLocalTime === true)
   → convertedSchedule
   ```

3. **Фильтрация:**
   ```
   convertedSchedule 
   → filter(isDateEqualOrAfterToday)
   → только текущие и будущие события
   ```

4. **Группировка:**
   ```
   filteredSchedule 
   → groupBy(item => `${item.date}_${item.day}`)
   → { "28.12.2025_суббота": [event1, event2], ... }
   ```

5. **Рендеринг:**
   ```
   byDay 
   → Object.entries() 
   → day-column (для каждого дня)
   → Header + ScheduleRow[] (для каждого события)
   ```

### Обработка иконок:

```
ScheduleItem (TG1, TG2, TG3, BCU1, BCU2, BCU3)
→ getTgNumbers(), getBcuNumbers()
→ parseBooleanFlag() для каждого флага
→ number[] (например, [1, 2])
→ ScheduleIcons (рендерит иконки с номерами)
```

### Интеграция с календарями:

```
ScheduleRow (кнопка календаря)
→ handleAddToGoogleCalendar() / handleAddToYandexCalendar()
→ generateGoogleCalendarUrl() / downloadICalendarFile()
→ parseScheduleDateTime() (парсит дату/время)
→ formatDateForCalendar() (форматирует для календаря)
→ URL открывается / .ics файл скачивается
```

---

## Зависимости между модулями

```
App.tsx
├── constants/index.ts (CSV_URL)
├── utils/csvParser.ts
│   ├── utils/timeUtils.ts
│   └── utils/dateUtils.ts
│       └── constants/index.ts (DAYS_OF_WEEK)
├── utils/dataUtils.ts
├── utils/dateUtils.ts
│   ├── constants/index.ts (DAYS_OF_WEEK)
│   └── utils/timeUtils.ts
├── utils/flagUtils.ts
│   └── constants/index.ts (TRUE_VALUES)
├── utils/iconUtils.ts
│   └── utils/flagUtils.ts
└── components/
    ├── Menu.tsx
    ├── Header.tsx
    │   ├── DateDisplay.tsx
    │   └── DayOfWeekDisplay.tsx
    └── ScheduleRow.tsx
        ├── ScheduleIcons.tsx
        ├── Commentator.tsx
        ├── Optionally.tsx
        ├── CalendarIcon.tsx
        ├── utils/timeUtils.ts
        ├── utils/textUtils.ts
        └── utils/calendarUtils.ts
            └── utils/dateUtils.ts (parseDate)
```

---

## Важные особенности реализации

### 1. Мемоизация
- Используется `useMemo` для дорогих вычислений (конвертация расписания, группировка)
- Используется `useCallback` для обработчиков событий
- Компоненты обернуты в `React.memo` где необходимо

### 2. Уникальные ключи
- В `App.tsx` используется сложный ключ для `ScheduleRow`:
  ```typescript
  `${row.date}_${row.time}_${row.championship}_${row.stage || ''}_${row.session}_${row.place}_${row.Commentator1 || ''}_${row.Commentator2 || ''}_${row.Optionally || ''}_${index}`
  ```
- Это гарантирует уникальность даже при дублирующихся событиях

### 3. Обработка ошибок
- Валидация данных на этапе парсинга CSV
- Проверка валидности дат
- Fallback значения при ошибках

### 4. Адаптивность
- Использование `clamp()` для адаптивных размеров
- CSS Grid и Flexbox для гибкой верстки
- Поддержка различных размеров экранов

### 5. Темы
- CSS переменные (`--text-color`) для динамического изменения цветов
- Классы модификаторы (`--light`, `--dark`) для переключения тем

---

## Развертывание

### Скрипты в `package.json`:
- `npm start` - запуск dev-сервера
- `npm run build` - сборка production версии
- `npm run deploy` - деплой на GitHub Pages (через `gh-pages`)

### Конфигурация деплоя:
- `homepage` в `package.json` указывает базовый URL для GitHub Pages
- `gh-pages` публикует папку `build` в ветку `gh-pages`

---

## Будущие улучшения

1. Кэширование данных CSV
2. Обработка ошибок сети (retry, offline mode)
3. Тестирование (unit, integration)
4. Оптимизация производительности (lazy loading, виртуализация)
5. Поддержка нескольких источников данных
6. Экспорт расписания в другие форматы

