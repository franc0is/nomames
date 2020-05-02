import { TextButton } from '../text-button';


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
                this.adminMenu.setVisible(true);
                this.adminButton.setVisible(false);
            }
        });
        this.add.existing(this.adminButton);


        this.adminMenu = new AdminZone(this,0,0,200,400);

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

        this.adminMenu.add(this.graphics);

        this.closeButton = new TextButton(this,3,3,'[-]',{
            onClick:() => {
                this.adminMenu.setVisible(false);
                this.adminButton.setVisible(true);
            }
        });
        this.add.existing(this.closeButton);
        this.adminMenu.add(this.closeButton);

        this.resetButton = new TextButton(this, 20, 60, 'Reset', {
            onClick: () => {
                this.adminMenu.setVisible(false);
                this.adminButton.setVisible(true);
                this.events.emit('reset',[]);
            }
        });
        this.add.existing(this.resetButton);
        this.adminMenu.add(this.resetButton);

        this.muteButton = new TextButton(this, 20, 80, 'Mute', {
            onClick: () => {
                this.audioManager.toggleMute();
                this.updateText();
            }
        });
        this.add.existing(this.muteButton);
        this.adminMenu.add(this.muteButton);

        this.resyncButton = new TextButton(this, 20, 100, 'Re-Sync', {
            onClick: () => {
                this.events.emit('resync',[]);
            }
        });
        this.add.existing(this.resyncButton);
        this.adminMenu.add(this.resyncButton);

        this.actionMenu = new AdminZone(this, 690,0);
        this.actionMenu.text.setText('');

        this.cupRollButton = new TextButton(this, 0, 30, 'Roll', {
            onClick: () => {
                this.events.emit('roll',[]);
            }
        });
        this.add.existing(this.cupRollButton);
        this.actionMenu.add(this.cupRollButton);

        this.cupLookButton = new TextButton(this, 0, 60, 'Look', {
            onClick: () => {
                this.events.emit('look',[]);
            }
        });
        this.add.existing(this.cupLookButton);
        this.actionMenu.add(this.cupLookButton);

        this.nextPlayerButton = new TextButton(this, 0, 90, 'Pass', {
            onClick: () => {
                this.events.emit('pass',[false]);
            }
        });
        this.add.existing(this.nextPlayerButton);
        this.nextPlayerButton.setEnabled(false);
        this.actionMenu.add(this.nextPlayerButton);

        this.fiverButton = new TextButton(this, 0, 120, 'Pass 5',{
            onClick: () => {
                this.events.emit('pass',[true]);
                this.makeDeadButton.setEnabled(true);
            }
        });
        this.add.existing(this.fiverButton);
        this.fiverButton.setEnabled(false);
        this.actionMenu.add(this.fiverButton);

        this.makeDeadButton = new TextButton(this, 0, 150, 'Die', {
            onClick: () => {
                this.events.emit('killPlayer',[]);
            }
        });
        this.add.existing(this.makeDeadButton);
        this.makeDeadButton.setEnabled(false);
        this.actionMenu.add(this.makeDeadButton);

        this.noMamesButton = new TextButton(this, 0, 180, 'No Mames!', {
            onClick: () => {
                let even = Phaser.Math.RND.between(0, 1);
                this.events.emit('noMames',[NMType.NO_MAMES, even]);
            }
        });
        this.add.existing(this.noMamesButton);
        this.actionMenu.add(this.noMamesButton);

        this.updateText();
        this.adminMenu.setVisible(false);
        this.actionMenu.setVisible(true);

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