// Утилиты для форматирования текста

export function formatChampionship(championship?: string): string {
  const champ = championship?.trim() || '';
  return champ.endsWith('.') ? champ : champ + '.';
}

export function formatStage(stage?: string): string {
  const stageText = stage?.trim() || '';
  return stageText.endsWith('.') ? stageText.slice(0, -1) : stageText;
}

