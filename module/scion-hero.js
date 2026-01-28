import ScionHeroActorSheetV2 from "./actor-sheet.js";
import { ScionHeroActorBaseDefault } from "./actor-base-default.js";
import { attributesUpdate } from "../helpers/attributesUpdate.js";
import { abilitiesUpdate } from "../helpers/abilitiesUpdate.js";
import { virtuesUpdate } from "../helpers/virtuesUpdate.js";
import { birthrightUpdate } from "../helpers/birthrightsUpdate.js";
import { mountingBasedata } from "../helpers/mountBasedata.js";
import { splitInColumns } from "../helpers/splitInColumns.js";
import { willpowerUpdate } from "../helpers/willpowerUpdate.js";
import { legendUpdate } from "../helpers/legendUpdate.js";
import { updateSoak } from "../helpers/updateSoak.js";
import {
  createPuviewsJournal,
  createKnacksJournal,
} from "../helpers/journals.js";
import { registerJournalHooks } from "./hooks.js";

Hooks.once("init", async function () {
  // Remove a sheet padrão do core
  foundry.documents.collections.Actors.unregisterSheet("core", "core");

  // Registra a nova sheet como padrão para o tipo 'character'
  foundry.documents.collections.Actors.registerSheet(
    "scion",
    ScionHeroActorSheetV2,
    {
      types: ["character"], // ou o nome do type no seu template.json
      makeDefault: true,
      label: "SCION.SheetCharacterV2",
    },
  );

  Handlebars.registerHelper("json", function (context) {
    return JSON.stringify(context, null, 2);
  });

  // Helper para gerar um array de números de start até end (inclusive)
  Handlebars.registerHelper("range", function (start, end, options) {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  });

  Handlebars.registerHelper("sub", function (a, b) {
    return a - b;
  });

  Handlebars.registerHelper(
    "splitInColumns",
    function (object, columns, columnClass, options) {
      const output = splitInColumns(object, columns, columnClass, options);
      return new Handlebars.SafeString(output);
    },
  );

  Handlebars.registerHelper("isObject", function (value) {
    return value && typeof value === "object" && !Array.isArray(value);
  });

  Handlebars.registerHelper("hasOwnProperty", function (obj, key, options) {
    return Object.hasOwn(obj, key);
  });

  Handlebars.registerHelper("multiply", function (a, b) {
    return a * b;
  });

  Handlebars.registerHelper("sum", function (a, b) {
    return a + b;
  });

  Handlebars.registerHelper("divide", function (a, b) {
    return a / b;
  });

  Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper("higherThan", function (a, b) {
    return a > b;
  });

  Handlebars.registerHelper("ifEquals", function (a, b) {
    return a === b ? "selected" : "";
  });

  const partials = [
    "systems/scion-foundry-v2/templates/actors/partials/stats.html",
    "systems/scion-foundry-v2/templates/actors/partials/birth-virtues.html",
    "systems/scion-foundry-v2/templates/actors/partials/knacks-boons.html",
    "systems/scion-foundry-v2/templates/actors/partials/combat.html",
  ];

  await foundry.applications.handlebars.loadTemplates(partials);

  // Registra o partial explicitamente para garantir que o Handlebars reconheça
  for (const partial of partials) {
    const partialContent = await fetch(partial).then((response) =>
      response.text(),
    );
    Handlebars.registerPartial(partial, partialContent);
  }

  registerJournalHooks();

  Hooks.on("renderToken", (token, html, data) => {
    // Aplique somente se o token tiver um sprite válido
    if (!token.mesh) return;

    const sprite = token.mesh; // ou token.icon em algumas versões

    const radius = Math.min(sprite.width, sprite.height) / 2;

    // Cria uma máscara circular usando PIXI
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawCircle(sprite.width / 2, sprite.height / 2, radius);
    mask.endFill();

    // Aplica a máscara ao sprite do token
    sprite.mask = mask;
    sprite.addChild(mask);
  });
});

Hooks.on("preCreateActor", (document, data, options, userId) => {
  if (document.type !== "character") return;

  const baseData = mountingBasedata(ScionHeroActorBaseDefault, document);

  console.log("Scion | Injetando dados iniciais:", baseData);

  // Injeta os dados diretamente no momento da criação
  document.updateSource({ system: baseData });
});

Hooks.on("ready", async () => {
  for (const actor of game.actors.contents) {
    if (actor.type === "character") {
      const baseData = mountingBasedata(ScionHeroActorBaseDefault, actor);

      await actor.update({
        system: baseData,
      });
    }
  }

  await createPuviewsJournal();
  await createKnacksJournal();
});

Hooks.on("renderActorSheet", (app, html, data) => {
  attributesUpdate(app, html, data);
  abilitiesUpdate(app, html, data);
  virtuesUpdate(app, html, data);
  birthrightUpdate(app, html, data);
  willpowerUpdate(app, html, data);
  legendUpdate(app, html, data);
  updateSoak(app);
});
