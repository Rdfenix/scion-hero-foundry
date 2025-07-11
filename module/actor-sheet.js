import { _onAction } from "../helpers/actions.js";
import { _onChange } from "../helpers/change.js";
import { _onDrop } from "../helpers/onDrop.js";

export class ScionHeroActorSheet extends foundry.appv1.sheets.ActorSheet {
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
    this._customTabs = new foundry.applications.ux.Tabs({
      navSelector: ".sheet-tabs",
      contentSelector: ".sheet-content",
      initial: "stats",
      group: "primary",
      callback: (event, tabs, tab) => {
        // Só permite mudar a aba se o evento vier diretamente do link da aba
        return !(event && event.target !== event.currentTarget);
      },
    });

    this._customTabs.bind(html[0]);

    html.find(".sheet-tabs a").on("click", (event) => {
      if (event.target !== event.currentTarget) return;

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
      if (event.currentTarget.tagName.toLowerCase() === "select") return;
      _onAction(event, this.actor);
    });

    html.on("change", "[data-action]", (event) => {
      event.preventDefault();
      event.stopPropagation();

      _onChange(event, this.actor);
    });

    html.find("[data-drop-target='knack-list']").on("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    html
      .find("[data-drop-target='knack-list']")
      .on("drop", (event) => _onDrop(event, this.actor));

    html.find("[data-drop-target='boons-list']").on("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    html
      .find("[data-drop-target='boons-list']")
      .on("drop", (event) => _onDrop(event, this.actor));

    html
      .find("[data-drop-target='birth-boons-list']")
      .on("dragover", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    html
      .find("[data-drop-target='birth-boons-list']")
      .on("drop", (event) => _onDrop(event, this.actor));
  }

  async getData() {
    try {
      const context = await super.getData();
      const actorData = this.actor.toObject();

      context.actor = actorData;
      context.system = actorData.system || {};
      context.currentUserName = game.user?.name || "";

      const attrKeys = [];
      const skillsKeys = [];
      const attributes = context.system.attributes || {};
      const skills = context.system.abilities || {};
      for (const group of Object.values(attributes)) {
        attrKeys.push(...Object.keys(group));
      }

      for (const skillKey of Object.keys(skills)) {
        skillsKeys.push(skillKey);
      }

      const damageType = ["Bashing", "Letal", "Aggraveted"];

      context.system.attrKeys = attrKeys;
      context.system.skillsKeys = skillsKeys;
      context.system.damageType = damageType;

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
