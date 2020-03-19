export class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, callback) {
        super(scene, x, y, text, { fill: '#0f0'});

        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterHoverState() )
            .on('pointerout', () => this.enterRestState() )
            .on('pointerdown', () => this.enterActiveState() )
            .on('pointerup', () => {
                this.enterHoverState();
                callback();
            });
    }

    enterActiveState() {
        this.setStyle({ fill: '#0ff' });
    }

    enterHoverState() {
        this.setStyle({ fill: '#ff0' });
    }

    enterRestState() {
        this.setStyle({fill: '#0f0' });
    }
}
