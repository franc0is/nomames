export class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, callbacks) {
        super(scene, x, y, text, { fill: '#0f0'});

        this.callbacks = callbacks;
        this.enabled = true;
        this.startClickTime = 0;
        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterHoverState() )
            .on('pointerout', () => this.enterRestState() )
            .on('pointerdown', () => this.onPointerDown() )
            .on('pointerup', () => this.onPointerUp() );
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.setInteractive();
            this.enterRestState();
        } else {
            this.disableInteractive();
            this.setStyle({ fill: '#888888' });
        }
    }

    onPointerDown() {
        if (!this.enabled) { return; }
        this.startClickTime = this.scene.time.now;
        this.setStyle({ fill: '#0ff' });
    }

    onPointerUp() {
        if (this.scene.time.now - this.startClickTime > 1000) {
            this.callbacks.onLongClick();
        } else {
            this.callbacks.onClick();
        }

        this.enterHoverState();
    }

    enterHoverState() {
        if (!this.enabled) { return; }
        this.setStyle({ fill: '#ff0' });
    }

    enterRestState() {
        if (!this.enabled) { return; }
        this.setStyle({fill: '#0f0' });
    }
}
