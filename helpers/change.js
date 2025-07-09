import { reopenWithActiveTab } from "./reopenWithActiveTab.js";

export async function _onChange(event, actor) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

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
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

const updateExperiencePoints = async (event, actor) => {
  try {
    let xp = foundry.utils.getProperty(actor.system, "experience");
    xp = {
      ...xp,
      value: event.currentTarget.value || 0,
    };
    await actor.update(
      {
        "system.experience": xp,
      },
      { render: false }
    );
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

    let weapons = foundry.utils.getProperty(actor.system, "weapons");

    weapons = weapons.map((weapon) => {
      if (weapon._id === weaponId) {
        weapon[field] = event.target.value;
      }
      return weapon;
    });

    await actor.update(
      {
        "system.weapons": weapons,
      },
      { render: false }
    );
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

    let health = foundry.utils.getProperty(actor.system, "health");

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

    await actor.update(
      {
        "system.health": health,
      },
      { render: false }
    );

    reopenWithActiveTab(actor);
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

    let combat = foundry.utils.getProperty(actor.system, "combat");

    combat = { ...combat, [field]: { value: event.currentTarget.value } };

    await actor.update(
      {
        "system.combat": combat,
      },
      { render: false }
    );

    reopenWithActiveTab(actor);
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

    let weapons = foundry.utils.getProperty(actor.system, "weapons");

    weapons = weapons.map((weapon) => {
      if (weapon._id === weaponId) {
        weapon[field] = event.currentTarget.value;
      }
      return weapon;
    });

    await actor.update(
      {
        "system.weapons": weapons,
      },
      { render: false }
    );
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch Weapons.");
  }
};

const onLegendPointChange = async (event, actor) => {
  try {
    const legendPoints = foundry.utils.getProperty(
      actor.system,
      "legendPoints"
    );

    const min = legendPoints.min ?? 0;
    const max = legendPoints.max ?? 48;
    let value = parseInt(event.currentTarget.value);

    if (isNaN(value)) value = min;
    value = Math.max(min, Math.min(max, value));
    legendPoints.value = value;

    await actor.update(
      {
        "system.legendPoints": legendPoints,
      },
      { render: false }
    );

    event.currentTarget.value = value;
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch legend points.");
  }
};

const onBirthrightBoonChange = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const birthIndex = parseInt(event.currentTarget.dataset.birthIndex);
    const boonIndex = parseInt(event.currentTarget.dataset.boonIndex);

    if (field === undefined || isNaN(birthIndex)) {
      throw new Error("Failed to found field or index from birthrights.");
    }

    const birthrights = foundry.utils.getProperty(actor.system, "birthrights");

    birthrights[birthIndex].boons[boonIndex][field] = event.currentTarget.value;

    await actor.update(
      {
        "system.birthrights": birthrights,
      },
      { render: false }
    );
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch boons on Birthrights.");
  }
};

const onBirthrightChange = async (event, actor) => {
  try {
    const field = event.currentTarget.dataset.field;
    const index = parseInt(event.currentTarget.dataset.index);

    if (field === undefined || isNaN(index)) {
      throw new Error("Failed to found field or index from birthrights.");
    }
    const birthrights = foundry.utils.getProperty(actor.system, "birthrights");

    // Verifica se o índice existe
    if (!birthrights[index]) {
      throw new Error(`Birthright at index ${index} not found`);
    }

    birthrights[index][field] = event.currentTarget.value;

    await actor.update(
      {
        "system.birthrights": birthrights,
      },
      { render: false }
    );
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
    let knacks = foundry.utils.getProperty(actor.system, "knacks");

    knacks = knacks.map((knack) => {
      if (knack._id === id) {
        knack[field] = event.currentTarget.value;
      }
      return knack;
    });

    await actor.update(
      {
        "system.knacks": knacks,
      },
      { render: false }
    );
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
    let boons = foundry.utils.getProperty(actor.system, "boons");

    boons = boons.map((boon) => {
      if (boon._id === id) {
        boon[field] = event.currentTarget.value;
      }
      return boon;
    });

    await actor.update(
      {
        "system.boons": boons,
      },
      { render: false }
    );
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch boons.");
  }
};
