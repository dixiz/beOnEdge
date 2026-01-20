import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import DateDisplay from './components/DateDisplay';
import DayOfWeekDisplay from './components/DayOfWeekDisplay';
import ScheduleRow from './components/ScheduleRow';
import Menu from './components/Menu';
import DaySlider from './components/DaySlider';
import { ScheduleItem } from './types/schedule';
import { CSV_URL } from './constants';
import { parseCSV } from './utils/csvParser';
import { groupBy } from './utils/dataUtils';
import { convertFromGMT3ToLocal, isDateEqualOrAfterToday, parseDate, getDayOfWeekFromDate } from './utils/dateUtils';
import { parseBooleanFlag } from './utils/flagUtils';
import { getTgNumbers, getBcuNumbers } from './utils/iconUtils';
import { DayOption } from './components/DaySlider';

const DAY_SLIDER_HEIGHT = 76;
const DAY_SHORT_LABEL: Record<string, string> = {
  'понедельник': 'Пн',
  'вторник': 'Вт',
  'среда': 'Ср',
  'четверг': 'Чт',
  'пятница': 'Пт',
  'суббота': 'Сб',
  'воскресенье': 'Вс'
};

function App() {
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
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
    
    // Конвертируем время, если нужно
    if (useLocalTime && schedule.length > 0) {
      schedule = schedule.map(convertFromGMT3ToLocal);
    }
    
    // Фильтруем: оставляем только дни, которые равны или старше текущего дня
    return schedule.filter(item => isDateEqualOrAfterToday(item.date));
  }, [useLocalTime, originalSchedule]);

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
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
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

  // Даты после применения фильтров (для слайдера по дням)
  const filteredDaysList = useMemo(() => {
    const set = new Set<string>();
    filteredSchedule.forEach(item => {
      if (item.date) set.add(item.date);
    });
    return Array.from(set).sort((a, b) => {
      const da = parseDate(a).getTime();
      const db = parseDate(b).getTime();
      return da - db;
    });
  }, [filteredSchedule]);

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
    return groupBy(filteredSchedule, r => `${r.date}_${r.day}`);
  }, [filteredSchedule]);

  const rowsByDate = useMemo(() => {
    return groupBy(filteredSchedule, r => r.date);
  }, [filteredSchedule]);

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
  }, [seriesList, daysList, tracksList, commentatorsList]);

  const sliderVisible = viewMode === 'byDay' && dayOptions.length > 0;
  const selectedDayRows = selectedDay ? rowsByDate[selectedDay] || [] : [];
  const selectedDayMeta = selectedDay ? dayOptions.find(d => d.date === selectedDay) : undefined;
  const menuOffsetValue = (menuHeight || 125) + (sliderVisible ? DAY_SLIDER_HEIGHT : 0);
  const scheduleContainerStyle = { '--menu-offset': `${menuOffsetValue}px` } as React.CSSProperties;

  return (
    <div className={`app-container ${isLightTheme ? 'app-container--light' : 'app-container--dark'}`}>
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
        />
      )}
      {showMenu && sliderVisible && (
        <DaySlider
          days={dayOptions}
          selectedDate={selectedDay}
          onSelect={setSelectedDay}
          isLightTheme={isLightTheme}
          topOffset={menuHeight}
        />
      )}
      <div
        className={`schedule-container ${showMenu ? 'schedule-container--with-menu' : 'schedule-container--without-menu'}`}
        style={scheduleContainerStyle}
      >
        {loading && <div className={`loading-message ${isLightTheme ? 'loading-message--light' : 'loading-message--dark'}`}>BE ON EDGE IS COMING</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && filteredSchedule.length === 0 && (
          <div className={`empty-message ${isLightTheme ? 'empty-message--light' : 'empty-message--dark'}`}>Упс! Ни одна гоночная серия не подходит для установленных отборов</div>
        )}
        {viewMode === 'all' ? (
          Object.entries(byDay).map(([key, rows]) => {
            const [date, day] = key.split('_');
            return (
              <div className="day-column" key={key}>
                <Header isLightTheme={isLightTheme}>
                  <DateDisplay date={date} isLightTheme={isLightTheme} />
                  <DayOfWeekDisplay day={day} isLightTheme={isLightTheme} />
                </Header>
                <div className="day-rows-container">
                  {rows.map((row, index) => {
                    const rowKey = `${row.date}_${row.time}_${row.championship}_${row.stage || ''}_${row.session}_${row.place}_${row.Commentator1 || ''}_${row.Commentator2 || ''}_${row.Optionally || ''}_${index}`;
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
                        commentator1={row.Commentator1}
                        commentator2={row.Commentator2}
                        optionally={row.Optionally}
                        duration={row.Duration}
                        liveTiming={row.LiveTiming}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="day-column">
            {selectedDayMeta && (
              <Header isLightTheme={isLightTheme}>
                <DateDisplay date={selectedDayMeta.date} isLightTheme={isLightTheme} />
                <DayOfWeekDisplay day={selectedDayMeta.dayName} isLightTheme={isLightTheme} />
              </Header>
            )}
            <div className="day-rows-container">
              {selectedDayRows.map((row, index) => {
                const rowKey = `${row.date}_${row.time}_${row.championship}_${row.stage || ''}_${row.session}_${row.place}_${row.Commentator1 || ''}_${row.Commentator2 || ''}_${row.Optionally || ''}_${index}`;
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
                    commentator1={row.Commentator1}
                    commentator2={row.Commentator2}
                    optionally={row.Optionally}
                    duration={row.Duration}
                    liveTiming={row.LiveTiming}
                  />
                );
              })}
            </div>
          </div>
        )}
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
                    return (
                      <label key={series} className="filter-item">
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
