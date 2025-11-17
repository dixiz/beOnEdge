// Получаем часовой пояс пользователя
export function getUserTimeZone(): string {
  try {
    // getTimezoneOffset() возвращает смещение в минутах, отрицательное для восточных поясов
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = -offsetMinutes / 60; // Инвертируем и переводим в часы
    const sign = offsetHours >= 0 ? '+' : '';
    const hours = Math.abs(Math.round(offsetHours));
    return `GMT ${sign}${hours}`;
  } catch (e) {
    // Если не удалось получить часовой пояс, используем GMT +0
    return 'GMT +0';
  }
}

