export const updateSoak = async (app) => {
  try {
    if (!app.actor?.isOwner) {
      ui.notifications.warn("You do not have permission to update this actor.");
      return;
    }
    
    const statmina = foundry.utils.getProperty(
      app.actor.system,
      "attributes.physical.stamina.value"
    );
    const epicStamina = foundry.utils.getProperty(
      app.actor.system,
      "epicAttributes.physical.stamina.value"
    );
    const Bashing = Math.max(0, statmina + epicStamina) || 0;
    const Lethal = Math.max(0, Math.ceil(statmina / 2) + epicStamina) || 0;
    const Aggravated = epicStamina || 0;

    const soak = {
      Bashing: { value: Bashing },
      Lethal: { value: Lethal },
      Aggravated: { value: Aggravated },
    };

    await app.actor.update(
      {
        "system.combat.soak": soak,
      },
      { render: true }
    );
  } catch (error) {
    console.error("Error updating Soak:", error);
    ui.notifications.error("Failed to update Soak.");
  }
};
