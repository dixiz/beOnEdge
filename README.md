# BeOnEdge Schedule

React-приложение для отображения расписания трансляций Be On Edge. Данные загружаются из опубликованной Google Sheets таблицы (CSV), дополняются прогнозом погоды (JSON) и сеткой комментаторов для отдельных 24-часовых эфиров. Расписание фильтруется, группируется по дням и показывается в виде адаптивных карточек событий.

Подробная документация: [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).  
Дерево файлов для агентов: [SUBAGENT_PROJECT_STRUCTURE.md](./SUBAGENT_PROJECT_STRUCTURE.md).

## Возможности

- Загрузка расписания из Google Sheets CSV.
- Прогноз погоды по событиям (`public/data/weather_cache.json`, CI на `gh-pages`).
- Переключение времени: **МСК** / **Ваш пояс**.
- Режимы: **Все дни** и **По дням** (слайдер дней, свайп на mobile).
- Фильтры по сериям, дням, трассам и комментаторам; приоритетные серии в списке.
- Плашки активных фильтров с удалением отдельного значения.
- Статусы **Live**, **Завершено**, **Отменено**; скрытие завершённых/отменённых по дням с кнопкой «Показать / Скрыть».
- Светлая и тёмная тема (переключатель в коде временно скрыт в UI).
- Мобильный bottom sheet «Настройки».
- Карточки: платформы, комментаторы, live timing, spotter guide, календарь, модалка расписания комментаторов (Le Mans / GTWEC 24h).
- Масштаб контента (zoom).
- Sticky заголовки дней в режиме «Все дни»; закреплённая кнопка скрытия в режиме «По дням».

## Запуск

```bash
npm install
npm start
```

Приложение откроется на `http://localhost:3000`.

Опционально скопируйте `.env.example` в `.env.development` и задайте `REACT_APP_WEATHER_CACHE_URL`, если нужен другой URL кэша погоды.

## Скрипты

- `npm start` — dev-сервер.
- `npm run build` — production-сборка в `build/`.
- `npm test` — тесты CRA.
- `npm run deploy` — сборка и публикация `build/` в ветку `gh-pages`.

## Структура

```text
src/
  components/   UI (Menu, ScheduleRow, WeatherBadge, …)
  constants/    URL CSV, погоды, комментаторов
  hooks/        useBodyScrollLock
  types/        schedule, weather
  utils/        парсинг CSV, даты, погода, календари
  App.tsx       основная логика
  App.css       layout, фильтры, sticky
public/data/    weather_cache.json (dev / fallback)
.github/workflows/  update-weather.yml
```

## Источник данных

URL задаются в `src/constants/index.ts`:

- `CSV_URL` — основное расписание;
- `COMMENTATOR_SCHEDULE_CSV_URL` — лист с сеткой комментаторов;
- `WEATHER_CACHE_URL` — JSON прогноза (env или `./data/weather_cache.json`).

Ожидаемые колонки основного CSV:

```text
Shed, Live, Ended, Delay, Cancel, Date, Start, Championship, Stage,
Place, Session, PC, TG1, TG2, TG3, BCU1, BCU2, BCU3, RT,
Commentator1, Commentator2, Optionally, Duration, Live Timing,
RuTube, Spotter
```

Обязательные поля строки: `Date`, `Start`, `Championship`, `Session`. Строка попадает в расписание при истинном `Shed`.

## Деплой

```bash
npm run deploy
```

Скрипт выполняет `npm run build`, затем публикует `build/` в ветку `gh-pages`. Workflow `Update Weather Data` обновляет `data/weather_cache.json` на той же ветке по расписанию.
