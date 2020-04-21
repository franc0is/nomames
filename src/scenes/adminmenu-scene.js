import { TextButton } from '../text-button';
import { Server } from '../server';
import { PopUpScene } from './popup-scene';


export class AdminMenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'adminMenuScene'});
    }

    init(data) {
        this.server = data.server
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
        this.graphics.fillRect(8, 3, 120, 352);
        
        
        this.graphics.lineStyle(2, 0x00ff00);
        this.graphics.strokeRect(8, 25, 120, 335);

        let text = this.add.text(20,30,'Admin Menu',{ color: 'white', fontSize: '16px '});

        this.closeButton = new TextButton(this,3,3,'[-]',{
            onClick:() => {
                this.scene.stop(this);
            }
        });
        this.add.existing(this.closeButton);

        this.resetButton = new TextButton(this, 20, 60, 'Reset', {
            onClick: () => {
                this.scene.stop('adminMenuScene');
                this.scene.remove('popUpScene');
                let popReset = new PopUpScene(
                    '  Continue with game reset?',
                    {
                        label: '[ continue ]',
                        callbacks: {
                            onClick: () => {
                                this.scene.stop('popUpScene');
                                this.server.reset();
                            }
                        }
                    },
                    {
                        label: '[ cancel ]',
                        callbacks: {
                            onClick: () => {
                                this.scene.stop('popUpScene');
                            }
                        }
                    }
                );
                this.scene.add('',popReset,true);
            }
        });
        this.add.existing(this.resetButton);
    }
}