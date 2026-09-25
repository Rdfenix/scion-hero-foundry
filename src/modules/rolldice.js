import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { epicAttributeSuccesses } from "./actor-base-default";
import { customLocalizeWord } from "../utils/i18n";

import DiceResult from "./components/DiceResult";

/**
 * Helper para garantir que o valor seja sempre um número inteiro >= 0.
 * Converte strings para números e trata nulos/undefined.
 */
const getSafeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const EPIC_MAP = new Map(
  Object.entries(epicAttributeSuccesses || {}).map(([key, value]) => [
    Number(key),
    value,
  ]),
);

export const rollDice = async (diceTotal) => {
  try {
    const safeTotal = Math.max(0, getSafeNumber(diceTotal));
    if (safeTotal === 0) return { dicesResult: [], roll: null };

    const roll = await new Roll(`${safeTotal}d10`).evaluate();
    let results = [];

    if (roll.terms?.[0]?.results) {
      results = roll.terms[0].results.map((dice) => dice.result);
    }

    return { dicesResult: results, roll };
  } catch (error) {
    console.error("Error in rollDice:", error);
    ui.notifications.error(`Erro ao rolar dados: ${error.message}`);
    return { dicesResult: [], roll: null };
  }
};

const calcSuccess = async (dices, difficulty = 7, isDamage = false) => {
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
  dices.forEach((dice) => counts.set(dice, (counts.get(dice) || 0) + 1));

  const tens = counts.get(10) || 0;
  const ones = counts.get(1) || 0;

  totalSucess += isDamage ? tens : tens * 2;

  const explodedDices = isDamage ? [] : Array.from({ length: tens }, () => 10);

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
const processAndSendRoll = async (
  actor,
  dicePool,
  difficulty,
  templateData,
  isDamage = false,
) => {
  const { dicesResult, roll } = await rollDice(dicePool);

  // Cria um roll dummy (0d10) se for nulo, para não quebrar a criação da mensagem
  const safeRoll = roll || (await new Roll("0d10").evaluate());

  const { totalSucess, criticalFailCount, fail, criticalFail, explodedDices } =
    await calcSuccess(dicesResult, difficulty, isDamage);

  const epicDots = getSafeNumber(templateData.epicAttribute);
  const epicAutoSuccesses = EPIC_MAP.get(epicDots) || 0;

  // Total final = Sucessos dos dados + Sucessos Automáticos do Épico
  const finalTotal = Math.max(0, totalSucess + epicAutoSuccesses);

  await sendRollToChat(actor, safeRoll, {
    totalSucess,
    criticalFailCount,
    fail,
    criticalFail,
    explodedDices,
    ...templateData,
  });

  return {
    totalSucess: finalTotal,
  };
};

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
    title = "",
    epicAttributeLabel = "",
  },
) => {
  try {
    const safeTotalSucess = getSafeNumber(totalSucess);
    const safeEpicAttribute = getSafeNumber(epicAttribute);
    const totalEpicSuccess = EPIC_MAP.get(safeEpicAttribute) || 0;

    const data = {
      totalSuccess: safeTotalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute: safeEpicAttribute,
      explodedDices,
      title,
      epicAttributeLabel,
      totalEpicSuccess,
    };

    const context = renderToStaticMarkup(createElement(DiceResult, { data }));

    const chatData = {
      speaker: window.ChatMessage.getSpeaker({ actor }),
      content: context,
      roll: roll,
    };

    if (roll instanceof Roll) {
      await roll.toMessage(chatData);
    } else {
      await window.ChatMessage.create(chatData);
    }

    if (game.audio?.context?.state === "suspended") {
      await game.audio.context.resume();
    }

    // Toca o som (Mova para cá se o toMessage não estiver tocando automaticamente na sua config)
    await window.foundry.audio.AudioHelper.play({
      src: window.CONFIG.sounds.dice,
      volume: 1,
      loop: false,
      autoplay: true,
    });
  } catch (error) {
    console.error("Error sending roll to chat:", error);
    ui.notifications.error("Erro ao enviar resultado para o chat.");
  }
};

//Rollers from attributes and other things
export const callRollLegendDice = async (actor, data) => {
  const legend = getSafeNumber(actor?.system?.legend?.value);

  return processAndSendRoll(actor, legend, data.difficulty, {
    epicAttribute: 0,
    title: game.i18n.localize("LABELS.LEGEND_ROLL"),
    epicAttributeLabel: null,
  });
};

export const callRollWillpowerDice = async (actor, data) => {
  const willpower = getSafeNumber(actor?.system?.willpower?.value);

  return processAndSendRoll(actor, willpower, data.difficulty, {
    epicAttribute: 0,
    title: game.i18n.localize("LABELS.WILLPOWER_ROLL"),
    epicAttributeLabel: null,
  });
};

export const callRollAttrDice = async (actor, data) => {
  const { type, key, difficulty, extraDices = 0 } = data;

  const attrValue = getSafeNumber(
    actor?.system?.attributes?.[type]?.[key]?.value,
  );

  const epicAttrValue = getSafeNumber(
    actor?.system?.epicAttributes?.[type]?.[key]?.value,
  );

  const healthPenalty = getSafeNumber(actor?.system?.health?.value);

  const totalDice = Math.max(
    attrValue + healthPenalty + getSafeNumber(extraDices),
    0,
  );

  return processAndSendRoll(actor, totalDice, difficulty, {
    epicAttribute: epicAttrValue,
    title: key,
    epicAttributeLabel: key,
  });
};

