export function groupBy<T>(arr: T[], keyGetter: (item: T) => string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  arr.forEach(item => {
    const key = keyGetter(item);
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return map;
}

