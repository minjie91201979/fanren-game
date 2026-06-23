import Phaser from 'phaser';

export class BreakthroughScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor() {
    super({ key: 'BreakthroughScene' });
  }

  create(data: { success: boolean; realm: string }): void {
    const { width, height } = this.scale;

    // Dark background
    this.cameras.main.setBackgroundColor('#1A1A1A');

    // Central glow
    const glow = this.add.graphics();
    glow.fillStyle(data.success ? 0xC9A34A : 0xC0503D, 0.3);
    glow.fillCircle(width / 2, height / 2, 150);
    glow.fillStyle(data.success ? 0xC9A34A : 0xC0503D, 0.15);
    glow.fillCircle(width / 2, height / 2, 300);

    // Particle effect
    const particles = this.add.particles(0, 0, 'particle', {
      x: width / 2,
      y: height / 2,
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 1000,
      quantity: 2,
      frequency: 50,
    });

    // Central text
    const resultText = data.success ? '突破成功！' : '突破失败...';
    const color = data.success ? '#C9A34A' : '#C0503D';
    this.add.text(width / 2, height / 2 - 40, resultText, {
      fontSize: '36px', color, fontFamily: 'serif',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, data.realm, {
      fontSize: '24px', color: '#F5F3ED', fontFamily: 'serif',
    }).setOrigin(0.5);

    // Continue button
    this.time.delayedCall(2000, () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'main' } }));
    });
  }
}
