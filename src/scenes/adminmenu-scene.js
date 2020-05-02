import { TextButton } from '../text-button';
import { Server } from '../server';
import { PopUpScene } from './popup-scene';


export class AdminMenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'adminMenuScene'});
    }

    init(data) {
        this.audioManager = data.audioManager;
    }

    updateText() {
        if (this.audioManager && this.audioManager.isMuted()){
            this.muteButton.setText('Unmute');
        } else {
            this.muteButton.setText('Mute');
        };
    }

    create() {
        this.adminButton = new TextButton(this,3,3,'[+]',{
            onClick:() => {
                this.menu.setVisible(true);
                this.adminButton.setVisible(false);
            }
        });
        this.add.existing(this.adminButton);


        this.menu = new AdminZone(this,0,0,200,400);

        this.graphics = this.add.graphics({
            x: 0,
            y: 0,
            fillStyle: {
                color: 'black',
                alpha: 0.90
            },
            add: true
        });

        this.graphics.fillRect(8, 25, 120, 335);
        this.graphics.lineStyle(2, 0x00ff00);
        this.graphics.strokeRect(8, 25, 120, 335);

        this.menu.add(this.graphics);

        this.closeButton = new TextButton(this,3,3,'[-]',{
            onClick:() => {
                this.menu.setVisible(false);
                this.adminButton.setVisible(true);
            }
        });
        this.add.existing(this.closeButton);
        this.menu.add(this.closeButton);

        this.resetButton = new TextButton(this, 20, 60, 'Reset', {
            onClick: () => {
                this.menu.setVisible(false);
                this.adminButton.setVisible(true);
                this.events.emit('reset',[]);
            }
        });
        this.add.existing(this.resetButton);
        this.menu.add(this.resetButton);

        this.muteButton = new TextButton(this, 20, 80, 'Mute', {
            onClick: () => {
                this.audioManager.toggleMute();
                this.updateText();
            }
        });
        this.add.existing(this.muteButton);
        this.menu.add(this.muteButton);

        this.resyncButton = new TextButton(this, 20, 100, 'Re-Sync', {
            onClick: () => {
                this.events.emit('resync',[]);
            }
        });
        this.add.existing(this.resyncButton);
        this.menu.add(this.resyncButton);

        this.updateText();
        this.menu.setVisible(false);
    }
}

export class AdminZone extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.setName('adminZone');
        this.text = scene.add.text(20,35,'Admin Menu',{ color: 'white', fontSize: '16px '});        
    }

    setVisible(value){
        this.text.setVisible(value);
        this.getAll().forEach(obj => {
            obj.setVisible(value);
        });
    }
}