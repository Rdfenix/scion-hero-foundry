import { checkKnacksFlag, checkPurviewFlag } from '../helpers/journals.js';

export function registerJournalHooks() {
  Hooks.on('renderJournalEntrySheet', (sheet, html, data) => {});

  Hooks.on('renderJournalEntryPageSheet', (sheet, html, data) => {
    const doc = sheet.document;
    checkKnacksFlag(doc);
    checkPurviewFlag(doc);

    html.querySelectorAll('li[draggable=true]').forEach(el => {
      el.addEventListener('dragstart', event => {
        const data = {
          type: event.currentTarget.dataset.type,
          entry: event.currentTarget.dataset.entry,
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
      });
    });
  });

  Hooks.on('renderJournalTextPageSheet', (sheet, html, data) => {});
}
