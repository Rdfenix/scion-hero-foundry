export const ScionHeroActorBaseDefault = {
  attributes: {
    physical: {
      strength: { value: 1, max: 10, min: 1 },
      dexterity: { value: 1, max: 10, min: 1 },
      stamina: { value: 1, max: 10, min: 1 },
    },
    social: {
      charisma: { value: 1, max: 10, min: 1 },
      manipulation: { value: 1, max: 10, min: 1 },
      appearance: { value: 1, max: 10, min: 1 },
    },
    mental: {
      intelligence: { value: 1, max: 10, min: 1 },
      perception: { value: 1, max: 10, min: 1 },
      wits: { value: 1, max: 10, min: 1 },
    },
  },
  epicAttributes: {
    physical: {
      strength: { value: 0, max: 10, min: 1 },
      dexterity: { value: 0, max: 10, min: 1 },
      stamina: { value: 0, max: 10, min: 1 },
    },
    social: {
      charisma: { value: 0, max: 10, min: 1 },
      manipulation: { value: 0, max: 10, min: 1 },
      appearance: { value: 0, max: 10, min: 1 },
    },
    mental: {
      intelligence: { value: 0, max: 10, min: 1 },
      perception: { value: 0, max: 10, min: 1 },
      wits: { value: 0, max: 10, min: 1 },
    },
  },
  abilities: {
    academics: { value: 0, max: 5, min: 1, favored: false },
    animalKen: { value: 0, max: 5, min: 1, favored: false },
    art: { value: 0, max: 5, min: 1, favored: false },
    athletics: { value: 0, max: 5, min: 1, favored: false },
    awareness: { value: 0, max: 5, min: 1, favored: false },
    brawl: { value: 0, max: 5, min: 1, favored: false },
    command: { value: 0, max: 5, min: 1, favored: false },
    control: { value: 0, max: 5, min: 1, favored: false },
    craft: { value: 0, max: 5, min: 1, favored: false },
    empathy: { value: 0, max: 5, min: 1, favored: false },
    fortitude: { value: 0, max: 5, min: 1, favored: false },
    integrity: { value: 0, max: 5, min: 1, favored: false },
    investigation: { value: 0, max: 5, min: 1, favored: false },
    larceny: { value: 0, max: 5, min: 1, favored: false },
    medicine: { value: 0, max: 5, min: 1, favored: false },
    marksmanship: { value: 0, max: 5, min: 1, favored: false },
    melee: { value: 0, max: 5, min: 1, favored: false },
    occult: { value: 0, max: 5, min: 1, favored: false },
    politics: { value: 0, max: 5, min: 1, favored: false },
    presence: { value: 0, max: 5, min: 1, favored: false },
    science: { value: 0, max: 5, min: 1, favored: false },
    stealth: { value: 0, max: 5, min: 1, favored: false },
    survival: { value: 0, max: 5, min: 1, favored: false },
    thrown: { value: 0, max: 5, min: 1, favored: false },
  },
  virtues: {},
  legend: { value: 2, max: 12, min: 1 },
  legendPoints: { value: 0, max: 48, min: 0 },
  willpower: { value: 0, max: 10, min: 1 },
  willpowerPoints: { value: 0, max: 10, min: 1 },
  birthrights: [],
  birthrightTypes: {
    0: {
      type: "Creature",
    },
    1: {
      type: "Followers",
    },
    2: {
      type: "Guide",
    },
    3: {
      type: "Relic",
    },
  },
  boons: [],
  knacks: [],
  weapons: [],
  combat: {
    dodgeDV: { value: 0 },
    parryDV: { value: 0 },
    soak: {
      Bashing: { value: 0 },
      Lethal: { value: 0 },
      Aggravated: { value: 0 },
    },
    armor: {
      name: "",
      Bashing: { value: 0 },
      Lethal: { value: 0 },
      Aggravated: { value: 0 },
    },
  },
  health: {
    value: 0,
    conditions: {
      Bruised: { value: 0 },
      Hurt: { value: -1 },
      Injured: { value: -1 },
      Wounded: { value: -2 },
      Maimed: { value: -2 },
      Crippled: { value: -4 },
      Incapacitated: { value: 0 },
    },
  },
};

const defaultBirthSchema = {
  name: "",
  description: "",
  level: { value: 0, min: 1, max: 5 },
  type: "",
};

export const birthrightSchema = {
  Creature: defaultBirthSchema,
  Followers: defaultBirthSchema,
  Guide: defaultBirthSchema,
  Relic: { ...defaultBirthSchema, boons: [] },
};

export const knackSchema = {
  name: "",
  description: "",
};

export const boonSchema = {
  name: "",
  level: "",
  dice_pool: "",
  cost: "",
  description: "",
};

export const weaponSchema = {
  name: "",
  attr: "",
  skill: "",
  speed: "",
  acc: "",
  defense: "",
  range: "",
  damage: "",
  damageAttr: "",
  type: "",
};

export const epicAttributeSuccesses = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 11,
  6: 16,
  7: 22,
  8: 29,
  9: 37,
  10: 46,
};
