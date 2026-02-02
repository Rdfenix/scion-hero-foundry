import { getKnacks } from '../api/knackApi.js';
import { getPurviews } from '../api/purviewsApi.js';
import { knackSchema, boonSchema } from '../module/actor-base-default.js';
import { stripHTMLAndFormatTable } from '../utils/utils.js';

/* -------------------------------------------- */
/* Funções de Preparação (Sem actor.update)    */
/* -------------------------------------------- */

const prepareKnackList = async (actor, knackName) => {
  try {
    const knacksList = await getKnacks();
    // Assume-se que knacksList[0] contém as categorias com powers
    const allPowers = knacksList[0].knacks.flatMap(k => k.powers);
    const foundPower = allPowers.find(p => p.name === knackName);

    if (!foundPower) return null;

    const newList = foundry.utils.deepClone(actor.system.knacks || []);
    if (!newList.some(k => k.name === foundPower.name)) {
      newList.push({
        ...knackSchema,
        _id: foundry.utils.randomID(),
        name: foundPower.name,
        description: foundPower.description,
      });
    }
    return newList;
  } catch (error) {
    console.error('Erro ao preparar Knack:', error);
    return null;
  }
};

const prepareBoonList = async (actor, boonName) => {
  try {
    const boonsList = await getPurviews();
    const allPowers = boonsList.flatMap(b => b.purviews).flatMap(p => p.boons);
    const foundBoon = allPowers.find(p => p.name === boonName);

    if (!foundBoon) return null;

    const newList = foundry.utils.deepClone(actor.system.boons || []);
    if (!newList.some(b => b.name === foundBoon.name)) {
      newList.push({
        ...boonSchema,
        _id: foundry.utils.randomID(),
        name: foundBoon.name,
        description: stripHTMLAndFormatTable(foundBoon.description),
        level: foundBoon.level,
        dice_pool: foundBoon.dice_pool,
        cost: foundBoon.cost,
      });
    }
    return newList;
  } catch (error) {
    console.error('Erro ao preparar Boon:', error);
    return null;
  }
};

const prepareBirthrightList = async (actor, boonName, index) => {
  try {
    const boonsList = await getPurviews();
    const allPowers = boonsList.flatMap(b => b.purviews).flatMap(p => p.boons);
    const foundBoon = allPowers.find(p => p.name === boonName);

    if (!foundBoon) return null;

    const birthrights = foundry.utils.deepClone(actor.system.birthrights || []);
    if (birthrights[index]) {
      if (!birthrights[index].boons.some(b => b.name === foundBoon.name)) {
        birthrights[index].boons.push({
          ...boonSchema,
          _id: foundry.utils.randomID(),
          name: foundBoon.name,
          description: stripHTMLAndFormatTable(foundBoon.description),
        });
      }
    }
    return birthrights;
  } catch (error) {
    console.error('Erro ao preparar Birthright:', error);
    return null;
  }
};

/* -------------------------------------------- */
/* Handler de Drop Principal                   */
/* -------------------------------------------- */

export async function _onDrop(event, actor) {
  // 1. Captura de dados nativa (v13/ApplicationV2)
  let data;
  try {
    data = JSON.parse(event.dataTransfer.getData('text/plain'));
  } catch (err) {
    console.error('Erro ao ler dados do drop:', err);
    return;
  }

  // 2. Localização do Alvo (closest garante que pegamos o data-drop-target correto)
  const dropZone = event.target.closest('[data-drop-target]');
  const dropTarget = dropZone?.dataset.dropTarget;
  const index = dropZone?.dataset.index;

  const updates = {};

  // 3. Lógica de Processamento de Knacks
  if (data.type === 'knack-power') {
    const updatedKnacks = await prepareKnackList(actor, data.entry);
    if (updatedKnacks) updates['system.knacks'] = updatedKnacks;
  }

  // 4. Lógica de Processamento de Boons
  else if (data.type === 'boon-power') {
    // Adiciona sempre na lista global de Boons
    const updatedBoons = await prepareBoonList(actor, data.entry);
    if (updatedBoons) updates['system.boons'] = updatedBoons;

    // Se o drop foi em uma Birthright específica (Boons de Relíquia, etc)
    if (dropTarget === 'birth-boons-list' && index !== undefined) {
      const updatedBirthrights = await prepareBirthrightList(actor, data.entry, index);
      if (updatedBirthrights) updates['system.birthrights'] = updatedBirthrights;
    }
  }

  // 5. Atualização Atômica (Um único re-render para a ficha inteira)
  if (Object.keys(updates).length > 0) {
    await actor.update(updates);
  }
}
