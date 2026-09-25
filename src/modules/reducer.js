import {
  weaponSchema,
  birthrightSchema,
  boonSchema,
  knackSchema,
} from "./actor-base-default";
import { mountDeities } from "./mountDeities";
import {
  cleanString,
  mountGodsList,
  mountFavoritiesSkills,
  resetFavoredAbilities,
} from "./../utils/utils";

import {
  callDifficultyDialog,
  selectPantheonDialog,
  selectGodDialog,
} from "./dialiog";

const EMPTY_VIRTUES = {
  virtue_1: { name: "", value: 1, min: 1, max: 5 },
  virtue_2: { name: "", value: 1, min: 1, max: 5 },
  virtue_3: { name: "", value: 1, min: 1, max: 5 },
  virtue_4: { name: "", value: 1, min: 1, max: 5 },
};

export async function reducer(action, actor) {
  let updateData = {};

  switch (action.type) {
    case "SET_UPDATE_HEADER":
    case "UPDATE_EXPERIENCE":
    case "SET_UPDATE_ARMOR":
    case "UPDATE_ATTR":
    case "UPDATE_SKILL": {
      const { field, value } = action.payload;
      const data = foundry.utils.deepClone([`${field}`]);

      const handler = pantheonHandlers[field];

      updateData = handler
        ? { ...(await handler(value, actor)) }
        : {
            ...data,
            [field]: value,
          };

      break;
    }
    case "SET_UPDATE_Will_LEGEND": {
      const data = foundry.utils.deepClone(
        actor.system[`${action.payload.field}`],
      );

      updateData = {
        [`system.${action.payload.field}`]: {
          ...data,
          value: action.payload.value,
        },
      };
      break;
    }
    case "ADD_NEW_WEAPON": {
      let schema = weaponSchema;

      schema = { ...schema, _id: foundry.utils.randomID() };

      const weapons = foundry.utils.deepClone(actor.system.weapons || []);
      weapons.push(schema);

      updateData = {
        ["system.weapons"]: weapons,
      };
      break;
    }
    case "DELETE_WEAPON": {
      let weapons = foundry.utils.deepClone(actor.system.weapons || []);

      const weaponId = action.payload.value;

      weapons = weapons.filter((weapon) => weapon._id !== weaponId);

      updateData = {
        ["system.weapons"]: weapons,
      };

      break;
    }
    case "UPDATE_WEAPON": {
      const { field, value } = action.payload;

      let weapons = foundry.utils.deepClone(actor.system.weapons || []);

      weapons = weapons.map((weapon) => {
        if (weapon._id === value.weaponId) {
          weapon[field] = value.data;
        }
        return weapon;
      });

      updateData = {
        ["system.weapons"]: weapons,
      };

      break;
    }
    case "UPDATE_HEALTH": {
      const { value } = action.payload;
      const health = { ...value };

      const lastKey =
        Object.keys(health.conditions ?? {}).findLast(
          (key) => health.conditions[key]?.damageType !== "",
        ) ?? null;

      updateData = {
        ["system.health"]: {
          ...health,
          value: lastKey ? (health.conditions[lastKey]?.value ?? 0) : 0,
        },
      };

      break;
    }
    case "ADD_BIRTH": {
      const { field } = action.payload;
      let schema = birthrightSchema[field];

      if (!schema) {
        ui.notifications.error("Choose the type of birthrights.");
      }

      schema = { ...schema, _id: foundry.utils.randomID(), type: field };

      const birthrightList = foundry.utils.deepClone(actor.system.birthrights);

      birthrightList.push(schema);

      updateData = {
        ["system.birthrights"]: birthrightList,
      };

      break;
    }
    case "ADD_BOON_BIRTH": {
      const { field } = action.payload;
      const birthrights = foundry.utils.deepClone(actor.system.birthrights);

      let schema = boonSchema;

      schema = { ...schema, _id: foundry.utils.randomID() };

      birthrights[field]?.boons.push(schema);

      updateData = {
        ["system.birthrights"]: birthrights,
      };
      break;
    }
    case "ADD_BOON": {
      let schema = boonSchema;

      schema = { ...schema, _id: foundry.utils.randomID() };

      const boonList = foundry.utils.deepClone(actor.system.boons || []);

      boonList.push(schema);

      updateData = {
        ["system.boons"]: boonList,
      };

      break;
    }
    case "UPDATE_BIRTH": {
      const { value } = action.payload;

      updateData = {
        ["system.birthrights"]: value,
      };
      break;
    }
    case "UPDATE_VIRTUE": {
      const { value } = action.payload;

      updateData = {
        ["system.virtues"]: value,
      };

      break;
    }
    case "ADD_KNACK": {
      let schema = knackSchema;

      schema = { ...schema, _id: foundry.utils.randomID() };

      const knackList = foundry.utils.deepClone(actor.system.knacks || []);

      knackList.push(schema);

      updateData = {
        ["system.knacks"]: knackList,
      };

      break;
    }
    case "UPDATE_KNACK": {
      const { value } = action.payload;

      updateData = {
        ["system.knacks"]: value,
      };
      break;
    }
    case "UPDATE_BOONS": {
      const { value } = action.payload;

      updateData = {
        ["system.boons"]: value,
      };
      break;
    }
    case "OPEN_DIFICULTY_DIALOG": {
      const { field, value } = action.payload;

      callDifficultyDialog(actor, { type: field, data: value });

      break;
    }
    case "OPEN_PANTHEON_DIALOG": {
      const result = await selectPantheonDialog(actor);

      updateData = {
        ...result,
      };
      break;
    }
    case "OPEN_GOD_DIALOG": {
      const result = await selectGodDialog(actor);

      updateData = {
        ...result,
      };
      break;
    }
    default:
      console.warn("Ação não reconhecida:", action.type);
      return;
  }

  return updateData;
}

