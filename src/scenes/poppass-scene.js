import { Server } from '../server';
import { TextButton } from '../text-button';


export class PopPassScene extends Phaser.Scene {
    constructor() {
        super({ key: 'popPassScene' });
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

        let text = this.add.text(190,150,'Who would you like to pass to?',{ color: 'white', fontSize: '20px '});

        this.leftButton = new TextButton(this, 220, 240, '[ '+this.server.playersList.getNextClockwise()+ ' ]', {
            onClick: () =>  {
            this.server.passCup(true);
            this.scene.stop('popPassScene');
            }
        });
        this.add.existing(this.leftButton);

        this.rightButton = new TextButton(this, 400, 240, '[ '+ this.server.playersList.getNextCounterClockwise() +' ]', {
            onClick: () => {
                this.server.passCup(false);
                this.scene.stop('popDieScene');
            }
        });
        this.add.existing(this.rightButton);
    }
} 