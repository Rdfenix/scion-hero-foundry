export class ScionCombatWheel {
  static get ID() {
    return game.system.id;
  }

  static get imagePaths() {
    const root = `systems/${this.ID}/assets/png`;
    return {
      wheel: `${root}/combat-wheel.png`,
      token: `${root}/time_token.png`,
    };
  }

  static CONFIG = {
    wheelSize: 1910,
    tokenSize: 320,
    radius: 822,
    startAngle: -67.5,
    totalTicks: 8,
  };

  /**
   * Remove todos os elementos da roda da cena atual
   */
  static async clearWheel() {
    const ids = canvas.scene.tiles.filter(t => t.getFlag(this.ID, 'type')).map(t => t.id);

    if (ids.length > 0) {
      await canvas.scene.deleteEmbeddedDocuments('Tile', ids);
      ui.notifications.info('Roda de combate removida.');
    }
  }

  static async createWheel() {
    if (!canvas.scene) return ui.notifications.warn('Nenhuma cena ativa.');

    // Opcional: Limpa a roda existente antes de criar uma nova
    await this.clearWheel();

    const paths = this.imagePaths;
    const wheelData = {
      texture: { src: paths.wheel },
      width: this.CONFIG.wheelSize,
      height: this.CONFIG.wheelSize,
      x: canvas.dimensions.width / 2 - this.CONFIG.wheelSize / 2,
      y: canvas.dimensions.height / 2 - this.CONFIG.wheelSize / 2,
      z: 100,
      flags: { [this.ID]: { type: 'bg' } },
    };

    const startPos = this.getPositionForTick(0, wheelData.x, wheelData.y);

    const tokenData = {
      texture: { src: paths.token },
      width: this.CONFIG.tokenSize,
      height: this.CONFIG.tokenSize,
      x: startPos.x,
      y: startPos.y,
      z: 110,
      flags: { [this.ID]: { type: 'token', currentTick: 0 } },
    };

    await canvas.scene.createEmbeddedDocuments('Tile', [wheelData, tokenData]);
    ui.notifications.info('Roda de Combate criada!');
  }

  static async moveToken(tickIndex) {
    const tokenTile = canvas.scene.tiles.find(t => t.getFlag(this.ID, 'type') === 'token');
    const bgTile = canvas.scene.tiles.find(t => t.getFlag(this.ID, 'type') === 'bg');

    if (!tokenTile || !bgTile) return ui.notifications.warn('Roda não encontrada na cena.');

    let normalizedTick = tickIndex % this.CONFIG.totalTicks;
    if (normalizedTick < 0) normalizedTick = this.CONFIG.totalTicks + normalizedTick;

    const newPos = this.getPositionForTick(normalizedTick, bgTile.x, bgTile.y);

    await tokenTile.update(
      {
        x: newPos.x,
        y: newPos.y,
        [`flags.${this.ID}.currentTick`]: normalizedTick,
      },
      {
        animate: true,
        animation: {
          duration: 700, // Tempo em milissegundos (700ms é um deslize elegante)
          easing: 'easeInOutSine', // Começa devagar, acelera e termina devagar
        },
      }
    );
  }

  static async advance(steps = 1) {
    const tokenTile = canvas.scene.tiles.find(t => t.getFlag(this.ID, 'type') === 'token');
    if (!tokenTile) return ui.notifications.warn('Crie a roda primeiro!');

    const currentTick = tokenTile.getFlag(this.ID, 'currentTick') || 0;
    await this.moveToken(currentTick + steps);
  }

  static getPositionForTick(tick, bgX, bgY) {
    let centerX = bgX + this.CONFIG.wheelSize / 2;
    const centerY = bgY + this.CONFIG.wheelSize / 2;

    // Se a posição 1 está ficando "atrasada" ou "passando",
    // podemos ajustar o multiplicador de graus.
    const degreesPerTick = 360 / this.CONFIG.totalTicks;

    // Calculamos o ângulo base
    let angle = this.CONFIG.startAngle + tick * degreesPerTick;

    const tickAdjustments = new Map([
      [1, { angleOffset: -6, xOffset: 52 }],
      [5, { angleOffset: 0, xOffset: -52 }],
      [6, { angleOffset: 5.3, xOffset: -52 }],
      [7, { angleOffset: -3, xOffset: 2 }],
    ]);

    // --- AJUSTE MANUAL DE COMPENSAÇÃO ---
    const adjustment = tickAdjustments.get(tick);
    if (adjustment) {
      angle += adjustment.angleOffset || 0;
      centerX += adjustment.xOffset || 0;
    }
    // ------------------------------------

    const angleRad = angle * (Math.PI / 180);

    const targetCenterX = centerX + this.CONFIG.radius * Math.cos(angleRad);
    const targetCenterY = centerY + this.CONFIG.radius * Math.sin(angleRad);

    return {
      x: targetCenterX - this.CONFIG.tokenSize / 2,
      y: targetCenterY - this.CONFIG.tokenSize / 2,
    };
  }
}
