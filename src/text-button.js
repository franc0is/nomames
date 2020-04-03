export class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, callback) {
        super(scene, x, y, text, { fill: '#0f0'});

        this.enabled = true;
        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterHoverState() )
            .on('pointerout', () => this.enterRestState() )
            .on('pointerdown', () => this.enterActiveState() )
            .on('pointerup', () => {
                this.enterHoverState();
                callback();
            });
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

    enterActiveState() {
        if (!this.enabled) { return; }
        this.setStyle({ fill: '#0ff' });
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
