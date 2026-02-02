import { ScheduleItem } from '../types/schedule';
import { normalizeTime } from './timeUtils';
import { getDayOfWeekFromDate } from './dateUtils';

const HEADER_MAP: Record<string, keyof ScheduleItem> = {
  shed: 'Shed',
  live: 'Live',
  ended: 'Ended',
  delay: 'Delay',
  cancel: 'Cancel',
  date: 'date',
  start: 'time',
  time: 'time',
  championship: 'championship',
  stage: 'stage',
  place: 'place',
  session: 'session',
  pc: 'PC',
  tg1: 'TG1',
  tg2: 'TG2',
  tg3: 'TG3',
  bcu1: 'BCU1',
  bcu2: 'BCU2',
  bcu3: 'BCU3',
  commentator1: 'Commentator1',
  commentator2: 'Commentator2',
  optionally: 'Optionally',
  duration: 'Duration',
  'live timing': 'LiveTiming',
  livetiming: 'LiveTiming',
  spotter: 'Spotter',
};

// Улучшенный парсер CSV строки (обрабатывает кавычки)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Экранированная кавычка
        current += '"';
        i++;
      } else {
        // Начало/конец кавычек
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Разделитель вне кавычек
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Валидация элемента расписания
function validateScheduleItem(item: Partial<ScheduleItem>): item is ScheduleItem {
  return !!(
    item.date &&
    item.time &&
    item.championship &&
    item.session
  );
}

export function parseCSV(text: string): ScheduleItem[] {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  
  return lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line);
      const obj: Partial<ScheduleItem> = {};
      headers.forEach((header, idx) => {
        const key = HEADER_MAP[header.toLowerCase()];
        if (!key) return;
        obj[key] = (values[idx] || '').trim() as any;
      });
      return obj;
    })
    .filter(validateScheduleItem)
    .map(item => ({
      ...item,
      time: normalizeTime(item.time),
      day: getDayOfWeekFromDate(item.date) // Вычисляем день недели из даты
    })) as ScheduleItem[];
}

