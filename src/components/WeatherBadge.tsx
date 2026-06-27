import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WeatherForecastPoint } from '../types/weather';
import { formatWeatherTooltip, getWeatherDescription } from '../utils/weatherUtils';
import './WeatherBadge.css';

type WeatherBadgeProps = {
  forecast: WeatherForecastPoint[];
  isLightTheme?: boolean;
};

type WeatherIconProps = {
  code: number;
  isLightTheme?: boolean;
};

const WeatherIcon: React.FC<WeatherIconProps> = ({ code, isLightTheme = false }) => {
  const accent = isLightTheme ? '#1A1A1A' : '#FFD600';
  const secondary = isLightTheme ? '#6B7280' : 'rgba(255, 255, 255, 0.72)';
  const gloomyCloud = isLightTheme ? '#374151' : 'rgba(32, 32, 32, 0.92)';
  const rain = isLightTheme ? '#2563EB' : '#7DD3FC';
  const sun = isLightTheme ? '#F59E0B' : '#FFD600';

  if (code === 0) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
        <circle cx="12" cy="12" r="5" fill={sun} />
        <g stroke={sun} strokeWidth="1.6" strokeLinecap="round">
          <line x1="12" y1="2.5" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21.5" y2="12" />
          <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
          <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
          <line x1="5.2" y1="18.8" x2="6.9" y2="17.1" />
          <line x1="17.1" y1="6.9" x2="18.8" y2="5.2" />
        </g>
      </svg>
    );
  }

  if (code === 1 || code === 2) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
        <circle cx="8" cy="8" r="4.2" fill={sun} />
        <g stroke={sun} strokeWidth="1.4" strokeLinecap="round">
          <line x1="8" y1="1.8" x2="8" y2="3.8" />
          <line x1="8" y1="12.2" x2="8" y2="14.2" />
          <line x1="1.8" y1="8" x2="3.8" y2="8" />
          <line x1="12.2" y1="8" x2="14.2" y2="8" />
          <line x1="3.6" y1="3.6" x2="5" y2="5" />
          <line x1="11" y1="11" x2="12.4" y2="12.4" />
          <line x1="3.6" y1="12.4" x2="5" y2="11" />
          <line x1="11" y1="5" x2="12.4" y2="3.6" />
        </g>
        <path
          d="M8.5 18h8.4a3.8 3.8 0 0 0 .3-7.6 4.9 4.9 0 0 0-9.2 1.8A3 3 0 0 0 8.5 18Z"
          fill={secondary}
          stroke={accent}
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (code === 3 || code === 45 || code === 48) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
        <path
          d="M6.5 17h10.8a4.8 4.8 0 0 0 .5-9.6 6.2 6.2 0 0 0-11.6 2.3A3.8 3.8 0 0 0 6.5 17Z"
          fill={secondary}
          stroke={accent}
          strokeWidth="1.2"
        />
        {(code === 45 || code === 48) && (
          <g stroke={accent} strokeWidth="1.2" strokeLinecap="round" opacity="0.85">
            <line x1="5" y1="19.5" x2="9" y2="19.5" />
            <line x1="11" y1="19.5" x2="15" y2="19.5" />
            <line x1="17" y1="19.5" x2="19" y2="19.5" />
          </g>
        )}
      </svg>
    );
  }

  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
        <path
          d="M6.5 14.5h10.8a4.8 4.8 0 0 0 .5-9.6 6.2 6.2 0 0 0-11.6 2.3A3.8 3.8 0 0 0 6.5 14.5Z"
          fill={secondary}
          stroke={accent}
          strokeWidth="1.2"
        />
        <g fill={accent}>
          <circle cx="8" cy="19" r="1" />
          <circle cx="12" cy="20" r="1" />
          <circle cx="16" cy="19" r="1" />
          <circle cx="10" cy="17.5" r="0.8" />
          <circle cx="14" cy="17.5" r="0.8" />
        </g>
      </svg>
    );
  }

  if (code >= 61 && code <= 67) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
        <path
          d="M5.8 14.2h11.8a5.2 5.2 0 0 0 .4-10.4 6.6 6.6 0 0 0-12.4 2.5A4.1 4.1 0 0 0 5.8 14.2Z"
          fill={gloomyCloud}
          stroke={accent}
          strokeWidth="1.25"
        />
        <g stroke={rain} strokeWidth="1.9" strokeLinecap="round">
          <line x1="7.5" y1="16.4" x2="6.3" y2="20.4" />
          <line x1="11.4" y1="16.2" x2="10.2" y2="21" />
          <line x1="15.3" y1="16.4" x2="14.1" y2="20.4" />
          <line x1="18.2" y1="16" x2="17.2" y2="19.5" />
        </g>
      </svg>
    );
  }

  if (code >= 95 && code <= 99) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
        <path
          d="M6.5 13.5h10.8a4.8 4.8 0 0 0 .5-9.6 6.2 6.2 0 0 0-11.6 2.3A3.8 3.8 0 0 0 6.5 13.5Z"
          fill={secondary}
          stroke={accent}
          strokeWidth="1.2"
        />
        <path d="M11 16.5 9.5 20h3L11 16.5Z" fill={accent} />
        <path d="M16 16.5 14.5 20h3L16 16.5Z" fill={accent} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-badge__icon">
      <path
        d="M6.5 14h10.8a4.8 4.8 0 0 0 .5-9.6 6.2 6.2 0 0 0-11.6 2.3A3.8 3.8 0 0 0 6.5 14Z"
        fill={secondary}
        stroke={accent}
        strokeWidth="1.2"
      />
      <g stroke={rain} strokeWidth="1.6" strokeLinecap="round">
        <line x1="8.5" y1="16.5" x2="7.5" y2="20" />
        <line x1="12" y1="16.5" x2="11" y2="20" />
        <line x1="15.5" y1="16.5" x2="14.5" y2="20" />
      </g>
    </svg>
  );
};

const formatForecastTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month} ${hours}:${minutes}`;
};

const WeatherBadge: React.FC<WeatherBadgeProps> = ({ forecast, isLightTheme = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const startForecast = forecast[0];
  const tooltip = useMemo(() => formatWeatherTooltip(startForecast), [startForecast]);
  const temperature = Math.round(startForecast.temperature_2m);
  const sortedForecast = useMemo(
    () => [...forecast].sort((a, b) => a.forecast_time_msk.localeCompare(b.forecast_time_msk)),
    [forecast]
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <button
        type="button"
        className={`weather-badge ${isLightTheme ? 'weather-badge--light' : 'weather-badge--dark'}`}
        title={tooltip}
        aria-label={`Прогноз погоды. На старт: ${getWeatherDescription(startForecast.weather_code)}, ${temperature} градусов. Открыть полный прогноз`}
        onClick={handleOpen}
      >
        <WeatherIcon code={startForecast.weather_code} isLightTheme={isLightTheme} />
        <span className="weather-badge__temp">{temperature}°</span>
      </button>
      {isOpen && (
        <div
          className="weather-modal"
          role="presentation"
          onMouseDown={handleBackdropClick}
        >
          <div
            className={`weather-modal__content ${isLightTheme ? 'weather-modal__content--light' : 'weather-modal__content--dark'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="weather-modal-title"
          >
            <div className="weather-modal__header">
              <h3 id="weather-modal-title">Прогноз погоды</h3>
              <button
                type="button"
                className="weather-modal__close"
                aria-label="Закрыть"
                onClick={handleClose}
              >
                x
              </button>
            </div>
            <div className="weather-modal__list">
              {sortedForecast.map((point, index) => (
                <div
                  key={`${point.forecast_time_msk}-${index}`}
                  className="weather-modal__row"
                >
                  <div className="weather-modal__time">{formatForecastTime(point.forecast_time_msk)}</div>
                  <div className="weather-modal__summary">
                    <WeatherIcon code={point.weather_code} isLightTheme={isLightTheme} />
                    <div>
                      <div className="weather-modal__description">
                        {getWeatherDescription(point.weather_code)}
                      </div>
                      <div className="weather-modal__details">
                        {Math.round(point.temperature_2m)}°C · ветер {Math.round(point.wind_speed_10m)} км/ч · осадки {point.precipitation.toFixed(1).replace(/\.0$/, '')} мм · влажность {Math.round(point.relative_humidity_2m)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(WeatherBadge);
