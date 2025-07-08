import { checkKnacksFlag, checkPurviewFlag } from "../helpers/journals.js";

export function registerJournalHooks() {
  Hooks.on("renderJournalEntrySheet", (sheet, html, data) => {});

  Hooks.on("renderJournalEntryPageSheet", (sheet, html, data) => {
    const doc = sheet.document;
    checkKnacksFlag(doc);
    checkPurviewFlag(doc);

    const $html = $(html);

    $html.find("li[draggable=true]").on("dragstart", (event) => {
      const target = event.currentTarget;
      const type = target.dataset.type;

      if (!type) {
        console.warn("Elemento sem tipo definido para drag:", target);
        return;
      }

      const data = {
        type,
        entry: target.dataset.entry,
      };

      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify(data)
      );
    });
  });

  Hooks.on("renderJournalTextPageSheet", (sheet, html, data) => {});
}
