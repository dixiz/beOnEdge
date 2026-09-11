# Структура проекта BeOnEdge Schedule (для субагентов)

**Назначение:** быстрая навигация по дереву файлов без обхода репозитория.  
**Корень приложения:** каталог `schedule/` (относительные пути ниже — от `schedule/`).  
**Семантика модулей и потоки данных:** [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

**Не перечисляются:** `node_modules/`, `build/`, содержимое `.git/` (артефакты сборки и зависимостей).

**Обновление:** при добавлении/удалении файлов синхронизируйте этот документ.

---

## Дерево файлов и папок

```text
schedule/
├── .env.development
├── .env.example
├── .env.production
├── .gitattributes
├── .github/
│   └── workflows/
│       └── update-weather.yml
├── .gitignore
├── fix-git-branches.ps1
├── GIT_BRANCHES_FIX.md
├── package.json
├── package-lock.json
├── PROJECT_DOCUMENTATION.md
├── SUBAGENT_PROJECT_STRUCTURE.md          ← этот файл
├── README.md
├── tsconfig.json
├── scripts/                               (пустая папка)
├── server/                                (пустая папка)
├── public/
│   ├── CNAME
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── data/
│       └── weather_cache.json
└── src/
    ├── App.tsx
    ├── App.css
    ├── App.test.tsx
    ├── index.tsx
    ├── index.css
    ├── logo.svg
    ├── react-app-env.d.ts
    ├── reportWebVitals.ts
    ├── setupTests.ts
    ├── assets/
    │   └── indy500.png
    ├── components/
    │   ├── CalendarIcon.tsx
    │   ├── Commentator.tsx
    │   ├── Commentator.css
    │   ├── DateDisplay.tsx
    │   ├── DateDisplay.css
    │   ├── DayOfWeekDisplay.tsx
    │   ├── DayOfWeekDisplay.css
    │   ├── DaySlider.tsx
    │   ├── DaySlider.css
    │   ├── DonationButtons.tsx
    │   ├── EventLogo.tsx
    │   ├── EventLogo.css
    │   ├── Header.tsx
    │   ├── Header.css
    │   ├── Menu.tsx
    │   ├── Menu.css
    │   ├── Optionally.tsx
    │   ├── Optionally.css
    │   ├── ScheduleIcons.tsx
    │   ├── ScheduleIcons.css
    │   ├── ScheduleRow.tsx
    │   ├── ScheduleRow.css
    │   ├── WeatherBadge.tsx
    │   └── WeatherBadge.css
    ├── constants/
    │   └── index.ts
    ├── hooks/
    │   └── useBodyScrollLock.ts
    ├── types/
    │   ├── schedule.ts
    │   └── weather.ts
    └── utils/
        ├── calendarUtils.ts
        ├── csvParser.ts
        ├── dataUtils.ts
        ├── dateUtils.ts
        ├── flagUtils.ts
        ├── iconUtils.ts
        ├── textUtils.ts
        ├── timeUtils.ts
        ├── timezoneUtils.ts
        └── weatherUtils.ts
```

---

## Краткая карта «где что искать»

| Задача | Путь |
| --- | --- |
| Точка входа React | `src/index.tsx` |
| Вся бизнес-логика UI | `src/App.tsx`, `src/App.css` |
| UI-компоненты | `src/components/*` |
| URL CSV / погоды | `src/constants/index.ts` |
| Типы | `src/types/` |
| Парсинг CSV, погода, даты | `src/utils/` |
| Блокировка scroll модалок | `src/hooks/useBodyScrollLock.ts` |
| Статика и weather fallback | `public/` |
| CI погоды | `.github/workflows/update-weather.yml` |
| Полная документация | `PROJECT_DOCUMENTATION.md` |

---

## Инструкция для субагента explore

1. Сначала открой этот файл, чтобы понять расположение модулей.
2. Для поведения и связей — `PROJECT_DOCUMENTATION.md`.
3. Не индексируй `node_modules/` и `build/`.
4. Основной breakpoint UI: `720px` (см. CSS в `App.css`, `Menu.css`).
