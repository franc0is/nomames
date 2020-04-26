import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';
import { Action } from '../message';
import { NMType } from '../message';
import { PlayersLabel } from '../playerslabel';
import { NMAudioManager } from '../audio';
import { PopUpScene } from './popup-scene';


const NUM_DICE = 5;

export class DiceScene extends Phaser.Scene {
    /*
     * XXX
     *
     * I royally fucked separation of concerns here.
     * MVC would be a much better idea, with th scene as the view and
     * an internal data structure representing the dice state as the model
     *
     */
    constructor() {
        super({ key: 'diceScene' });
        this.audioManager = new NMAudioManager(this);
        this.leftButtonAction = () => {};
        this.rightButtonAction = () => {};
    }

    init(data) {
        this.server = data.server;
        this.server.setCallbacks({
            onPlayersUpdate: (players) => {
                this.onPlayersUpdate(players);
            },
            onDiceUpdate: (msg) => {
                this.onDiceUpdate(msg);
            },
            onNoMames: (nmtype, audionum) => {
                this.onNoMames(nmtype, audionum);
            },
            onReset: () => {
                this.onReset();
            },
            onPassDirectionChange: (isClockwise) => {
                this.onPassDirectionChange(isClockwise);
            },
            onPause: (pauseText) => {
                this.onPause(pauseText);
            },
            onResume: () => {
                this.onResume();
            },
            onFiver: (fp) => {
                this.onFiver(fp);
            }
        });
    }

