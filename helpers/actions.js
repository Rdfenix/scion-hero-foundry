export async function _onAction(event) {
  event.preventDefault();
  event.stopPropagation();
  console.log("Ação acionada:", event.currentTarget.dataset.action);

  switch (event.currentTarget.dataset.action) {
    case "select-pantheon":
      await selectPantheon();
      break;
    default:
      console.warn("Ação não reconhecida:", event.currentTarget.dataset.action);
      break;
  }
}

const selectPantheon = async () => {
  try {
    for (const [key, value] of game.packs.entries()) {
      console.log(key, value.documentName, value.metadata);
    }
    const pack = game.packs.get("scion-hero-foundry.deities");
    if (!pack) {
      throw new Error("Pacote de panteões não encontrado.");
    }

    const deities = await pack.getDocuments();
    console.log("Divindades encontradas no pacote:", deities);

    const pantheons = deities
      .map((deity) => ({
        name: deity.name,
        logo: deity.img,
        description: deity.system.description,
        virtues: deity.system.virtues,
      }))
      .filter((pantheon, index, self) =>
        index === self.findIndex((p) => p.name === pantheon.name)
      );

    console.log("Panteões disponíveis:", pantheons);

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
          title: "Selecione um Panteão",
          content,
          buttons: {
            select: {
              icon: '<i class="fas fa-check"></i>',
              label: "Selecionar",
              class: "pantheon-select",
              callback: (html) => {
                console.log("Botão de seleção clicado");
              },
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancelar",
              class: "pantheon-cancel",
              callback: () => resolve(null),
            },
          },
          default: "select",
          render: (html) =>
            console.log("Diálogo de seleção de panteão renderizado"),
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
