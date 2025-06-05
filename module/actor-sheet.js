import { _onAction } from "../helpers/actions.js";

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
      event.stopPropagation();

      let tab = event.currentTarget.dataset.tab;

      html.find(".sheet-tabs a").removeClass("active");
      $(event.currentTarget).addClass("active");

      this._customTabs.activate(tab);

      html.find(".tab").removeClass("active");
      html.find(`.tab[data-tab="${tab}"]`).addClass("active");
    });

    // Usa delegação para garantir que funcione em partials e elementos dinâmicos
    html.on("click", "[data-action]", (event) => {
      event.preventDefault();
      event.stopPropagation();
      _onAction(event, this.actor);
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
