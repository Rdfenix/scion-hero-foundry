import { _onAction } from "../helpers/actions.js";
import { _onChange } from "../helpers/change.js";
import { _onDrop } from "../helpers/onDrop.js";

import { attributesUpdate } from "../helpers/attributesUpdate.js";
import { abilitiesUpdate } from "../helpers/abilitiesUpdate.js";
import { virtuesUpdate } from "../helpers/virtuesUpdate.js";
import { birthrightUpdate } from "../helpers/birthrightsUpdate.js";
import { willpowerUpdate } from "../helpers/willpowerUpdate.js";
import { legendUpdate } from "../helpers/legendUpdate.js";
import { updateSoak } from "../helpers/updateSoak.js";

function renderActorSheetElements(app, html, data) {
  // Implementar funcionalidades específicas de renderização aqui, se necessário
  attributesUpdate(app, html, data);
  abilitiesUpdate(app, html, data);
  virtuesUpdate(app, html, data);
  birthrightUpdate(app, html, data);
  willpowerUpdate(app, html, data);
  legendUpdate(app, html, data);
  updateSoak(app);
}

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
        scrollable: [".scion-wrapper"],
      },
      form: {
        handler: ScionHeroActorSheetV2.#onSubmit,
        submitOnChange: true,
        closeOnSubmit: false,
      },
      position: { width: 897, height: 800 },
      // REGRA DE OURO: Todas as interações de clique devem ser mapeadas aqui
      actions: {
        rollAttribute: ScionHeroActorSheetV2.#onRollAttribute,
        setTab: ScionHeroActorSheetV2.#onSetTab, // Handler para trocar abas
        "select-pantheon": ScionHeroActorSheetV2.#onActionTracker,
        "select-god": ScionHeroActorSheetV2.#onActionTracker,
        "button-birthright-type": ScionHeroActorSheetV2.#onActionTracker,
        "button-knack-add": ScionHeroActorSheetV2.#onActionTracker,
        "button-birthright-boon": ScionHeroActorSheetV2.#onActionTracker,
        "button-boon-add": ScionHeroActorSheetV2.#onActionTracker,
        "button-weapon-add": ScionHeroActorSheetV2.#onActionTracker,
        "delete-birthright": ScionHeroActorSheetV2.#onActionTracker,
        "delete-birth-boon": ScionHeroActorSheetV2.#onActionTracker,
        "delete-knack": ScionHeroActorSheetV2.#onActionTracker,
        "delete-boon": ScionHeroActorSheetV2.#onActionTracker,
        "delete-weapon": ScionHeroActorSheetV2.#onActionTracker,
        "roll-attribute": ScionHeroActorSheetV2.#onActionTracker,
        "roll-willpower": ScionHeroActorSheetV2.#onActionTracker,
        "roll-legend": ScionHeroActorSheetV2.#onActionTracker,
        "roll-ability": ScionHeroActorSheetV2.#onActionTracker,
        "roll-attack": ScionHeroActorSheetV2.#onActionTracker,
        "roll-damage": ScionHeroActorSheetV2.#onActionTracker,
        "join-battle": ScionHeroActorSheetV2.#onActionTracker,
        editImage: ScionHeroActorSheetV2.#onEditImage,
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
    console.log("CONFIG:", CONFIG);
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

  static async #onActionTracker(event, target) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const action = target.dataset.action;
    const key = target.dataset.key;
    const type = target.dataset.type;
    const label = target.dataset.label;

    await _onAction(action, this.document, {
      key,
      type,
      label,
      dataset: target.dataset,
    });
  }

  static async #onEditImage(event, target) {
    const attr = target.dataset.edit || "img";
    const current = foundry.utils.getProperty(this.document, attr);

    // Acessando o FilePicker via namespace correto da v13
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;

    const fp = new FilePickerImpl({
      type: "image",
      current: current,
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      // Opcional: Garante que o seletor abra perto da ficha
      top: this.position.top + 40,
      left: this.position.left + 10,
    });

    return fp.browse();
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

    const jHtml = $(html);
    renderActorSheetElements(this, jHtml, context);

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
