import { ScionHeroActorSheet } from "./actor-sheet.js";
import { ScionHeroActorBaseDefault } from "./actor-base-default.js";
import { attributesUpdate } from "../helpers/attributesUpdate.js";
import { abilitiesUpdate } from "../helpers/abilitiesUpdate.js";
import { mountingBasedata } from "../helpers/mountBasedata.js";
import { splitInColumns } from "../helpers/splitInColumns.js";
import {
  createPuviewsJournal,
  checkPurviewFlag,
  checkKnacksFlag,
  createKnacksJournal,
} from "../helpers/journals.js";

Hooks.once("init", async function () {
  // Remove a sheet padrão do core
  Actors.unregisterSheet("core", "core");
  // Registra a nova sheet como padrão para o tipo 'character'
  Actors.registerSheet("scion-hero-foundry", ScionHeroActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Scion Hero Actor Sheet",
  });

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
    }
  );

  Handlebars.registerHelper("isObject", function (value) {
    return value && typeof value === "object" && !Array.isArray(value);
  });

  const partials = [
    "systems/scion-hero-foundry/templates/actors/partials/stats.html",
    "systems/scion-hero-foundry/templates/actors/partials/birth-virtues.html",
    "systems/scion-hero-foundry/templates/actors/partials/knacks-boons.html",
    "systems/scion-hero-foundry/templates/actors/partials/combat.html",
  ];

  await loadTemplates(partials);

  // Registra o partial explicitamente para garantir que o Handlebars reconheça
  for (const partial of partials) {
    const partialContent = await fetch(partial).then((response) =>
      response.text()
    );
    Handlebars.registerPartial(partial, partialContent);
  }
});

Hooks.on("createActor", async (actor, options, userId) => {
  if (actor.type !== "character") return;

  const baseData = mountingBasedata(ScionHeroActorBaseDefault, actor);

  await actor.update({
    system: baseData,
  });
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
});

Hooks.on("renderJournalPageSheet", (sheet, html, data) => {
  const page = sheet.object;
  const newTitle = `${page.name}`;

  // Altera o título da janela modal do Foundry
  html.closest(".app.window-app").find(".window-title").text(newTitle);

  checkPurviewFlag(sheet, html);
  checkKnacksFlag(sheet, html);
});
