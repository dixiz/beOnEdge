import { WeatherCacheData, WeatherCacheEvent, WeatherForecastPoint } from '../types/weather';
import { normalizeTime } from './timeUtils';

export type WeatherEventKeyParts = {
  date: string;
  time: string;
  championship: string;
  stage?: string;
};

const normalizeEventDate = (date: string): string => {
  const [dayRaw = '', monthRaw = '', yearRaw = ''] = date.trim().split('.');
  if (!dayRaw || !monthRaw || !yearRaw) return date.trim();

  const fullYear = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  return `${dayRaw.padStart(2, '0')}.${monthRaw.padStart(2, '0')}.${fullYear}`;
};

const normalizeStage = (stage?: string): string => {
  const trimmed = (stage ?? '').trim();
  if (!trimmed) return '';
  return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
};

export const buildWeatherEventKey = ({
  date,
  time,
  championship,
  stage
}: WeatherEventKeyParts): string => {
  return [
    normalizeEventDate(date),
    normalizeTime(time),
    championship.trim(),
    normalizeStage(stage)
  ].join('|');
};

export const buildWeatherLookupMap = (
  events: WeatherCacheEvent[]
): Map<string, WeatherForecastPoint[]> => {
  const map = new Map<string, WeatherForecastPoint[]>();

  events.forEach(event => {
    if (!event.forecast?.length) return;

    const key = buildWeatherEventKey({
      date: event.Date,
      time: event.Start,
      championship: event.Championship,
      stage: event.Stage
    });

    map.set(key, event.forecast);
  });

  return map;
};

export const parseWeatherCache = (text: string): WeatherCacheData => {
  const parsed = JSON.parse(text) as WeatherCacheData;
  if (!parsed || !Array.isArray(parsed.events)) {
    throw new Error('Некорректный формат прогноза погоды');
  }
  return parsed;
};

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Ясно';
  if (code === 1) return 'Преимущественно ясно';
  if (code === 2) return 'Переменная облачность';
  if (code === 3) return 'Пасмурно';
  if (code === 45 || code === 48) return 'Туман';
  if (code >= 51 && code <= 57) return 'Морось';
  if (code >= 61 && code <= 67) return 'Дождь';
  if (code >= 71 && code <= 77) return 'Снег';
  if (code >= 80 && code <= 82) return 'Ливень';
  if (code >= 85 && code <= 86) return 'Снегопад';
  if (code >= 95 && code <= 99) return 'Гроза';
  return 'Погода';
};

export const formatWeatherTooltip = (point: WeatherForecastPoint): string => {
  const temp = Math.round(point.temperature_2m);
  const wind = Math.round(point.wind_speed_10m);
  const precip = point.precipitation.toFixed(1).replace(/\.0$/, '');
  return `${getWeatherDescription(point.weather_code)} · ${temp}°C · ветер ${wind} км/ч · осадки ${precip} мм · влажность ${Math.round(point.relative_humidity_2m)}%`;
};
