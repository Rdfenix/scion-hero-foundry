import {
  birthrightSchema,
  knackSchema,
  boonSchema,
  weaponSchema,
} from "../module/actor-base-default.js";
import {
  selectPantheon,
  selectGod,
  callDialogRollSkillDice,
  callDialogRollWeaponDice,
  callDialogRollDamage,
  callDifficultyDialog,
} from "./dialog.js";

import { callRollJoinBattle } from "./rollDice.js";

export async function _onAction(event, actor, options) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (!actor?.isOwner) {
    ui.notifications.warn(
      "Você não tem permissão para alterar este personagem.",
    );
    return;
  }

  switch (event) {
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
      await setBoonToBirthright(options, actor);
      break;
    case "button-boon-add":
      await setBoonStructure(actor);
      break;
    case "button-weapon-add":
      await setWeaponStructure(actor);
      break;
    case "delete-birthright":
      await deleteBirthright(actor, options);
      break;
    case "delete-birth-boon":
      await deleteBoonFromBirthright(actor, options);
      break;
    case "delete-knack":
      await deleteKnack(actor, options);
      break;
    case "delete-boon":
      await deleteBoon(actor, options);
      break;
    case "delete-weapon":
      await deleteWeapon(actor, options);
      break;
    case "roll-attribute":
    case "roll-willpower":
    case "roll-legend":
      await callDifficultyDialog(actor, options);
      break;
    case "roll-ability":
      await callDialogRollSkillDice(actor, options);
      break;
    case "roll-attack":
      await callDialogRollWeaponDice(actor, options);
      break;
    case "roll-damage":
      await callDialogRollDamage(actor, options);
      break;
    case "join-battle":
      await callRollJoinBattle(actor, options);
      break;
    default:
      console.warn("Ação não reconhecida:", event);
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

    const birthrightList = foundry.utils.deepClone(actor.system.birthrights);

    birthrightList.push(schema);

    await actor.update({
      "system.birthrights": birthrightList,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Birthrights.");
  }
};

const setKnackStructure = async (actor) => {
  try {
    let schema = knackSchema;

    schema = { ...schema, _id: foundry.utils.randomID() };

    const knackList = foundry.utils.deepClone(actor.system.knacks || []);

    knackList.push(schema);

    await actor.update({
      "system.knacks": knackList,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch knacks.");
  }
};

const setWeaponStructure = async (actor) => {
  try {
    let schema = weaponSchema;

    schema = { ...schema, _id: foundry.utils.randomID() };

    const weapons = foundry.utils.deepClone(actor.system.weapons || []);

    weapons.push(schema);

    await actor.update({
      "system.weapons": weapons,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch weapons.");
  }
};

const setBoonStructure = async (actor) => {
  try {
    let schema = boonSchema;

    schema = { ...schema, _id: foundry.utils.randomID() };

    const boonList = foundry.utils.deepClone(actor.system.boons || []);

    boonList.push(schema);

    await actor.update({
      "system.boons": boonList,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch boons.");
  }
};

const setBoonToBirthright = async (options, actor) => {
  const index = Number.parseInt(options.dataset.index);

  const birthrights = foundry.utils.deepClone(actor.system.birthrights);

  let schema = boonSchema;

  schema = { ...schema, _id: foundry.utils.randomID() };

  birthrights[index]?.boons.push(schema);

  await actor.update({
    "system.birthrights": birthrights,
  });
};

const deleteBirthright = async (actor, options) => {
  try {
    const birthId = options.dataset.birthId;

    if (!birthId) {
      throw new Error("Failed to found id from birthrights.");
    }

    let birthrights = foundry.utils.deepClone(actor.system.birthrights);

    birthrights = birthrights.filter((birth) => birth._id !== birthId);

    await actor.update({
      "system.birthrights": birthrights,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete Birthrights.");
  }
};

const deleteWeapon = async (actor, options) => {
  try {
    const weaponId = options.dataset.weaponId;

    if (!weaponId) {
      throw new Error("Failed to found id from Weapons.");
    }

    let weapons = foundry.utils.deepClone(actor.system.weapons || []);

    weapons = weapons.filter((weapon) => weapon._id !== weaponId);

    await actor.update({
      "system.weapons": weapons,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete Weapon.");
  }
};

const deleteBoonFromBirthright = async (actor, options) => {
  try {
    const birthId = options.dataset.birthId;
    const boonId = options.dataset.boonId;

    if (!boonId || !birthId) {
      throw new Error("Failed to find boon or birthright id.");
    }

    let birthrights = foundry.utils.deepClone(actor.system.birthrights);

    birthrights = birthrights.map((birth) => {
      if (birth._id === birthId) {
        return {
          ...birth,
          boons: (birth.boons || []).filter((boon) => boon._id !== boonId),
        };
      }
      return birth;
    });

    await actor.update({
      "system.birthrights": birthrights,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete boons from Birthrights.");
  }
};

const deleteBoon = async (actor, options) => {
  try {
    const boonId = options.dataset.boonId;

    if (!boonId) {
      throw new Error("Failed to found id from Boons.");
    }
    let boons = foundry.utils.deepClone(actor.system.boons || []);

    boons = boons.filter((boon) => boon._id !== boonId);

    await actor.update({
      "system.boons": boons,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete boons.");
  }
};

const deleteKnack = async (actor, options) => {
  try {
    const knackId = options.dataset.knackId;

    if (!knackId) {
      throw new Error("Failed to found id from Knacks.");
    }
    let knacks = foundry.utils.deepClone(actor.system.knacks || []);

    knacks = knacks.filter((knack) => knack._id !== knackId);

    await actor.update({
      "system.knacks": knacks,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to delete Knack.");
  }
};
