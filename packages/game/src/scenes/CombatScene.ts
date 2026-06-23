import Phaser from 'phaser';
import { useCombatStore } from '@fanren/data';
import { CombatUnit, CombatAction, Realm } from '@fanren/core';

export class CombatScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerName!: Phaser.GameObjects.Text;
  private enemyName!: Phaser.GameObjects.Text;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private isAnimating = false;

  constructor() {
    super({ key: 'CombatScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor('#F0EDE4');

    // Player sprite (left side)
    this.playerSprite = this.add.sprite(width * 0.25, height * 0.5, 'player')
      .setOrigin(0.5)
      .setScale(2);

    // Enemy sprite (right side)
    this.enemySprite = this.add.sprite(width * 0.75, height * 0.5, 'enemy')
      .setOrigin(0.5)
      .setScale(2);

    // HP bars
    this.playerHpBar = this.add.graphics();
    this.enemyHpBar = this.add.graphics();
    this.drawHpBars();

    // Names
    const store = useCombatStore.getState();
    this.playerName = this.add.text(width * 0.25, height * 0.15,
      store.player?.name || '玩家', {
        fontSize: '18px',
        color: '#1A1A1A',
        fontFamily: 'serif',
    }).setOrigin(0.5);

    this.enemyName = this.add.text(width * 0.75, height * 0.15,
      store.enemy?.name || '敌人', {
        fontSize: '18px',
        color: '#C0503D',
        fontFamily: 'serif',
    }).setOrigin(0.5);

    // Action buttons
    this.createActionButtons();

    // Log area
    this.createLogPanel();
  }

  private drawHpBars(): void {
    const { width, height } = this.scale;
    const barWidth = 200;
    const barHeight = 12;
    const playerX = width * 0.25 - barWidth / 2;
    const enemyX = width * 0.75 - barWidth / 2;
    const barY = height * 0.75;

    const combat = useCombatStore.getState();
    const playerHp = combat.player ? combat.player.currentAttributes.hp / combat.player.attributes.maxHp : 1;
    const enemyHp = combat.enemy ? combat.enemy.currentAttributes.hp / combat.enemy.attributes.maxHp : 1;

    // Player HP bar
    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(0xD0D0D0);
    this.playerHpBar.fillRect(playerX, barY, barWidth, barHeight);
    this.playerHpBar.fillStyle(0x5B8C5A);
    this.playerHpBar.fillRect(playerX, barY, barWidth * playerHp, barHeight);

    // Enemy HP bar
    this.enemyHpBar.clear();
    this.enemyHpBar.fillStyle(0xD0D0D0);
    this.enemyHpBar.fillRect(enemyX, barY, barWidth, barHeight);
    this.enemyHpBar.fillStyle(0xC0503D);
    this.enemyHpBar.fillRect(enemyX, barY, barWidth * enemyHp, barHeight);
  }

  private createActionButtons(): void {
    const { height } = this.scale;
    const btnY = height * 0.88;

    const attackBtn = this.add.text(100, btnY, '🗡️ 攻击', {
      fontSize: '16px', color: '#1A1A1A', fontFamily: 'serif',
      backgroundColor: '#F0EDE4', padding: { x: 12, y: 6 },
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doAction({ type: 'ATTACK' }));

    this.add.text(250, btnY, '🛡️ 防御', {
      fontSize: '16px', color: '#1A1A1A', fontFamily: 'serif',
      backgroundColor: '#F0EDE4', padding: { x: 12, y: 6 },
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doAction({ type: 'DEFEND' }));

    this.add.text(400, btnY, '🏃 逃跑', {
      fontSize: '16px', color: '#A0A0A0', fontFamily: 'serif',
      backgroundColor: '#F0EDE4', padding: { x: 12, y: 6 },
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doAction({ type: 'FLEE' }));
  }

  private createLogPanel(): void {
    const { width, height } = this.scale;
    // Scroll background
    this.add.graphics()
      .fillStyle(0xF5F3ED, 0.9)
      .fillRoundedRect(width * 0.5 - 180, height * 0.6, 360, 80, 8);

    for (let i = 0; i < 3; i++) {
      const text = this.add.text(width * 0.5, height * 0.63 + i * 22, '', {
        fontSize: '12px', color: '#3A3A3A', fontFamily: 'serif',
      }).setOrigin(0.5);
      this.logTexts.push(text);
    }
  }

  private doAction(action: CombatAction): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const combatStore = useCombatStore.getState();
    combatStore.executeAction(action);

    // Animation: player attacks
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 80,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: this.enemySprite,
          x: this.enemySprite.x - 20,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.updateUI();
            this.isAnimating = false;

            // Check combat result
            const state = useCombatStore.getState();
            if (state.result) {
              this.time.delayedCall(1000, () => {
                this.scene.stop();
              });
            }
          },
        });
      },
    });
  }

  updateUI(): void {
    const store = useCombatStore.getState();
    this.drawHpBars();

    // Update log
    const logs = store.log.slice(-3);
    this.logTexts.forEach((t, i) => {
      t.setText(logs[i] || '');
    });
  }
}
