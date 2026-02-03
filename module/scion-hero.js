import ScionHeroActorSheetV2 from './actor-sheet.js';
import { ScionCombatWheel } from './combat-wheel.js';
import { ScionHeroActorBaseDefault } from './actor-base-default.js';
import { mountingBasedata } from '../helpers/mountBasedata.js';
import { splitInColumns } from '../helpers/splitInColumns.js';

import { createPuviewsJournal, createKnacksJournal } from '../helpers/journals.js';
import { registerJournalHooks } from './hooks.js';

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

// HOOK NOVO: Adiciona botão na barra lateral (Layer de Tokens ou Tiles)
Hooks.on('getSceneControlButtons', controls => {
  // 1. Remova a verificação de Array, ou ajuste-a
  if (!game.user.isGM) return;

  console.log("CHEGUEI AQUI NO WHEEL BUTTON", controls);

  // 2. Localize o controle de 'tiles' de forma segura
  // No v13 'controls' é um objeto. No v12- é um array.
  const tileControls = Array.isArray(controls)
    ? controls.find(c => c.name === 'tiles')
    : controls.tiles;

  if (tileControls) {
    const myTool = {
      name: 'scion-wheel',
      title: 'Battle Wheel Scion',
      icon: 'fas fa-sync-alt',
      button: true,
      visible: true,
      onClick: () => {
        new Dialog({
          title: 'Controlar Roda de Batalha',
          content: `<p style="text-align:center">Gerencie a roda de iniciativa.</p>`,
          buttons: {
            create: {
              label: 'Criar Roda (Spawn)',
              icon: '<i class="fas fa-plus"></i>',
              callback: () => ScionCombatWheel.createWheel(),
            },
            prev: {
              label: 'Voltar (-1)',
              icon: '<i class="fas fa-arrow-left"></i>',
              callback: () => ScionCombatWheel.advance(-1),
            },
            next: {
              label: 'Avançar (+1)',
              icon: '<i class="fas fa-arrow-right"></i>',
              callback: () => ScionCombatWheel.advance(1),
            },
          },
          default: 'next',
        }).render(true);
      },
    };

    // 3. Adiciona a ferramenta à lista
    // No v13 tileControls.tools também pode ser um objeto ou array dependendo da implementação
    if (Array.isArray(tileControls.tools)) {
      tileControls.tools.push(myTool);
    } else {
      tileControls.tools['scion-wheel'] = myTool;
    }
  }
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
});
