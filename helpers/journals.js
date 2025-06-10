import { getPurviews } from "./actions.js";

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

    const entry = await JournalEntry.create(
      {
        name: `${purview.name}`,
        pages: pages,
        folder: folder.id,
        permission: { default: 2 },
        flags: {
          "scion-hero-foundry": {
            customCss: true,
          },
        },
      }
    );

    // Garante que o flag customCss está presente na página criada
    for (const page of entry.pages.contents) {
      await page.setFlag("scion-hero-foundry", "customCss", true);
    }
  }
}
