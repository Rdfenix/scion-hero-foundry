import { getKnacks } from "../api/knackApi.js";
import { getPurviews } from "../api/purviewsApi.js";

export async function createPuviewsJournal() {
  const purviewList = await getPurviews();
  const templatePath =
    "systems/scion-hero-foundry/templates/journals/purviews.html";
  const folderName = "Purviews";

  let folder = game.folders.find(
    (f) => f.name === folderName && f.type === "JournalEntry"
  );

  if (folder) {
    await folder.delete();
  }

  folder = await Folder.create({
    name: folderName,
    type: "JournalEntry",
    color: "#782e22",
  });

  for (const purview of purviewList) {
    const existingJournal = game.journal.find((j) => j.name === purview.name);
    if (existingJournal) await existingJournal.delete();

    const content = await foundry.applications.handlebars.renderTemplate(
      templatePath,
      {
        purview,
      }
    );

    const entry = await JournalEntry.create({
      name: purview.name,
      folder: folder.id,
      permission: { default: 2 },
    });

    await entry.createEmbeddedDocuments("JournalEntryPage", [
      {
        name: purview.name,
        type: "text",
        text: {
          content,
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
        },
        flags: {
          "scion-hero-foundry": {
            customPurviewCss: true,
          },
        },
      },
    ]);
  }
}

export async function createKnacksJournal() {
  const knackList = await getKnacks();
  const folderName = "Knacks";
  const templatePath =
    "systems/scion-hero-foundry/templates/journals/knacks.html";

  // Deleta pasta antiga se já existir
  let folder = game.folders.find(
    (f) => f.name === folderName && f.type === "JournalEntry"
  );
  if (folder) await folder.delete();

  // Cria nova pasta
  folder = await Folder.create({
    name: folderName,
    type: "JournalEntry",
    color: "#556B2F",
  });

  // Cria journals individualmente com página e flag
  for (const knackItem of knackList) {
    const existingJournal = game.journal.find((j) => j.name === knackItem.name);
    if (existingJournal) await existingJournal.delete();

    const content = await foundry.applications.handlebars.renderTemplate(
      templatePath,
      {
        knackItem,
      }
    );

    const entry = await JournalEntry.create({
      name: knackItem.name,
      folder: folder.id,
      permission: { default: 2 },
    });

    await entry.createEmbeddedDocuments("JournalEntryPage", [
      {
        name: knackItem.name,
        type: "text",
        text: {
          content,
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
        },
        flags: {
          "scion-hero-foundry": {
            customKnackCss: true,
          },
        },
      },
    ]);
  }
}

export const checkPurviewFlag = (doc) => {
  if (doc.flags["scion-hero-foundry"]?.customPurviewCss) {
    const element = document.getElementsByClassName("journal-entry-content")[0];

    element.classList.add("purview-journal-entry-content");
  }
};

export const checkKnacksFlag = (doc) => {
  if (doc.flags["scion-hero-foundry"]?.customKnackCss) {
    const element = document.getElementsByClassName("journal-entry-content")[0];

    element.classList.add("knack-journal-entry-content");
  }
};
