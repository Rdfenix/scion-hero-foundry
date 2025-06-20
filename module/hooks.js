import { checkKnacksFlag, checkPurviewFlag } from "../helpers/journals.js";

export function registerJournalHooks() {
  Hooks.on("renderJournalEntrySheet", (sheet, html, data) => {
    console.log("renderJournalPageSheet");
    handleJournalRendering(sheet, html);
  });

  Hooks.on("renderJournalEntryPageSheet", (sheet, html, data) => {
    console.log("renderJournalSheet");
    handleJournalRendering(sheet, html);
  });

  Hooks.on("renderJournalTextPageSheet", (sheet, html, data) => {
    console.log("cheguei");
    console.log("renderJournalTextPageSheet");
  });
}

function handleJournalRendering(sheet, html) {
  console.log(sheet);
  const doc = sheet.document;
  if (!doc) return;

  const $form = html.closest("form");
  let appForm = null;
  if ($form && $form.length) {
    appForm = $form[0];
  } else if (html[0]?.form) {
    appForm = html[0].form;
  } else if (html[0]?.closest) {
    appForm = html[0].closest("form");
  }
  if (!appForm) return;

  // Aguarda o Foundry terminar de atualizar o título antes de sobrescrever
  setTimeout(() => {
    const windowHeader = appForm.querySelector(".window-header");
    if (windowHeader) {
      const windowTitle = windowHeader.querySelector(".window-title");
      if (windowTitle) {
        windowTitle.textContent = doc.name || doc.parent?.name || "";
      }
    }
  }, 50); // 50ms costuma ser suficiente
}
