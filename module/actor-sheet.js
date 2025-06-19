import { _onAction, _onChange } from "../helpers/actions.js";

// Importa a nova classe base do Foundry VTT
const { DocumentSheetV2 } = foundry.applications.api;

export class ScionHeroActorSheet extends DocumentSheetV2 {
  // O método prepareData() está correto como está.
  prepareData() {
    super.prepareData();
  }

  // O método defaultOptions() está correto como está.
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["scion-hero", "sheet", "character"],
      template:
        "systems/scion-hero-foundry/templates/actors/character-sheet.html",
      width: 890,
      height: 800,
      resizable: true,
      // A sua lógica de abas (tabs) é tratada em activateListeners, o que está correto.
    });
  }

  setPosition(options = {}) {
    options.width = 890;
    options.height = 800;
    return super.setPosition(options);
  }

  get template() {
    return (
      this.options.template ??
      "systems/scion-hero-foundry/templates/actors/character-sheet.html"
    );
  }

  async _prepareContext(options) {
    try {
      // Obter o contexto base da classe pai
      const context = await super._prepareContext(options);

      // Usar getFlag() para obter dados seguros do ator
      const actorData = this.document;

      // Definir imagem padrão se não houver
      actorData.img = actorData.img || CONST.DEFAULT_TOKEN;

      // Atualizar o contexto
      context.actor = actorData;
      context.system = actorData.system || {};
      context.currentUserName = game.user?.name || "";

      // Garantir que pantheon existe antes de acessar logo
      context.system.pantheon = context.system.pantheon || {};
      context.system.pantheon.logo = context.system.pantheon.logo || "";

      return context;
    } catch (error) {
      console.error("Erro ao preparar contexto:", error);
      return super._prepareContext(options);
    }
  }

  /**
   * @override
   * NOVO MÉTODO REQUERIDO (1/2)
   * Este método recebe o contexto de getData() e renderiza o template.
   */
  async _renderHTML(context) {
    return foundry.applications.handlebars.renderTemplate(
      this.template,
      context
    );
  }

  _replaceHTML(result) {
    this.element.querySelector(".window-content").innerHTML = result;
  }

  // O seu método activateListeners() está correto e não precisa de alterações.
  // Ele será chamado depois de _replaceHTML() ter inserido o conteúdo na página.
  activateListeners(html) {
    super.activateListeners(html);

    // Corrige: adiciona o parâmetro group: "primary" para bater com o data-group do HTML
    this._customTabs = new Tabs({
      navSelector: ".sheet-tabs",
      contentSelector: ".sheet-content",
      initial: "stats",
      group: "primary",
      callback: (event, tabs, tab) => {
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
  }
}
