/** Knacks */
export async function getKnacks() {
  try {
    const pack = game.packs.get("scion-hero-foundry.knacks");
    if (!pack) throw new Error("Knacks pack not found.");

    return Array.from(
      new Map(
        (await pack.getDocuments()).map((doc) => [
          doc.name,
          {
            name: doc.name,
            knacks: doc.system?.knacks ?? [],
          },
        ]),
      ).values(),
    );
  } catch (error) {
    console.error("Error fetching knacks:", error);
    ui.notifications.error("Failed to fetch knacks.");
    return [];
  }
}
