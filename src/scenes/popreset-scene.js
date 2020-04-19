import { Server } from '../server';
import { TextButton } from '../text-button';


export class PopResetScene extends Phaser.Scene {
    constructor() {
        super({ key: 'popResetScene' });
        this.x = 160;
        this.y = 120;
        this.width = 400;
        this.height = 200;
    }

    init(data) {
        this.server = data.server;
    }

    create() {
        this.graphics = this.add.graphics({
            x: 0,
            y: 0,
            fillStyle: {
                color: 'black',
                alpha: 0.90
            },
            add: true
        });
        this.graphics.lineStyle(2, 0xffff00);
        this.graphics.strokeRect(this.x, this.y, this.width, this.height);

        this.graphics.fillRect(this.x, this.y, this.width, this.height);

        let text = this.add.text(210,150,'Continue with game RESET?',{ color: 'white', fontSize: '20px '});

        this.leftButton = new TextButton(this, 220, 240, '[ confirm ]', {
            onClick: () =>  {
                this.server.reset();
                this.scene.stop('popResetScene');
            }
        });
        this.add.existing(this.leftButton);

        this.rightButton = new TextButton(this, 400, 240, '[ cancel ]', {
            onClick: () => {
                this.scene.stop('popResetScene');
            }
        });
        this.add.existing(this.rightButton);

    }
}