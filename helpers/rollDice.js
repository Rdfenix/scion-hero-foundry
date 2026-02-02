import { epicAttributeSuccesses } from '../module/actor-base-default.js';

/**
 * Helper para garantir que o valor seja sempre um número inteiro >= 0.
 * Converte strings para números e trata nulos/undefined.
 */
const getSafeNumber = value => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const EPIC_MAP = new Map(
  Object.entries(epicAttributeSuccesses || {}).map(([key, value]) => [Number(key), value])
);

export const rollDice = async diceTotal => {
  try {
    const safeTotal = Math.max(0, getSafeNumber(diceTotal));
    if (safeTotal === 0) return { dicesResult: [], roll: null };

    const roll = await new Roll(`${safeTotal}d10`).evaluate();
    let results = [];

    if (roll.terms?.[0]?.results) {
      results = roll.terms[0].results.map(dice => dice.result);
    }

    return { dicesResult: results, roll };
  } catch (error) {
    console.error('Error in rollDice:', error);
    ui.notifications.error(`Erro ao rolar dados: ${error.message}`);
    return { dicesResult: [], roll: null };
  }
};

const calcSuccess = async (dices, difficulty = 7) => {
  let totalSucess = 0;

  if (!dices || dices.length === 0) {
    return {
      totalSucess: 0,
      criticalFailCount: 0,
      fail: true,
      criticalFail: false,
      explodedDices: [],
    };
  }

  const counts = new Map();
  dices.forEach(dice => counts.set(dice, (counts.get(dice) || 0) + 1));

  const tens = counts.get(10) || 0;
  const ones = counts.get(1) || 0;

  totalSucess += tens * 2;
  const explodedDices = Array.from({ length: tens }, () => 10);

  // Sucessos normais (7, 8, 9)
  for (let i = difficulty; i <= 9; i++) {
    totalSucess += counts.get(i) || 0;
  }

  const hasCriticalFail = ones > 0;
  const isFail = totalSucess === 0;

  return {
    totalSucess,
    criticalFailCount: ones,
    fail: isFail && !hasCriticalFail,
    criticalFail: isFail && hasCriticalFail,
    explodedDices,
  };
};

/**
 * Processador central para evitar repetição de código
 */
const processAndSendRoll = async (actor, dicePool, difficulty, templateData) => {
  const { dicesResult, roll } = await rollDice(dicePool);

  // Cria um roll dummy (0d10) se for nulo, para não quebrar a criação da mensagem
  const safeRoll = roll || (await new Roll('0d10').evaluate());

  const { totalSucess, criticalFailCount, fail, criticalFail, explodedDices } = await calcSuccess(
    dicesResult,
    difficulty
  );

  await sendRollToChat(actor, safeRoll, {
    totalSucess,
    criticalFailCount,
    fail,
    criticalFail,
    explodedDices,
    ...templateData,
  });
};

/* -------------------------------------------- */
/* Funções de Rolagem (Exportadas)             */
/* -------------------------------------------- */

export const callRollJoinBattle = async actor => {
  try {
    const wits = getSafeNumber(
      foundry.utils.getProperty(actor.system, 'attributes.mental.wits.value')
    );
    const awareness = getSafeNumber(
      foundry.utils.getProperty(actor.system, 'abilities.awareness.value')
    );
    const epicWits = getSafeNumber(
      foundry.utils.getProperty(actor.system, 'epicAttributes.mental.wits.value')
    );

    const totalDices = Math.max(0, wits + awareness);

    await processAndSendRoll(actor, totalDices, 7, {
      epicAttribute: epicWits,
      title: 'Join Battle',
      epicAttributeLabel: 'Wits',
    });
  } catch (error) {
    console.error(error);
  }
};

export const callRollLegendDice = async (actor, event, difficulty) => {
  try {
    const legend = getSafeNumber(foundry.utils.getProperty(actor.system, `legend.value`));
    await processAndSendRoll(actor, legend, difficulty, {
      epicAttribute: 0,
      title: 'Legend Roll',
      epicAttributeLabel: null,
    });
  } catch (error) {
    console.error(error);
  }
};

export const callRollWillpowerDice = async (actor, event, difficulty) => {
  try {
    const willpower = getSafeNumber(foundry.utils.getProperty(actor.system, `willpower.value`));
    await processAndSendRoll(actor, willpower, difficulty, {
      epicAttribute: 0,
      title: 'Willpower Roll',
      epicAttributeLabel: null,
    });
  } catch (error) {
    console.error(error);
  }
};

