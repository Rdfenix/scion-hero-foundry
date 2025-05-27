import { ScionHeroActorSheet } from "./actor-sheet.js";
import { ScionHeroActorBaseDefault } from "./actor-base-default.js";

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
  // Para cada grupo de atributos (physical, social, mental)
  html.find(".attribute-grid-item").each(function () {
    const gridItem = $(this);
    const groupKey = gridItem.find("h3").text().trim().toLowerCase();

    // Para cada linha de atributo (ex: strength, dexterity)
    gridItem.find(".attribute-row").each(function () {
      const row = $(this);
      const label = row.find("span").text().trim().toLowerCase();
      const checkboxes = row.find(".circle-checkbox");
      const target = `attributes.${groupKey}.${label}.value`;
      const currentValue = foundry.utils.getProperty(app.actor.system, target);

      // Atualiza o checked de cada círculo
      checkboxes.each(function () {
        const input = this;
        const value = parseInt(input.value);
        // Só marca se o valor do atributo e do círculo forem maiores que zero e value <= currentValue
        input.checked = !(
          isNaN(currentValue) ||
          currentValue <= 0 ||
          value <= 0 ||
          value > currentValue
        );
      });
    });
  });
});
