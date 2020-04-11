export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'pauseScene' });
    }

    init(data) {
        this.pauseText = data.pauseText;
    }

    create() {
        this.graphics = this.add.graphics({
            x: 0,
            y: 0,
            fillStyle: {
                color: '0xfff',
                alpha: 0.5
            },
            add: true
        });
        this.graphics.fillRect(0, 0, 720, 480);
        let text = this.add.text(200, 200, this.pauseText, {
            'color': 'red',
            'fontSize': '36px',
            'align': 'center'
        });
    }

}
