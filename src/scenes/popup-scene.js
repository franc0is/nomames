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
        let messageWidth = this.message.length*6;
        let text = this.add.text(360-messageWidth,150,this.message,{ color: 'white', fontSize: '20px '});

        let lbWidth = this.lB.label.length*4.8;
        this.leftButton = new TextButton(this, 260-lbWidth,240,this.lB.label,this.lB.callbacks);
        this.add.existing(this.leftButton);

        let rbWidth = this.rB.label.length*4.8;
        this.rightButton = new TextButton(this, 460-rbWidth, 240, this.rB.label, this.rB.callbacks);
        this.add.existing(this.rightButton);
    }
}