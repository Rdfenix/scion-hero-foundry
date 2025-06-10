import { getPurviews } from "./actions.js";

export async function createPuviewsJournal() {
  const purviewList = await getPurviews();
  const templatePath =
    "systems/scion-hero-foundry/templates/journals/purviews.html";

  console.log("Purviews fetched:", purviewList);

  const pages = [];

  for (const purview of purviewList) {
    console.log("Processing purview:", purview);

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
        folder: null,
        permission: { default: 2 },
        flags: {
          "scion-hero-foundry": {
            customCss: true,
          },
        },
      },
      { renderSheet: true }
    );

    // Garante que o flag customCss está presente na página criada
    for (const page of entry.pages.contents) {
      await page.setFlag("scion-hero-foundry", "customCss", true);
    }
  }
}
