export class ScionHeroActorSheet extends ActorSheet {
  prepareData() {
    super.prepareData();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["scion-hero", "sheet", "character"],
      template:
        "systems/scion-hero-foundry/templates/actors/character-sheet.html",
      width: 885,
      height: 800,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "character",
        },
      ],
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
