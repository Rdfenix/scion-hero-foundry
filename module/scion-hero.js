import ScionHeroActorSheetV2 from './actor-sheet.js';
import { ScionHeroActorBaseDefault } from './actor-base-default.js';
import { mountingBasedata } from '../helpers/mountBasedata.js';
import { splitInColumns } from '../helpers/splitInColumns.js';

import { createPuviewsJournal, createKnacksJournal } from '../helpers/journals.js';
import { registerJournalHooks } from './hooks.js';
import { getRoot } from '../utils/utils.js';

async function createOrUpdateWheelMacro() {
  const root = getRoot();

  // IMPORTANTE: Para que as macros funcionem, a classe precisa estar no escopo global
  // Adicione isso no seu arquivo combat-wheel.js ou no init:
  // window.ScionCombatWheel = ScionCombatWheel;

  const macroActions = [
    {
      name: 'Scion: Create Combat Wheel',
      type: 'script',
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.createWheel();
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada no escopo global.");
      }`,
      img: `${root}/assets/svg/square-plus-solid-full.svg`,
    },
    {
      name: 'Scion: Advance Tick Wheel',
      type: 'script',
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.advance(1);
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada.");
      }`,
      img: `${root}/assets/svg/angles-right-solid-full.svg`,
    },
    {
      name: 'Scion: Rewind Tick Wheel',
      type: 'script',
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.advance(-1);
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada.");
      }`,
      img: `${root}/assets/svg/angles-left-solid-full.svg`,
    },
    {
      name: 'Scion: Remove Combat Wheel',
      type: 'script',
      command: `if (typeof ScionCombatWheel !== "undefined") {
        ScionCombatWheel.clearWheel();
      } else {
        ui.notifications.error("A classe ScionCombatWheel não foi encontrada.");
      }`,
      img: `${root}/assets/svg/eraser-solid-full.svg`,
    },
  ];

  const results = [];

  for (const data of macroActions) {
    let macro = game.macros.find(m => m.name === data.name);

    if (macro) {
      await macro.update(data);
    } else {
      macro = await Macro.create(data);
    }
    results.push(macro);
  }

  return results;
}

async function assignMacroToHotbar(slot = 1) {
  const macros = (await createOrUpdateWheelMacro()).filter(m => !!m);

  for (let i = 0; i < macros.length; i++) {
    if (macros[i] && macros[i] instanceof Macro) {
      await game.user.assignHotbarMacro(macros[i], slot + i);
      console.log(`Scion | Macro atribuída ao hotbar: ${macros[i].name} no slot ${slot + i}`);
    } else {
      console.warn(`Scion | Macro inválida não atribuída ao hotbar:`, macros[i]);
    }
  }
}

Hooks.once('init', async function () {
  // Registra a nova sheet como padrão para o tipo 'character'
  foundry.documents.collections.Actors.registerSheet('scion', ScionHeroActorSheetV2, {
    types: ['character'], // ou o nome do type no seu template.json
    makeDefault: true,
    label: 'SCION.SheetCharacterV2',
  });

  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 2);
  });

  // Helper para gerar um array de números de start até end (inclusive)
  Handlebars.registerHelper('range', function (start, end, options) {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  });

  Handlebars.registerHelper('sub', function (a, b) {
    return a - b;
  });

  Handlebars.registerHelper('splitInColumns', function (object, columns, columnClass, options) {
    const output = splitInColumns(object, columns, columnClass, options);
    return new Handlebars.SafeString(output);
  });

  Handlebars.registerHelper('isObject', function (value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  });

  Handlebars.registerHelper('hasOwnProperty', function (obj, key, options) {
    return Object.hasOwn(obj, key);
  });

  Handlebars.registerHelper('multiply', function (a, b) {
    return a * b;
  });

  Handlebars.registerHelper('sum', function (a, b) {
    return a + b;
  });

  Handlebars.registerHelper('divide', function (a, b) {
    return a / b;
  });

  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('higherThan', function (a, b) {
    return a > b;
  });

  Handlebars.registerHelper('lessThanOrEqual', function (a, b) {
    return a <= b;
  });

  Handlebars.registerHelper('ifEquals', function (a, b) {
    return a === b ? 'selected' : '';
  });

  registerJournalHooks();
});

Hooks.on('preCreateActor', (document, data, options, userId) => {
  if (document.type !== 'character') return;

  const baseData = mountingBasedata(ScionHeroActorBaseDefault, document);

  console.log('Scion | Injetando dados iniciais:', baseData);

  // Injeta os dados diretamente no momento da criação
  document.updateSource({ system: baseData });
});

Hooks.on('ready', async () => {
  for (const actor of game.actors.contents) {
    if (actor.type === 'character') {
      const baseData = mountingBasedata(ScionHeroActorBaseDefault, actor);

      await actor.update({
        system: baseData,
      });
    }
  }

  await createPuviewsJournal();
  await createKnacksJournal();

  if (!game.user.isGM) return;

  await assignMacroToHotbar(1);
});
