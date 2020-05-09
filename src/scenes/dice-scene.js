import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';
import { Action } from '../message';
import { NMType } from '../message';
import { PlayersLabel } from '../playerslabel';
import { NMAudioManager } from '../audio';


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

    }

    init(data) {
        this.audioManager = data.audioManager;
        this.playersList = data.playersList;
        this.scene.bringToTop('adminMenuScene');
    }

    preload() {
        this.load.spritesheet('dice', 'assets/dice-pixel.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('life', 'assets/life_spritesheet.png', { frameWidth: 90, frameHeight: 22});
        this.audioManager.preload();
    }

    create() {
        this.audioManager.create();

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

        this.fiverWinText = this.add.text(220 , 180, '🎲🎲🎲🎲🎲 !! FIVE OF A KIND !! 🎲🎲🎲🎲🎲', {color: 'yellow'});
        this.fiverWinText.setVisible(false);

        this.firstpass = true;
        this.clockwise = true;

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

        let isMe = this.playersList.getActivePlayer().isMe;
        this.playersLabel = new PlayersLabel(this, 5, 30, this.playersList);
        this.add.existing(this.playersLabel)

        if(!isMe) {
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
        //reset all of the dice's rollcounts and tell dice and cup if 5 dice were passed
        this.dice.forEach(d=> {
            d.resetRoll();
            d.passFive = fp;
        });
        this.cup.fiver = fp;
        this.firstpass = false;
        if(fp) {
            this.fiverText.setVisible(true);
        }
    }

    setPlayable(playable) {
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});
        this.cup.setOnMoveCb((action, dice) => {});

        this.input.enabled = playable;
        this.cup.reset();

        if (this.fiverPass && !this.nomames){
            this.fiverText.setVisible(true)
        }

        this.lookedButton.setEnabled(false);
        this.rolledButton.setEnabled(false);

        if (playable) {
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
    }

    updateCup(action, dice) {
        if (action === Action.ROLL_ONE) {
            console.log('this should not have happened - roll_one inside cup')
            this.table.setOnUpdateCb((action, dice) => {});
        
            this.table.add(dice[0]);

            this.table.setOnUpdateCb((action, dice) => {
                this.updateTable(action, dice);
            })
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
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});
        this.cup.setOnMoveCb((action, dice) => {});

        if (this.fiverPass && !this.nomames) {
            this.cup.getDice().forEach(d=>{
                if (d.didRoll() && d.getVisible()){
                    this.table.add(d);
                }
            });
        }


        if (this.firstpass) {
            let allrolled = this.dice.reduce((previous, die) => (previous && die.didRoll()), true /* initial value */);
            if (allrolled){
                this.events.emit('allRolled', []);
            }
        }

        this.cup.reorder();
        this.table.reorder();
        this.lookedButton.setEnabled(this.cup.getVisible());
        this.rolledButton.setEnabled(this.cup.didRoll());
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

        this.events.emit('diceUpdate',[update]);

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

    onPlayersUpdate(playersList) {
        this.playersLabel.updateWithPlayers(playersList);
        if (!this.input.enabled && playersList.getActivePlayer().isMe) {
            // this player is now active
            if (this.fiverPass){
                this.onFiverReceipt();
                return
            }
        }
    }

    onFiverReceipt(){
        this.dice.forEach(d=> {
            d.maxRoll = 5;
        });
        this.cup.maxRoll = 5;
    };

    onDiceUpdate(msg) {
            this.cup.setOnUpdateCb((action, dice) => {});
            this.table.setOnUpdateCb((action, dice) => {});
            this.cup.setOnMoveCb((action, dice) => {});

            switch (msg.action) {
                case Action.ROLL_ONE: {
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
                        this.dice[i].setRoll(die[1]);
                        this.dice[i].setValue(die[0]);
                        this.table.add(this.dice[i]);
                        i++
                    });
                    console.assert(i === 5);

                    let new_value = this.dice[4].getValue()
                    this.dice[4].setValue(0);
                    this.dice[4].animate(function(target) {
                        target.setValue(new_value);
                    });
                
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
                    }
                }
            }
            if(!this.nomames){
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
    }

    onNoMames(nmt, audionum) {
        this.nomames = true;
        this.cup.setOnUpdateCb((action, dice) => {});
        this.table.setOnUpdateCb((action, dice) => {});
        this.cup.setOnMoveCb((action, dice) => {});

        this.fiverFailText.setVisible(false);
        this.fiverText.setVisible(false);
        this.fiverTryText.setVisible(false);

        //added switch to address multiple types of endings and added audio sync capabilities
        switch (nmt){
            case NMType.NO_MAMES: {
                this.audioManager.playNoMames(audionum);
                this.noMamesText.setVisible(true); 
                this.cup.setVisible(true);
                break;
            }
            case NMType.FAILED_5: {
                this.fiverFailText.setVisible(true);
                this.cup.setVisible(true);
                break;
            }
            case NMType.ROLLED_5: {
                this.fiverWinText.setVisible(true);
                this.cup.setVisible(true);
                break;
            }
        };
    }

    onReset(playersList) {
        this.playersList = playersList;
        this.scene.restart();
    }

    roll(){
        this.cup.roll();
        if (this.cup.didRoll()){
            this.events.emit('cupRolled', []);
        }
    };

    look(){
        this.cup.setVisible(true);
    }

    checkFive() {
        if (this.fiverPass && !this.nomames){
            if (this.fiverText.visible){
                this.fiverText.setVisible(false);
                this.fiverTryText.setVisible(true);
            }
            let d = this.dice[0];
            let allFive = this.dice.reduce((previous,die) => (previous && d.value === die.value && die.rollCount >=1 && die.visible), true);
            
            if(allFive){
                this.events.emit('noMames',[NMType.ROLLED_5, 0]);
                return
            } else {
                let rolledDice = [];
                this.dice.forEach(die => {
                    if (die.didRoll()){
                        rolledDice.push(die);
                    }
                });
                if (rolledDice.length >1){
                    let value = rolledDice[0].value
                    let notFailedFiver = rolledDice.reduce((previous, die) => previous && die.value === value, true);
                    if (!notFailedFiver){
                        this.events.emit('noMames',[NMType.FAILED_5, 0]);
                        return
                    }
                }
            }
        }
    }

    startTurn() {
        this.lookedButton.setEnabled(false);
        this.rolledButton.setEnabled(false);
    }
}