const updatePantheonField = async (value, actor) => {
  const { pantheons, deities } = await mountDeities();
  const currentPantheon = actor.system?.pantheon ?? {};

  const selectedPantheon =
    pantheons.find(
      (pantheon) =>
        cleanString(game.i18n.localize(pantheon.name)).toUpperCase() ===
        cleanString(value).toUpperCase(),
    ) ?? null;

  const pantheon = {
    ...currentPantheon,
    name: selectedPantheon?.name ?? value,
    logo: selectedPantheon?.logo ?? null,
  };

  const pantheonData = deities.find(
    (p) => game.i18n.localize(p.name) === selectedPantheon.name,
  );

  const gods = await mountGodsList(pantheonData?.system?.deities ?? []);
  const firstGod = gods[0];

  if (!firstGod) {
    return {
      "system.pantheon": {
        ...pantheon,
        god: "",
      },
      "system.virtues": selectedPantheon?.virtues ?? EMPTY_VIRTUES,
      "system.abilities": resetFavoredAbilities(actor),
    };
  }

  return {
    "system.pantheon": {
      ...pantheon,
      god: firstGod.name,
    },
    "system.virtues": selectedPantheon?.virtues ?? EMPTY_VIRTUES,
    "system.abilities": await mountFavoritiesSkills(firstGod, actor),
  };
};

const updatePantheonGodField = async (value, actor) => {
  const currentPantheon = actor.system?.pantheon ?? {};
  const { deities } = await mountDeities();

  const foundGod =
    deities
      .flatMap((pantheon) => pantheon.system?.deities ?? [])
      .find(
        (god) =>
          cleanString(game.i18n.localize(god.name))?.toUpperCase() ===
          cleanString(value)?.toUpperCase(),
      ) ?? null;

  if (!foundGod) {
    return {
      "system.pantheon": {
        ...currentPantheon,
        god: value,
      },
      "system.virtues": currentPantheon?.virtues ?? EMPTY_VIRTUES,
      "system.abilities": resetFavoredAbilities(actor),
    };
  }

  return {
    "system.pantheon": {
      ...currentPantheon,
      god: foundGod.name,
    },
    "system.virtues": actor.system?.virtues ?? EMPTY_VIRTUES,
    "system.abilities": await mountFavoritiesSkills(foundGod, actor),
  };
};

const pantheonHandlers = {
  "system.pantheon.name": updatePantheonField,
  "system.pantheon.god": updatePantheonGodField,
};

export const updateSoak = async (actor) => {
  try {
    if (!actor?.isOwner) return;

    const stamina = foundry.utils.deepClone(
      actor.system.attributes.physical.stamina.value,
    );
    const epicStamina = foundry.utils.deepClone(
      actor.system.epicAttributes.physical.stamina.value,
    );

    const soak = {
      Bashing: {
        value: Math.max(0, stamina + epicStamina),
      },
      Lethal: {
        value: Math.max(0, Math.ceil(stamina / 2) + epicStamina),
      },
      Aggravated: {
        value: Math.max(0, epicStamina),
      },
    };

    await actor.update({ "system.combat.soak": soak });
  } catch (error) {
    console.error("Error updating Soak:", error);
  }
};
