import { Server } from '../server';
import { TextButton } from '../text-button';
import { PlayersLabel } from '../playerslabel';

export class FirstScene extends Phaser.Scene {
    constructor() {
        super({ key: 'firstScene' });
    };

    preload() {
        this.load.image('cupanddice','assets/cupanddice.png');
        this.load.image('title','assets/title-glow.png');
    };

    create() {
        this.add.image(360, 75, 'title');
        this.add.image(360, 275,'cupanddice');
        this.add.text(235, 450, 'Brought to you by 400B Studios',{ color: 'white', fontSize: '14px '});

        this.startButton = new TextButton(this, 250, 420, '[ NEW ]', {
            onClick: () => {
                this.scene.start('startScene');
            }
        });
        this.add.existing(this.startButton);

        this.joinButton = new TextButton(this, 395, 420, '[ JOIN ]', {
            onClick: () => {
                this.scene.start('joinScene');
            }
        });
        this.add.existing(this.joinButton);

    }
}