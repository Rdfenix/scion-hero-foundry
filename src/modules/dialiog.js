import { createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import {
  callDamageAtkRoll,
  callRollAttrDice,
  callRollJoinBattle,
  callRollLegendDice,
  callRollSkillDice,
  callRollWeaponDice,
  callRollWillpowerDice,
} from "./rolldice";
import { getDeities } from "./../api/deitiesApi";

import { mountDeities } from "./mountDeities";
import { mountGodsList, mountFavoritiesSkills } from "../utils/utils";
import { customLocalizeWord } from "../utils/i18n";

import DifficultyDialog from "./components/DifficultyDialog";
import Pantheon from "./components/Pantheon";
import Gods from "./components/Gods";

const DIFFICULTY_HANDLERS = {
  attribute: callRollAttrDice,
  willpower: callRollWillpowerDice,
  legend: callRollLegendDice,
  ability: callRollSkillDice,
  attack: callRollWeaponDice,
  damage: callDamageAtkRoll,
  battle: callRollJoinBattle,
};

const DIALOG_CONFIG = {
  attribute: {
    showExtraDices: true,
  },
  ability: {
    showAttribute: true,
    showExtraDices: true,
  },
  attack: {
    showMultipleAttack: true,
    showExtraDices: true,
  },
  damage: {
    showExtraDices: true,
  },
  legend: {},
  willpower: {},
  battle: {},
};

const mountResponseAttrValues = (actor, { type, key }) => {
  const attributes = actor?.system?.attributes;
  const epicAttributes = actor?.system?.epicAttributes;

  const getValue = (data) => {
    const attribute = data?.[type]?.[key];

    return Number(attribute?.value ?? 0);
  };

  return {
    attrValue: getValue(attributes),
    epicAttrValue: getValue(epicAttributes),
  };
};

export const callDifficultyDialog = async (actor, options = {}) => {
  const { type, data = {} } = options;

  let rollHandler = null;

  if (Object.hasOwn(DIFFICULTY_HANDLERS, type)) {
    rollHandler = DIFFICULTY_HANDLERS[type];
  }

  if (!rollHandler) {
    ui.notifications.error(`Unknown difficulty type: ${type}`);
    return null;
  }

  const attrKeys = actor?.system?.attrKeys || [];

  const context = {
    ...DIALOG_CONFIG[type],
    ...data,
    attrKeys,
  };

  return new Promise((resolve) => {
    let reactRoot;
    let settled = false;

    const finish = (value) => {
      if (settled) return;

      settled = true;
      reactRoot?.unmount();
      resolve(value);
    };

    const dialogRef = createRef();

    const dialog = new foundry.applications.api.DialogV2({
      classes: ["difficulty-dialog"],
      content: `<div class="difficulty-dialog-react"></div>`,
      buttons: [
        {
          action: "set",
          label: "Set",
          icon: '<i class="fas fa-check"></i>',
          class: "set-difficulty",
          default: true,

          callback: async () => {
            try {
              const values = dialogRef.current?.getValues();

              if (!values) {
                throw new Error(
                  "Não foi possível obter os valores do diálogo.",
                );
              }

              const rollData = {
                ...data,
                ...values,
              };

              const result = await rollHandler(actor, rollData);
              finish(result ?? null);
            } catch (err) {
              ui.notifications.error(err.message);
            }
          },
        },
        {
          action: "cancel",
          label: "Cancel",
          icon: '<i class="fas fa-times"></i>',
          class: "set-difficulty-cancel",
          callback: () => finish(null),
        },
      ],
    });

    dialog.render({ force: true }).then(() => {
      const mountPoint = dialog.element?.querySelector(
        ".difficulty-dialog-react",
      );

      if (!mountPoint) {
        finish(null);
      }

      reactRoot = createRoot(mountPoint);

      reactRoot.render(
        createElement(DifficultyDialog, {
          ref: dialogRef,
          ...context,
        }),
      );
    });
  });
};

export const selectPantheonDialog = async (actor) => {
  try {
    const { deities, pantheons } = await mountDeities();

    if (pantheons.length === 0) {
      throw new Error("Nenhuma divindade encontrada no pacote.");
    }

    return new Promise((resolve) => {
      let reactRoot;
      let settled = false;

      const finish = (value) => {
        if (settled) {
          return;
        }

        settled = true;
        reactRoot?.unmount();
        resolve(value);
      };

      const dialogRef = createRef();

      const dialog = new foundry.applications.api.DialogV2({
        classes: ["pantheon-dialog"],
        content: `<div class="pantheon-dialog-react"></div>`,
        buttons: [
          {
            action: "select",
            label: "Select",
            icon: '<i class="fas fa-check"></i>',
            class: "pantheon-select",
            default: true,

            callback: async () => {
              try {
                const values = dialogRef.current?.getValues();

                if (!values) {
                  throw new Error(
                    "Não foi possível obter os valores do diálogo.",
                  );
                }

                const { pantheonName } = values;

                if (!pantheonName) {
                  return ui.notifications.warn("Choose a pantheon first");
                }

                const selectedPantheon = pantheons.find(
                  (pantheon) => pantheon.name === pantheonName,
                );

                if (!selectedPantheon) {
                  return ui.notifications.warn("Pantheon not found");
                }

                let gods =
                  deities.find(
                    (pantheon) => pantheon.name === selectedPantheon.name,
                  )?.system?.deities ?? [];

                gods = await mountGodsList(gods);

                const updatedAbilities = await mountFavoritiesSkills(
                  gods[0],
                  actor,
                );

                const virtues = Object.entries(selectedPantheon.virtues).reduce(
                  (accumulator, [key, virtue]) => {
                    accumulator[key] = {
                      ...virtue,
                      name: customLocalizeWord(virtue.name, "VIRTUES"),
                    };

                    return accumulator;
                  },
                  {},
                );

                const result = {
                  "system.abilities": updatedAbilities,
                  "system.pantheon": {
                    name: selectedPantheon.name,
                    logo: selectedPantheon.logo,
                    god: gods[0].name,
                  },
                  "system.virtues": virtues,
                };
                finish(result ?? null);
              } catch (err) {
                ui.notifications.error(err.message);
              }
            },
          },
          {
            action: "cancel",
            label: "Cancel",
            icon: '<i class="fas fa-times"></i>',
            class: "set-difficulty-cancel",
            callback: () => finish(null),
          },
        ],
      });

      dialog.render({ force: true }).then(() => {
        const mountPoint = dialog.element?.querySelector(
          ".pantheon-dialog-react",
        );

        if (!mountPoint) {
          finish(null);
        }

        reactRoot = createRoot(mountPoint);

        reactRoot.render(
          createElement(Pantheon, {
            ref: dialogRef,
            pantheons,
          }),
        );
      });
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
};

export const selectGodDialog = async (actor) => {
  try {
    const pantheon = actor.system.pantheon?.name;
    const deities = await getDeities();
    let gods = deities.find((p) => p.name === pantheon)?.system.deities || [];
    gods = await mountGodsList(gods);

    return new Promise((resolve) => {
      let reactRoot;
      let settled = false;

      const finish = (value) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(value);
        reactRoot?.unmount();
      };

      const dialogRef = createRef();

      const dialog = new foundry.applications.api.DialogV2({
        classes: ["pantheon-dialog"],
        content: `<div class="god-dialog-react"></div>`,
        buttons: [
          {
            action: "select",
            label: "Select",
            icon: '<i class="fas fa-check"></i>',
            class: "pantheon-select",
            default: true,
            callback: async () => {
              const values = dialogRef.current?.getValues();

              if (!values) {
                throw new Error(
                  "Não foi possível obter os valores do diálogo.",
                );
              }

              const { god: godSelected } = values;

              if (!godSelected) {
                return ui.notifications.warn("Choose a god first");
              }

              const deityPantheon = gods.find((p) => p.name === godSelected);

              if (!deityPantheon) {
                return ui.notifications.warn("God not found");
              }

              const updatedAbilities = await mountFavoritiesSkills(
                deityPantheon,
                actor,
              );

              const data = {
                "system.abilities": updatedAbilities,
                "system.pantheon": {
                  god: deityPantheon.name,
                },
              };

              finish(data ?? null);
            },
          },
          {
            action: "cancel",
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            class: "pantheon-cancel",
            callback: () => finish(null),
          },
        ],
      });

      dialog.render({ force: true }).then(() => {
        const mountPoint = dialog.element?.querySelector(".god-dialog-react");

        if (!mountPoint) {
          finish(null);
        }

        reactRoot = createRoot(mountPoint);

        reactRoot.render(
          createElement(Gods, {
            ref: dialogRef,
            gods,
          }),
        );
      });
    });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
};
