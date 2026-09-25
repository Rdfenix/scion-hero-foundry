import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { getKnacks } from "../api/knackApi";
import { getPurviews } from "../api/purviewsApi";
import Knack from "./components/jornals/Knacks";
import Purview from "./components/jornals/Purviews";

export const createPuviewsJournal = async () => {
  const purviewList = await getPurviews();
  const folderName = "Purviews";

  const existingFolder = game.folders.find(
    (folder) => folder.name === folderName && folder.type === "JournalEntry",
  );

  const journalsToDelete = game.journal.contents.filter((journal) => {
    const belongsToFolder = existingFolder
      ? journal.folder?.id === existingFolder.id
      : false;

    const hasGeneratedName = purviewList.some(
      (purviewItem) => purviewItem.name === journal.name,
    );

    return belongsToFolder || hasGeneratedName;
  });

  if (journalsToDelete.length > 0) {
    await JournalEntry.deleteDocuments(
      journalsToDelete.map((journal) => journal.id),
    );
  }

  if (existingFolder) {
    await existingFolder.delete();
  }

  const folder = await Folder.create({
    name: folderName,
    type: "JournalEntry",
    color: "#782e22",
    ownership: { default: 2 },
  });

  for (const purview of purviewList) {
    const content = renderToStaticMarkup(
      createElement(Purview, {
        purview,
      }),
    );

    const entry = await JournalEntry.create({
      name: purview.name,
      folder: folder.id,
      ownership: { default: 2 },
      flags: {
        "scion-hero-foundry": {
          generatedBy: "purview-journal",
        },
      },
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
};

export const createKnacksJournal = async () => {
  const knackList = await getKnacks();
  const folderName = "Knacks";

  const existingFolder = game.folders.find(
    (folder) => folder.name === folderName && folder.type === "JournalEntry",
  );

  const journalsToDelete = game.journal.contents.filter((journal) => {
    const belongsToFolder = existingFolder
      ? journal.folder?.id === existingFolder.id
      : false;

    const hasGeneratedName = knackList.some(
      (knackItem) => knackItem.name === journal.name,
    );

    return belongsToFolder || hasGeneratedName;
  });

  if (journalsToDelete.length > 0) {
    await JournalEntry.deleteDocuments(
      journalsToDelete.map((journal) => journal.id),
    );
  }

  if (existingFolder) {
    await existingFolder.delete();
  }

  const folder = await Folder.create({
    name: folderName,
    type: "JournalEntry",
    color: "#556B2F",
    ownership: { default: 2 },
  });

  for (const knackItem of knackList) {
    const content = renderToStaticMarkup(
      createElement(Knack, {
        knacks: knackItem.knacks ?? [],
      }),
    );

    const entry = await JournalEntry.create({
      name: knackItem.name,
      folder: folder.id,
      ownership: { default: 2 },
      flags: {
        "scion-hero-foundry": {
          generatedBy: "knacks-journal",
        },
      },
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
};
