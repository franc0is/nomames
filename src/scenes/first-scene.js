import { TextButton } from '../text-button';

export class FirstScene extends Phaser.Scene {
    constructor() {
        super({ key: 'firstScene' });
    };

    preload() {
        this.load.image('cupanddice','assets/cupanddice.png');
        this.load.image('title','assets/title-glow.png');
    };

    create() {
        this.add.image(400, 75, 'title');
        this.add.image(400, 275,'cupanddice');
        this.add.text(275, 450, 'Brought to you by 400B Studios',{ color: 'white', fontSize: '14px '});

        this.startButton = new TextButton(this, 290, 420, '[ NEW ]', {
            onClick: () => {
                this.scene.start('startScene');
            }
        });
        this.add.existing(this.startButton);

        this.joinButton = new TextButton(this, 435, 420, '[ JOIN ]', {
            onClick: () => {
                this.scene.start('joinScene');
            }
        });
        this.add.existing(this.joinButton);

    }
}