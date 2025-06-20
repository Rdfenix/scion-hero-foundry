import { checkKnacksFlag, checkPurviewFlag } from "../helpers/journals.js";

export function registerJournalHooks() {
  Hooks.on("renderJournalEntrySheet", (sheet, html, data) => {});

  Hooks.on("renderJournalEntryPageSheet", (sheet, html, data) => {
    console.log("renderJournalSheet olha abaixo");
    const doc = sheet.document;
    checkKnacksFlag(doc);
    checkPurviewFlag(doc);
  });

  Hooks.on("renderJournalTextPageSheet", (sheet, html, data) => {});
}
