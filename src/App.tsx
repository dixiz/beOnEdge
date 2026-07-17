import React, { useEffect, useState, useMemo, useCallback, useLayoutEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import DateDisplay from './components/DateDisplay';
import DayOfWeekDisplay from './components/DayOfWeekDisplay';
import ScheduleRow from './components/ScheduleRow';
import Menu from './components/Menu';
import DaySlider from './components/DaySlider';
import { CommentatorScheduleData, ScheduleItem } from './types/schedule';
import { WeatherForecastPoint } from './types/weather';
import { COMMENTATOR_SCHEDULE_CSV_URL, CSV_URL, WEATHER_CACHE_URL } from './constants';
import { parseCSV, parseCommentatorScheduleCSV } from './utils/csvParser';
import { buildWeatherEventKey, buildWeatherLookupMap, parseWeatherCache } from './utils/weatherUtils';
import { groupBy } from './utils/dataUtils';
import { convertFromGMT3ToLocal, isDateEqualOrAfterToday, parseDate, getDayOfWeekFromDate } from './utils/dateUtils';
import { parseBooleanFlag } from './utils/flagUtils';
import { getTgNumbers, getBcuNumbers } from './utils/iconUtils';
import { DayOption } from './components/DaySlider';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';

const DAY_SLIDER_HEIGHT = 76;
const DAY_SLIDER_OVERLAP = 4;
const MIN_CONTENT_SCALE = 0.4;
const MAX_CONTENT_SCALE = 1;
const CONTENT_SCALE_STEP = 0.05;
 

type DisplayScheduleItem = ScheduleItem & {
  displayTime?: string;
  startedLabel?: string;
  isCarryover?: boolean;
};

type ActiveFilterChip = {
  key: string;
  label: string;
  type: 'series' | 'days' | 'tracks' | 'commentators';
  value: string;
};

const isScheduleFlagTrue = (value?: string): boolean => {
  const normalized = value?.trim() || '';
  return parseBooleanFlag(normalized) || normalized.toLowerCase() === 'истина';
};

const isScheduleItemEnded = (item: Pick<ScheduleItem, 'Ended'>): boolean => {
  return isScheduleFlagTrue(item.Ended);
};

const isScheduleItemCancelled = (item: Pick<ScheduleItem, 'Ended' | 'Cancel'>): boolean => {
  return isScheduleFlagTrue(item.Cancel) && !isScheduleItemEnded(item);
};

const isScheduleItemHiddenByStatus = (
  item: Pick<ScheduleItem, 'Ended' | 'Cancel'>
): boolean => isScheduleItemEnded(item) || isScheduleFlagTrue(item.Cancel);

const getHiddenEventsToggleLabel = (
  hasEndedEvents: boolean,
  hasCancelledEvents: boolean,
  areEventsShown: boolean
): string => {
  const statusLabel = hasEndedEvents && hasCancelledEvents
    ? 'завершённые и отменённые'
    : hasCancelledEvents
      ? 'отменённые'
      : 'завершённые';
  return `${areEventsShown ? 'Скрыть' : 'Показать'} ${statusLabel}`;
};

const isScheduleItemLive = (item: Pick<ScheduleItem, 'Live' | 'Ended'>): boolean =>
  isScheduleFlagTrue(item.Live) && !isScheduleItemEnded(item);

const parseDurationMs = (duration?: string): number => {
  if (!duration) return 0;
  const cleaned = duration.trim();
  if (!cleaned) return 0;
  const parts = cleaned.split(':').map(part => part.trim());
  let h = 0;
  let m = 0;
  let s = 0;
  if (parts.length === 3) {
    [h, m, s] = parts.map(part => Number(part));
  } else if (parts.length === 2) {
    [h, m] = parts.map(part => Number(part));
    s = 0;
  } else {
    return 0;
  }
  if ([h, m, s].some(value => Number.isNaN(value))) return 0;
  return Math.max(0, ((h * 60 + m) * 60 + s) * 1000);
};

const getStartDate = (item: ScheduleItem): Date => {
  const [dayRaw, monthRaw, yearRaw] = (item.date ?? '').split('.');
  const [hoursRaw, minutesRaw] = (item.time ?? '').split(':');

  if (!dayRaw || !monthRaw || !yearRaw || !hoursRaw || !minutesRaw) return new Date(NaN);

  const fullYear = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  const day = dayRaw.padStart(2, '0');
  const month = monthRaw.padStart(2, '0');
  const hours = hoursRaw.padStart(2, '0');
  const minutes = minutesRaw.padStart(2, '0');

  return new Date(`${fullYear}-${month}-${day}T${hours}:${minutes}:00`);
};

const formatDateShort = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

const addCarryoverItems = (items: ScheduleItem[], today: Date): DisplayScheduleItem[] => {
  const result: DisplayScheduleItem[] = [...items];
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  items.forEach(item => {
    const durationMs = parseDurationMs(item.Duration);
    if (!durationMs) return;

    const startDate = getStartDate(item);
    if (Number.isNaN(startDate.getTime())) return;
    const startKey = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    if (startKey !== yesterdayKey) return;

    const endDate = new Date(startDate.getTime() + durationMs);
    const endKey = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;
    if (endKey !== todayKey) return;

    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    const endDateStr = formatDateShort(endDate);
    const startLabel = `с ${formatDateShort(startDate)} до`;

    result.unshift({
      ...item,
      date: endDateStr,
      day: getDayOfWeekFromDate(endDateStr),
      time: endTimeStr,
      displayTime: endTimeStr,
      startedLabel: startLabel,
      isCarryover: true
    });
  });

  return result;
};
const DAY_SHORT_LABEL: Record<string, string> = {
  'понедельник': 'Пн',
  'вторник': 'Вт',
  'среда': 'Ср',
  'четверг': 'Чт',
  'пятница': 'Пт',
  'суббота': 'Сб',
  'воскресенье': 'Вс'
};

const PRIORITY_SERIES: string[] = [
  'Формула 1',
  'Индикар',
  'НАСКАР Кубок',
  'WEC'
];

const shouldShowRtIcon = (value?: string): boolean => {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return parseBooleanFlag(trimmed);
};

const scrollToPageTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const buildRowKey = (row: DisplayScheduleItem, index: number) =>
  `${row.date}_${row.time}_${row.championship}_${row.stage || ''}_${row.session}_${row.place}_${row.Commentator1 || ''}_${row.Commentator2 || ''}_${row.Optionally || ''}_${index}`;

const isCommentatorScheduleEvent = (item: Pick<ScheduleItem, 'championship' | 'session'>) => {
  const championship = item.championship.trim();
  const session = item.session.trim();

  const isLeMans24h =
    championship.toLowerCase() === 'wec' &&
    session === '94-я гонка "24 часа Ле-Мана"';

  const isGtwcEuropeEndurance24h =
    championship === 'ГТВЧ Европа (Эндуранс)' &&
    session === 'Гонка (24 часа)';

  return isLeMans24h || isGtwcEuropeEndurance24h;
};

function App() {
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [commentatorSchedule, setCommentatorSchedule] = useState<CommentatorScheduleData | null>(null);
  const [commentatorScheduleLoading, setCommentatorScheduleLoading] = useState(false);
  const [commentatorScheduleError, setCommentatorScheduleError] = useState<string | null>(null);
  const [weatherLookupMap, setWeatherLookupMap] = useState<Map<string, WeatherForecastPoint[]>>(new Map());
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [useLocalTime, setUseLocalTime] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'byDay'>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [menuHeight, setMenuHeight] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedSeries, setAppliedSeries] = useState<string[]>([]);
  const [tempSeries, setTempSeries] = useState<string[]>([]);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [appliedDays, setAppliedDays] = useState<string[]>([]);
  const [tempDays, setTempDays] = useState<string[]>([]);
  const [appliedTracks, setAppliedTracks] = useState<string[]>([]);
  const [tempTracks, setTempTracks] = useState<string[]>([]);
  const [appliedCommentators, setAppliedCommentators] = useState<string[]>([]);
  const [tempCommentators, setTempCommentators] = useState<string[]>([]);
  const [filterPage, setFilterPage] = useState<'series' | 'days' | 'tracks' | 'commentators'>('series');
  const [contentScale, setContentScale] = useState(1);
  const [shownHiddenDays, setShownHiddenDays] = useState<Set<string>>(() => new Set());
  const [zoomControlsHeight, setZoomControlsHeight] = useState(0);
  const zoomControlsRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useBodyScrollLock(isFilterOpen);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(CSV_URL)
      .then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки данных.');
        return r.text();
      })
      .then(text => {
        try {
        const parsed = parseCSV(text);
          if (parsed.length === 0) {
            throw new Error('Данные не найдены');
          }
          setOriginalSchedule(parsed);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Ошибка обработки данных');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCommentatorScheduleLoading(true);
    setCommentatorScheduleError(null);

    fetch(COMMENTATOR_SCHEDULE_CSV_URL)
      .then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки расписания комментаторов.');
        return r.text();
      })
      .then(text => {
        try {
          const parsed = parseCommentatorScheduleCSV(text);
          if (parsed.times.length === 0 || parsed.rows.length === 0) {
            throw new Error('Расписание комментаторов не найдено');
          }
          setCommentatorSchedule(parsed);
        } catch (error) {
          setCommentatorScheduleError(error instanceof Error ? error.message : 'Ошибка обработки расписания комментаторов');
        }
      })
      .catch(e => setCommentatorScheduleError(e.message))
      .finally(() => setCommentatorScheduleLoading(false));
  }, []);

  useEffect(() => {
    fetch(WEATHER_CACHE_URL)
      .then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки прогноза погоды.');
        return r.text();
      })
      .then(text => {
        const parsed = parseWeatherCache(text);
        setWeatherLookupMap(buildWeatherLookupMap(parsed.events));
      })
      .catch(() => {
        setWeatherLookupMap(new Map());
      });
  }, []);

  // Мемоизация конвертированного расписания с фильтрацией по дате
  const convertedSchedule = useMemo(() => {
    let schedule = originalSchedule;
    
    // Оставляем только строки, где Shed = Истина/TRUE/✓/1 (или явно "истина")
    schedule = schedule.filter(item => {
      const shed = item.Shed?.trim() || '';
      const isTrue =
        parseBooleanFlag(shed) ||
        shed.toLowerCase() === 'истина';
      return isTrue;
    });

    schedule = schedule.map(item => ({
      ...item,
      weatherForecast: weatherLookupMap.get(buildWeatherEventKey({
        date: item.date,
        time: item.time,
        championship: item.championship,
        stage: item.stage
      }))
    }));
    
    // Конвертируем время, если нужно
    if (useLocalTime && schedule.length > 0) {
      schedule = schedule.map(convertFromGMT3ToLocal);
    }
    
    // Фильтруем: оставляем только дни, которые равны или старше текущего дня,
    // а также события, начавшиеся вчера и продолжающиеся сегодня
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return schedule.filter(item => {
      if (isDateEqualOrAfterToday(item.date)) return true;
      const durationMs = parseDurationMs(item.Duration);
      if (!durationMs) return false;
      const startDate = getStartDate(item);
      const startKey = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
      const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
      if (startKey !== yKey) return false;
      const endDate = new Date(startDate.getTime() + durationMs);
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return endDateOnly >= today;
    });
  }, [useLocalTime, originalSchedule, weatherLookupMap]);

  const normalizeDateShort = useCallback((dateStr: string) => {
    // Вход теперь всегда dd.mm.yyyy, нормализуем только к короткому виду dd.mm.yy
    const [d = '', m = '', y = ''] = dateStr.split('.');
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y.slice(-2)}`;
  }, []);

  const normalizedSchedule = useMemo(() => {
    return convertedSchedule.map(item => ({
      ...item,
      date: normalizeDateShort(item.date),
    }));
  }, [convertedSchedule, normalizeDateShort]);

  // Все серии, присутствующие в текущем расписании
  const seriesList = useMemo(() => {
    const set = new Set<string>();
    normalizedSchedule.forEach(item => {
      if (item.championship) set.add(item.championship);
    });
    return Array.from(set).sort((a, b) => {
      const priorityA = PRIORITY_SERIES.indexOf(a);
      const priorityB = PRIORITY_SERIES.indexOf(b);

      if (priorityA !== -1 || priorityB !== -1) {
        if (priorityA === -1) return 1;
        if (priorityB === -1) return -1;
        return priorityA - priorityB;
      }

      return a.localeCompare(b, 'ru');
    });
  }, [normalizedSchedule]);

  // Все даты в расписании (для фильтра по дням), сортировка по возрастанию
  const daysList = useMemo(() => {
    const set = new Set<string>();
    normalizedSchedule.forEach(item => {
      if (item.date) set.add(item.date);
    });
    return Array.from(set).sort((a, b) => {
      const da = parseDate(a).getTime();
      const db = parseDate(b).getTime();
      return da - db;
    });
  }, [normalizedSchedule]);

  // Все трассы (place) для фильтра по трассам
  const tracksList = useMemo(() => {
    const set = new Set<string>();
    normalizedSchedule.forEach(item => {
      if (item.place && item.place.trim() !== '') {
        set.add(item.place);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [normalizedSchedule]);

  const ORIGINAL_COMMENT = 'Оригинальная дорожка';

  // Все комментаторы (Commentator1/2 или отсутствие как "Оригинальная дорожка") для фильтра по комментаторам
  const commentatorsList = useMemo(() => {
    const set = new Set<string>();
    normalizedSchedule.forEach(item => {
      const hasComm1 = !!item.Commentator1;
      const hasComm2 = !!item.Commentator2;
      if (hasComm1 && item.Commentator1) set.add(item.Commentator1);
      if (hasComm2 && item.Commentator2) set.add(item.Commentator2);
      if (!hasComm1 && !hasComm2) set.add(ORIGINAL_COMMENT);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [normalizedSchedule]);

  const activeFilterLabels = useMemo<ActiveFilterChip[]>(() => {
    const labels: ActiveFilterChip[] = [];

    if (seriesList.length > 0 && appliedSeries.length > 0 && appliedSeries.length < seriesList.length) {
      appliedSeries.forEach(series => {
        labels.push({
          key: `series-${series}`,
          label: series,
          type: 'series',
          value: series
        });
      });
    }

    if (daysList.length > 0 && appliedDays.length > 0 && appliedDays.length < daysList.length) {
      appliedDays.forEach(day => {
        labels.push({
          key: `days-${day}`,
          label: `${day.slice(0, 2)}.${day.slice(3, 5)}.${day.slice(-2)}, ${getDayOfWeekFromDate(day)}`,
          type: 'days',
          value: day
        });
      });
    }

    if (tracksList.length > 0 && appliedTracks.length > 0 && appliedTracks.length < tracksList.length) {
      appliedTracks.forEach(track => {
        labels.push({
          key: `tracks-${track}`,
          label: track,
          type: 'tracks',
          value: track
        });
      });
    }

    if (
      commentatorsList.length > 0 &&
      appliedCommentators.length > 0 &&
      appliedCommentators.length < commentatorsList.length
    ) {
      appliedCommentators.forEach(commentator => {
        labels.push({
          key: `commentators-${commentator}`,
          label: commentator,
          type: 'commentators',
          value: commentator
        });
      });
    }

    return labels;
  }, [
    seriesList,
    appliedSeries,
    daysList,
    appliedDays,
    tracksList,
    appliedTracks,
    commentatorsList,
    appliedCommentators
  ]);

  // Инициализируем выбранные серии, когда данные появились
  useEffect(() => {
    // Если применённых фильтров нет (всё расписание), отображаем всё без проставленных чекбоксов
    if (seriesList.length > 0 && appliedSeries.length === 0) {
      setAppliedSeries(seriesList); // показываем все серии в расписании
      setTempSeries([]);            // при открытии поп-апа чекбоксы пустые
    }
    if (daysList.length > 0 && appliedDays.length === 0) {
      setAppliedDays(daysList); // показываем все дни
      setTempDays([]);          // при открытии поп-апа чекбоксы пустые
    }
    if (tracksList.length > 0 && appliedTracks.length === 0) {
      setAppliedTracks(tracksList);
      setTempTracks([]);
    }
    if (commentatorsList.length > 0 && appliedCommentators.length === 0) {
      setAppliedCommentators(commentatorsList);
      setTempCommentators([]);
    }
  }, [
    seriesList, appliedSeries.length,
    daysList, appliedDays.length,
    tracksList, appliedTracks.length,
    commentatorsList, appliedCommentators.length
  ]);

  // Применяем фильтр по сериям
  const filteredSchedule = useMemo(() => {
    const seriesSet = new Set(appliedSeries.length === 0 ? seriesList : appliedSeries);
    const daysSet = new Set(appliedDays.length === 0 ? daysList : appliedDays);
    const tracksSet = new Set(appliedTracks.length === 0 ? tracksList : appliedTracks);
    const trackNoFilter = appliedTracks.length === 0 || appliedTracks.length === tracksList.length;
    const commentatorsNoFilter = appliedCommentators.length === 0 || appliedCommentators.length === commentatorsList.length;
    const commentatorsSet = new Set(appliedCommentators.length === 0 ? commentatorsList : appliedCommentators);
    return normalizedSchedule.filter(
      item => {
        const matchSeries = seriesSet.has(item.championship);
        const matchDay = daysSet.has(item.date);
        const matchTrack = trackNoFilter
          ? true // все трассы или фильтр не активен
          : (item.place && tracksSet.has(item.place));
        const hasComm1 = !!item.Commentator1;
        const hasComm2 = !!item.Commentator2;
        const matchCommentator =
          commentatorsNoFilter ||
          ((hasComm1 && commentatorsSet.has(item.Commentator1!)) ||
           (hasComm2 && commentatorsSet.has(item.Commentator2!)) ||
           (!hasComm1 && !hasComm2 && commentatorsSet.has(ORIGINAL_COMMENT)));
        return matchSeries && matchDay && matchTrack && matchCommentator;
      }
    );
  }, [normalizedSchedule, appliedSeries, appliedDays, appliedTracks, appliedCommentators, seriesList, daysList, tracksList, commentatorsList]);

  const scheduleWithCarryover = useMemo<DisplayScheduleItem[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const withCarryover = addCarryoverItems(filteredSchedule, today);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const yesterdayStr = formatDateShort(yesterday);
    return withCarryover.filter(item => item.date !== yesterdayStr);
  }, [filteredSchedule]);

  const endedDays = useMemo(() => {
    const dates = new Set<string>();
    scheduleWithCarryover.forEach(item => {
      if (isScheduleItemEnded(item)) dates.add(item.date);
    });
    return dates;
  }, [scheduleWithCarryover]);

  const cancelledDays = useMemo(() => {
    const dates = new Set<string>();
    scheduleWithCarryover.forEach(item => {
      if (isScheduleItemCancelled(item)) dates.add(item.date);
    });
    return dates;
  }, [scheduleWithCarryover]);

  const displaySchedule = useMemo(
    () => scheduleWithCarryover.filter(
      item => !isScheduleItemHiddenByStatus(item) || shownHiddenDays.has(item.date)
    ),
    [scheduleWithCarryover, shownHiddenDays]
  );

  // Даты после применения фильтров (для слайдера по дням)
  const filteredDaysList = useMemo(() => {
    const set = new Set<string>();
    scheduleWithCarryover.forEach(item => {
      if (item.date) set.add(item.date);
    });
    return Array.from(set).sort((a, b) => {
      const da = parseDate(a).getTime();
      const db = parseDate(b).getTime();
      return da - db;
    });
  }, [scheduleWithCarryover]);

  const dayOptions: DayOption[] = useMemo(() => {
    return filteredDaysList.map(date => {
      const dayName = getDayOfWeekFromDate(date);
      const shortLabel = DAY_SHORT_LABEL[dayName] || `${dayName.charAt(0).toUpperCase()}${dayName.slice(1, 2)}`;
      const [dayNumber = '', month = ''] = date.split('.');
      const dayMonth = `${dayNumber}.${month}`;
      return {
        date,
        dayName,
        shortLabel,
        dayNumber: dayMonth
      };
    });
  }, [filteredDaysList]);

  useEffect(() => {
    if (viewMode === 'byDay' && dayOptions.length > 0) {
      setSelectedDay(prev => {
        if (prev && dayOptions.some(d => d.date === prev)) return prev;
        return dayOptions[0].date;
      });
    }
    if (viewMode === 'all') {
      setSelectedDay(null);
    }
  }, [viewMode, dayOptions]);

  // Мемоизация группировки по дням
  const byDay = useMemo(() => {
    const grouped = groupBy(scheduleWithCarryover, r => `${r.date}_${r.day}`);
    Object.keys(grouped).forEach(key => {
      grouped[key] = grouped[key].filter(
        item => !isScheduleItemHiddenByStatus(item) || shownHiddenDays.has(item.date)
      );
    });
    return grouped;
  }, [scheduleWithCarryover, shownHiddenDays]);

  const rowsByDate = useMemo(() => {
    return groupBy(displaySchedule, r => r.date);
  }, [displaySchedule]);

  const timeToMinutes = useCallback((time: string) => {
    const [h = '0', m = '0'] = time.split(':');
    return Number(h) * 60 + Number(m);
  }, []);

  const sortDayRows = useCallback((rows: DisplayScheduleItem[]) => {
    return [...rows].sort((a, b) => {
      const aCarry = a.isCarryover ? 1 : 0;
      const bCarry = b.isCarryover ? 1 : 0;
      if (aCarry !== bCarry) return bCarry - aCarry;
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  }, [timeToMinutes]);

  // Мемоизация обработчиков
  const handleToggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, []);

  const handleToggleTime = useCallback((useLocal: boolean) => {
    setUseLocalTime(useLocal);
  }, []);

  const handleToggleViewMode = useCallback((mode: 'all' | 'byDay') => {
    setViewMode(mode);
  }, []);

  const handleMenuHeightChange = useCallback((height: number) => {
    setMenuHeight(height);
  }, []);

  const showMenu = !loading && !error && originalSchedule.length > 0;

  useLayoutEffect(() => {
    const el = zoomControlsRef.current;

    if (!showMenu || !el) {
      setZoomControlsHeight(0);
      return;
    }

    const update = () => setZoomControlsHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [showMenu]);

  const handleOpenFilter = useCallback(() => {
    // Если фильтр не активен (в расписании все серии/дни/трассы/комментаторы) — открываем с пустыми чекбоксами
    const isAllSeries = appliedSeries.length === seriesList.length;
    const isAllDays = appliedDays.length === daysList.length;
    const isAllTracks = appliedTracks.length === tracksList.length;
    const isAllCommentators = appliedCommentators.length === commentatorsList.length;
    setTempSeries(isAllSeries ? [] : appliedSeries);
    setTempDays(isAllDays ? [] : appliedDays);
    setTempTracks(isAllTracks ? [] : appliedTracks);
    setTempCommentators(isAllCommentators ? [] : appliedCommentators);
    setFilterError(null);
    setFilterPage('series');
    setIsFilterOpen(true);
  }, [appliedSeries, seriesList, appliedDays, daysList, appliedTracks, tracksList, appliedCommentators, commentatorsList]);

  const handleCloseFilter = useCallback(() => {
    setTempSeries(appliedSeries); // возврат к применённому при закрытии крестом
    setTempDays(appliedDays);
    setTempTracks(appliedTracks);
    setTempCommentators(appliedCommentators);
    setFilterError(null);
    setIsFilterOpen(false);
  }, [appliedSeries, appliedDays, appliedTracks, appliedCommentators]);

  const handleToggleSeries = useCallback((series: string) => {
    setTempSeries(prev => {
      if (prev.includes(series)) {
        return prev.filter(s => s !== series);
      }
      return [...prev, series];
    });
  }, []);

  const handleToggleAllSeries = useCallback(() => {
    const allChecked = tempSeries.length === seriesList.length;
    if (allChecked) {
      setTempSeries([]);
    } else {
      setTempSeries(seriesList);
    }
  }, [tempSeries.length, seriesList]);

  const handleToggleDay = useCallback((day: string) => {
    setTempDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  }, []);

  const handleToggleAllDays = useCallback(() => {
    const allChecked = tempDays.length === daysList.length;
    if (allChecked) {
      setTempDays([]);
    } else {
      setTempDays(daysList);
    }
  }, [tempDays.length, daysList]);

  const handleToggleTrack = useCallback((track: string) => {
    setTempTracks(prev => {
      if (prev.includes(track)) {
        return prev.filter(t => t !== track);
      }
      return [...prev, track];
    });
  }, []);

  const handleToggleAllTracks = useCallback(() => {
    const allChecked = tempTracks.length === tracksList.length;
    if (allChecked) {
      setTempTracks([]);
    } else {
      setTempTracks(tracksList);
    }
  }, [tempTracks.length, tracksList]);

  const handleToggleCommentator = useCallback((commentator: string) => {
    setTempCommentators(prev => {
      if (prev.includes(commentator)) {
        return prev.filter(c => c !== commentator);
      }
      return [...prev, commentator];
    });
  }, []);

  const handleToggleAllCommentators = useCallback(() => {
    const allChecked = tempCommentators.length === commentatorsList.length;
    if (allChecked) {
      setTempCommentators([]);
    } else {
      setTempCommentators(commentatorsList);
    }
  }, [tempCommentators.length, commentatorsList]);

  const handleApplyFilter = useCallback(() => {
    const hasDays = tempDays.length > 0;
    const hasSeries = tempSeries.length > 0;
    const hasTracks = tempTracks.length > 0;
    const hasCommentators = tempCommentators.length > 0;

    if (!hasDays && !hasSeries && !hasTracks && !hasCommentators) {
      setFilterError('Не выбрана ни одна серия');
      return;
    }

    const nextSeries = hasSeries ? tempSeries : seriesList;
    const nextDays = hasDays ? tempDays : daysList;
    const nextTracks = hasTracks ? tempTracks : tracksList;
    const nextCommentators = hasCommentators ? tempCommentators : commentatorsList;

    setAppliedSeries(nextSeries);
    setAppliedDays(nextDays);
    setAppliedTracks(nextTracks);
    setAppliedCommentators(nextCommentators);
    setFilterError(null);
    setIsFilterOpen(false);
    scrollToPageTop();
  }, [tempSeries, tempDays, tempTracks, tempCommentators, daysList, seriesList, tracksList, commentatorsList]);

  const handleResetFilter = useCallback(() => {
    setAppliedSeries(seriesList); // вернуть все серии
    setTempSeries([]);
    setAppliedDays(daysList);
    setTempDays([]);
    setAppliedTracks(tracksList);
    setTempTracks([]);
    setAppliedCommentators(commentatorsList);
    setTempCommentators([]);
    setFilterError(null);
    setIsFilterOpen(false);
    scrollToPageTop();
  }, [seriesList, daysList, tracksList, commentatorsList]);

  const removeFilterValue = useCallback((
    type: 'series' | 'days' | 'tracks' | 'commentators',
    value: string
  ) => {
    const removeValue = (current: string[], allValues: string[]) => {
      const source = current.length === 0 ? allValues : current;
      const next = source.filter(item => item !== value);
      return next.length > 0 ? next : allValues;
    };

    if (type === 'series') {
      setAppliedSeries(current => removeValue(current, seriesList));
      return;
    }

    if (type === 'days') {
      setAppliedDays(current => removeValue(current, daysList));
      return;
    }

    if (type === 'tracks') {
      setAppliedTracks(current => removeValue(current, tracksList));
      return;
    }

    setAppliedCommentators(current => removeValue(current, commentatorsList));
  }, [seriesList, daysList, tracksList, commentatorsList]);

  const handleZoomIn = useCallback(() => {
    setContentScale(prev => Math.min(MAX_CONTENT_SCALE, Number((prev + CONTENT_SCALE_STEP).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setContentScale(prev => Math.max(MIN_CONTENT_SCALE, Number((prev - CONTENT_SCALE_STEP).toFixed(2))));
  }, []);

  const handleZoomReset = useCallback(() => {
    setContentScale(1);
  }, []);

  const sliderVisible = viewMode === 'byDay' && dayOptions.length > 0;
  const selectedDayRows = useMemo(
    () => selectedDay ? rowsByDate[selectedDay] || [] : [],
    [selectedDay, rowsByDate]
  );
  const sortedSelectedDayRows = useMemo(
    () => sortDayRows(selectedDayRows as DisplayScheduleItem[]),
    [selectedDayRows, sortDayRows]
  );
  const sortedDayEntries = useMemo(() => {
    return Object.entries(byDay).sort(([aKey], [bKey]) => {
      const [aDate] = aKey.split('_');
      const [bDate] = bKey.split('_');
      return parseDate(aDate).getTime() - parseDate(bDate).getTime();
    });
  }, [byDay]);
  const selectedDayMeta = selectedDay ? dayOptions.find(d => d.date === selectedDay) : undefined;
  const scaledDaySliderHeight = sliderVisible ? DAY_SLIDER_HEIGHT : 0;
  const sliderTopOffset = Math.max(0, menuHeight - (sliderVisible ? DAY_SLIDER_OVERLAP : 0));
  const menuOffsetValue = (menuHeight || 125) + scaledDaySliderHeight - (sliderVisible ? DAY_SLIDER_OVERLAP : 0);
  const stickyDayHeaderTop = menuHeight;
  const scheduleContainerStyle = {
    '--menu-offset': `${menuOffsetValue}px`,
    '--sticky-day-header-top': `${stickyDayHeaderTop}px`
  } as React.CSSProperties;
  const scheduleContentStyle = { zoom: contentScale } as React.CSSProperties;
  const appContainerStyle = { '--zoom-controls-offset': `${showMenu ? zoomControlsHeight + 24 : 0}px` } as React.CSSProperties;

  const selectAdjacentDay = useCallback((direction: 1 | -1) => {
    if (viewMode !== 'byDay' || !selectedDay || dayOptions.length <= 1) return;

    const currentIndex = dayOptions.findIndex(day => day.date === selectedDay);
    if (currentIndex < 0) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= dayOptions.length) return;

    setSelectedDay(dayOptions[nextIndex].date);
  }, [viewMode, selectedDay, dayOptions]);

  const handleScheduleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (viewMode !== 'byDay' || window.innerWidth > 720) return;

    const touch = event.touches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  }, [viewMode]);

  const handleScheduleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (viewMode !== 'byDay' || window.innerWidth > 720 || !touchStartRef.current) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 50;
    const isHorizontalSwipe = Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.4;
    if (!isHorizontalSwipe) return;

    selectAdjacentDay(deltaX < 0 ? 1 : -1);
  }, [viewMode, selectAdjacentDay]);

  const handleScheduleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const handleToggleHiddenForDay = useCallback((date: string) => {
    setShownHiddenDays(current => {
      const next = new Set(current);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }, []);

  return (
    <div
      className={`app-container ${isLightTheme ? 'app-container--light' : 'app-container--dark'}`}
      style={appContainerStyle}
      onTouchStart={handleScheduleTouchStart}
      onTouchEnd={handleScheduleTouchEnd}
      onTouchCancel={handleScheduleTouchCancel}
    >
      {showMenu && (
        <Menu
          isLightTheme={isLightTheme}
          onToggleTheme={handleToggleTheme}
          useLocalTime={useLocalTime}
          onToggleTime={handleToggleTime}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          onHeightChange={handleMenuHeightChange}
          onOpenFilter={handleOpenFilter}
          activeFilters={activeFilterLabels}
          onRemoveActiveFilter={removeFilterValue}
        />
      )}
      {showMenu && (
        <div
          ref={zoomControlsRef}
          className={`zoom-controls ${isLightTheme ? 'zoom-controls--light' : 'zoom-controls--dark'}`}
        >
          <button
            type="button"
            className="zoom-controls__button"
            onClick={handleZoomOut}
            disabled={contentScale <= MIN_CONTENT_SCALE}
            aria-label="Уменьшить масштаб"
            title="Уменьшить масштаб"
          >
            -
          </button>
          <button
            type="button"
            className="zoom-controls__button zoom-controls__button--reset"
            onClick={handleZoomReset}
            disabled={contentScale === 1}
            aria-label="Сбросить масштаб до 100%"
            title="100%"
          >
            100%
          </button>
          <button
            type="button"
            className="zoom-controls__button"
            onClick={handleZoomIn}
            disabled={contentScale >= MAX_CONTENT_SCALE}
            aria-label="Увеличить масштаб"
            title="Увеличить масштаб"
          >
            +
          </button>
        </div>
      )}
      {showMenu && sliderVisible && (
        <DaySlider
          days={dayOptions}
          selectedDate={selectedDay}
          onSelect={setSelectedDay}
          isLightTheme={isLightTheme}
          topOffset={sliderTopOffset}
        />
      )}
      <div
        className={`schedule-container ${showMenu ? 'schedule-container--with-menu' : 'schedule-container--without-menu'}`}
        style={scheduleContainerStyle}
      >
        <div className="schedule-content-zoom" style={scheduleContentStyle}>
          {loading && <div className={`loading-message ${isLightTheme ? 'loading-message--light' : 'loading-message--dark'}`}>BE ON EDGE IS COMING</div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && displaySchedule.length === 0 && (
            <div className={`empty-message ${isLightTheme ? 'empty-message--light' : 'empty-message--dark'}`}>
              {endedDays.size > 0 || cancelledDays.size > 0
                ? 'Все подходящие события завершены или отменены. Покажите скрытые события в блоке нужного дня.'
                : 'Упс! Ни одна гоночная серия не подходит для установленных отборов'}
            </div>
          )}
          {viewMode === 'all' ? (
            sortedDayEntries.map(([key, rows]) => {
              const [date, day] = key.split('_');
              const sortedRows = sortDayRows(rows as DisplayScheduleItem[]);
              const hasEndedEvents = endedDays.has(date);
              const hasCancelledEvents = cancelledDays.has(date);
              const hasHiddenEvents = hasEndedEvents || hasCancelledEvents;
              return (
                <div
                  className={`day-column ${hasHiddenEvents ? 'day-column--has-ended-toggle' : ''}`}
                  key={key}
                >
                  <div className="day-header-sticky">
                    <Header
                      isLightTheme={isLightTheme}
                      hasEndedEvents={hasEndedEvents}
                      hasCancelledEvents={hasCancelledEvents}
                      areEndedEventsShown={shownHiddenDays.has(date)}
                      onToggleEndedEvents={() => handleToggleHiddenForDay(date)}
                    >
                      <DateDisplay date={date} isLightTheme={isLightTheme} />
                      <DayOfWeekDisplay day={day} isLightTheme={isLightTheme} />
                    </Header>
                  </div>
                  <div className="day-rows-container">
                    {sortedRows.map((row, index) => {
                      const rowKey = buildRowKey(row, index);
                      return (
                        <ScheduleRow
                          key={rowKey}
                          date={row.date}
                          time={row.time}
                          championship={row.championship}
                          stage={row.stage}
                          place={row.place}
                          session={row.session}
                          isLightTheme={isLightTheme}
                          showPC={parseBooleanFlag(row.PC)}
                          tgNumbers={getTgNumbers(row)}
                          bcuNumbers={getBcuNumbers(row)}
                          showRT={shouldShowRtIcon(row.RT)}
                          ruTube={row.RuTube}
                          commentator1={row.Commentator1}
                          commentator2={row.Commentator2}
                          optionally={row.Optionally}
                          duration={row.Duration}
                          liveTiming={row.LiveTiming}
                          spotter={row.Spotter}
                          displayTime={row.displayTime}
                          startedLabel={row.startedLabel}
                          commentatorSchedule={isCommentatorScheduleEvent(row) ? commentatorSchedule : undefined}
                          commentatorScheduleLoading={isCommentatorScheduleEvent(row) ? commentatorScheduleLoading : false}
                          commentatorScheduleError={isCommentatorScheduleEvent(row) ? commentatorScheduleError : null}
                          weatherForecast={row.weatherForecast}
                          isEnded={isScheduleItemEnded(row)}
                          isCancelled={isScheduleItemCancelled(row)}
                          isLive={isScheduleItemLive(row)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`day-column ${selectedDayMeta && (endedDays.has(selectedDayMeta.date) || cancelledDays.has(selectedDayMeta.date)) ? 'day-column--has-ended-toggle' : ''}`}>
              {selectedDayMeta && (endedDays.has(selectedDayMeta.date) || cancelledDays.has(selectedDayMeta.date)) && (
                <div className="by-day-ended-toggle">
                  <button
                    type="button"
                    className="header__ended-toggle"
                    onClick={() => handleToggleHiddenForDay(selectedDayMeta.date)}
                    aria-pressed={shownHiddenDays.has(selectedDayMeta.date)}
                  >
                    {getHiddenEventsToggleLabel(
                      endedDays.has(selectedDayMeta.date),
                      cancelledDays.has(selectedDayMeta.date),
                      shownHiddenDays.has(selectedDayMeta.date)
                    )}
                  </button>
                </div>
              )}
              <div className="day-rows-container">
                {sortedSelectedDayRows.map((row, index) => {
                  const rowKey = buildRowKey(row, index);
                  return (
                    <ScheduleRow
                      key={rowKey}
                      date={row.date}
                      time={row.time}
                      championship={row.championship}
                      stage={row.stage}
                      place={row.place}
                      session={row.session}
                      isLightTheme={isLightTheme}
                      showPC={parseBooleanFlag(row.PC)}
                      tgNumbers={getTgNumbers(row)}
                      bcuNumbers={getBcuNumbers(row)}
                      showRT={shouldShowRtIcon(row.RT)}
                      ruTube={row.RuTube}
                      commentator1={row.Commentator1}
                      commentator2={row.Commentator2}
                      optionally={row.Optionally}
                      duration={row.Duration}
                      liveTiming={row.LiveTiming}
                      spotter={row.Spotter}
                      displayTime={row.displayTime}
                      startedLabel={row.startedLabel}
                      commentatorSchedule={isCommentatorScheduleEvent(row) ? commentatorSchedule : undefined}
                      commentatorScheduleLoading={isCommentatorScheduleEvent(row) ? commentatorScheduleLoading : false}
                      commentatorScheduleError={isCommentatorScheduleEvent(row) ? commentatorScheduleError : null}
                      weatherForecast={row.weatherForecast}
                      isEnded={isScheduleItemEnded(row)}
                      isCancelled={isScheduleItemCancelled(row)}
                      isLive={isScheduleItemLive(row)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {isFilterOpen && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-modal__header">
              <h3>Фильтры</h3>
              <button className="filter-close" aria-label="Закрыть" onClick={handleCloseFilter}>✕</button>
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterPage === 'series' ? 'filter-tab--active' : ''}`}
                onClick={() => setFilterPage('series')}
              >
                Серии
              </button>
              <button
                className={`filter-tab ${filterPage === 'days' ? 'filter-tab--active' : ''}`}
                onClick={() => setFilterPage('days')}
              >
                Дни
              </button>
              <button
                className={`filter-tab ${filterPage === 'tracks' ? 'filter-tab--active' : ''}`}
                onClick={() => setFilterPage('tracks')}
              >
                Трассы
              </button>
              <button
                className={`filter-tab ${filterPage === 'commentators' ? 'filter-tab--active' : ''}`}
                onClick={() => setFilterPage('commentators')}
              >
                Комментаторы
              </button>
            </div>
            <div className="filter-modal__list">
              {filterPage === 'series' && (
                <>
                  <label className="filter-item filter-item--all">
                    <input
                      type="checkbox"
                      checked={tempSeries.length === seriesList.length && seriesList.length > 0}
                      onChange={handleToggleAllSeries}
                    />
                    <span className="filter-item__all-text">Все серии</span>
                  </label>
                  {seriesList.map(series => {
                    const checked = tempSeries.includes(series);
                    const isPriority = PRIORITY_SERIES.includes(series);
                    return (
                      <label
                        key={series}
                        className={`filter-item ${isPriority ? 'filter-item--priority' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleSeries(series)}
                        />
                        <span>{series}</span>
                      </label>
                    );
                  })}
                </>
              )}
              {filterPage === 'days' && (
                <>
                  <label className="filter-item filter-item--all">
                    <input
                      type="checkbox"
                      checked={tempDays.length === daysList.length && daysList.length > 0}
                      onChange={handleToggleAllDays}
                    />
                    <span className="filter-item__all-text">Все дни</span>
                  </label>
                  {daysList.map(day => {
                    const checked = tempDays.includes(day);
                    const dayLabel = `${day.slice(0, 2)}.${day.slice(3, 5)}.${day.slice(-2)}, ${getDayOfWeekFromDate(day)}`;
                    return (
                      <label key={day} className="filter-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDay(day)}
                        />
                        <span>{dayLabel}</span>
                      </label>
                    );
                  })}
                </>
              )}
              {filterPage === 'tracks' && (
                <>
                  <label className="filter-item filter-item--all">
                    <input
                      type="checkbox"
                      checked={tempTracks.length === tracksList.length && tracksList.length > 0}
                      onChange={handleToggleAllTracks}
                    />
                    <span className="filter-item__all-text">Все трассы</span>
                  </label>
                  {tracksList.map(track => {
                    const checked = tempTracks.includes(track);
                    return (
                      <label key={track} className="filter-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleTrack(track)}
                        />
                        <span>{track}</span>
                      </label>
                    );
                  })}
                </>
              )}
              {filterPage === 'commentators' && (
                <>
                  <label className="filter-item filter-item--all">
                    <input
                      type="checkbox"
                      checked={tempCommentators.length === commentatorsList.length && commentatorsList.length > 0}
                      onChange={handleToggleAllCommentators}
                    />
                    <span className="filter-item__all-text">Все комментаторы</span>
                  </label>
                  {commentatorsList.map(comm => {
                    const checked = tempCommentators.includes(comm);
                    return (
                      <label key={comm} className="filter-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleCommentator(comm)}
                        />
                        <span>{comm}</span>
                      </label>
                    );
                  })}
                </>
              )}
            </div>
            {filterError && <div className="filter-error">{filterError}</div>}
            <div className="filter-modal__footer">
              <button className="filter-ok" onClick={handleApplyFilter}>OK</button>
              <button className="filter-reset" onClick={handleResetFilter}>Сброс</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
