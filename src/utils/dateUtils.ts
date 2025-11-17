import { ScheduleItem } from '../types/schedule';
import { DAYS_OF_WEEK } from '../constants';
import { normalizeTime } from './timeUtils';

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

