import { _onAction } from "../helpers/actions.js";
import { _onChange } from "../helpers/change.js";
import { _onDrop } from "../helpers/onDrop.js";

export default class ScionHeroActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2,
) {
  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["scion-hero", "sheet", "character"],
      tag: "form",
      window: {
        title: "SCION.SheetTitle",
        resizable: false,
      },
      form: {
        handler: ScionHeroActorSheetV2.#onSubmit,
        submitOnChange: true,
        closeOnSubmit: false,
      },
      position: { width: 890, height: 800 },
      // REGRA DE OURO: Todas as interações de clique devem ser mapeadas aqui
      actions: {
        rollAttribute: ScionHeroActorSheetV2.#onRollAttribute,
        setTab: ScionHeroActorSheetV2.#onSetTab, // Handler para trocar abas
        onCustomAction: (event, target) => _onAction(event, this.document),
      },
    },
    { inplace: false },
  );

  static PARTS = {
    form: {
      template:
        "systems/scion-foundry-v2/templates/actors/character-sheet.html",
    },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    console.log("Preparando contexto do sheet do ator:", context);
    context.actor = this.document;
    context.system = this.document.system;
    context.config = CONFIG.SCION;
    context.currentUserName = game.user.name;
    context.isGM = game.user.isGM;
    context.tabs = this.tabGroups;

    // Inicializa o grupo 'primary' se ele não existir
    if (!context.tabs.primary) context.tabs.primary = "stats";

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

    context.enrichedBiography =
      await foundry.applications.ux.TextEditor.enrichHTML(
        this.document.system.biography,
        {
          secrets: this.document.isOwner,
          rollData: this.document.getRollData(),
        },
      );

    return context;
  }

  /* -------------------------------------------- */
  /* Ações (Native API V2)                        */
  /* -------------------------------------------- */

  // Troca de abas nativa simplificada
  static #onSetTab(event, target) {
    const tab = target.dataset.tab;
    this.changeTab(tab, "primary"); // Assume que você definiu um grupo de tabs "primary"
  }

  static async #onRollAttribute(event, target) {
    const attr = target.dataset.attribute;
    console.log(`Rolando: ${attr}`);
  }

  static async #onSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  /* -------------------------------------------- */
  /* Drag & Drop e Listeners Específicos          */
  /* -------------------------------------------- */

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    const html = this.element;

    // Em vez de listeners de clique globais, usamos apenas para o que o framework
    // não cobre automaticamente (como inputs de mudança ou drag & drop complexo)

    html.querySelectorAll("input, select").forEach((el) => {
      if (el.dataset.action) {
        el.addEventListener("change", (ev) => _onChange(ev, this.document));
      }
    });

    // Delegando Drag & Drop de forma limpa
    const dropTargets = html.querySelectorAll("[data-drop-target]");
    dropTargets.forEach((target) => {
      target.addEventListener("dragover", (ev) => ev.preventDefault());
      target.addEventListener("drop", (ev) => _onDrop(ev, this.document));
    });
  }
}
