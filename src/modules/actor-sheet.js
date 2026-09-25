import { createRoot } from "react-dom/client";
import React from "react";
import { ActorProvider } from "./ActorContext";
import CharacterSheet from "./CharacterSheet";
import { mountingBasedata } from "./mountBasedata.js";
import { ScionHeroActorBaseDefault } from "./actor-base-default.js";
import { _onDrop } from "./onDrop";

export default class ScionHeroActorSheetV2
  extends foundry.applications.sheets.ActorSheetV2
{
  constructor(options) {
    super(options);
    this.reactRoot = null;
  }

  /** @override */
  get title() {
    return this.document.name;
  }

  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["scion-hero", "sheet", "character"],
      tag: "form",
      window: {
        title: "{name}",
        resizable: false,
        contentClasses: ["standard-form", "scion-v2-sheet"],
        scrollable: [".scion-v2-sheet"],
      },
      position: { width: 897, height: 800 },
      dragDrop: [{ dragSelector: null, dropSelector: "[data-drop-target]" }],
      actions: {
        editImage: ScionHeroActorSheetV2.#onEditImage,
      },
    },
    { inplace: false },
  );

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const baseData = mountingBasedata(ScionHeroActorBaseDefault, this.document);
    context.system = foundry.utils.mergeObject(baseData, this.document.system, {
      inplace: false,
    });

    context.actor = this.document;
    context.system = this.document.system;
    context.config = CONFIG.SCION;
    context.currentUserName = game.user.name;
    context.isGM = game.user.isGM;
    context.tabs = { ...this.tabGroups };

    // 2. Garante que sempre haja uma aba 'primary' selecionada
    if (!context.tabs.primary) {
      context.tabs.primary = "stats";
      // Atualiza o estado interno também para sincronizar
      this.tabGroups.primary = "stats";
    }

    const attrKeys = new Set();
    const skillsKeys = new Set();
    const attributes = context.system.attributes || {};
    const skills = context.system.abilities || {};

    for (const group of Object.values(attributes)) {
      Object.keys(group).forEach((key) => attrKeys.add(key));
    }

    for (const skillKey of Object.keys(skills)) {
      skillsKeys.add(skillKey);
    }

    const damageType = ["Bashing", "Lethal", "Aggravated"];

    context.system.attrKeys = Array.from(attrKeys);
    context.system.skillsKeys = Array.from(skillsKeys);
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

  /** @override */
  async _renderHTML(context, options) {
    // Apenas a Div raiz onde o React vai nascer
    return `<div id="react-root-${this.id}" style="height: 100%;"></div>`;
  }

  /**
   * @override
   * ESSA É A FUNÇÃO QUE FALTAVA!
   * Ela pega o "result" (a div que retornamos acima) e injeta no "content" (o corpo da janela)
   */
  _replaceHTML(result, content, options) {
    if (!content.querySelector(`#react-root-${this.id}`)) {
      content.innerHTML = result;
    }
  }

  /** @override */
  async _onRender(context, options = {}) {
    super._onRender(context, options);

    const container = this.element.querySelector(`#react-root-${this.id}`);

    if (!container) return;

    if (!this.reactRoot) {
      this.reactRoot = createRoot(container);
    }

    console.log("Rendering React component for actor sheet: context", context);
    console.log("Rendering React component for actor sheet:", this.document);

    this.reactRoot.render(
      React.createElement(
        ActorProvider,
        { actor: this.document, context },
        React.createElement(CharacterSheet),
      ),
    );
  }

  static async #onEditImage(event, target) {
    const attr = target.dataset.edit || "img";
    const current = foundry.utils.getProperty(this.document, attr);

    // Acessando o FilePicker via namespace correto da v13
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;

    const fp = new FilePickerImpl({
      type: "image",
      current: current,
      callback: async (path) => {
        await this.document.update({ [attr]: path });
        await this.render({ force: true });
      },
      // Opcional: Garante que o seletor abra perto da ficha
      top: this.position.top + 40,
      left: this.position.left + 10,
    });

    return fp.browse();
  }

  // O framework agora chama esta função automaticamente
  /** @override */
  _onDrop(event) {
    // Não precisa de preventDefault, o framework já faz
    return _onDrop(event, this.document);
  }

  /** @override */
  async _onClose(options) {
    this.reactRoot?.unmount();
    this.reactRoot = null;

    return super._onClose(options);
  }
}
