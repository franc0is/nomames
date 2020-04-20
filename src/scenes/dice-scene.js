import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';
import { Action } from '../message';
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
            onNoMames: () => {
                this.onNoMames();
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
        this.scene.launch('muteScene', { audioManager: this.audioManager });

        this.nomames = false;
        this.fiverPass = false;
        this.table = new DiceZone(this, 430, 100, 500, 150, 'Table');
        this.cup = new DiceZone(this, 430, 300, 500, 150, 'Cup');

        this.noMamesText = this.add.text(170, 180, "🚨🖕🚨 NO MAMES GUEY 🚨🖕🚨", { fill: 'red' });
        this.noMamesText.setVisible(false);

        this.firstpass = true;

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
                if (this.fiverPass){
                    this.makeDeadButton.setEnabled(true)
                    this.cup.getDice().forEach(d=>{
                        if (d.didRoll()){
                            this.table.add(d);
                        }
                    });
                }
                if (!this.cup.didRoll()){
                    this.cupRollButton.setEnabled(true);
                } 
            }
        });
        this.add.existing(this.cupLookButton);

        this.nextPlayerButton = new TextButton(this, 690, 90, 'Pass', {
            onClick: () => {
                this.server.passCup(this.clockwise, false);
            },
        });
        this.add.existing(this.nextPlayerButton);
        this.nextPlayerButton.setEnabled(false);

        this.clockwise = true;
        this.passDirectionButton = new TextButton(this, 740, 90, '>',{
            onClick: () => {
                this.onPassDirectionChange(!this.clockwise);
            }
        });
        this.add.existing(this.passDirectionButton);

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
                let popDie = new PopUpScene('You are about to loose a life',{
                    label: '[ confirm ]',
                    callback: {
                        onClick: () => {
                            this.scene.stop('popUpScene');
                            let playersList = this.server.getPlayersList();
                            this.server.killPlayer(playersList.getMe());
                        }
                    }
                },
                {
                    label: '[ cancel ]',
                    callback: {
                        onClick: () => {
                            this.scene.stop('popUpScene');
                        }
                    }
                });
                this.scene.add('',popDie,true);
            }
        });
        this.add.existing(this.makeDeadButton);
        this.makeDeadButton.setEnabled(false);

        this.noMamesButton = new TextButton(this, 690, 180, 'No Mames!', {
            onClick: () => {
                this.server.noMames();
            }
        });
        this.add.existing(this.noMamesButton);

        this.resetButton = new TextButton(this, 690, 210, 'Reset', {
            onClick: () => {
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

        this.dice = [];
        for (let i=0; i< NUM_DICE; i++) {
            let d = new Dice(this, 0, 0, NUM_DICE - i);
            this.add.existing(d);
            this.input.setDraggable(d);
            this.cup.add(d);
            this.dice.push(d);
        }

        this.dragging = false;
        this.input.on('drag', function(pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragenter', function(pointer, gameObject, dropZone) {
            dropZone.setHighlighted(true);
            this.dragging = true;
        });

        this.input.on('dragleave', function(pointer, gameObject, dropZone) {
            dropZone.setHighlighted(false);
        });

        this.input.on('drop', function(pointer, gameObject, dropZone) {
            if (gameObject instanceof Dice && gameObject.didRoll() && dropZone.name === "Cup" ){
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                dropZone.setHighlighted(false);
            } else {
                dropZone.add(gameObject);
                dropZone.setHighlighted(false);
            }
        });

        this.input.on('dragend', function(pointer, gameObject, dropZone) {
            if (this.dragging){
                if (!dropZone) {
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                }
                this.dragging = false;
            }
        });

        let playersList = this.server.getPlayersList();
        this.playersLabel = new PlayersLabel(this, 5, 30, playersList);
        this.add.existing(this.playersLabel);

        if (!playersList.getActivePlayer().isMe) {
            this.setPlayable(false);
        }

        this.cup.setOnUpdateCb((action, dice) => {
            this.updateCup(action, dice)
        });

        this.table.setOnUpdateCb((action, dice) => {
            this.updateTable(action, dice);
        });
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
        this.passDirectionButton.setEnabled(false);
    }

    setPlayable(playable) {
        this.input.enabled = playable;
        this.cup.reset();
        this.cupLookButton.setEnabled(playable);
        this.cupRollButton.setEnabled(playable);
        this.noMamesButton.setEnabled(playable);
        this.resetButton.setEnabled(playable);
        this.dice.forEach(dice => {
            dice.resetRoll();
        });
        if (!this.fiverPass){
            this.nextPlayerButton.setEnabled(playable);
            this.fiverButton.setEnabled(playable);
        } else {
            this.nextPlayerButton.setEnabled(false);
            this.fiverButton.setEnabled(false);
            this.dice.forEach(dice => {
                dice.resetRoll();
            });
        }
        if (!playable) {
            this.passDirectionButton.setEnabled(false);
            this.lookedButton.setEnabled(false);
            this.rolledButton.setEnabled(false);
        }
    }

    updateCup(action, dice) {
        if (action === Action.ROLL_ONE) {
            this.table.add(dice[0]);
        }
        this.updateDice(action);
    }


    updateTable(action, dice) {
        this.updateDice(action);
    }

    updateDice(action) {
        if (this.firstpass) {
            let allrolled = this.dice.reduce((previous, die) => previous && die.didRoll,
                                             true /* initial value */);
            this.nextPlayerButton.setEnabled(allrolled);
            this.fiverButton.setEnabled(allrolled);
        } else {
            this.nextPlayerButton.setEnabled(!this.fiverPass);
            this.fiverButton.setEnabled(!this.fiverPass);
        }

        // we've taken an action that changes dice,
        // no mames is disabled
        this.cup.reorder();
        this.table.reorder();
        this.lookedButton.setEnabled(this.cup.getVisible());
        this.rolledButton.setEnabled(this.cup.didRoll());
        this.noMamesButton.setEnabled(false);
        this.audioManager.playAudioForAction(action);
        let update = {
            'action': action,
            'cup': {
                'rolled': this.cup.didRoll(),
                'visible': this.cup.getVisible(),
                'dice': this.cup.getDice().map(d => d.getValue())
            },
            'table': {
                'dice': this.table.getDice().map(d => d.getValue())
            }
        };
        this.server.updateDice(update);
    }

    onPlayersUpdate(playersList) {
        // XXX this is not completely correct.
        // in the event a player joins or leaves the game, it will
        // disable the pass direction button
        this.firstpass = false;
        this.passDirectionButton.setEnabled(false);
        this.playersLabel.updateWithPlayers(playersList);
        if (!this.input.enabled && playersList.getActivePlayer().isMe) {
            // this player is now active
            if (this.fiverPass){
                this.onFiverReceipt();
                return
            }
            this.setPlayable(true);
        }
        if (!playersList.getActivePlayer().isMe){
            this.setPlayable(false)
        }
        if (this.nomames) {
            this.onNoMames();
        }
    }

    onFiverReceipt(){
        this.setPlayable(true);
        this.dice.forEach(d=> {
            d.maxRoll = 5;
        });
        this.cup.maxRoll = 5;
    };

    onDiceUpdate(msg) {
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});

        switch (msg.action) {
            case Action.ROLL_ONE: {
                let table_dice = Array.from(this.table.getDice());
                let new_value = -1;
                msg.table.dice.forEach(die => {
                    let idx = table_dice.findIndex(d => d.getValue() === die);
                    if (idx === -1) {
                        console.assert(new_value === -1);
                        new_value = die;
                    } else {
                        table_dice.splice(idx, 1);
                    }
                });
                // FIXME we don't know which dice to animate
                // when we roll the exact same...
                // I don't think this matters since everyone's orders are different. -ac
                if (new_value !== -1) {
                    table_dice[0].animate(function(target) {
                        target.setValue(new_value);
                    });
                }
                break;
            }
            case Action.MOVE_ONE: {
                //remove all dice
                this.cup.getDice().forEach(d => {
                    this.cup.remove(d);
                });
                this.table.getDice().forEach(d => {
                    this.table.remove(d);
                });

                //refill all dice per message
                let i = 0;
                msg.cup.dice.forEach(die => {
                    this.dice[i].setValue(die);
                    this.cup.add(this.dice[i]);
                    i++
                });
                msg.table.dice.forEach(die => {
                    this.dice[i].setValue(die);
                    this.table.add(this.dice[i]);
                    i++
                });
                console.assert(i === 5);
                break;
            }
            case Action.ROLL_MANY: {
                for (const [i, die] of msg.cup.dice.entries()) {
                    this.cup.getDice()[i].setValue(die);
                }
                break;
            }
        }

        this.audioManager.playAudioForAction(msg.action);

        this.rolledButton.setEnabled(msg.cup.rolled);
        this.lookedButton.setEnabled(msg.cup.visible);
        if (this.fiverPass){
            this.cup.setVisible(msg.cup.visible);
        }

        this.cup.setOnUpdateCb((action, dice) => {
            this.updateCup(action, dice)
        });

        this.table.setOnUpdateCb((action, dice) => {
            this.updateTable(action, dice);
        });
    }

    onNoMames() {
        if (!this.nomames) {
            this.audioManager.playNoMames();
        }
        this.nomames = true;
        this.setPlayable(true);
        this.cup.setVisible(true);
        this.noMamesText.setVisible(true);
        this.makeDeadButton.setEnabled(true);
        this.cupLookButton.setEnabled(false);
        this.cupRollButton.setEnabled(true);
        this.noMamesButton.setEnabled(false);
        this.nextPlayerButton.setEnabled(false);
        this.fiverButton.setEnabled(false);
    }

    onReset() {
        this.scene.restart();
    }

    onPassDirectionChange(isClockwise) {
        if (isClockwise) {
            this.passDirectionButton.setText('>');
        } else {
            this.passDirectionButton.setText('<');
        }
        this.clockwise = isClockwise;
    }
}
