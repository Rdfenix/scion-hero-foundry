export async function getDeities() {
  try {
    const pack = game.packs.get("scion-hero-foundry.deities");

    if (!pack) {
      throw new Error("Pantheon pack not found.");
    }

    const deities = await pack.getDocuments();

    return deities;
  } catch (error) {
    console.error("Error fetching deities:", error);
    ui.notifications.error("Failed to fetch deities.");
    return [];
  }
}
