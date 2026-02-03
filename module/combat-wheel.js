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

  static async moveToken(tickIndex) {
    const tokenTile = canvas.scene.tiles.find(t => t.getFlag(this.ID, 'type') === 'token');
    const bgTile = canvas.scene.tiles.find(t => t.getFlag(this.ID, 'type') === 'bg');

    if (!tokenTile || !bgTile) return ui.notifications.warn('Roda não encontrada.');

    // 1. Calcular Ticks (Origem e Destino)
    const oldTick = tokenTile.getFlag(this.ID, 'currentTick') || 0;
    const newTick = tickIndex; // Mantemos o valor real para o cálculo de distância

    const normalizedNewTick =
      ((newTick % this.CONFIG.totalTicks) + this.CONFIG.totalTicks) % this.CONFIG.totalTicks;

    // 2. Definir a animação orbital
    const duration = 600;
    const name = `ScionWheel.${tokenTile.id}`;

    // Função que roda a cada frame do navegador
    const ontick = (dt, { progress }) => {
      // Interpola o "tick" atual (ex: de 0 para 1, passa por 0.1, 0.2...)
      const currentInterpolatedTick = oldTick + (newTick - oldTick) * progress;

      // Pega as coordenadas X e Y para esse micro-momento do ângulo
      const pos = this.getPositionForTick(currentInterpolatedTick, bgTile.x, bgTile.y);

      // Move o visual (mesh)
      if (tokenTile.mesh) {
        tokenTile.mesh.x = pos.x;
        tokenTile.mesh.y = pos.y;
      }
    };

    // 3. Executar a animação de arco
    await foundry.canvas.animation.CanvasAnimation.animate([], {
      name,
      duration,
      ontick,
      easing: 'easeInOutSine',
    });

    // 4. Salvar posição final no banco de dados
    const finalPos = this.getPositionForTick(normalizedNewTick, bgTile.x, bgTile.y);
    return tokenTile.update(
      {
        x: finalPos.x,
        y: finalPos.y,
        [`flags.${this.ID}.currentTick`]: normalizedNewTick,
      },
      { animate: false }
    );
  }

  static getPositionForTick(tick, bgX, bgY) {
    let centerX = bgX + this.CONFIG.wheelSize / 2;
    const centerY = bgY + this.CONFIG.wheelSize / 2;
    const degreesPerTick = 360 / this.CONFIG.totalTicks;

    let angle = this.CONFIG.startAngle + tick * degreesPerTick;

    // Ajustes de compensação (usamos um cálculo simplificado para o arco)
    // Para animação suave, o ajuste ideal seria interpolado, mas manteremos o seu Map:
    const tickFloor = Math.floor(((tick % 8) + 8) % 8);
    const tickAdjustments = new Map([
      [1, { angleOffset: -6, xOffset: 52 }],
      [5, { angleOffset: 0, xOffset: -52 }],
      [6, { angleOffset: 5.3, xOffset: -52 }],
      [7, { angleOffset: -3, xOffset: 2 }],
    ]);

    const adjustment = tickAdjustments.get(tickFloor);
    if (adjustment) {
      angle += adjustment.angleOffset || 0;
      centerX += adjustment.xOffset || 0;
    }

    const angleRad = angle * (Math.PI / 180);
    const targetCenterX = centerX + this.CONFIG.radius * Math.cos(angleRad);
    const targetCenterY = centerY + this.CONFIG.radius * Math.sin(angleRad);

    return {
      x: targetCenterX - this.CONFIG.tokenSize / 2,
      y: targetCenterY - this.CONFIG.tokenSize / 2,
    };
  }

  // --- Métodos de utilidade mantidos ---
  static async advance(steps = 1) {
    const tokenTile = canvas.scene.tiles.find(t => t.getFlag(this.ID, 'type') === 'token');
    if (!tokenTile) return;
    const current = tokenTile.getFlag(this.ID, 'currentTick') || 0;
    await this.moveToken(current + steps);
  }

  static async clearWheel() {
    const ids = canvas.scene.tiles.filter(t => t.getFlag(this.ID, 'type')).map(t => t.id);
    if (ids.length) await canvas.scene.deleteEmbeddedDocuments('Tile', ids);
  }

  static async createWheel() {
    if (!canvas.scene) return;
    await this.clearWheel();
    const wheelData = {
      texture: { src: this.imagePaths.wheel },
      width: this.CONFIG.wheelSize,
      height: this.CONFIG.wheelSize,
      x: (canvas.dimensions.width - this.CONFIG.wheelSize) / 2,
      y: (canvas.dimensions.height - this.CONFIG.wheelSize) / 2,
      z: 100,
      flags: { [this.ID]: { type: 'bg' } },
    };
    const startPos = this.getPositionForTick(0, wheelData.x, wheelData.y);
    const tokenData = {
      texture: { src: this.imagePaths.token },
      width: this.CONFIG.tokenSize,
      height: this.CONFIG.tokenSize,
      x: startPos.x,
      y: startPos.y,
      z: 110,
      flags: { [this.ID]: { type: 'token', currentTick: 0 } },
    };
    await canvas.scene.createEmbeddedDocuments('Tile', [wheelData, tokenData]);
  }
}

globalThis.ScionCombatWheel = ScionCombatWheel;
