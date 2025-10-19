import { getKnacks } from "../api/knackApi.js";
import { getPurviews } from "../api/purviewsApi.js";
import { knackSchema, boonSchema } from "../module/actor-base-default.js";
import { reopenWithActiveTab } from "./reopenWithActiveTab.js";

function stripHTMLAndFormatTable(html) {
  // Primeiro, extrai o conteúdo da tabela
  const tableRegex = /<table[^>]*>(.*?)<\/table>/is;
  const tableMatch = html.match(tableRegex);

  let tableText = "";
  if (tableMatch) {
    const tableHTML = tableMatch[1];

    // Extrai cabeçalhos e linhas
    const rows = [...tableHTML.matchAll(/<tr>(.*?)<\/tr>/gis)].map(
      (rowMatch) => {
        const rowHTML = rowMatch[1];
        const cols = [...rowHTML.matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis)].map(
          (colMatch) => colMatch[1].replaceAll(/<[^>]+>/g, "").trim()
        );
        return cols;
      }
    );

    // Calcula largura máxima de cada coluna
    const colWidths = rows[0].map((_, colIndex) =>
      Math.max(...rows.map((row) => (row[colIndex] || "").length))
    );

    // Monta texto formatado
    const formatRow = (row) =>
      row.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ");

    const separator = colWidths.map((w) => "-".repeat(w)).join("-|-");

    const [header, ...body] = rows;
    tableText = [formatRow(header), separator, ...body.map(formatRow)].join(
      "\n"
    );
  }

  // Remove HTML restante e insere tabela formatada no lugar
  let cleaned = html
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/p>/gi, "\n")
    .replaceAll(/<table[^>]*>.*?<\/table>/gis, tableText)
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/\n{2,}/g, "\n")
    .replaceAll(/[ \t]{2,}/g, " ")
    .trim();

  return cleaned;
}

export async function _onDrop(event, actor) {
  event.preventDefault();
  event.stopPropagation();

  const data = JSON.parse(
    event.originalEvent.dataTransfer.getData("text/plain")
  );

  const dropTarget = event.currentTarget.dataset.dropTarget;
  const index = event.currentTarget.dataset.index;

  if (data.type === "knack-power") {
    await updateKnackList(actor, data.entry);
  } else if (data.type === "boon-power") {
    console.log("Drop detected:", data, "on target:", dropTarget);

    if (dropTarget === "boons-list") {
      await updateBoonList(actor, data.entry);
    }

    if (dropTarget === "birth-boons-list") {
      await updateBoonList(actor, data.entry);
      await updateBirthBoonList(actor, data.entry, index);
    }
  } else {
    console.warn("Unsupported drop type:", data.type);
  }
}

const updateKnackList = async (actor, knack) => {
  try {
    let knacksList = await getKnacks();

    const allPowers = knacksList[0].knacks.flatMap((k) => k.powers);
    const foundPower = allPowers.find((power) => power.name === knack);

    let schema = knackSchema;

    schema = {
      ...schema,
      _id: foundry.utils.randomID(),
      name: foundPower.name,
      description: foundPower.description,
    };

    const knackList = foundry.utils.getProperty(actor.system, "knacks");
    if (!knackList.some((k) => k.name === foundPower.name)) {
      knackList.push(schema);
    }

    await actor.update(
      {
        "system.knacks": knackList,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error("Error updating knack list:", error);
    ui.notifications.error("Failed to update knack list.");
  }
};

const updateBoonList = async (actor, boon) => {
  try {
    const boonsList = await getPurviews();

    let allPowers = boonsList.flatMap((b) => b.purviews);
    allPowers = allPowers.flatMap((p) => p.boons);

    const foundBoon = allPowers.find((power) => power.name === boon);

    let schema = boonSchema;

    schema = {
      ...schema,
      _id: foundry.utils.randomID(),
      name: foundBoon.name,
      description: stripHTMLAndFormatTable(foundBoon.description),
      level: foundBoon.level,
      dice_pool: foundBoon.dice_pool,
      cost: foundBoon.cost,
    };

    const boonList = foundry.utils.getProperty(actor.system, "boons");

    if (!boonList.some((b) => b.name === foundBoon.name)) {
      boonList.push(schema);
    }

    await actor.update(
      {
        "system.boons": boonList,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error("Error updating boon list:", error);
    ui.notifications.error("Failed to update boon list.");
  }
};

const updateBirthBoonList = async (actor, boon, index) => {
  try {
    const boonsList = await getPurviews();

    let allPowers = boonsList.flatMap((b) => b.purviews);
    allPowers = allPowers.flatMap((p) => p.boons);

    const foundBoon = allPowers.find((power) => power.name === boon);

    let schema = boonSchema;

    schema = {
      ...schema,
      _id: foundry.utils.randomID(),
      name: foundBoon.name,
      description: stripHTMLAndFormatTable(foundBoon.description),
      level: foundBoon.level,
      dice_pool: foundBoon.dice_pool,
      cost: foundBoon.cost,
    };

    const birthBoonsList = foundry.utils.getProperty(
      actor.system,
      "birthrights"
    );

    if (!birthBoonsList[index].boons.some((b) => b.name === foundBoon.name)) {
      birthBoonsList[index].boons.push(schema);
    }

    await actor.update(
      {
        "system.birthrights": birthBoonsList,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error("Error updating birth boon list:", error);
    ui.notifications.error("Failed to update birth boon list.");
  }
};