const findAttribute = (attributes, key) => {
  for (const group of Object.values(attributes ?? {})) {
    if (group?.[key]) {
      return group[key];
    }
  }

  return null;
};

export const callRollSkillDice = async (actor, data) => {
  const { skillName, attr, difficulty, extraDices = 0 } = data;

  const skill = actor?.system?.abilities?.[skillName];
  const attribute = findAttribute(actor?.system?.attributes, attr);
  const epicAttribute = findAttribute(actor?.system?.epicAttributes, attr);

  const skillValue = getSafeNumber(skill?.value);
  const attrValue = getSafeNumber(attribute?.value);
  const epicAttrValue = getSafeNumber(epicAttribute?.value);
  const healthPenalty = getSafeNumber(actor?.system?.health?.value);

  const totalDice = Math.max(
    getSafeNumber(skillValue) +
      getSafeNumber(attrValue) +
      healthPenalty +
      getSafeNumber(extraDices),
    0,
  );

  const localizedAttr = customLocalizeWord(attr, "ATTRIBUTES");

  const localizedSkill = customLocalizeWord(skillName, "ABILITIES");

  return processAndSendRoll(actor, totalDice, difficulty, {
    epicAttribute: getSafeNumber(epicAttrValue),
    title: `${localizedAttr} + ${localizedSkill}`,
    epicAttributeLabel: attr,
  });
};

export const callRollWeaponDice = async (actor, data) => {
  const { weapon, extraDices = 0, difficulty, isMultiple } = data;

  if (!weapon) return null;

  const attribute = findAttribute(actor?.system?.attributes, weapon.attr);

  const epicAttribute = findAttribute(
    actor?.system?.epicAttributes,
    weapon.attr,
  );

  console.log(epicAttribute);

  const skill = actor?.system?.abilities?.[weapon.skill];

  const attrValue = getSafeNumber(attribute?.value);
  const epicAttrValue = getSafeNumber(epicAttribute?.value);
  const skillValue = getSafeNumber(skill?.value);
  const healthPenalty = getSafeNumber(actor?.system?.health?.value);

  let totalDice = Math.max(
    attrValue +
      skillValue +
      getSafeNumber(weapon.acc) +
      healthPenalty +
      getSafeNumber(extraDices),
    0,
  );
  const actions = isMultiple ? 2 : 1;

  if (isMultiple) {
    totalDice -= 2;
  }

  totalDice = Math.max(totalDice, 0);

  for (let index = 0; index < actions; index += 1) {
    await processAndSendRoll(actor, totalDice, difficulty, {
      epicAttribute: epicAttrValue,
      title:
        actions > 1 ? `#${index + 1} - ${weapon.name}` : `#1 - ${weapon.name}`,
      epicAttributeLabel: weapon.attr || "",
    });
  }

  return true;
};

export const callDamageAtkRoll = async (actor, data) => {
  const { weapon, extraDices = 0, attrValue, epicAttrValue, difficulty } = data;

  if (!weapon) return null;

  const totalDamageDice = Math.max(
    getSafeNumber(weapon.damage) +
      getSafeNumber(attrValue) +
      getSafeNumber(extraDices),
    0,
  );

  return processAndSendRoll(
    actor,
    totalDamageDice,
    difficulty,
    {
      epicAttribute: getSafeNumber(epicAttrValue),
      title: `${game.i18n.localize("LABELS.DAMAGE")} - ${weapon.name} <br /> ${game.i18n.localize(
        "LABELS.TYPE",
      )}: ${weapon.type}`,
      epicAttributeLabel: weapon.damageAttr || "",
    },
    true,
  );
};

export const callRollJoinBattle = async (actor, data = {}) => {
  try {
    const wits = getSafeNumber(actor?.system?.attributes?.mental?.wits?.value);

    const awareness = getSafeNumber(actor?.system?.abilities?.awareness?.value);

    const epicWits = getSafeNumber(
      actor?.system?.epicAttributes?.mental?.wits?.value,
    );

    const difficulty = getSafeNumber(data.difficulty || 7);
    const totalDices = Math.max(0, wits + awareness);

    const initiativeValue = await processAndSendRoll(
      actor,
      totalDices,
      difficulty,
      {
        epicAttribute: epicWits,
        title: game.i18n.localize("LABELS.JOIN_BATTLE"),
        epicAttributeLabel: "WITS",
      },
    );

    let combat = game.combat;

    if (!combat) {
      if (!game.user.isGM) {
        ui.notifications.warn(
          "Não há combate ativo e apenas o Mestre pode iniciar um.",
        );

        return null;
      }

      if (!canvas.scene) {
        ui.notifications.error(
          "Não existe uma cena ativa para iniciar o combate.",
        );

        return null;
      }

      combat = await Combat.create({
        scene: canvas.scene.id,
        active: true,
      });
    }

    let combatant = combat.combatants.find(
      (currentCombatant) => currentCombatant.actorId === actor.id,
    );

    if (!combatant) {
      const token = actor.getActiveTokens()[0];

      if (!token) {
        ui.notifications.error(
          "O personagem precisa de um token na cena para entrar em combate.",
        );

        return null;
      }

      const createdCombatants = await combat.createEmbeddedDocuments(
        "Combatant",
        [
          {
            tokenId: token.id,
            actorId: actor.id,
            hidden: token.document.hidden,
          },
        ],
      );

      combatant = createdCombatants[0];
    }

    await combatant.update({
      initiative: initiativeValue.totalSucess,
    });

    return initiativeValue;
  } catch (error) {
    console.error("Erro ao entrar em combate:", error);
    ui.notifications.error(error.message);
    return null;
  }
};
