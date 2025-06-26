export function reopenWithActiveTab(actor) {
  const activeTab =
    document.querySelector(".sheet-tabs .item.active")?.dataset.tab ?? "stats";

  Hooks.once("renderActorSheet", (app, html, data) => {
    const nav = html[0].querySelector(".sheet-tabs");
    const tabEl = nav?.querySelector(`[data-tab="${activeTab}"]`);
    if (tabEl) tabEl.click();
  });
  return actor.sheet.render(true);
}