export const callRollAttrDice = async (actor, event, difficulty) => {
  try {
    const key = event.key;
    const attr = event.label;
    const penality = getSafeNumber(foundry.utils.getProperty(actor.system, 'health.value'));
    const value = getSafeNumber(
      foundry.utils.getProperty(actor.system, `attributes.${key}.${attr}.value`)
    );
    const epicValue = getSafeNumber(
      foundry.utils.getProperty(actor.system, `epicAttributes.${key}.${attr}.value`)
    );

    const totalDice = Math.max(value + penality, 0);

    await processAndSendRoll(actor, totalDice, difficulty, {
      epicAttribute: epicValue,
      title: attr,
      epicAttributeLabel: attr,
    });
  } catch (error) {
    console.error(error);
  }
};

export const callRollSkillDice = async (
  actor,
  { skillName, skillValue, attr, attrValue, epicAttrValue, difficulty }
) => {
  try {
    const sValue = getSafeNumber(skillValue);
    const aValue = getSafeNumber(attrValue);
    const eValue = getSafeNumber(epicAttrValue);
    const penality = getSafeNumber(foundry.utils.getProperty(actor.system, 'health.value'));

    const title = `${attr} + ${skillName}`;
    const totalDice = Math.max(aValue + sValue + penality, 0);

    await processAndSendRoll(actor, totalDice, difficulty, {
      epicAttribute: eValue,
      title: title,
      epicAttributeLabel: attr,
    });
  } catch (error) {
    console.error(error);
  }
};

export const callRollWeaponDice = async (
  actor,
  { multipleSelected, epicAttrValue, skillValue, attrValue, weapon, extraDices, difficulty }
) => {
  try {
    if (!weapon) return;

    const acc = getSafeNumber(weapon.acc);
    const sValue = getSafeNumber(skillValue);
    const aValue = getSafeNumber(attrValue);
    const eValue = getSafeNumber(epicAttrValue);
    const extra = getSafeNumber(extraDices);
    const penality = getSafeNumber(foundry.utils.getProperty(actor.system, 'health.value'));

    let totalDice = aValue + sValue + acc + penality + extra;
    let actions = 1;

    if (multipleSelected) {
      totalDice = totalDice - 2;
      actions = 2;
    }

    totalDice = Math.max(totalDice, 0);

    for (let i = 0; i < actions; i++) {
      const title = actions > 1 ? `#${i + 1} - ${weapon.name}` : `#1 - ${weapon.name}`;
      await processAndSendRoll(actor, totalDice, difficulty, {
        epicAttribute: eValue,
        title: title,
        epicAttributeLabel: weapon.attr || '',
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const callDamageAtkRoll = async (
  actor,
  { weapon, extraDices, attrValue, epicAttrValue }
) => {
  try {
    const damage = getSafeNumber(weapon.damage);
    const aValue = getSafeNumber(attrValue);
    const extra = getSafeNumber(extraDices);
    const eValue = getSafeNumber(epicAttrValue);

    const totalDamage = Math.max(damage + aValue + extra, 0);

    await processAndSendRoll(actor, totalDamage, 7, {
      epicAttribute: eValue,
      title: `Damage - ${weapon.name} <br /> Type: ${weapon.type}`,
      epicAttributeLabel: weapon.damageAttr || '',
    });
  } catch (error) {
    console.error(error);
  }
};

/* -------------------------------------------- */
/* Envio para Chat (FIXED FOR V12)             */
/* -------------------------------------------- */

const sendRollToChat = async (
  actor,
  roll,
  {
    totalSucess,
    criticalFailCount,
    fail,
    criticalFail,
    epicAttribute,
    explodedDices = [],
    title = '',
    epicAttributeLabel = '',
  }
) => {
  try {
    const safeTotalSucess = getSafeNumber(totalSucess);
    const safeEpicAttribute = getSafeNumber(epicAttribute);
    const totalEpicSuccess = EPIC_MAP.get(safeEpicAttribute) || 0;

    const data = {
      totalSucess: safeTotalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute: safeEpicAttribute,
      explodedDices,
      title,
      epicAttributeLabel,
      totalEpicSuccess,
    };

    const context = await foundry.applications.handlebars.renderTemplate(
      'systems/scion-hero-foundry/templates/diceRoll/dice-result.html',
      { data }
    );

    const chatData = {
      speaker: ChatMessage.getSpeaker({ actor }),
      content: context,
      roll: roll,
    };

    if (roll instanceof Roll) {
      await roll.toMessage(chatData);
    } else {
      await ChatMessage.create(chatData);
    }

    // Toca o som (Mova para cá se o toMessage não estiver tocando automaticamente na sua config)
    foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true);
  } catch (error) {
    console.error('Error sending roll to chat:', error);
    ui.notifications.error('Erro ao enviar resultado para o chat.');
  }
};
