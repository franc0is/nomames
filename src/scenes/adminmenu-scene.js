import { TextButton } from '../text-button';
import { NMType } from '../message';
import { EventDispatcher } from '../events';


export class AdminMenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'adminMenuScene'});
        this.eventDispatcher = EventDispatcher.getInstance();
    }

    preload(){
        this.startMenu = new AdminZone(this, 690, 0);
        this.actionMenu = new AdminZone(this, 690,0);
        this.deathMenu = new AdminZone(this, 690,0);
    }

    init(data) {
        this.audioManager = data.audioManager;
        this.startactive = data.isMe;
    }

    updateText() {
        if (this.audioManager && this.audioManager.isMuted()){
            this.muteButton.setText('Unmute');
        } else {
            this.muteButton.setText('Mute');
        };
    }

    create() {
        this.startMenu.text.setText('');
        this.actionMenu.text.setText('');
        this.deathMenu.text.setText('');

        this.adminButton = new TextButton(this,3,3,'[+]',{
            onClick:() => {
                this.adminMenu.setVis(true);
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
                this.adminMenu.setVis(false);
                this.adminButton.setVisible(true);
            }
        });
        this.add.existing(this.closeButton);
        this.adminMenu.add(this.closeButton);

        this.resetButton = new TextButton(this, 20, 60, 'Reset', {
            onClick: () => {
                this.adminMenu.setVis(false);
                this.adminButton.setVisible(true);
                this.eventDispatcher.emit('reset',[]);
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
                this.eventDispatcher.emit('resync',[]);
            }
        });
        this.add.existing(this.resyncButton);
        this.adminMenu.add(this.resyncButton);

        this.cupRollButton = new TextButton(this, 0, 30, 'Roll', {
            onClick: () => {
                this.eventDispatcher.emit('roll',[]);
            }
        });
        this.add.existing(this.cupRollButton);
        this.actionMenu.add(this.cupRollButton);

        this.cupLookButton = new TextButton(this, 0, 60, 'Look', {
            onClick: () => {
                this.eventDispatcher.emit('look',[]);
            }
        });
        this.add.existing(this.cupLookButton);
        this.actionMenu.add(this.cupLookButton);

        this.nextPlayerButton = new TextButton(this, 0, 90, 'Pass', {
            onClick: () => {
                this.eventDispatcher.emit('pass',[false]);
            }
        });
        this.add.existing(this.nextPlayerButton);
        this.nextPlayerButton.setEnabled(false);
        this.actionMenu.add(this.nextPlayerButton);

        this.fiverButton = new TextButton(this, 0, 120, 'Pass 5',{
            onClick: () => {
                this.eventDispatcher.emit('pass',[true]);
            }
        });
        this.add.existing(this.fiverButton);
        this.fiverButton.setEnabled(false);
        this.actionMenu.add(this.fiverButton);

        this.makeDeadButton = new TextButton(this, 0, 30, 'Die', {
            onClick: () => {
                this.eventDispatcher.emit('killPlayer',[]);
            }
        });
        this.add.existing(this.makeDeadButton);
        this.deathMenu.add(this.makeDeadButton);

        this.noMamesButton = new TextButton(this, 0, 60, 'No Mames!', {
            onClick: () => {
                let even = Phaser.Math.RND.between(0, 1);
                this.eventDispatcher.emit('noMames', [ NMType.NO_MAMES , even]);
            }
        });
        this.add.existing(this.noMamesButton);
        this.startMenu.add(this.noMamesButton);

        this.acceptButton = new TextButton(this, 0, 30, 'Accept', {
            onClick: () => {
                this.setMenuState(MenuState.ACTIONS);
                this.actionMenu.allActive();
                this.eventDispatcher.emit('accept',[]);
            }
        });
        this.add.existing(this.acceptButton);
        this.startMenu.add(this.acceptButton);

        this.updateText();
        this.startMenu.setVis(false);
        this.adminMenu.setVis(false);
        this.actionMenu.setVis(false);
        this.deathMenu.setVis(false);

        if (this.startactive) {
            this.setMenuState(MenuState.ACTIONS);
        };
    }

    setMenuState(state){
        this.startMenu.setVis(false);
        this.actionMenu.setVis(false);
        this.deathMenu.setVis(false);

        switch (state){
            case MenuState.START_TURN:{
                this.startMenu.setVis(true);
                break;
            }
            case MenuState.ACTIONS: {
                this.actionMenu.setVis(true);
                break;
            }
            case MenuState.INACTIVE: {

                break;
            }
            case MenuState.DEATH: {
                this.deathMenu.setVis(true);
                break;
            }
        }
    }

    onreset() {
        this.cupRollButton.setEnabled(true);
        this.cupLookButton.setEnabled(true);
        this.nextPlayerButton.setEnabled(false);
        this.fiverButton.setEnabled(false);
        this.setMenuState(MenuState.ACTIONS);
    }
}

export class AdminZone extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.setName('adminZone');
        this.text = scene.add.text(20,35,'Admin Menu',{ color: 'white', fontSize: '16px '});        
    }

    setVis(value){
        this.text.setVisible(value);
        this.getAll().forEach(obj => {
            obj.setVisible(value);
        });
    }

    allActive() {
        this.getAll().forEach( obj => {
            obj.setEnabled(true);
        })
    }
}

export const MenuState = {
    START_TURN: 'start-turn',
    ACTIONS: 'action_menu',
    INACTIVE: 'inactive',
    DEATH: 'death'
}