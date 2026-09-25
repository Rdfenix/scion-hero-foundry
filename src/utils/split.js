export function splitInColumns(object, columns) {
  if (!object || typeof object !== "object") {
    return [];
  }

  const entries = Object.entries(object);
  const columnSize = Math.ceil(entries.length / columns);

  return Array.from({ length: columns }, (_, index) =>
    entries.slice(index * columnSize, (index + 1) * columnSize),
  );
}
