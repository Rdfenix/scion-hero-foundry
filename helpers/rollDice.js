export const rollDice = async (diceTotal = 0) => {
  try {
    const roll = await new Roll(`${diceTotal}d10`).evaluate();

    console.log("Roll", roll.terms[0].results);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callRollAttrDice = async (actor, event) => {
  try {
    const key = event.currentTarget.dataset.key;
    const attr = event.currentTarget.dataset.label;
    console.log(attr);
    console.log(key);

    const attributes = foundry.utils.getProperty(actor.system, "attributes");
    const epicAttributes = foundry.utils.getProperty(
      actor.system,
      "epicAttributes"
    );

    const value = attributes[key][attr]?.value;
    const epicValue = epicAttributes[key][attr]?.value;
    console.log("epicValue", epicValue);

    await rollDice(value);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};
