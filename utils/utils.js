export const cleanString = (str) => {
  return str
    .normalize("NFD") // Decompõe os caracteres acentuados (ex: 'á' vira 'a' + '´')
    .replaceAll(/[\u0300-\u036f]/g, "") // Remove apenas os acentos (os "sinais")
    .replaceAll(/[^a-zA-Z0-9\s]/g, "");
};

export const mountGodsList = async (gods) =>
  gods.map((god) => ({
    name: god.name,
    favoredSkills: (god.favoredSkills || []).reduce((obj, skill, idx) => {
      obj[idx] = skill;
      return obj;
    }, {}),
  }));

export const mountFavoritiesSkills = async (deityPantheon, actor) => {
  const abilities = foundry.utils.getProperty(actor.system, "abilities");
  const favoredSkillsArr = Object.values(deityPantheon.favoredSkills);
  const updatedAbilities = {};

  for (const [key, value] of Object.entries(abilities)) {
    updatedAbilities[key] = {
      ...value,
      favored: favoredSkillsArr.includes(key),
    };
  }

  return updatedAbilities;
};

export function processTable(tableHTML) {
  if (!tableHTML?.trim()) return "";

  // Extrai linhas e colunas em uma única passagem
  const rows = [...tableHTML.matchAll(/<tr>(.*?)<\/tr>/gis)].map((rowMatch) => {
    return [...rowMatch[1].matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis)].map(
      (colMatch) => colMatch[1].replaceAll(/<[^>]+>/g, "").trim(),
    );
  });

  if (!rows.length) return "";

  // Normaliza colunas
  const maxCols = Math.max(...rows.map((r) => r.length));
  rows.forEach((r) => r.push(...new Array(maxCols - r.length).fill("")));

  // Calcula larguras
  const colWidths = Array.from({ length: maxCols }, (_, i) =>
    Math.max(...rows.map((r) => r[i]?.length || 0)),
  );

  // Formata
  const formatRow = (row) =>
    row.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ");
  const separator = colWidths.map((w) => "-".repeat(w)).join("-+-");
  const [header, ...body] = rows;

  return [formatRow(header), separator, ...body.map(formatRow)].join("\n");
}

export function stripHTMLAndFormatTable(html) {
  // Substitui todas as tabelas por texto formatado
  let processed = html;
  processed = processed.replaceAll(
    /<table[^>]*>(.*?)<\/table>/gis,
    (match, tableHTML) => {
      return "\n" + processTable(tableHTML) + "\n";
    },
  );

  // Remove tags de quebra de linha e parágrafo, mas preserva separação
  processed = processed.replaceAll(/<br\s*\/?>(?!\n)/gi, "\n");
  processed = processed.replaceAll(/<\/p>/gi, "\n");

  // Remove o restante das tags HTML
  processed = processed.replaceAll(/<[^>]+>/g, "");

  // Normaliza múltiplas quebras de linha e espaços
  processed = processed.replaceAll(/\n{3,}/g, "\n\n"); // Mantém parágrafos
  processed = processed.replaceAll(/[ \t]{2,}/g, " ");
  processed = processed.trim();

  return processed;
}

export function getRoot() {
  return `systems/${game?.system?.id}`;
}

export function customLocalizeWord(word, key) {
  if (!word || !key) return "";
  const formatedWord = word
    .replaceAll(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
  return game.i18n.localize(`${key}.${formatedWord}`);
}
