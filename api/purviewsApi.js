/** Puviews */
export async function getPurviews() {
  try {
    const pack = game.packs.get("scion-hero-foundry.purviews");

    if (!pack) {
      throw new Error("Purviews pack not found.");
    }

    const purviews = await pack.getDocuments();
    const priorities = ["PURVIEWS", "PANTHEON–SPECIFIC PURVIEWS"];

    return purviews
      .map((purview) => ({
        name: purview.name,
        description: purview.system.description,
        purviews: purview.system.purviews,
      }))
      .filter(
        (purview, index, self) =>
          index === self.findIndex((p) => p.name === purview.name)
      )
      .sort((a, b) => {
        const priorityA = priorities.indexOf(a.name.toUpperCase());
        const priorityB = priorities.indexOf(b.name.toUpperCase());

        if (priorityA === -1 && priorityB === -1) {
          return a.name.localeCompare(b.name);
        } else if (priorityA === -1) {
          return 1; // b comes first
        } else if (priorityB === -1) {
          return -1; // a comes first
        } else {
          return priorityA - priorityB; // both are in the priorities array
        }
      });
  } catch (error) {
    console.error("Error fetching purviews:", error);
    ui.notifications.error("Failed to fetch purviews.");
    return [];
  }
}
