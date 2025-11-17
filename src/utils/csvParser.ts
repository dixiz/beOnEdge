import { ScheduleItem } from '../types/schedule';
import { normalizeTime } from './timeUtils';

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
    item.day && 
    item.time && 
    item.championship &&
    item.stage &&
    item.place &&
    item.session
  );
}

export function parseCSV(text: string): ScheduleItem[] {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line);
      const obj: Partial<ScheduleItem> = {};
      headers.forEach((header, idx) => {
        const key = header.trim() as keyof ScheduleItem;
        obj[key] = (values[idx] || '').trim() as any;
      });
      return obj;
    })
    .filter(validateScheduleItem)
    .map(item => ({
      ...item,
      time: normalizeTime(item.time)
    })) as ScheduleItem[];
}

