export function getRoot() {
  return `systems/${game?.system?.id}`;
}

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

function normalizeText(text) {
  return text
    .replace(/\s*\n\s*/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function getCellText(cell) {
  const clone = cell.cloneNode(true);

  clone.querySelectorAll("br").forEach((br) => {
    br.replaceWith("\n");
  });

  return normalizeText(clone.textContent || "");
}

export function processTable(tableHTML) {
  if (typeof tableHTML !== "string" || !tableHTML.trim()) {
    return "";
  }

  const document = new DOMParser().parseFromString(
    `<table>${tableHTML}</table>`,
    "text/html",
  );

  const rows = [...document.querySelectorAll("tr")]
    .map((row) =>
      [...row.querySelectorAll(":scope > th, :scope > td")].map(getCellText),
    )
    .filter((row) => row.length > 0);

  if (!rows.length) {
    return "";
  }

  const columnCount = Math.max(...rows.map((row) => row.length));

  rows.forEach((row) => {
    row.push(...new Array(columnCount - row.length).fill(""));
  });

  const columnWidths = Array.from({ length: columnCount }, (_, index) =>
    Math.max(...rows.map((row) => row[index].length)),
  );

  const formatRow = (row) =>
    row
      .map((cell, index) => cell.padEnd(columnWidths[index]))
      .join(" | ")
      .trimEnd();

  const separator = columnWidths.map((width) => "-".repeat(width)).join("-+-");

  const [header, ...body] = rows;

  return [formatRow(header), separator, ...body.map(formatRow)].join("\n");
}

export function stripHTMLAndFormatTable(html) {
  if (typeof html !== "string" || !html.trim()) {
    return "";
  }

  const document = new DOMParser().parseFromString(html, "text/html");

  document.querySelectorAll("table").forEach((table) => {
    const formattedTable = processTable(table.innerHTML);
    table.replaceWith(
      document.createTextNode(formattedTable ? `\n${formattedTable}\n` : ""),
    );
  });

  document.querySelectorAll("br").forEach((br) => {
    br.replaceWith("\n");
  });

  document.querySelectorAll("p, div, li, tr").forEach((element) => {
    element.append("\n");
  });

  let result = document.body.textContent || "";

  result = result
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return result;
}

export function validateActorPermission(actor, requiredPermission = "OWNER") {
  if (!actor) {
    ui.notifications.error("Ator não encontrado.");
    return false;
  }

  // Obtém as permissões do usuário atual para este ator
  const userPermission = actor.getUserLevel(game.user);

  console.log(`Permissão do usuário ${game.user.name}:`, userPermission);
  console.log(
    `Nível requerido (OWNER=3):`,
    DOCUMENT_PERMISSION_LEVELS[requiredPermission],
  );

  // CONST.DOCUMENT_PERMISSION_LEVELS:
  // NONE = 0, LIMITED = 1, OBSERVER = 2, OWNER = 3

  const requiredLevel = DOCUMENT_PERMISSION_LEVELS[requiredPermission] ?? 3;

  if (userPermission < requiredLevel) {
    const permName = Object.keys(DOCUMENT_PERMISSION_LEVELS).find(
      (k) => DOCUMENT_PERMISSION_LEVELS[k] === userPermission,
    );

    ui.notifications.warn(
      `Permissão insuficiente. Você tem: ${permName}, Necessário: ${requiredPermission}`,
    );
    return false;
  }

  return true;
}

export function resetFavoredAbilities(actor) {
  return Object.fromEntries(
    Object.entries(actor.system?.abilities ?? {}).map(([key, ability]) => [
      key,
      {
        ...ability,
        favored: false,
      },
    ]),
  );
}
