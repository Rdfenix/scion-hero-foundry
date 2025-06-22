import {
  birthrightSchema,
  knackSchema,
  boonSchema,
} from "../module/actor-base-default.js";

export async function _onAction(event, actor) {
  event.preventDefault();
  event.stopPropagation();

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
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

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

    console.log(birthrights);
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

    console.log(birthrightList);
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

    console.log(knackList);
  } catch (error) {
    console.error(error.message);
    ui.notifications.error("Failed to fetch knacks.");
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

    console.log(boonList);
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

  delete schema.description;
  delete schema.cost;
  delete schema.dice_pool;

  birthrights[index]?.boons.push(schema);

  await actor.update(
    {
      "system.birthrights": birthrights,
    },
    { render: false }
  );

  await reopenWithActiveTab(actor);
};

function reopenWithActiveTab(actor) {
  const activeTab =
    document.querySelector(".sheet-tabs .item.active")?.dataset.tab ?? "stats";

  Hooks.once("renderActorSheet", (app, html, data) => {
    const nav = html[0].querySelector(".sheet-tabs");
    const tabEl = nav?.querySelector(`[data-tab="${activeTab}"]`);
    if (tabEl) tabEl.click();
  });
  return actor.sheet.render(true);
}

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
