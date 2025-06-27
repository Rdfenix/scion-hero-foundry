import { reopenWithActiveTab } from "./reopenWithActiveTab.js";
import {
  birthrightSchema,
  knackSchema,
  boonSchema,
  weaponSchema,
} from "../module/actor-base-default.js";

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
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

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
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

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

const selectPantheon = async (actor) => {
  try {
    const pack = game.packs.get("scion-hero-foundry.deities");
    if (!pack) {
      throw new Error("Pantheon pack not found.");
    }

    const deities = await pack.getDocuments();

    const pantheons = deities
      .map((deity) => ({
        name: deity.name,
        logo: deity.img,
        description: deity.system.description,
        virtues: deity.system.virtues.reduce((acc, virtue) => {
          acc[virtue.name] = {
            value: 1,
            min: virtue.min,
            max: virtue.max,
          };
          return acc;
        }, {}),
      }))
      .filter(
        (pantheon, index, self) =>
          index === self.findIndex((p) => p.name === pantheon.name)
      );

    if (pantheons.length === 0) {
      throw new Error("Nenhuma divindade encontrada no pacote.");
    }

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/actors/dialogs/pantheon.html",
      { pantheons }
    );

    return new Promise((resolve) => {
      new Dialog(
        {
          title: "",
          content,
          buttons: {
            select: {
              icon: '<i class="fas fa-check"></i>',
              label: "Select",
              class: "pantheon-select",
              callback: async (html) => {
                const pantheonSelected = html
                  .find('input[name="pantheon-option"]:checked')
                  .val();

                if (!pantheonSelected) {
                  return ui.notifications.warn("Choose a pantheon first");
                }
                const selectedPantheon = pantheons.find(
                  (p) => p.name === pantheonSelected
                );

                if (!selectedPantheon) {
                  return ui.notifications.warn("Pantheon not found");
                }

                await actor.update({
                  "system.pantheon": {
                    name: selectedPantheon.name,
                    logo: selectedPantheon.logo,
                  },
                  "system.virtues": null,
                });

                await actor.update({
                  "system.virtues": selectedPantheon.virtues,
                });

                await reopenWithActiveTab(actor);
              },
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              class: "pantheon-cancel",
              callback: () => resolve(null),
            },
          },
          default: "select",
          render: (html) => {
            setTimeout(() => {
              const contentEl = html
                .closest(".window-app")
                .find(".window-content")[0];
              if (contentEl) {
                contentEl.scrollTop = 0;
              }
            }, 50);
          },
          close: () => resolve(null),
        },
        {
          width: 700,
          height: 500,
        }
      ).render(true);
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
};

const selectGod = async (actor) => {
  try {
    const pack = game.packs.get("scion-hero-foundry.deities");
    if (!pack) {
      throw new Error("Pantheon pack not found.");
    }

    const pantheon = actor.system.pantheon?.name;

    const deities = await pack.getDocuments();

    let gods = deities.find((p) => p.name === pantheon)?.system.deities || [];

    gods = gods.map((god) => ({
      name: god.name,
      favoredSkills: (god.favoredSkills || []).reduce((obj, skill, idx) => {
        obj[idx] = skill;
        return obj;
      }, {}),
    }));

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/actors/dialogs/gods.html",
      { gods }
    );

    return new Promise((resolve) => {
      new Dialog(
        {
          title: "",
          content,
          buttons: {
            select: {
              icon: '<i class="fas fa-check"></i>',
              label: "Select",
              class: "pantheon-select",
              callback: async (html) => {
                const godSelected = html
                  .find('input[name="pantheon-option"]:checked')
                  .val();

                if (!godSelected) {
                  return ui.notifications.warn("Choose a god first");
                }
                const deityPantheon = gods.find((p) => p.name === godSelected);

                if (!deityPantheon) {
                  return ui.notifications.warn("God not found");
                }

                const abilities = actor.system.abilities;
                const favoredSkillsArr = Object.values(
                  deityPantheon.favoredSkills
                );

                const updatedAbilities = {};
                for (const [key, value] of Object.entries(abilities)) {
                  updatedAbilities[key] = {
                    ...value,
                    favored: favoredSkillsArr.includes(key),
                  };
                }

                await actor.update({
                  "system.abilities": updatedAbilities,
                  "system.pantheon": {
                    god: deityPantheon.name,
                  },
                });

                await reopenWithActiveTab(actor);
              },
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              class: "pantheon-cancel",
              callback: () => resolve(null),
            },
          },
          default: "select",
          render: (html) => {
            setTimeout(() => {
              const contentEl = html
                .closest(".window-app")
                .find(".window-content")[0];
              if (contentEl) {
                contentEl.scrollTop = 0;
              }
            }, 50);
          },
          close: () => resolve(null),
        },
        {
          width: 700,
          height: 500,
        }
      ).render(true);
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
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
