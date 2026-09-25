import ScionHeroActorSheetV2 from "./actor-sheet.js";
import { mountingBasedata } from "./mountBasedata.js";
import { ScionHeroActorBaseDefault } from "./actor-base-default.js";
import { createKnacksJournal, createPuviewsJournal } from "./journals.js";
import { ScionCombatWheel } from "./ScionCombatWheel.js";
import { getRoot } from "../utils/utils";

import deitiesEn from "../lang/deities-en.json";
import deitiesBr from "../lang/deities-pt-BR.json";
import knackPurviewEn from "../lang/knack-puerviews-en.json";
import knackPurviewBr from "../lang/knack-puerviews-pt-BR.json";

function getTranslationMap() {
  return {
    "pt-BR": {
      deities: deitiesBr,
      knacksPuviews: knackPurviewBr,
    },
    en: {
      deities: deitiesEn,
      knacksPuviews: knackPurviewEn,
    },
  };
}

function gameSettingsRegister() {
  const id = game?.system?.id || "scion-hero-foundry";
  game.settings.register(id, "contentLanguage", {
    name: game.i18n.localize("LABELS.SPECIFIC_CONTENT_LANGUAGE"),
    hint: game.i18n.localize("LABELS.CHOOSE_CONTENT_LANGUAGE"),
    scope: "client",
    config: true,
    type: String,
    choices: {
      "pt-BR": "Português (Brasil)",
      en: "English",
    },
    default: "en",
    onChange: () => globalThis.location.reload(),
  });
}

async function loadTranslations() {
  const id = game?.system?.id || "scion-hero-foundry";
  const selectedLang = game.settings.get(id, "contentLanguage");
  const translationMap = getTranslationMap();
  const translations = translationMap[selectedLang];

  for (const [key, content] of Object.entries(translations)) {
    try {
      foundry.utils.mergeObject(game.i18n.translations, content, {
        inplace: true,
      });

      console.log(`Scion Hero | Carregado: ${key} (${selectedLang})`);
    } catch (err) {
      console.error(`Scion Hero | Falha ao carregar tradução [${key}]:`, err);
    }
  }
}

async function createOrUpdateWheelMacro() {
  const root = getRoot();
  const macroActions = [
    {
      name: "Scion: Create Combat Wheel",
      type: "script",
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.createWheel();
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada no escopo global.");
      }`,
      img: `${root}/dist/assets/square-plus-solid-full.svg`,
    },
    {
      name: "Scion: Advance Tick Wheel",
      type: "script",
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.advance();
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada.");
      }`,
      img: `${root}/dist/assets/angles-right-solid-full.svg`,
    },
    {
      name: "Scion: Rewind Tick Wheel",
      type: "script",
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.rewind();
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada.");
      }`,
      img: `${root}/dist/assets/angles-left-solid-full.svg`,
    },
    {
      name: "Scion: Remove Combat Wheel",
      type: "script",
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.clearWheel();
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada.");
      }`,
      img: `${root}/dist/assets/eraser-solid-full.svg`,
    },
  ];

  const results = new Set();

  for (const data of macroActions) {
    let macro = game.macros.find((m) => m.name === data.name);

    if (macro) {
      await macro.update(data);
    } else {
      macro = await Macro.create(data);
    }
    results.add(macro);
  }

  return Array.from(results);
}

async function assignMacroToHotbar(slot = 1) {
  const macros = (await createOrUpdateWheelMacro()).filter((m) => !!m);

  for (let i = 0; i < macros.length; i++) {
    if (macros[i] && macros[i] instanceof Macro) {
      await game.user.assignHotbarMacro(macros[i], slot + i);
      console.log(
        `Scion | Macro atribuída ao hotbar: ${macros[i].name} no slot ${slot + i}`,
      );
    } else {
      console.warn(
        `Scion | Macro inválida não atribuída ao hotbar:`,
        macros[i],
      );
    }
  }
}

Hooks.once("init", async function () {
  const id = game?.system?.id || "scion-hero-foundry";

  foundry.documents.collections.Actors.registerSheet(
    id,
    ScionHeroActorSheetV2,
    {
      types: ["character"],
      makeDefault: true,
      label: "SCION.SheetCharacterV2",
    },
  );

  globalThis.ScionCombatWheel = ScionCombatWheel;

  gameSettingsRegister();
});

Hooks.on("setup", async () => {
  await loadTranslations();
});

Hooks.on("preCreateActor", (actor, data, options, userId) => {
  // Roda apenas se quem está criando for o usuário atual e se for character
  if (actor.type === "character" && game.user.id === userId) {
    const baseData = mountingBasedata(ScionHeroActorBaseDefault, actor);
    // Injeta os dados padrões ANTES do ator ser salvo no banco de dados pela primeira vez
    actor.updateSource({ name: actor.name ?? "", system: baseData });
  }
});

Hooks.on("ready", async () => {
  registerJournalDragHandlers();
  await createKnacksJournal();
  await createPuviewsJournal();
  await assignMacroToHotbar(1);
});

function registerJournalDragHandlers() {
  document.addEventListener("dragstart", (event) => {
    const element = event.target.closest(
      'li[data-type][data-entry][draggable="true"]',
    );

    if (!element) return;

    const data = {
      type: element.dataset.type,
      entry: element.dataset.entry,
    };

    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  });
}
