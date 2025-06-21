/** Knacks */
export async function getKnacks() {
  try {
    const pack = game.packs.get("scion-hero-foundry.knacks");

    if (!pack) {
      throw new Error("Purviews pack not found.");
    }

    const knackList = await pack.getDocuments();

    return knackList
      .map((item) => ({
        name: item.name,
        knacks: item.system.knacks,
      }))
      .filter(
        (knack, index, self) =>
          index === self.findIndex((p) => p.name === knack.name)
      );
  } catch (error) {
    console.error("Error fetching knacks:", error);
    ui.notifications.error("Failed to fetch knacks.");
    return [];
  }
}
