import { getPurviews, getKnacks } from "./actions.js";

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

  const pages = [];

  for (const purview of purviewList) {
    const existingJournal = game.journal.find((j) => j.name === purview.name);
    const content = await renderTemplate(templatePath, { purview });

    if (existingJournal) {
      await existingJournal.delete();
    }

    pages.push({
      name: purview.name,
      type: "text",
      text: {
        content: content,
        format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
      },
    });

    const entry = await JournalEntry.create({
      name: `${purview.name}`,
      pages: pages,
      folder: folder.id,
      permission: { default: 2 },
    });

    // Garante que o flag customCss está presente na página criada
    for (const page of entry.pages.contents) {
      await page.setFlag("scion-hero-foundry", "customPurviewCss", true);
    }
  }
}

export async function createKnacksJournal() {
  const knackList = await getKnacks();
  const folderName = "Knacks";
  const templatePath =
    "systems/scion-hero-foundry/templates/journals/knacks.html";
  console.log("knackList", knackList);

  let folder = game.folders.find(
    (f) => f.name === folderName && f.type === "JournalEntry"
  );

  if (folder) {
    await folder.delete();
  }

  folder = await Folder.create({
    name: folderName,
    type: "JournalEntry",
    color: "#556B2F",
  });

  const pages = [];

  for (const knackItem of knackList) {
    const existingJournal = game.journal.find((j) => j.name === knackItem.name);
    const content = await renderTemplate(templatePath, { knackItem });

    if (existingJournal) {
      await existingJournal.delete();
    }

    pages.push({
      name: knackItem.name,
      type: "text",
      text: {
        content: content,
        format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
      },
    });

    const entry = await JournalEntry.create({
      name: `${knackItem.name}`,
      pages: pages,
      folder: folder.id,
      permission: { default: 2 },
    });

    // Garante que o flag customCss está presente na página criada
    for (const page of entry.pages.contents) {
      await page.setFlag("scion-hero-foundry", "customKnackCss", true);
    }
  }
}

export const checkPurviewFlag = (sheet, html) => {
  const purviewFlag = sheet.document.getFlag(
    "scion-hero-foundry",
    "customPurviewCss"
  );

  if (purviewFlag) {
    html
      .closest(".journal-entry-content")
      ?.addClass("purview-journal-entry-content");
  }
};

export const checkKnacksFlag = (sheet, html) => {
  const knackFlag = sheet.document.getFlag(
    "scion-hero-foundry",
    "customKnackCss"
  );

  if (knackFlag) {
    html
      .closest(".journal-entry-content")
      ?.addClass("knack-journal-entry-content");
  }
};
