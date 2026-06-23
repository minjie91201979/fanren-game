import Phaser from 'phaser';

export class WorldMapScene extends Phaser.Scene {
  private mapContainer!: Phaser.GameObjects.Container;
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  constructor() {
    super({ key: 'WorldMapScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor('#F5F3ED');

    // Map container (for panning)
    this.mapContainer = this.add.container(0, 0);

    // Map background image
    const mapBg = this.add.image(0, 0, 'map_tiannan')
      .setOrigin(0, 0)
      .setDisplaySize(width * 2, height * 2);
    this.mapContainer.add(mapBg);

    // Map locations (interactive points)
    this.createLocations();

    // Drag to pan
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStart = { x: pointer.x - this.mapContainer.x, y: pointer.y - this.mapContainer.y };
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.mapContainer.x = pointer.x - this.dragStart.x;
        this.mapContainer.y = pointer.y - this.dragStart.y;
      }
    });

    this.input.on('pointerup', () => { this.isDragging = false; });

    // Back button
    const backBtn = this.add.text(20, 20, '← 返回', {
      fontSize: '16px', color: '#1A1A1A', fontFamily: 'serif',
      backgroundColor: '#F0EDE4', padding: { x: 10, y: 5 },
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'main' } }));
      });
  }

  private createLocations(): void {
    const locations = [
      { id: 'huangfeng', name: '黄枫谷', x: 300, y: 250, color: 0x5B8C5A },
      { id: 'village', name: '青石村', x: 150, y: 400, color: 0x8B7355 },
      { id: 'forest', name: '狼谷森林', x: 500, y: 350, color: 0xC0503D },
      { id: 'lake', name: '水月湖', x: 350, y: 550, color: 0x4A7BA7 },
      { id: 'ruins', name: '断魂崖', x: 600, y: 200, color: 0x7B6BAA },
    ];

    locations.forEach((loc) => {
      // Location dot
      const dot = this.add.graphics();
      dot.fillStyle(loc.color, 0.8);
      dot.fillCircle(0, 0, 8);
      dot.lineStyle(2, 0x1A1A1A);
      dot.strokeCircle(0, 0, 8);
      dot.setInteractive(
        new Phaser.Geom.Circle(0, 0, 15),
        Phaser.Geom.Circle.Contains,
      );

      const label = this.add.text(0, 15, loc.name, {
        fontSize: '11px', color: '#1A1A1A', fontFamily: 'serif',
      }).setOrigin(0.5);

      const container = this.add.container(loc.x, loc.y, [dot, label]);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-30, -15, 60, 45),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('navigate', {
          detail: { page: 'location', params: { id: loc.id } },
        }));
      });

      this.mapContainer.add(container);
    });
  }
}
