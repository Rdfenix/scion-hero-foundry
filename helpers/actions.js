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

    const pantheon = deities.map((deity) => ({
      name: deity.name,
      logo: deity.img,
      description: deity.system.description,
      virtues: deity.system.virtues,
    }));

    console.log("Panteões disponíveis:", pantheon);

    if (pantheon.length === 0) {
      throw new Error("Nenhuma divindade encontrada no pacote.");
    }

    // return new Promise((resolve) => {
    //   new Dialog({
    //     title: "Selecione um Panteão",
    //     content: `
    //       <form>
    //         <div class="form-group">
    //           <select name="deity" id="deity-select">
    //             ${deities.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
    //           </select>
    //         </div>
    //       </form>
    //     `,
    //     buttons: {
    //       select: {
    //         icon: '<i class="fas fa-check"></i>',
    //         label: "Selecionar",
    //         callback: (html) => {
    //           const selectedId = html.find('#deity-select').val();
    //           const selectedDeity = deities.find(d => d.id === selectedId);
    //           if (selectedDeity) {
    //             console.log("Divindade selecionada:", selectedDeity);
    //             resolve(selectedDeity);
    //           }
    //         }
    //       },
    //       cancel: {
    //         icon: '<i class="fas fa-times"></i>',
    //         label: "Cancelar",
    //         callback: () => resolve(null)
    //       }
    //     },
    //     default: "select",
    //     render: (html) => console.log("Diálogo de seleção de panteão renderizado"),
    //     close: () => resolve(null)
    //   }).render(true);
    // });
  } catch (error) {
    console.error(error.message);
    ui.notifications.error(error.message);
    return null;
  }
};
