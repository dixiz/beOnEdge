export interface WeatherForecastPoint {
  forecast_time_msk: string;
  forecast_time_local?: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
}

export interface WeatherCacheEvent {
  event_row?: number;
  Date: string;
  Start: string;
  Championship: string;
  Stage?: string;
  latitude?: number;
  longitude?: number;
  forecast: WeatherForecastPoint[];
}

export interface WeatherCacheData {
  last_updated?: string;
  events: WeatherCacheEvent[];
}
