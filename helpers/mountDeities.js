import { getDeities } from '../api/deitiesApi.js';

export async function mountDeities() {
  try {
    const deities = await getDeities();
    return {
      deities,
      pantheons: [
        ...new Map(
          deities.map(deity => {
            const virtues = Object.fromEntries(
              deity.system.virtues.map((virtue, index) => [
                `virtue_${index + 1}`,
                {
                  name: virtue.name,
                  value: 1,
                  min: virtue.min,
                  max: virtue.max,
                },
              ])
            );

            return [
              deity.name,
              {
                name: deity.name,
                logo: deity.img,
                description: deity.system.description,
                virtues,
              },
            ];
          })
        ).values(),
      ],
    };
  } catch (error) {
    console.error('Error mounting deities:', error);
    ui.notifications.error('Failed to mount deities.');
  }
}
