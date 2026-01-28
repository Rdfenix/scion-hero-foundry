import { epicAttributeSuccesses } from "../module/actor-base-default.js";

export const rollDice = async (diceTotal) => {
  try {
    const roll = await new Roll(`${diceTotal}d10`).evaluate();

    return {
      dicesResult: roll.terms[0].results.map((dice) => dice.result),
      roll,
    };
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

const calcSuccess = async (dices, difficulty = 7) => {
  let totalSucess = 0;
  let hasCriticalFail = false;
  let explodedDices = [];
  let criticalFailCount = [];

  for (const dice of dices) {
    if (dice === 10) {
      explodedDices.push(dice);
      totalSucess += 2;
    } else if (dice >= difficulty && dice <= 9) {
      totalSucess += 1;
    } else if (dice === 1) {
      hasCriticalFail = true;
      criticalFailCount.push(dice);
    }
  }

  return {
    totalSucess,
    criticalFailCount,
    fail: totalSucess === 0 && !hasCriticalFail,
    criticalFail: totalSucess === 0 && hasCriticalFail,
    explodedDices,
  };
};

export const callRollJoinBattle = async (actor) => {
  try {
    const wits = foundry.utils.getProperty(
      actor.system,
      "attributes.mental.wits.value"
    );

    const epicWits = foundry.utils.getProperty(
      actor.system,
      "epicAttributes.mental.wits.value"
    );

    const awareness = foundry.utils.getProperty(
      actor.system,
      "abilities.awareness.value"
    );

    const totalDices = Math.max(0, wits + awareness) || 0;
    const { dicesResult, roll } = await rollDice(totalDices);

    const {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      explodedDices,
    } = await calcSuccess(dicesResult);

    await sendRollToChat(actor, roll, {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute: epicWits,
      explodedDices,
      title: "Join Battle",
      epicAttributeLabel: "Wits",
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callRollLegendDice = async (actor, event, difficulty) => {
  try {
    const legend = foundry.utils.getProperty(actor.system, `legend.value`) || 0;

    const { dicesResult, roll } = await rollDice(legend);
    const { totalSucess, fail, explodedDices } = await calcSuccess(
      dicesResult,
      difficulty
    );

    await sendRollToChat(actor, roll, {
      totalSucess,
      criticalFailCount: 0,
      fail,
      criticalFail: false,
      explodedDices,
      title: "Legend Roll",
      epicAttributeLabel: null,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callRollWillpowerDice = async (actor, event, difficulty) => {
  try {
    const willpower =
      foundry.utils.getProperty(actor.system, `willpower.value`) || 0;
    const { dicesResult, roll } = await rollDice(willpower);
    const { totalSucess, fail, explodedDices } = await calcSuccess(
      dicesResult,
      difficulty
    );

    await sendRollToChat(actor, roll, {
      totalSucess,
      criticalFailCount: 0,
      fail,
      criticalFail: false,
      explodedDices,
      title: "Willpower Roll",
      epicAttributeLabel: null,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callRollAttrDice = async (actor, event, difficulty) => {
  try {
    const key = event.currentTarget.dataset.key;
    const attr = event.currentTarget.dataset.label;
    const attributes = foundry.utils.getProperty(actor.system, "attributes");
    const epicAttributes = foundry.utils.getProperty(
      actor.system,
      "epicAttributes"
    );
    const penality = foundry.utils.getProperty(actor.system, "health.value");
    const value = attributes[key][attr]?.value ?? 0;
    const epicValue = epicAttributes[key][attr]?.value ?? 0;

    const totalDice = Math.max(value + penality, 0);

    let results = [];
    let rollItem = null;

    if (totalDice > 0) {
      const { dicesResult, roll } = await rollDice(totalDice);
      results = dicesResult;
      rollItem = roll;
    }

    const {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      explodedDices,
    } = await calcSuccess(results, difficulty);

    await sendRollToChat(actor, rollItem, {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute: epicValue,
      explodedDices,
      title: attr,
      epicAttributeLabel: attr,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callRollSkillDice = async (
  actor,
  { skillName, skillValue, attr, attrValue, epicAttrValue, difficulty }
) => {
  try {
    if (!skillName || !skillValue || !attr || !attrValue) {
      throw new Error("Missing required parameters for skill roll.");
    }

    const penality = foundry.utils.getProperty(actor.system, "health.value");
    const title = `${attr} + ${skillName}`;
    const totalDice = Math.max(attrValue + skillValue + penality, 0);

    let results = [];
    let rollItem = null;

    if (totalDice > 0) {
      const { dicesResult, roll } = await rollDice(totalDice);
      results = dicesResult;
      rollItem = roll;
    }

    const {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      explodedDices,
    } = await calcSuccess(results, difficulty);

    await sendRollToChat(actor, rollItem, {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute: epicAttrValue,
      explodedDices,
      title,
      epicAttributeLabel: attr,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callRollWeaponDice = async (
  actor,
  {
    multipleSelected,
    epicAttrValue,
    skillValue,
    attrValue,
    weapon,
    extraDices,
    difficulty,
  }
) => {
  try {
    if (!weapon) {
      throw new Error("Weapon not found.");
    }

    let acc = Number.parseInt(weapon.acc) || 0;
    const penality = foundry.utils.getProperty(actor.system, "health.value");
    let totalDice = Math.max(
      attrValue + skillValue + acc + penality + extraDices,
      0
    );

    let actions = 1;

    if (multipleSelected) {
      totalDice = Math.max(totalDice - 2, 0);
      actions = 2;
    }

    if (totalDice > 0) {
      for (let i = 0; i < actions; i++) {
        let results = [];
        const { dicesResult, roll } = await rollDice(totalDice);
        results = dicesResult;

        const {
          totalSucess,
          criticalFailCount,
          fail,
          criticalFail,
          explodedDices,
        } = await calcSuccess(results, difficulty);

        await sendRollToChat(actor, roll, {
          totalSucess,
          criticalFailCount,
          fail,
          criticalFail,
          epicAttribute: epicAttrValue || 0,
          explodedDices,
          title: `#${i + 1} - ${weapon.name}`,
          epicAttributeLabel: weapon.attr || "",
        });
      }
    } else {
      const { dicesResult, roll } = await rollDice(totalDice);

      await sendRollToChat(actor, roll, {
        totalSucess: 0,
        criticalFailCount: 0,
        fail: true,
        criticalFail: false,
        epicAttribute: epicAttrValue || 0,
        explodedDices: [],
        title: `#1 - ${weapon.name}`,
        epicAttributeLabel: weapon.attr || "",
      });
    }
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callDamageAtkRoll = async (
  actor,
  { weapon, extraDices, attrValue, epicAttrValue }
) => {
  try {
    const damage = Number.parseInt(weapon.damage) || 0;

    const totalDamage = Math.max(damage + attrValue + extraDices, 0);

    const { dicesResult, roll } = await rollDice(totalDamage);

    const { totalSucess, criticalFailCount, fail, explodedDices } =
      await calcSuccess(dicesResult);

    await sendRollToChat(actor, roll, {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail: false,
      epicAttribute: epicAttrValue || 0,
      explodedDices,
      title: `Damage - ${weapon.name} <br /> Type: ${weapon.type}`,
      epicAttributeLabel: weapon.damageAttr || "",
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
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
  }
) => {
  try {
    const totalEpicSuccess = epicAttributeSuccesses[epicAttribute] || 0;

    const data = {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute,
      explodedDices,
      title,
      epicAttributeLabel,
      totalEpicSuccess,
    };

    const context = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/diceRoll/dice-result.html",
      { data }
    );

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: context,
    });

    foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true);
  } catch (error) {
    console.error("Error to send message to roll", error.message);
    ui.notifications.error("Error to send message to roll.");
  }
};