    preload() {
        this.load.spritesheet('dice', 'assets/dice-pixel.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('life', 'assets/life_spritesheet.png', { frameWidth: 90, frameHeight: 22});
        this.audioManager.preload();
    }

    create() {
        this.audioManager.create();
        this.scene.launch('muteScene', { audioManager: this.audioManager, server: this.server });
        
        this.scene.launch('tableScene', {server: this.server});
        
        this.nomames = false;
        this.fiverPass = false;

        this.firstpass = true;
        this.clockwise = true;

        this.cupRollButton = new TextButton(this, 690, 30, 'Roll', {
            onClick: () => {
                this.cup.roll();
                this.cupRollButton.setEnabled(false);
                this.noMamesButton.setEnabled(false);
                this.cupLookButton.setEnabled(true);
            }
        });
        this.add.existing(this.cupRollButton);

        this.cupLookButton = new TextButton(this, 690, 60, 'Look', {
            onClick: () => {
                this.cup.setVisible(true);
                this.noMamesButton.setEnabled(false);
                this.cupLookButton.setEnabled(false);
                if (!this.cup.didRoll()){
                    this.cupRollButton.setEnabled(true);
                } 
                if (this.fiverPass){
                    this.cupLookButton.setEnabled(true);
                    this.makeDeadButton.setEnabled(true);
                }
            }
        });
        this.add.existing(this.cupLookButton);

        this.nextPlayerButton = new TextButton(this, 690, 90, 'Pass', {
            onClick: () => {
                if (!this.firstpass) {
                    this.server.passCup(this.clockwise);
                } else {
                        this.scene.remove('popUpScene');
                        let popDie = new PopUpScene(
                            'Who would you like to pass to?',
                            {
                                label: '[ '+this.server.playersList.getNextClockwise().name+' ]',
                                callbacks: {
                                    onClick: () => {
                                        this.scene.stop('popUpScene');
                                        this.server.passCup(true);
                                    }
                                }
                            },
                            {
                                label: '[ '+this.server.playersList.getNextCounterClockwise().name+' ]',
                                callbacks: {
                                    onClick: () => {
                                        this.scene.stop('popUpScene');
                                        this.server.passCup(false);
                                    }
                                }
                            }
                        );
                        this.scene.add('',popDie,true);
                }
            },
        });
        this.add.existing(this.nextPlayerButton);
        this.nextPlayerButton.setEnabled(false);

        this.fiverButton = new TextButton(this, 690, 120, 'Pass 5',{
            onClick: () => {
                this.server.passCup(this.clockwise, true);
                this.makeDeadButton.setEnabled(true);
            }
        });
        this.add.existing(this.fiverButton);
        this.fiverButton.setEnabled(false)

        this.makeDeadButton = new TextButton(this, 690, 150, 'Die', {
            onClick: () => {
                this.scene.remove('popUpScene');
                let popDie = new PopUpScene(
                    'You are about to loose a life',
                    {
                        label: '[ confirm ]',
                        callbacks: {
                            onClick: () => {
                                this.scene.stop('popUpScene');
                                let playersList = this.server.getPlayersList();
                                this.server.killPlayer(playersList.getMe());
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
                this.scene.add('',popDie,true);
            }
        });
        this.add.existing(this.makeDeadButton);
        this.makeDeadButton.setEnabled(false);

        this.noMamesButton = new TextButton(this, 690, 180, 'No Mames!', {
            onClick: () => {
                let even = Phaser.Math.RND.between(0, 1);
                this.server.noMames(NMType.NO_MAMES, even);
            }
        });
        this.add.existing(this.noMamesButton);

        this.lookedButton = new TextButton(this, 690, 280, 'Looked', {
            onClick: () => {
            }
        });
        this.add.existing(this.lookedButton);
        this.lookedButton.setEnabled(false);

        this.rolledButton = new TextButton(this, 690, 310, 'Rolled', {
            onClick: () => {
            }
        });
        this.add.existing(this.rolledButton);
        this.rolledButton.setEnabled(false);

        this.adminButton = new TextButton(this,3,3,'[+]',{
            onClick:() => {
                this.scene.launch('adminMenuScene',{server: this.server});
            }
        });
        this.add.existing(this.adminButton);
    }

    onPause(pauseText) {
        this.scene.pause();
        this.scene.launch('pauseScene', { pauseText: pauseText });
    }

    onResume() {
        this.scene.stop('pauseScene');
        this.scene.resume();

    }

    onFiver(fp){
        this.fiverPass = fp;
        //reset all of the dice's rollcounts and tell dice and cup if 5 dice were passed
        this.dice.forEach(d=> {
            d.resetRoll();
            d.passFive = fp;
        });
        this.cup.fiver = fp;
        this.firstpass = false;
    }

    setPlayable(playable) {
        this.cupLookButton.setEnabled(playable);
        this.cupRollButton.setEnabled(playable);
        this.noMamesButton.setEnabled(playable);
        if (!this.fiverPass){
            this.nextPlayerButton.setEnabled(playable);
            this.fiverButton.setEnabled(playable);
        } else {
            this.nextPlayerButton.setEnabled(false);
            this.fiverButton.setEnabled(false);
        }
        if (!playable) {
            this.lookedButton.setEnabled(false);
            this.rolledButton.setEnabled(false);
        }

    }



    updateDice(action) {
        if (this.firstpass) {
            let allrolled = this.dice.reduce((previous, die) => (previous && die.didRoll()),
                                             true /* initial value */);
            this.nextPlayerButton.setEnabled(allrolled);
            this.fiverButton.setEnabled(allrolled);
        } else {
            this.nextPlayerButton.setEnabled(!this.fiverPass);
            this.fiverButton.setEnabled(!this.fiverPass);
        }

        // we've taken an action that changes dice,
        // no mames is disabled
        this.lookedButton.setEnabled(this.cup.getVisible());
        this.rolledButton.setEnabled(this.cup.didRoll());
        this.noMamesButton.setEnabled(false);
        this.audioManager.playAudioForAction(action);
        
        if (this.fiverPass && !this.nomames){
            if (this.fiverText.visible){
                this.fiverText.setVisible(false);
                this.fiverTryText.setVisible(true);
            }
        }
    }

    onPlayersUpdate(playersList) {
        if (!this.input.enabled && playersList.getActivePlayer().isMe) {
            // this player is now active
            this.setPlayable(true);
        }
        if (!playersList.getActivePlayer().isMe){
            this.setPlayable(false)
        }
    }

    onDiceUpdate(msg) {
            this.audioManager.playAudioForAction(msg.action);

            this.rolledButton.setEnabled(msg.cup.rolled);
            this.lookedButton.setEnabled(msg.cup.visible);
    }

    onNoMames(nmt, audionum) {
        this.nomames = true;

        //added switch to address multiple types of endings and added audio sync capabilities
        switch (nmt){
            case NMType.NO_MAMES: {
                this.audioManager.playNoMames(audionum);
                break;
            }
            case NMType.FAILED_5: {

                break;
            }
            case NMType.ROLLED_5: {

                break;
            }
        };

        this.setPlayable(true);
        this.makeDeadButton.setEnabled(true);
        this.cupLookButton.setEnabled(false);
        this.cupRollButton.setEnabled(false);
        this.noMamesButton.setEnabled(false);
        this.nextPlayerButton.setEnabled(false);
        this.fiverButton.setEnabled(false);
    }

    onReset() {
        this.scene.restart();
    }

    onPassDirectionChange(isClockwise) {
        this.clockwise = isClockwise;
    }
}
