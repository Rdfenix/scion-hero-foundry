import { reopenWithActiveTab } from "./reopenWithActiveTab.js";
import { getDeities } from "../api/deitiesApi.js";
import { callRollSkillDice } from "./rollDice.js";

const mountGodsList = async (gods) =>
  gods.map((god) => ({
    name: god.name,
    favoredSkills: (god.favoredSkills || []).reduce((obj, skill, idx) => {
      obj[idx] = skill;
      return obj;
    }, {}),
  }));

const mountFavoritiesSkills = async (deityPantheon, actor) => {
  const abilities = foundry.utils.getProperty(actor.system, "abilities");
  const favoredSkillsArr = Object.values(deityPantheon.favoredSkills);
  const updatedAbilities = {};

  for (const [key, value] of Object.entries(abilities)) {
    updatedAbilities[key] = {
      ...value,
      favored: favoredSkillsArr.includes(key),
    };
  }

  return updatedAbilities;
};

export const selectPantheon = async (actor) => {
  try {
    const deities = await getDeities();

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
      new foundry.applications.api.DialogV2({
        classes: ["pantheon-dialog"],
        window: {},
        content,
        buttons: [
          {
            action: "select",
            label: "Select",
            icon: '<i class="fas fa-check"></i>',
            class: "pantheon-select",
            default: true,
            callback: async (event, button, dialog) => {
              const pantheonSelected = $(dialog.element)
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

              let gods =
                deities.find((p) => p.name === selectedPantheon.name)?.system
                  .deities || [];

              gods = await mountGodsList(gods);

              const updatedAbilities = await mountFavoritiesSkills(
                gods[0],
                actor
              );

              await actor.update({
                "system.pantheon": {
                  name: selectedPantheon.name,
                  logo: selectedPantheon.logo,
                },
                "system.virtues": null,
              });

              await actor.update({
                "system.abilities": updatedAbilities,
                "system.pantheon": {
                  god: gods[0].name,
                },
              });

              await actor.update({
                "system.virtues": selectedPantheon.virtues,
              });

              await reopenWithActiveTab(actor);
            },
          },
          {
            action: "cancel",
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            class: "pantheon-cancel",
            callback: () => resolve(null),
          },
        ],
        render: (html) => {
          console.log(html);
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
      }).render({ force: true });
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
};

export const selectGod = async (actor) => {
  try {
    const pantheon = actor.system.pantheon?.name;

    const deities = await getDeities();

    let gods = deities.find((p) => p.name === pantheon)?.system.deities || [];

    gods = await mountGodsList(gods);

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/actors/dialogs/gods.html",
      { gods }
    );

    return new Promise((resolve) => {
      new foundry.applications.api.DialogV2({
        classes: ["pantheon-dialog"],
        window: {},
        content,
        buttons: [
          {
            action: "select",
            label: "Select",
            icon: '<i class="fas fa-check"></i>',
            class: "pantheon-select",
            default: true,
            callback: async (event, button, dialog) => {
              const godSelected = $(dialog.element)
                .find('input[name="pantheon-option"]:checked')
                .val();

              if (!godSelected) {
                return ui.notifications.warn("Choose a god first");
              }
              const deityPantheon = gods.find((p) => p.name === godSelected);

              if (!deityPantheon) {
                return ui.notifications.warn("God not found");
              }

              const updatedAbilities = await mountFavoritiesSkills(
                deityPantheon,
                actor
              );

              await actor.update({
                "system.abilities": updatedAbilities,
                "system.pantheon": {
                  god: deityPantheon.name,
                },
              });

              await reopenWithActiveTab(actor);
            },
          },
          {
            action: "cancel",
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            class: "pantheon-cancel",
            callback: () => resolve(null),
          },
        ],
        render: (html) => {
          console.log(html);
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
      }).render({ force: true });
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
};

export const callDialogRollSkillDice = async (actor, event) => {
  try {
    const key = event.currentTarget.dataset.key;
    const abilities = foundry.utils.getProperty(actor.system, "abilities");
    const attrKeys = Object.values(
      foundry.utils.getProperty(actor.system, "attributes") || {}
    ).flatMap((group) => Object.keys(group));
    const skillValue = abilities[key]?.value ?? 0;

    const data = {
      attrKeys,
    };

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/actors/dialogs/choose-attr.html",
      { data }
    );

    return new Promise(async (resolve) => {
      new foundry.applications.api.DialogV2({
        classes: ["roll-skill-dialog"],
        window: {},
        content,
        buttons: [
          {
            action: "roll",
            label: "Roll",
            icon: '<i class="fas fa-dice"></i>',
            class: "roll-skill",
            default: true,
            callback: async (event, button, dialog) => {
              const attrSelected = $(dialog.element)
                .find('select[name="attr-dice-roll"]')
                .val();

              if (!attrSelected) {
                return ui.notifications.warn("Choose an attribute first");
              }

              const attr = foundry.utils.getProperty(
                actor.system,
                "attributes"
              );
              const epicAttr = foundry.utils.getProperty(
                actor.system,
                "epicAttributes"
              );

              let attrValue = 0;
              let epicAttrValue = 0;

              for (const [groupName, group] of Object.entries(attr)) {
                if (group[attrSelected]) {
                  attrValue = group[attrSelected].value;
                  break;
                }
              }

              for (const [groupName, group] of Object.entries(epicAttr)) {
                if (group[attrSelected]) {
                  epicAttrValue = group[attrSelected].value;
                  break;
                }
              }

              await callRollSkillDice(actor, {
                skillName: key,
                skillValue,
                attr: attrSelected,
                attrValue,
                epicAttrValue,
              });

              resolve();
            },
          },
          {
            action: "cancel",
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            class: "roll-skill-cancel",
            callback: () => resolve(null),
          },
        ],
        render: (html) => {
          console.log(html);
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
      }).render({ force: true });
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};

export const callDialogRollWeaponDice = async (actor, event) => {
  try {
    const weaponId = event.currentTarget.dataset.weaponId;

    if (!weaponId) {
      return ui.notifications.error("WeaponId not found.");
    }

    const weapons = foundry.utils.getProperty(actor.system, "weapons");

    const weapon = weapons.find((w) => w._id === weaponId);

    if (!weapon) {
      return ui.notifications.error("Weapon not found.");
    }

    const data = {
      weapon,
    };

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/scion-hero-foundry/templates/actors/dialogs/weapon-atk.html",
      { data }
    );

    return new Promise((resolve) => {
      new foundry.applications.api.DialogV2({
        classes: ["weapon-dialog"],
        window: {},
        content,
        buttons: [
          {
            action: "roll",
            label: "Roll",
            icon: '<i class="fas fa-dice"></i>',
            class: "roll-weapon",
            default: true,
            callback: async (event, button, dialog) => {
              // Implement the roll logic here
              resolve();
            },
          },
          {
            action: "cancel",
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            class: "roll-weapon-cancel",
            callback: () => resolve(null),
          },
        ],
        render: (html) => {
          console.log(html);
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
      }).render({ force: true });
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
  }
};
