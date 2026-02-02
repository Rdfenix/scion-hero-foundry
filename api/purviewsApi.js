/** Puviews */
export async function getPurviews() {
  try {
    const pack = game.packs.get("scion-foundry-v2.purviews");
    if (!pack) throw new Error("Purviews pack not found.");

    const documents = await pack.getDocuments();

    const priorityList = ["PURVIEWS", "PANTHEON–SPECIFIC PURVIEWS"];

    const priorityMap = new Map(
      priorityList.map((name, index) => [name, index]),
    );

    // Remove duplicados pelo nome usando Map
    const purviewsMap = new Map();

    for (const doc of documents) {
      if (!purviewsMap.has(doc.name)) {
        purviewsMap.set(doc.name, {
          name: doc.name,
          description: doc.system?.description ?? "",
          purviews: doc.system?.purviews ?? [],
        });
      }
    }

    return Array.from(purviewsMap.values()).sort((a, b) => {
      const priorityA = priorityMap.get(a.name.toUpperCase());
      const priorityB = priorityMap.get(b.name.toUpperCase());

      if (priorityA !== undefined && priorityB !== undefined) {
        return priorityA - priorityB;
      }

      if (priorityA !== undefined) return -1;
      if (priorityB !== undefined) return 1;

      return a.name.localeCompare(b.name, "en", {
        sensitivity: "base",
        numeric: true,
      });
    });
  } catch (error) {
    console.error("Error fetching purviews:", error);
    ui.notifications.error("Failed to fetch purviews.");
    return [];
  }
}
