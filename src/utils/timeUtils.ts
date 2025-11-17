// Функция нормализации времени к формату ЧЧ:ММ
export function normalizeTime(timeStr: string): string {
  if (!timeStr) return timeStr;
  const trimmed = timeStr.trim();
  const parts = trimmed.split(':');
  if (parts.length !== 2) return trimmed; // Если формат неправильный, возвращаем как есть
  
  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  return `${hours}:${minutes}`;
}

