import { ScheduleItem } from '../types/schedule';
import { DAYS_OF_WEEK } from '../constants';
import { normalizeTime } from './timeUtils';

// Функция для вычисления дня недели из даты в формате DD.MM.YY
export function getDayOfWeekFromDate(dateStr: string): string {
  try {
    const [day, month, year] = dateStr.split('.');
    const fullYear = '20' + year;
    
    // Создаем дату (без времени, используем полдень для избежания проблем с часовыми поясами)
    const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return 'неизвестно';
    }
    
    // Возвращаем день недели
    return DAYS_OF_WEEK[date.getDay()];
  } catch (error) {
    console.error('Error getting day of week from date:', error, dateStr);
    return 'неизвестно';
  }
}

// Функция конвертации времени из GMT+3 в локальный часовой пояс пользователя
export function convertFromGMT3ToLocal(item: ScheduleItem): ScheduleItem {
  try {
    // Парсим дату в формате DD.MM.YY
    const [day, month, year] = item.date.split('.');
    const fullYear = '20' + year;
    
    // Создаем дату в GMT+3 (Europe/Moscow)
    // Формат: YYYY-MM-DDTHH:mm:ss+03:00
    const timeStr = normalizeTime(item.time).padStart(5, '0'); // Убеждаемся, что время в формате HH:mm
    const gmt3DateStr = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timeStr}:00+03:00`;
    const gmt3Date = new Date(gmt3DateStr);
    
    // Проверяем, что дата валидна
    if (isNaN(gmt3Date.getTime())) {
      console.error('Invalid date:', gmt3DateStr);
      return item; // Возвращаем оригинальный элемент при ошибке
    }
    
    // Конвертируем в локальный часовой пояс пользователя
    const localDate = new Date(gmt3Date);
    
    // Форматируем новую дату в формате DD.MM.YY вручную
    const localDay = String(localDate.getDate()).padStart(2, '0');
    const localMonth = String(localDate.getMonth() + 1).padStart(2, '0');
    const localYear = String(localDate.getFullYear()).slice(-2);
    const newDate = `${localDay}.${localMonth}.${localYear}`;
    
    // Форматируем новое время
    const localHours = String(localDate.getHours()).padStart(2, '0');
    const localMinutes = String(localDate.getMinutes()).padStart(2, '0');
    const newTime = `${localHours}:${localMinutes}`;
    
    // Получаем новый день недели
    const newDay = DAYS_OF_WEEK[localDate.getDay()];
    
    return {
      ...item,
      date: newDate,
      time: newTime,
      day: newDay
    };
  } catch (error) {
    console.error('Error converting time:', error, item);
    return item; // Возвращаем оригинальный элемент при ошибке
  }
}

