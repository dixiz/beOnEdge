import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import DateDisplay from './components/DateDisplay';
import DayOfWeekDisplay from './components/DayOfWeekDisplay';
import ScheduleRow from './components/ScheduleRow';
import Menu from './components/Menu';
import { ScheduleItem } from './types/schedule';
import { CSV_URL } from './constants';
import { parseCSV } from './utils/csvParser';
import { groupBy } from './utils/dataUtils';
import { convertFromGMT3ToLocal, isDateEqualOrAfterToday, parseDate, getDayOfWeekFromDate } from './utils/dateUtils';
import { parseBooleanFlag } from './utils/flagUtils';
import { getTgNumbers, getBcuNumbers } from './utils/iconUtils';

function App() {
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [useLocalTime, setUseLocalTime] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedSeries, setAppliedSeries] = useState<string[]>([]);
  const [tempSeries, setTempSeries] = useState<string[]>([]);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [appliedDays, setAppliedDays] = useState<string[]>([]);
  const [tempDays, setTempDays] = useState<string[]>([]);
  const [filterPage, setFilterPage] = useState<'series' | 'days'>('series');

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
    
    // Конвертируем время, если нужно
    if (useLocalTime && schedule.length > 0) {
      schedule = schedule.map(convertFromGMT3ToLocal);
    }
    
    // Фильтруем: оставляем только дни, которые равны или старше текущего дня
    return schedule.filter(item => isDateEqualOrAfterToday(item.date));
  }, [useLocalTime, originalSchedule]);

  const normalizeDateShort = useCallback((dateStr: string) => {
    const parts = dateStr.trim().split('.');
    if (parts.length < 3) return dateStr.trim();
    const [d, m, yRaw] = parts;
    const y = yRaw.length === 2 ? yRaw : yRaw.slice(-2);
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
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
  }, [seriesList, appliedSeries.length, daysList, appliedDays.length]);

  // Применяем фильтр по сериям
  const filteredSchedule = useMemo(() => {
    if (appliedSeries.length === 0) return normalizedSchedule;
    const seriesSet = new Set(appliedSeries);
    const daysSet = new Set(appliedDays.length === 0 ? daysList : appliedDays);
    return normalizedSchedule.filter(item => seriesSet.has(item.championship) && daysSet.has(item.date));
  }, [normalizedSchedule, appliedSeries, appliedDays, daysList]);

  // Мемоизация группировки по дням
  const byDay = useMemo(() => {
    return groupBy(filteredSchedule, r => `${r.date}_${r.day}`);
  }, [filteredSchedule]);

  // Мемоизация обработчиков
  const handleToggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, []);

  const handleToggleTime = useCallback((useLocal: boolean) => {
    setUseLocalTime(useLocal);
  }, []);

  const showMenu = !loading && !error && originalSchedule.length > 0;

  const handleOpenFilter = useCallback(() => {
    // Если фильтр не активен (в расписании все серии) — открываем с пустыми чекбоксами
    // Если фильтр активен — отмечаем те серии, которые отображаются
    const isAllVisible = appliedSeries.length === seriesList.length;
    const isAllDaysVisible = appliedDays.length === daysList.length;
    setTempSeries(isAllVisible ? [] : appliedSeries);
    setTempDays(isAllDaysVisible ? [] : appliedDays);
    setFilterError(null);
    setFilterPage('series');
    setIsFilterOpen(true);
  }, [appliedSeries, seriesList, appliedDays, daysList]);

  const handleCloseFilter = useCallback(() => {
    setTempSeries(appliedSeries); // возврат к применённому при закрытии крестом
    setTempDays(appliedDays);
    setFilterError(null);
    setIsFilterOpen(false);
  }, [appliedSeries, appliedDays]);

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

  const handleApplyFilter = useCallback(() => {
    const hasDays = tempDays.length > 0;
    const hasSeries = tempSeries.length > 0;

    if (!hasDays && !hasSeries) {
      setFilterError('Не выбрана ни одна серия');
      return;
    }
    if (!hasDays) {
      setFilterError('Не выбран ни один день');
      return;
    }

    // Если дни выбраны, но серии нет — отображаем все серии для выбранных дней
    const nextSeries = hasSeries ? tempSeries : seriesList;

    setAppliedSeries(nextSeries);
    setAppliedDays(tempDays);
    setFilterError(null);
    setIsFilterOpen(false);
  }, [tempSeries, tempDays]);

  const handleResetFilter = useCallback(() => {
    setAppliedSeries(seriesList); // вернуть все серии
    setTempSeries([]);
    setAppliedDays(daysList);
    setTempDays([]);
    setFilterError(null);
    setIsFilterOpen(false);
  }, [seriesList, daysList]);

  return (
    <div className={`app-container ${isLightTheme ? 'app-container--light' : 'app-container--dark'}`}>
      {showMenu && (
        <Menu
          isLightTheme={isLightTheme}
          onToggleTheme={handleToggleTheme}
          useLocalTime={useLocalTime}
          onToggleTime={handleToggleTime}
          onOpenFilter={handleOpenFilter}
        />
      )}
      <div className={`schedule-container ${showMenu ? 'schedule-container--with-menu' : 'schedule-container--without-menu'}`}>
        {loading && <div className={`loading-message ${isLightTheme ? 'loading-message--light' : 'loading-message--dark'}`}>BE ON EDGE IS COMING</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && filteredSchedule.length === 0 && (
          <div className={`empty-message ${isLightTheme ? 'empty-message--light' : 'empty-message--dark'}`}>Упс! Ни одна гоночная серия не подходит для установленных отборов</div>
        )}
        {Object.entries(byDay).map(([key, rows]) => {
          const [date, day] = key.split('_');
          return (
            <div className="day-column" key={key}>
              <Header isLightTheme={isLightTheme}>
                <DateDisplay date={date} isLightTheme={isLightTheme} />
                <DayOfWeekDisplay day={day} isLightTheme={isLightTheme} />
              </Header>
              <div className="day-rows-container">
                {rows.map((row, index) => {
                  // Создаем уникальный ключ, включая все возможные уникальные поля
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
                  />
                  );
                })}
              </div>
            </div>
          );
        })}
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
                Фильтр по сериям
              </button>
              <button
                className={`filter-tab ${filterPage === 'days' ? 'filter-tab--active' : ''}`}
                onClick={() => setFilterPage('days')}
              >
                Фильтр по дням
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
