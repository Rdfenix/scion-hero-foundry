export async function _onAction(event, actor) {
  event.preventDefault();
  event.stopPropagation();
  console.log("Ação acionada:", event.currentTarget.dataset.action);

  switch (event.currentTarget.dataset.action) {
    case "select-pantheon":
      await selectPantheon(actor);
      break;
    case "select-god":
      await selectGod(actor);
      break;
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

function reopenWithActiveTab(actor, tabName) {
  Hooks.once("renderActorSheet", (app, html, data) => {
    const nav = html[0].querySelector(".sheet-tabs");
    const tabEl = nav?.querySelector(`[data-tab="${tabName}"]`);
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

    const content = await renderTemplate(
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

                const activeTab =
                  document.querySelector(".sheet-tabs .item.active")?.dataset
                    .tab ?? "stats";

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

                await reopenWithActiveTab(actor, activeTab);
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
            console.log("Diálogo de seleção de panteão renderizado");
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

    const content = await renderTemplate(
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

                console.log("Deus selecionado:", godSelected);
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

                const activeTab =
                  document.querySelector(".sheet-tabs .item.active")?.dataset
                    .tab ?? "stats";

                await actor.update({
                  "system.abilities": updatedAbilities,
                  "system.pantheon": {
                    god: deityPantheon.name,
                  },
                });

                await reopenWithActiveTab(actor, activeTab);
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
            console.log("Diálogo de seleção de panteão renderizado");
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
