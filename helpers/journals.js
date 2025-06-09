import { getPurviews } from "./actions.js";

export async function createPuviewsJournal() {
  const purviewList = await getPurviews();
  console.log("Purviews fetched:", purviewList);
}
