import { Server } from '../server';
import { TextButton } from '../text-button';


export class PopUpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'popUpScene' });
    }

    init(data) {
        this.server = data.server;
        this.message = data.message;
        this.leftButtonText = data.leftButtonText;
        this.leftButtonAction = data.leftButtonAction;
        this.rightButtonText = data.rightButtonText;
        this.rightButtonAction = data.rightButtonAction;
    }

    create() {
        this.graphics = this.add.graphics({
            x: 0,
            y: 0,
            fillStyle: {
                color: '0f0',
                alpha: 0.5
            },
            add: true
        });

        this.graphics.fillRect(160, 120, 400, 240);

        let text = this.add.text(200,140,this.message,{ color: 'white', fontSize: '20px '});

        this.leftButton = new TextButton(this, 300, 240, this.leftButtonText, this.leftButtonAction);
        this.add.existing(this.leftButton);

        this.rightButton = new TextButton(this, 400, 240, this.rightButtonText, this.rightButtonAction);
        this.add.existing(this.rightButton);

        console.log('hello');
        console.log(this.leftButton);
        console.log(this.rightButton);

    }
}