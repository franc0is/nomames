import { Server } from '../server';
import { TextButton } from '../text-button';


export class PopDieScene extends Phaser.Scene {
    constructor() {
        super({ key: 'popDieScene' });
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
        this.graphics.strokeRect(160, 120, 400, 200);

        this.graphics.fillRect(160, 120, 400, 200);

        let text = this.add.text(185,150,'You are about to loose a life!',{ color: 'white', fontSize: '20px '});

        this.leftButton = new TextButton(this, 220, 240, '[ confirm ]', {
            onClick: () =>  {
            let playersList = this.server.getPlayersList();
            this.server.killPlayer(playersList.getMe());
            this.scene.stop('popDieScene');
            }
        });
        this.add.existing(this.leftButton);

        this.rightButton = new TextButton(this, 400, 240, '[ cancel ]', {
            onClick: () => {
                this.scene.stop('popDieScene');
            }
        });
        this.add.existing(this.rightButton);

    }
}