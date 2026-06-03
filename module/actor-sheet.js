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
import { createDebouncedRender } from "../helpers/debounce.js";

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
  constructor(options = {}) {
    super(options);
    this.tabGroups = { primary: "stats" };
    this.debouncedRender = createDebouncedRender(this, 150);
    this._debouncedTabRender = createDebouncedRender(this, 150);
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
      form: {
        handler: ScionHeroActorSheetV2.#onSubmit,
        submitOnChange: true,
        closeOnSubmit: false,
      },
      position: { width: 897, height: 800 },
      dragDrop: [{ dragSelector: null, dropSelector: "[data-drop-target]" }],
      // REGRA DE OURO: Todas as interações de clique devem ser mapeadas aqui
      actions: {
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
    sheet: {
      template:
        "systems/scion-hero-foundry/templates/actors/character-sheet.html",
      root: true,
    },
    header: {
      template:
        "systems/scion-hero-foundry/templates/actors/partials/header.html",
    },
    tabs: {
      template:
        "systems/scion-hero-foundry/templates/actors/partials/tabs-nav.html",
    },
    stats: {
      template:
        "systems/scion-hero-foundry/templates/actors/partials/stats.html",
    },
    birth: {
      template:
        "systems/scion-hero-foundry/templates/actors/partials/birth-virtues.html",
    },
    knacks: {
      template:
        "systems/scion-hero-foundry/templates/actors/partials/knacks-boons.html",
    },
    combat: {
      template:
        "systems/scion-hero-foundry/templates/actors/partials/combat.html",
    },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
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
  async render(force = false, options = {}) {
    // Preserve scroll position of the main sheet container across renders
    try {
      const prevEl = this.element?.querySelector?.('.scion-wrapper') || this.element?.querySelector?.('.scion-v2-sheet') || this.element;
      const prevScroll = prevEl ? prevEl.scrollTop : 0;
      const result = await super.render(force, options);
      // Restore scroll on next tick to ensure DOM is updated
      setTimeout(() => {
        try {
          if (prevEl) prevEl.scrollTop = prevScroll;
        } catch (e) {
          console.warn('Failed to restore scroll position', e);
        }
      }, 0);
      return result;
    } catch (err) {
      console.error('Error preserving scroll on render:', err);
      return await super.render(force, options);
    }
  }

  static #onSetTab(event, target) {
    const tab = target.dataset.tab;
    this.changeTab(tab, "primary"); // Assume que você definiu um grupo de tabs "primary"
  }

  /* -------------------------------------------- */
  /* Ações (Native API V2)                        */
  /* -------------------------------------------- */

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

  static async #onSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  // O framework agora chama esta função automaticamente
  /** @override */
  _onDrop(event) {
    // Não precisa de preventDefault, o framework já faz
    return _onDrop(event, this.document);
  }

  /** @override */
  changeTab(tab, group, options = {}) {
    // 1. Chama o original para salvar o estado (this.tabGroups)
    super.changeTab(tab, group, options);
    this._debouncedTabRender(["stats", "birth", "knacks", "combat"]);
  }

  /** @override */
  _onUpdate(changed, options, userId) {
    // Deixa o Foundry processar os dados primeiro
    super._onUpdate(changed, options, userId);

    const isLocalUpdate = userId === game.user.id;
    const updates = new Set();

    // Atalho para verificar propriedades aninhadas com segurança
    const has = (key) => foundry.utils.hasProperty(changed, key);

    // --- 1. HEADER ---
    // Nome, Imagem, Jogador, Calling, Natureza, Pantheon
    if (
      changed.name ||
      changed.img ||
      has("system.player") ||
      has("system.calling") ||
      has("system.nature") ||
      has("system.pantheon")
    ) {
      updates.add("header");
    }

    // --- 2. STATS TAB ---
    // Atributos, Habilidades, Lenda, Força de Vontade, XP
    if (
      has("system.attributes") ||
      has("system.epicAttributes") ||
      has("system.abilities") ||
      has("system.legend") ||
      has("system.legendPoints") ||
      has("system.willpower") ||
      has("system.willpowerPoints") ||
      has("system.experience")
    ) {
      updates.add("stats");
    }

    // --- 3. BIRTHRIGHTS & VIRTUES TAB ---
    // Birthrights (array) e Virtudes
    if (has("system.birthrights") || has("system.virtues")) {
      updates.add("birth");
    }

    // --- 4. KNACKS & BOONS TAB ---
    // Knacks e Boons (arrays)
    if (has("system.knacks") || has("system.boons")) {
      updates.add("knacks");
    }

    // --- 5. COMBAT TAB ---
    // Armas, Saúde, Defesas (combat object)
    if (has("system.weapons") || has("system.health") || has("system.combat")) {
      updates.add("combat");
    }

    // Renderiza apenas as partes necessárias
    if (!isLocalUpdate && updates.size > 0) {
      this.debouncedRender(Array.from(updates));
    }
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

    html.querySelectorAll("input, select, textarea").forEach((el) => {
      if (el.dataset.action) {
        // Remove listener anterior se existir
        if (el._scionChangeListener) {
          el.removeEventListener("change", el._scionChangeListener);
        }

        el._scionChangeListener = (ev) => _onChange(ev, this.document);
        el.addEventListener("change", el._scionChangeListener);
      }
    });
  }
}
