import { Server } from '../server';
import { TextButton } from '../text-button';
import { PlayersLabel } from '../playerslabel';

export class FirstScene extends Phaser.Scene {
    constructor() {
        super({ key: 'firstScene' });
    };

    preload() {
        this.load.image('cupanddice','assets/cupanddice.png');
        this.load.image('title','assets/nomames.png');
    };

    create() {
        this.add.image(360,75, 'title');
        this.add.image(360,275,'cupanddice');
        //let text = this.add.text(320,200,'Welcome!',{ color: 'white', fontSize: '20px '});
        this.add.text(135, 450, 'this no mames game brough to you by the harkness boys',{ color: 'white', fontSize: '14px '});

        this.startButton = new TextButton(this, 250, 420, '[ START ]', {
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