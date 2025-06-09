import { getPurviews } from "./actions.js";

export async function createPuviewsJournal() {
  const result = await getPurviews();
  console.log("Purviews fetched:", result);
}
