import { mountDeities } from "./mountDeities.js";
import {
  cleanString,
  mountFavoritiesSkills,
  mountGodsList,
} from "../utils/utils.js";

export async function _onChange(event, actor) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (!actor?.isOwner) {
    ui.notifications.warn(
      "Você não tem permissão para alterar este personagem.",
    );
    return;
  }

  switch (event.currentTarget.dataset.action) {
    case "select-birthright-type":
      event.currentTarget.dataset.selectedType = event.target.value;
      break;
    case "update-birthright-name":
    case "update-birthright-description":
      await onBirthrightChange(event, actor);
      break;
    case "update-birthright-boon":
      await onBirthrightBoonChange(event, actor);
      break;
    case "knack-change":
      await onKnackChange(event, actor);
      break;
    case "boon-change":
      await onBoonChange(event, actor);
      break;
    case "legend-point-change":
      await onLegendPointChange(event, actor);
      break;
    case "update-weapon-field":
      await onChangeFieldInWeapon(event, actor);
      break;
    case "select-weapon-type":
      await onSelectFieldInWeapon(event, actor);
      break;
    case "defense-value-update":
      await onChangeDefenseValue(event, actor);
      break;
    case "change-health-damage":
      await onChangeHealthValue(event, actor);
      break;
    case "update-xp":
      await updateExperiencePoints(event, actor);
      break;
    case "update-virtue-field":
      await updateVirtueField(event, actor);
      break;
    case "armor-update":
      await updateArmorField(event, actor);
      break;
    case "update-pantheon-name":
      await updatePantheonField(event, actor);
      break;
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

const updateVirtueField = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    let virtues = foundry.utils.deepClone(actor.system.virtues);

    // Inicializar com objeto vazio se virtues for null
    if (!virtues) virtues = {};

    virtues = {
      ...virtues,
      [field]: { ...virtues[field], name: event.target.value },
    };

    await actor.update({
      "system.virtues": virtues,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch virtues.");
  }
};

const updateArmorField = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    let combat = foundry.utils.deepClone(actor.system.combat);

    // Inicializar com objeto padrão se combat for null
    if (!combat) {
      combat = { armor: {} };
    }
    if (!combat.armor) {
      combat.armor = {};
    }

    combat = {
      ...combat,
      armor: { ...combat.armor, [field]: { value: event.currentTarget.value } },
    };

    await actor.update({
      "system.combat": combat,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch combat.");
  }
};

const updateExperiencePoints = async (event, actor) => {
  try {
    let xp = foundry.utils.deepClone(actor.system.experience);

    // Inicializar com valores padrão se xp for null
    if (!xp) {
      xp = { value: 0 };
    }

    xp = {
      ...xp,
      value: event.currentTarget.value || 0,
    };
    await actor.update({
      "system.experience": xp,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch xp.");
  }
};

const onSelectFieldInWeapon = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const weaponId = event.currentTarget.dataset.weaponId;

    if (field === undefined || !weaponId) {
      throw new Error("Failed to found field or id from weapons.");
    }

    let weapons = foundry.utils.deepClone(actor.system.weapons || []);

    weapons = weapons.map((weapon) => {
      if (weapon._id === weaponId) {
        weapon[field] = event.target.value;
      }
      return weapon;
    });

    await actor.update({
      "system.weapons": weapons,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Weapons.");
  }
};

const onChangeHealthValue = async (event, actor) => {
  try {
    const key = event.currentTarget.dataset.key;
    const value =
      event.currentTarget.value === "__none__" ? "" : event.currentTarget.value;

    if (key === undefined) {
      throw new Error("Failed to found key from health values.");
    }

    let health = foundry.utils.deepClone(actor.system.health);

    if (health === undefined) {
      throw new Error("Failed to found health.");
    }

    health = {
      ...health,
      conditions: {
        ...health.conditions,
        [key]: {
          ...health.conditions[key],
          damageType: value,
        },
      },
    };

    const conditionKeys = Object.keys(health.conditions);
    let lastKey = null;

    for (const key of conditionKeys) {
      if (health.conditions[key] && health.conditions[key].damageType !== "") {
        lastKey = key;
      }
    }

    if (lastKey) {
      health = {
        ...health,
        value: health.conditions[lastKey].value,
      };
    } else {
      health = {
        ...health,
        value: 0,
      };
    }

    await actor.update({
      "system.health": health,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch health.");
  }
};

const onChangeDefenseValue = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;

    if (field === undefined) {
      throw new Error("Failed to found field from defense values.");
    }

    let combat = foundry.utils.deepClone(actor.system.combat);

    combat = { ...combat, [field]: { value: event.currentTarget.value } };

    await actor.update({
      "system.combat": combat,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch combat.");
  }
};

const onChangeFieldInWeapon = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const weaponId = event.currentTarget.dataset.weaponId;

    if (field === undefined || !weaponId) {
      throw new Error("Failed to found field or id from weapons.");
    }

    let weapons = foundry.utils.deepClone(actor.system.weapons || []);

    weapons = weapons.map((weapon) => {
      if (weapon._id === weaponId) {
        weapon[field] = event.currentTarget.value;
      }
      return weapon;
    });

    await actor.update({
      "system.weapons": weapons,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Weapons.");
  }
};

const onLegendPointChange = async (event, actor) => {
  try {
    const inputElement = event.currentTarget;
    const inputValue = Number.parseInt(inputElement.value);

    let legendPoints = foundry.utils.deepClone(actor.system.legendPoints) || {
      value: 0,
      min: 0,
      max: 48,
    };

    const min = legendPoints.min ?? 0;
    const max = legendPoints.max ?? 48;

    let newValue = Number.isNaN(inputValue) ? min : inputValue;
    newValue = Math.max(min, Math.min(max, newValue));

    legendPoints.value = newValue;

    await actor.update({
      "system.legendPoints": legendPoints,
    });

    if (inputElement) {
      inputElement.value = newValue;
    }
  } catch (error) {
    console.error("Erro ao atualizar Legend Points:", error);
    ui.notifications.error("Não foi possível atualizar os Pontos de Lenda.");
  }
};

const onBirthrightBoonChange = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const birthIndex = Number.parseInt(event.currentTarget.dataset.birthIndex);
    const boonIndex = Number.parseInt(event.currentTarget.dataset.boonIndex);

    if (field === undefined || Number.isNaN(birthIndex)) {
      throw new Error("Failed to found field or index from birthrights.");
    }

    let birthrights = foundry.utils.deepClone(actor.system.birthrights);

    // Verificar se birthrights e os índices existem
    if (!birthrights?.[birthIndex]) {
      throw new Error("Birthright not found.");
    }
    if (!birthrights[birthIndex].boons?.[boonIndex]) {
      throw new Error("Boon not found.");
    }

    birthrights[birthIndex].boons[boonIndex][field] = event.currentTarget.value;

    await actor.update({
      "system.birthrights": birthrights,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch boons on Birthrights.");
  }
};

const onBirthrightChange = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const index = Number.parseInt(event.currentTarget.dataset.index);

    if (field === undefined || Number.isNaN(index)) {
      throw new Error("Failed to found field or index from birthrights.");
    }
    let birthrights = foundry.utils.deepClone(actor.system.birthrights);

    // Verifica se o índice existe
    if (!birthrights[index]) {
      throw new Error(`Birthright at index ${index} not found`);
    }

    birthrights[index][field] = event.currentTarget.value;

    await actor.update({
      "system.birthrights": birthrights,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Birthrights.");
  }
};

const onKnackChange = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const id = event.currentTarget.dataset.knackId; // <-- agora é string

    if (field === undefined || !id) {
      throw new Error("Failed to found field or id from knacks.");
    }

    let knacks = foundry.utils.deepClone(actor.system.knacks);

    // Inicializar com array vazio se knacks for null
    if (!knacks || !Array.isArray(knacks)) {
      knacks = [];
    }

    knacks = knacks.map((knack) => {
      if (knack._id === id) {
        knack[field] = event.currentTarget.value;
      }
      return knack;
    });

    await actor.update({
      "system.knacks": knacks,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Knacks.");
  }
};

const onBoonChange = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const id = event.currentTarget.dataset.boonId; // <-- agora é string

    if (field === undefined || !id) {
      throw new Error("Failed to found field or id from boons.");
    }
    let boons = foundry.utils.deepClone(actor.system.boons);

    // Inicializar com array vazio se boons for null
    if (!boons || !Array.isArray(boons)) {
      boons = [];
    }

    boons = boons.map((boon) => {
      if (boon._id === id) {
        boon[field] = event.currentTarget.value;
      }
      return boon;
    });

    await actor.update({
      "system.boons": boons,
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch boons.");
  }
};

const updatePantheonField = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    let pantheon = foundry.utils.deepClone(actor.system.pantheon);
    const { pantheons, deities } = await mountDeities();

    const selectedPantheon =
      pantheons.find(
        (p) =>
          cleanString(p.name)?.toUpperCase() ===
          cleanString(event.target.value)?.toUpperCase(),
      ) || {};

    pantheon = {
      ...pantheon,
      [field]: selectedPantheon[field] || event.target.value.toUpperCase(),
      logo: selectedPantheon.logo || null,
    };

    let gods =
      deities.find((p) => p.name === selectedPantheon.name)?.system.deities ||
      [];
    gods = await mountGodsList(gods);
    const updatedAbilities = await mountFavoritiesSkills(gods[0], actor);

    let updatedPantheon = {
      "system.pantheon": pantheon,
      "system.virtues": selectedPantheon.virtues,
    };

    if (gods[0]) {
      updatedPantheon["system.pantheon.god"] = gods[0].name;
      updatedPantheon["system.abilities"] = updatedAbilities;
    }

    await actor.update(updatedPantheon, { render: true });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch pantheon data.");
  }
};
