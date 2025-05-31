export class ScionHeroActorSheet extends ActorSheet {
  prepareData() {
    super.prepareData();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["scion-hero", "sheet", "character"],
      template:
        "systems/scion-hero-foundry/templates/actors/character-sheet.html",
      width: 890,
      height: 800, // tabs removido para evitar conflito com inicialização manual
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Corrige: adiciona o parâmetro group: "primary" para bater com o data-group do HTML
    this._customTabs = new Tabs({
      navSelector: ".sheet-tabs",
      contentSelector: ".sheet-content",
      initial: "stats",
      group: "primary",
    });

    this._customTabs.bind(html[0]);

    html.find(".sheet-tabs a").on("click", (event) => {
      event.preventDefault();
      this._customTabs.activate(event.currentTarget);

      let tab = event.currentTarget.dataset.tab;
      html.find(".tab").removeClass("active");
      html.find(`.tab[data-tab="${tab}"]`).addClass("active");
    });
  }

  async getData() {
    try {
      const context = await super.getData();
      const actorData = this.actor.toObject();

      context.actor = actorData;
      context.system = actorData.system || {};
      context.currentUserName = game.user?.name || "";

      console.log("Contexto preparado:", context);

      return context;
    } catch (e) {
      console.error(
        "Erro ao carregar getData ou template da ScionHeroActorSheet:",
        e
      );
      return {};
    }
  }
}
