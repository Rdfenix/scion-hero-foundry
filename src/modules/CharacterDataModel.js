const {
  SchemaField,
  NumberField,
  StringField,
  BooleanField,
  ArrayField,
  ObjectField,
} = foundry.data.fields;

export class CharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    // Helper para atalhos com valor, max e min
    const createStat = (initialVal = 1, initialMax = 10, initialMin = 1) =>
      new SchemaField({
        value: new NumberField({
          required: true,
          nullable: false,
          initial: initialVal,
          integer: true,
        }),
        max: new NumberField({
          required: true,
          nullable: false,
          initial: initialMax,
          integer: true,
        }),
        min: new NumberField({
          required: true,
          nullable: false,
          initial: initialMin,
          integer: true,
        }),
      });

    // Helper para habilidades
    const createAbility = () =>
      new SchemaField({
        value: new NumberField({
          required: true,
          nullable: false,
          initial: 0,
          integer: true,
        }),
        max: new NumberField({
          required: true,
          nullable: false,
          initial: 5,
          integer: true,
        }),
        min: new NumberField({
          required: true,
          nullable: false,
          initial: 1,
          integer: true,
        }),
        favored: new BooleanField({ initial: false }),
      });

    return {
      attributes: new SchemaField({
        physical: new SchemaField({
          strength: createStat(1, 10, 1),
          dexterity: createStat(1, 10, 1),
          stamina: createStat(1, 10, 1),
        }),
        social: new SchemaField({
          charisma: createStat(1, 10, 1),
          manipulation: createStat(1, 10, 1),
          appearance: createStat(1, 10, 1),
        }),
        mental: new SchemaField({
          intelligence: createStat(1, 10, 1),
          perception: createStat(1, 10, 1),
          wits: createStat(1, 10, 1),
        }),
      }),
      epicAttributes: new SchemaField({
        physical: new SchemaField({
          strength: createStat(0, 10, 1),
          dexterity: createStat(0, 10, 1),
          stamina: createStat(0, 10, 1),
        }),
        social: new SchemaField({
          charisma: createStat(0, 10, 1),
          manipulation: createStat(0, 10, 1),
          appearance: createStat(0, 10, 1),
        }),
        mental: new SchemaField({
          intelligence: createStat(0, 10, 1),
          perception: createStat(0, 10, 1),
          wits: createStat(0, 10, 1),
        }),
      }),
      abilities: new SchemaField({
        academics: createAbility(),
        animalKen: createAbility(),
        art: createAbility(),
        athletics: createAbility(),
        awareness: createAbility(),
        brawl: createAbility(),
        command: createAbility(),
        control: createAbility(),
        craft: createAbility(),
        empathy: createAbility(),
        fortitude: createAbility(),
        integrity: createAbility(),
        investigation: createAbility(),
        larceny: createAbility(),
        medicine: createAbility(),
        marksmanship: createAbility(),
        melee: createAbility(),
        occult: createAbility(),
        politics: createAbility(),
        presence: createAbility(),
        science: createAbility(),
        stealth: createAbility(),
        survival: createAbility(),
        thrown: createAbility(),
      }),
      virtues: new SchemaField({
        virtue_1: new SchemaField({
          name: new StringField({ initial: "" }),
          value: new NumberField({ initial: 1 }),
          min: new NumberField({ initial: 1 }),
          max: new NumberField({ initial: 5 }),
        }),
        virtue_2: new SchemaField({
          name: new StringField({ initial: "" }),
          value: new NumberField({ initial: 1 }),
          min: new NumberField({ initial: 1 }),
          max: new NumberField({ initial: 5 }),
        }),
        virtue_3: new SchemaField({
          name: new StringField({ initial: "" }),
          value: new NumberField({ initial: 1 }),
          min: new NumberField({ initial: 1 }),
          max: new NumberField({ initial: 5 }),
        }),
        virtue_4: new SchemaField({
          name: new StringField({ initial: "" }),
          value: new NumberField({ initial: 1 }),
          min: new NumberField({ initial: 1 }),
          max: new NumberField({ initial: 5 }),
        }),
      }),
      legend: createStat(2, 12, 1),
      legendPoints: createStat(0, 48, 0),
      willpower: createStat(0, 10, 1),
      willpowerPoints: createStat(0, 10, 1),
      birthrights: new ArrayField(new ObjectField()),
      birthrightTypes: new ObjectField({
        initial: {
          0: { type: "Creature" },
          1: { type: "Followers" },
          2: { type: "Guide" },
          3: { type: "Relic" },
        },
      }),
      boons: new ArrayField(new ObjectField()),
      knacks: new ArrayField(new ObjectField()),
      weapons: new ArrayField(new ObjectField()),
      combat: new SchemaField({
        dodgeDV: new SchemaField({ value: new StringField({ initial: "0" }) }),
        parryDV: new SchemaField({ value: new StringField({ initial: "0" }) }),
        soak: new SchemaField({
          Bashing: new SchemaField({
            value: new StringField({ initial: "0" }),
          }),
          Lethal: new SchemaField({ value: new StringField({ initial: "0" }) }),
          Aggravated: new SchemaField({
            value: new StringField({ initial: "0" }),
          }),
        }),
        armor: new SchemaField({
          name: new SchemaField({ value: new StringField({ initial: "" }) }),
          Bashing: new SchemaField({
            value: new StringField({ initial: "0" }),
          }),
          Lethal: new SchemaField({ value: new StringField({ initial: "0" }) }),
          Aggravated: new SchemaField({
            value: new NumberField({ initial: 0 }),
          }),
        }),
      }),
      health: new SchemaField({
        value: new NumberField({ initial: 0 }),
        conditions: new SchemaField({
          Bruised: new SchemaField({
            value: new NumberField({ initial: 0 }),
            damageType: new StringField({ initial: "" }),
          }),
          Hurt: new SchemaField({
            value: new NumberField({ initial: -1 }),
            damageType: new StringField({ initial: "" }),
          }),
          Injured: new SchemaField({
            value: new NumberField({ initial: -1 }),
            damageType: new StringField({ initial: "" }),
          }),
          Wounded: new SchemaField({
            value: new NumberField({ initial: -2 }),
            damageType: new StringField({ initial: "" }),
          }),
          Maimed: new SchemaField({
            value: new NumberField({ initial: -2 }),
            damageType: new StringField({ initial: "" }),
          }),
          Crippled: new SchemaField({
            value: new NumberField({ initial: -4 }),
            damageType: new StringField({ initial: "" }),
          }),
          Incapacitated: new SchemaField({
            value: new NumberField({ initial: -4 }),
            damageType: new StringField({ initial: "" }),
          }),
        }),
      }),
      experience: new SchemaField({
        value: new NumberField({ initial: 0 }),
      }),
    };
  }
}
