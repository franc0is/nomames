import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';
import { Action } from '../message';
import { PlayersLabel } from '../playerslabel';
import { Life } from '../life';

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
            }
        });
    }

    preload() {
        this.load.spritesheet('dice', 'assets/dice-pixel.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('life', 'assets/life_spritesheet.png', { frameWidth: 90, frameHeight: 22});
        this.load.image('heart','assets/heart.png');
        this.load.image('crown','assets/crown.png');
        this.load.image('harlequin', 'assets/harlequin.png');
        this.load.image('skull','assets/skull.png');
    }

    create() {
        this.nomames = false;
        this.cup = new DiceZone(this, 305, 300, 600, 150, 'Cup');
        this.cup.setIndividualRoll(false);
        this.table = new DiceZone(this, 305, 100, 600, 150, 'Table');

        this.noMamesText = this.add.text(200, 180, "🚨🚨 NO MAMES 🚨🚨", { fill: 'red' });
        this.noMamesText.setVisible(false);

        this.cupRollButton = new TextButton(this, 610, 30, 'Roll', {
            onClick: () => {
                this.cup.roll();
                this.cupRollButton.setEnabled(false);
                this.noMamesButton.setEnabled(false);
                this.cupLookButton.setEnabled(true);
                if (this.nomames) {
                    this.onNoMames();
                }
            }
        });
        this.add.existing(this.cupRollButton);

        this.cupLookButton = new TextButton(this, 610, 60, 'Look', {
            onClick: () => {
                this.cup.setVisible(true);
                this.noMamesButton.setEnabled(false);
                this.cupLookButton.setEnabled(false);
            }
        });
        this.add.existing(this.cupLookButton);

        this.nextPlayerButton = new TextButton(this, 610, 90, 'Pass', {
            onClick: () => {
                this.server.passCup(this.clockwise);
            },
        });
        this.add.existing(this.nextPlayerButton);

        this.clockwise = true;
        this.passDirectionButton = new TextButton(this, 660, 90, '>',{
            onClick: () => {
                this.onPassDirectionChange(!this.clockwise);
            }
        });
        this.add.existing(this.passDirectionButton);

        this.makeDeadButton = new TextButton(this, 610, 120, 'Die', {
            onClick: () => {
                let playersList = this.server.getPlayersList();
                this.server.killPlayer(playersList.getMe());
            }
        });
        this.add.existing(this.makeDeadButton);
        this.makeDeadButton.setEnabled(false);

        this.noMamesButton = new TextButton(this, 610, 150, 'No Mames!', {
            onClick: () => {
                this.server.noMames();
            }
        });
        this.add.existing(this.noMamesButton);

        this.resetButton = new TextButton(this, 610, 180, 'Reset', {
            onClick: () => {
                this.server.reset()
            }
        });
        this.add.existing(this.resetButton);

        this.lookedButton = new TextButton(this, 610, 250, 'Looked', {
            onClick: () => {
            }
        });
        this.add.existing(this.lookedButton);
        this.lookedButton.setEnabled(false);

        this.rolledButton = new TextButton(this, 610, 280, 'Rolled', {
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
        this.lives = [];
        let k = 0
        let pList = this.server.getPlayersList();
        pList.getPlayers().forEach( player => {
            let l = new Life(this, 100*k+59, 468, 3-player.numLives);
            this.add.existing(l);
            this.lives.push(l);
            k++;
        });

        this.input.on('drag', function(pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragenter', function(pointer, gameObject, dropZone) {
            dropZone.setHighlighted(true);
        });

        this.input.on('dragleave', function(pointer, gameObject, dropZone) {
            dropZone.setHighlighted(false);
        });

        this.input.on('drop', function(pointer, gameObject, dropZone) {
            dropZone.add(gameObject);
            dropZone.setHighlighted(false);
        });

        this.input.on('dragend', function(pointer, gameObject, dropZone) {
            if (!dropZone) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        let playersList = this.server.getPlayersList();
        this.playersLabel = new PlayersLabel(this, 20, 400, playersList);
        this.add.existing(this.playersLabel);

        if (!playersList.getActivePlayer().isMe) {
            this.setPlayable(false);
        }

        this.cup.setOnUpdateCb((action) => {
            this.updateDice(action)
        });

        this.table.setOnUpdateCb((action) => {
            this.updateDice(action);
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

    setPlayable(playable) {
        this.lookedButton.setEnabled(false);
        this.rolledButton.setEnabled(false);
        this.input.enabled = playable;
        this.cup.reset();
        this.cupLookButton.setEnabled(playable);
        this.cupRollButton.setEnabled(playable);
        this.noMamesButton.setEnabled(playable);
        this.resetButton.setEnabled(playable);
        this.nextPlayerButton.setEnabled(playable);
        this.dice.forEach(dice => {
            dice.resetRoll();
        });
        if (!playable) {
            this.passDirectionButton.setEnabled(false);
        }
    }

    updateDice(action) {
        // we've taken an action that changes dice,
        // no mames is disabled
        this.lookedButton.setEnabled(this.cup.getVisible());
        this.rolledButton.setEnabled(this.cup.didRoll());
        this.noMamesButton.setEnabled(false);
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
        this.passDirectionButton.setEnabled(false);
        this.playersLabel.updateWithPlayers(playersList);
        if (!this.input.enabled && playersList.getActivePlayer().isMe) {
            // this player is now active
            this.setPlayable(true);
        }
        if (!playersList.getActivePlayer().isMe){
            this.setPlayable(false)
        }
        if (this.nomames) {
            this.onNoMames();
        }
    }

    onDiceUpdate(msg) {
        this.cup.setOnUpdateCb((action) => {});
        this.table.setOnUpdateCb((action) => {});

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
                if (new_value !== -1) {
                    table_dice[0].animate(function(target) {
                        target.setValue(new_value);
                    });
                }
                break;
            }
            case Action.MOVE_ONE: {
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

        this.rolledButton.setEnabled(msg.cup.rolled);
        this.lookedButton.setEnabled(msg.cup.visible);

        this.cup.setOnUpdateCb((action) => {
            this.updateDice(action)
        });

        this.table.setOnUpdateCb((action) => {
            this.updateDice(action);
        });
    }

    onNoMames() {
        this.nomames = true;
        this.setPlayable(true);
        this.cup.setVisible(true);
        this.noMamesText.setVisible(true);
        this.makeDeadButton.setEnabled(true);
        this.cupLookButton.setEnabled(false);
        this.cupRollButton.setEnabled(false);
        this.noMamesButton.setEnabled(false);
        this.nextPlayerButton.setEnabled(false);
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
