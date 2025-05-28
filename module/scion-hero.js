import { ScionHeroActorSheet } from "./actor-sheet.js";
import { ScionHeroActorBaseDefault } from "./actor-base-default.js";
import { attributesUpdate } from "../helpers/attributesUpdate.js";

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
});

Hooks.on("createActor", async (actor, options, userId) => {
  if (actor.type !== "character") return;

  const baseData = foundry.utils.mergeObject(
    ScionHeroActorBaseDefault,
    actor.system || {}
  );
  await actor.update({
    system: baseData,
  });
});

Hooks.on("ready", async () => {
  for (const actor of game.actors.contents) {
    if (actor.type === "character") {
      const baseData = foundry.utils.mergeObject(
        ScionHeroActorBaseDefault,
        actor.system || {}
      );
      await actor.update({
        system: baseData,
      });
    }
  }
});

Hooks.on("renderActorSheet", (app, html, data) => {
  attributesUpdate(app, html, data);
});
