export const cleanString = str => {
  return str
    .normalize('NFD') // Decompõe os caracteres acentuados (ex: 'á' vira 'a' + '´')
    .replaceAll(/[\u0300-\u036f]/g, '') // Remove apenas os acentos (os "sinais")
    .replaceAll(/[^a-zA-Z0-9\s]/g, '');
};

export const mountGodsList = async gods =>
  gods.map(god => ({
    name: god.name,
    favoredSkills: (god.favoredSkills || []).reduce((obj, skill, idx) => {
      obj[idx] = skill;
      return obj;
    }, {}),
  }));

export const mountFavoritiesSkills = async (deityPantheon, actor) => {
  const abilities = foundry.utils.getProperty(actor.system, 'abilities');
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
  // Extrai linhas
  const rows = [...tableHTML.matchAll(/<tr>(.*?)<\/tr>/gis)].map(rowMatch => {
    const rowHTML = rowMatch[1];
    const cols = [...rowHTML.matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis)].map(colMatch =>
      colMatch[1].replaceAll(/<[^>]+>/g, '').trim()
    );
    return cols;
  });
  if (!rows.length) return '';
  // Garante que todas as linhas tenham o mesmo número de colunas
  const maxCols = Math.max(...rows.map(r => r.length));
  rows.forEach(r => {
    while (r.length < maxCols) r.push('');
  });
  // Calcula largura máxima de cada coluna
  const colWidths = Array.from({ length: maxCols }, (_, colIndex) =>
    Math.max(...rows.map(row => (row[colIndex] || '').length))
  );
  // Monta texto formatado
  const formatRow = row => row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ');
  const separator = colWidths.map(w => '-'.repeat(w)).join('-|-');
  const [header, ...body] = rows;
  return [formatRow(header), separator, ...body.map(formatRow)].join('\n');
}

export function stripHTMLAndFormatTable(html) {
  // Substitui todas as tabelas por texto formatado
  let processed = html;
  processed = processed.replaceAll(/<table[^>]*>(.*?)<\/table>/gis, (match, tableHTML) => {
    return '\n' + processTable(tableHTML) + '\n';
  });

  // Remove tags de quebra de linha e parágrafo, mas preserva separação
  processed = processed.replaceAll(/<br\s*\/?>(?!\n)/gi, '\n');
  processed = processed.replaceAll(/<\/p>/gi, '\n');

  // Remove o restante das tags HTML
  processed = processed.replaceAll(/<[^>]+>/g, '');

  // Normaliza múltiplas quebras de linha e espaços
  processed = processed.replaceAll(/\n{3,}/g, '\n\n'); // Mantém parágrafos
  processed = processed.replaceAll(/[ \t]{2,}/g, ' ');
  processed = processed.trim();

  return processed;
}
