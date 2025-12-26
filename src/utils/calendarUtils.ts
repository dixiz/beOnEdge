import { ScheduleItem } from '../types/schedule';

/**
 * Генерирует URL для добавления события в Google Calendar
 */
export function generateGoogleCalendarUrl(item: ScheduleItem): string {
  // Парсим дату из формата DD.MM.YY
  const [day, month, year] = item.date.split('.');
  const fullYear = '20' + year;
  
  // Парсим время из формата HH:MM
  const [hours, minutes] = item.time.split(':');
  
  // Создаем дату начала (в GMT+3, как указано в данных)
  const startDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+03:00`);
  
  // Создаем дату окончания (предполагаем длительность 2 часа, можно изменить)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  // Форматируем даты для Google Calendar (формат: YYYYMMDDTHHmmssZ для UTC)
  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };
  
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  
  // Формируем название события
  const eventTitle = `${item.championship} - ${item.stage}: ${item.session}`;
  
  // Формируем описание
  const descriptionParts = [
    `Этап: ${item.stage}`,
    `Сессия: ${item.session}`,
    item.place && `Место: ${item.place}`,
    item.Commentator1 && `Комментатор: ${item.Commentator1}`,
    item.Commentator2 && `Комментатор: ${item.Commentator2}`,
    item.Optionally && `Важно: ${item.Optionally}`
  ].filter(Boolean);
  
  const description = descriptionParts.join('\n');
  
  // Кодируем параметры для URL
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${startDateStr}/${endDateStr}`,
    details: description,
    location: item.place || ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Экранирует специальные символы для формата iCalendar
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Генерирует файл iCalendar (.ics) для Яндекс Календаря и других календарей
 */
export function generateICalendarFile(item: ScheduleItem): string {
  // Парсим дату из формата DD.MM.YY
  const [day, month, year] = item.date.split('.');
  const fullYear = '20' + year;
  
  // Парсим время из формата HH:MM
  const [hours, minutes] = item.time.split(':');
  
  // Создаем дату начала (в GMT+3, как указано в данных)
  const startDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+03:00`);
  
  // Создаем дату окончания (предполагаем длительность 2 часа)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  // Форматируем даты для iCalendar (формат: YYYYMMDDTHHmmssZ для UTC)
  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };
  
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  const currentDateStr = formatDate(new Date());
  
  // Формируем название события
  const eventTitle = `${item.championship} - ${item.stage}: ${item.session}`;
  
  // Формируем описание
  const descriptionParts = [
    `Этап: ${item.stage}`,
    `Сессия: ${item.session}`,
    item.place && `Место: ${item.place}`,
    item.Commentator1 && `Комментатор: ${item.Commentator1}`,
    item.Commentator2 && `Комментатор: ${item.Commentator2}`,
    item.Optionally && `Важно: ${item.Optionally}`
  ].filter(Boolean);
  
  const description = descriptionParts.join('\\n');
  const location = item.place || '';
  
  // Генерируем уникальный ID события
  const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Формируем содержимое .ics файла
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BeOnEdge Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${eventId}@beonedge.com`,
    `DTSTAMP:${currentDateStr}`,
    `DTSTART:${startDateStr}`,
    `DTEND:${endDateStr}`,
    `SUMMARY:${escapeICS(eventTitle)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
}

/**
 * Скачивает файл .ics для Яндекс Календаря
 */
export function downloadICalendarFile(item: ScheduleItem): void {
  const icsContent = generateICalendarFile(item);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Функция для безопасного форматирования имени файла
  const sanitizeFileName = (text: string): string => {
    return text.replace(/[^a-zA-Z0-9а-яА-Я]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };
  
  const championship = sanitizeFileName(item.championship);
  const stage = sanitizeFileName(item.stage);
  const session = sanitizeFileName(item.session);
  const date = item.date.replace(/\./g, '_');
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${championship}-${stage}-${session}-${date}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

