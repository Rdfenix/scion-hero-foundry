export const rollDice = async (diceTotal = 0) => {
  try {
    const roll = await new Roll(`${diceTotal}d10`).evaluate();

    return roll.terms[0].results.map((dice) => dice.result);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

const calcSuccess = async (dices) => {
  let totalSucess = 0;
  let hasCriticalFail = false;
  let explodedDices = [];
  let criticalFailCount = [];

  for (const dice of dices) {
    if (dice === 10) {
      explodedDices.push(dice);
      totalSucess += 2;
    } else if (dice >= 7 && dice <= 9) {
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

export const callRollAttrDice = async (actor, event) => {
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

    if (totalDice > 0) {
      results = await rollDice(totalDice);
    }

    const {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      explodedDices,
    } = await calcSuccess(results);

    console.log("Total os Success", totalSucess);
    console.log("Fail", fail);
    console.log("Critical Fail", criticalFail);
    await sendRollToChat(actor, {
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
  { skillName, skillValue, attr, attrValue, epicAttrValue }
) => {
  try {
    if (!skillName || !skillValue || !attr || !attrValue) {
      throw new Error("Missing required parameters for skill roll.");
    }

    const penality = foundry.utils.getProperty(actor.system, "health.value");
    const title = `${attr} + ${skillName}`;
    const totalDice = Math.max(attrValue + skillValue + penality, 0);

    let results = [];

    if (totalDice > 0) {
      results = await rollDice(totalDice);
    }

    const {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      explodedDices,
    } = await calcSuccess(results);

    await sendRollToChat(actor, {
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

const sendRollToChat = async (
  actor,
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
    const data = {
      totalSucess,
      criticalFailCount,
      fail,
      criticalFail,
      epicAttribute,
      explodedDices,
      title,
      epicAttributeLabel,
    };

    const context = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/diceRoll/dice-result.html",
      { data }
    );

    await ChatMessage.create({
      content: context,
      speaker: ChatMessage.getSpeaker({ actor }),
    });

    foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true);
  } catch (error) {
    console.error("Error to send message to roll", error.message);
    ui.notifications.error("Error to send message to roll.");
  }
};
