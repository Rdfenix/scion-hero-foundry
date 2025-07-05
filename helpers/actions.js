import { reopenWithActiveTab } from "./reopenWithActiveTab.js";
import {
  birthrightSchema,
  knackSchema,
  boonSchema,
  weaponSchema,
} from "../module/actor-base-default.js";
import { callRollAttrDice } from "./rollDice.js";
import {
  selectPantheon,
  selectGod,
  callDialogRollSkillDice,
  callDialogRollWeaponDice
} from "./dialog.js";

export async function _onAction(event, actor) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  switch (event.currentTarget.dataset.action) {
    case "select-pantheon":
      await selectPantheon(actor);
      break;
    case "select-god":
      await selectGod(actor);
      break;
    case "button-birthright-type":
      await setBirthrightOptionEstructure(actor);
      break;
    case "button-knack-add":
      await setKnackStructure(actor);
      break;
    case "button-birthright-boon":
      await setBoonToBirthright(event, actor);
      break;
    case "button-boon-add":
      await setBoonStructure(actor);
      break;
    case "button-weapon-add":
      await setWeaponStructure(actor);
      break;
    case "delete-birthright":
      await deleteBirthright(actor, event);
      break;
    case "delete-birth-boon":
      await deleteBoonFromBirthright(actor, event);
      break;
    case "delete-knack":
      await deleteKnack(actor, event);
      break;
    case "delete-boon":
      await deleteBoon(actor, event);
      break;
    case "delete-weapon":
      await deleteWeapon(actor, event);
      break;
    case "roll-attribute":
      await callRollAttrDice(actor, event);
      break;
    case "roll-abilitie":
      await callDialogRollSkillDice(actor, event);
      break;
    case "roll-attack":
      await callDialogRollWeaponDice(actor, event);
      break;
    case "roll-damage":
      break;
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

const setBirthrightOptionEstructure = async (actor) => {
  try {
    const selectedType = document.getElementById("birthright-type").value;

    let schema = birthrightSchema[selectedType];

    if (!schema) {
      ui.notifications.error("Choose the type of birthrights.");
    }

    schema = { ...schema, _id: foundry.utils.randomID(), type: selectedType };

    const birthrightList = foundry.utils.getProperty(
      actor.system,
      "birthrights"
    );

    birthrightList.push(schema);

    await actor.update(
      {
        "system.birthrights": birthrightList,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Birthrights.");
  }
};

const setKnackStructure = async (actor) => {
  try {
    let schema = knackSchema;

    schema = { ...schema, _id: foundry.utils.randomID() };

    const knackList = foundry.utils.getProperty(actor.system, "knacks");

    knackList.push(schema);

    await actor.update(
      {
        "system.knacks": knackList,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch knacks.");
  }
};

const setWeaponStructure = async (actor) => {
  try {
    let schema = weaponSchema;

    schema = { ...schema, _id: foundry.utils.randomID() };

    const weapons = foundry.utils.getProperty(actor.system, "weapons");

    weapons.push(schema);

    await actor.update(
      {
        "system.weapons": weapons,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch weapons.");
  }
};

const setBoonStructure = async (actor) => {
  try {
    let schema = boonSchema;

    schema = { ...schema, _id: foundry.utils.randomID() };

    const boonList = foundry.utils.getProperty(actor.system, "boons");

    boonList.push(schema);

    await actor.update(
      {
        "system.boons": boonList,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch knacks.");
  }
};

const setBoonToBirthright = async (event, actor) => {
  const index = parseInt(event.currentTarget.dataset.index);

  const birthrights = foundry.utils.getProperty(actor.system, "birthrights");

  let schema = boonSchema;

  schema = { ...schema, _id: foundry.utils.randomID() };

  birthrights[index]?.boons.push(schema);

  await actor.update(
    {
      "system.birthrights": birthrights,
    },
    { render: false }
  );

  await reopenWithActiveTab(actor);
};

const deleteBirthright = async (actor, event) => {
  try {
    const birthId = event.currentTarget.dataset.birthId;

    if (!birthId) {
      throw new Error("Failed to found id from birthrights.");
    }

    let birthrights = foundry.utils.getProperty(actor.system, "birthrights");

    birthrights = birthrights.filter((birth) => birth._id !== birthId);

    await actor.update(
      {
        "system.birthrights": birthrights,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete Birthrights.");
  }
};

const deleteWeapon = async (actor, event) => {
  try {
    const weaponId = event.currentTarget.dataset.weaponId;

    if (!weaponId) {
      throw new Error("Failed to found id from Weapons.");
    }

    let weapons = foundry.utils.getProperty(actor.system, "weapons");

    weapons = weapons.filter((weapon) => weapon._id !== weaponId);

    await actor.update(
      {
        "system.weapons": weapons,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete Weapon.");
  }
};

const deleteBoonFromBirthright = async (actor, event) => {
  try {
    const birthId = event.currentTarget.dataset.birthId;
    const boonId = event.currentTarget.dataset.boonId;

    if (!boonId || !birthId) {
      throw new Error("Failed to find boon or birthright id.");
    }

    let birthrights = foundry.utils.getProperty(actor.system, "birthrights");

    birthrights = birthrights.map((birth) => {
      if (birth._id === birthId) {
        return {
          ...birth,
          boons: (birth.boons || []).filter((boon) => boon._id !== boonId),
        };
      }
      return birth;
    });

    await actor.update(
      {
        "system.birthrights": birthrights,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete boons from Birthrights.");
  }
};

const deleteBoon = async (actor, event) => {
  try {
    const boonId = event.currentTarget.dataset.boonId;

    if (!boonId) {
      throw new Error("Failed to found id from Boons.");
    }
    let boons = foundry.utils.getProperty(actor.system, "boons");

    boons = boons.filter((boon) => boon._id !== boonId);

    await actor.update(
      {
        "system.boons": boons,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete boons.");
  }
};

const deleteKnack = async (actor, event) => {
  try {
    const knackId = event.currentTarget.dataset.knackId;

    if (!knackId) {
      throw new Error("Failed to found id from Knacks.");
    }
    let knacks = foundry.utils.getProperty(actor.system, "knacks");

    knacks = knacks.filter((knack) => knack._id !== knackId);

    await actor.update(
      {
        "system.knacks": knacks,
      },
      { render: false }
    );

    await reopenWithActiveTab(actor);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete Knack.");
  }
};
