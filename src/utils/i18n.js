export function localize(key) {
  return game.i18n.localize(key);
}

export function customLocalizeWord(word, key) {
  if (!word || !key) return "";
  const formatedWord = word
    .replaceAll(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
  return game.i18n.localize(`${key}.${formatedWord}`);
}
