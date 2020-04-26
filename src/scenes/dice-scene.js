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

        this.noMamesText = this.add.text(270, 180, "🚨🖕🚨 NO MAMES GUEY 🚨🖕🚨", { fill: 'red' });
        this.noMamesText.setVisible(false);

        this.fiverText = this.add.text(220,180, '🎲🎲🎲🎲🎲 !! FIVE OF A KIND !! 🎲🎲🎲🎲🎲',{color: '#0f0'});
        this.fiverText.setVisible(false);

        this.fiverTryText = this.add.text(220,180, 'ROLLIN ROLLIN ROLLIN - GOING FOR IT!!',{color: 'yellow'});
        this.fiverTryText.setVisible(false);

        this.fiverFailText = this.add.text(220 , 180, '😢😭😢 BETTER LUCK NEXT TIME 😢😭😢', {color: 'yellow'});
        this.fiverFailText.setVisible(false);

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

        this.cheaterButton = new TextButton(this, 690, 370, 'Cheat', {
            onClick: () => {
                if (this.fiverPass){
                    for (let i = 0; i<4;i++){
                        this.dice[i].setValue(3);
                    }
                }
            }
        });
        this.add.existing(this.cheaterButton);

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

        this.cup.setOnMoveCb((action, dice) => {
            this.moveCup(action, dice);
        })

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
        
        //disable the pass direction button on first pass
        this.passDirectionButton.setEnabled(false);

        //reset all of the dice's rollcounts and tell dice and cup if 5 dice were passed
        this.dice.forEach(d=> {
            d.resetRoll();
            d.passFive = fp;
        });
        this.cup.fiver = fp;
    }

    setPlayable(playable) {
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});
        this.cup.setOnMoveCb((action, dice) => {});

        this.input.enabled = playable;
        this.cup.reset();
        this.cupLookButton.setEnabled(playable);
        this.cupRollButton.setEnabled(playable);
        this.noMamesButton.setEnabled(playable);
        this.resetButton.setEnabled(playable);
        if (!this.fiverPass){
            this.nextPlayerButton.setEnabled(playable);
            this.fiverButton.setEnabled(playable);
        } else {
            this.nextPlayerButton.setEnabled(false);
            this.fiverButton.setEnabled(false);
            this.fiverText.setVisible(true)
        }
        if (!playable) {
            this.passDirectionButton.setEnabled(false);
            this.lookedButton.setEnabled(false);
            this.rolledButton.setEnabled(false);
        }

        this.cup.setOnUpdateCb((action, dice) => {
            this.updateCup(action, dice)
        });

        this.table.setOnUpdateCb((action, dice) => {
            this.updateTable(action, dice);
        });

        this.cup.setOnMoveCb((action, dice) => {
            this.moveCup(action, dice);
        })
    }

    updateCup(action, dice) {
        if (action === Action.ROLL_ONE) {
            console.log('this should not have happened - roll_one inside cup')
            //this.table.add(dice[0]);
            return
        }
        this.updateDice(action);
    }

    moveCup(action, dice) {
        this.table.setOnUpdateCb((action, dice) => {});
        
        this.table.add(dice[0]);

        this.table.setOnUpdateCb((action, dice) => {
            this.updateTable(action, dice);
        })

    }


    updateTable(action, dice) {
        this.updateDice(action);
    }

    updateDice(action) {
        console.log('updateing dice: '+ action);
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});
        this.cup.setOnMoveCb((action, dice) => {});

        if (this.fiverPass) {
            this.cup.getDice().forEach(d=>{
                if (d.didRoll()){
                    this.table.add(d);
                }
            });
        }

        this.cup.setOnUpdateCb((action, dice) => {
            this.updateCup(action, dice)
        });

        this.table.setOnUpdateCb((action, dice) => {
            this.updateTable(action, dice);
        });

        this.cup.setOnMoveCb((action, dice) => {
            this.moveCup(action, dice);
        })

        if (this.firstpass) {
            let allrolled = this.allRolled(1);
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
                'dice': this.cup.getDice().map(d => [d.getValue(),d.rollCount])
            },
            'table': {
                'dice': this.table.getDice().map(d => [d.getValue(),d.rollCount])
            }
        };
        console.log(update);
        this.server.updateDice(update);
        if (this.fiverPass && !this.noMames){
            if(this.allFive()){
                this.server.noMames(NMType.ROLLED_5, 0);
                console.log('rolled 5');
            } else if (this.allRolled(5)) {
                this.server.noMames(NMType.FAILED_5, 0);
                console.log('failed 5');
            }
            if (this.cup.visible && !this.fiverTryText.visible){
                this.fiverText.setVisible(false);
                this.fiverTryText.setVisible(true);
                console.log('cup is visible in updateDice');
            }
        }
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
        this.cup.setOnMoveCb((action, dice) => {});
        console.log({msg});

        switch (msg.action) {
            case Action.ROLL_ONE: {
                let table_dice = Array.from(this.table.getDice());
                let new_value = -1;
                let new_rollCount = -1;
                msg.table.dice.forEach(die => {
                    let idx = table_dice.findIndex(d => d.getValue() === die[0]);
                    if (idx === -1) {
                        console.assert(new_value === -1);
                        new_value = die[0];
                        new_rollCount = die[1];
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
                    table_dice[0].setRoll(new_rollCount);
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
                    this.dice[i].setRoll(die[1]);
                    this.dice[i].setValue(die[0]);
                    this.cup.add(this.dice[i]);
                    i++
                });
                msg.table.dice.forEach(die => {
                    this.dice[i].setValue(die[0]);
                    this.dice[i].setRoll(die[1]);
                    this.table.add(this.dice[i]);
                    i++
                });
                console.assert(i === 5);
                break;
            }
            case Action.ROLL_MANY: {
                this.cup.incRoll();
                for (const [i, die] of msg.cup.dice.entries()) {
                    this.cup.getDice()[i].setValue(die[0]);
                    this.cup.getDice()[i].setRoll(die[1]);
                }
                break;
            }
        }

        this.audioManager.playAudioForAction(msg.action);

        this.rolledButton.setEnabled(msg.cup.rolled);
        this.lookedButton.setEnabled(msg.cup.visible);
        if (this.fiverPass){
            this.cup.setVisible(msg.cup.visible);
            if (msg.cup.visible){
                if(this.fiverText.visible){
                    this.fiverText.setVisible(false);
                    this.fiverTryText.setVisible(true);
                    console.log('cup visible in onDiceUpdate');
                }
            }
        }

        this.cup.setOnUpdateCb((action, dice) => {
            this.updateCup(action, dice)
        });

        this.table.setOnUpdateCb((action, dice) => {
            this.updateTable(action, dice);
        });

        this.cup.setOnMoveCb((action, dice) => {
            this.moveCup(action, dice);
        })
    }

    onNoMames(nmtype, audionum) {
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});
        this.cup.setOnMoveCb((action, dice) => {});
        
        //added switch to address multiple types of endings and add audio sync capabilities
        switch (nmtype){
            case NMType.NO_MAMES: {
                if (!this.nomames){
                    this.audioManager.playNoMames(audionum);
                    this.noMamesText.setVisible(true); 
                    console.log('no mames, no mames');
                }
                break;
            }
            case NMType.FAILED_5: {
                this.fiverTryText.setVisible(false);
                this.fiverFailText.setVisible(true);
                console.log('no mames, failed 5');
                break;
            }
            case NMType.ROLLED_5: {
                this.fiverTryText.setVisible(false);
                this.fiverText.setVisible(true);
                console.log('no mames, rolled 5');
                break;
            }
        };
        let d = this.dice;
        console.log({d});

        this.nomames = true;
        this.setPlayable(true);
        this.cup.setVisible(true);
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

    allFive() {
        let d = this.dice[0];
        let fiveSame = this.dice.reduce((previous,die) => (previous && d.value === die.value), this.allRolled(1));
        console.log(fiveSame);
        return fiveSame;
    }

    allRolled(num) {
        return this.dice.reduce((previous, die) => (previous && die.rollCount >=num), true)
    }
}
