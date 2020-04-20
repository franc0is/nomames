import { TextButton } from '../text-button';


export class PopUpScene extends Phaser.Scene {
    constructor(message,lB,rB) {
        super({key: 'popUpScene'},message,lB,rB);
        this.message = message;
        this.lB = lB
        this.rB = rB 
    }

    init() {
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

        let text = this.add.text(200,150,this.message,{ color: 'white', fontSize: '20px '});

        this.leftButton = new TextButton(this, 220,240,this.lB.label,this.lB.callback);
        this.add.existing(this.leftButton);

        this.rightButton = new TextButton(this, 400, 240, this.rB.label, this.rB.callback);
        this.add.existing(this.rightButton);
    }
}