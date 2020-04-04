import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';
import { DiceUpdateMessage } from '../message';
import { PlayersLabel } from '../playerslabel';

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
            }
        });
    }

    preload() {
        this.load.spritesheet('dice', 'assets/andrewDice.png', { frameWidth: 64, frameHeight: 64});
    }

    create() {
        this.nomames = false;
        this.cup = new DiceZone(this, 305, 100, 600, 150, 'Cup');
        this.cup.setIndividualRoll(false);
        this.table = new DiceZone(this, 305, 300, 600, 150, 'Table');

        this.noMamesText = this.add.text(200, 180, "🚨🚨 NO MAMES 🚨🚨", { fill: 'red' });
        this.noMamesText.setVisible(false);

        this.cupRollButton = new TextButton(this, 610, 30, 'Roll', () => {
            this.cup.roll();
            this.cupRollButton.setEnabled(false);
            if (this.nomames) {
                this.onNoMames();
            }
        });
        this.add.existing(this.cupRollButton);

        let cupLookButton = new TextButton(this, 610, 60, 'Look', () => {
            this.cup.setVisible(true);
            this.noMamesButton.setEnabled(false);
        });
        this.add.existing(cupLookButton);

        let nextPlayerButton = new TextButton(this, 610, 90, 'Pass', () => {
            this.server.passCup();
        });
        this.add.existing(nextPlayerButton);

        let makeDeadButton = new TextButton(this, 610, 120, 'Die', () => {
            // FIXME needs to send this to server & other players
            this.server.killPlayer(this.playersList.getMe());
        });
        this.add.existing(makeDeadButton);

        this.noMamesButton = new TextButton(this, 610, 150, 'No Mames!', () => {
            this.server.noMames();
        });
        this.add.existing(this.noMamesButton);

        let resetButton = new TextButton(this, 610, 180, 'Reset', () => {
            this.server.reset()
        });
        this.add.existing(resetButton);

        this.dice = [];
        for (let i=0; i< NUM_DICE; i++) {
            let d = new Dice(this, 0, 0, NUM_DICE - i);
            this.add.existing(d);
            this.input.setDraggable(d);
            this.cup.add(d);
            this.dice.push(d);
        }

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

        this.playersList = this.server.getPlayersList();
        this.playersLabel = new PlayersLabel(this, 20, 400, this.playersList);
        this.add.existing(this.playersLabel);

        if (!this.playersList.getActivePlayer().isMe) {
            this.setPlayable(false);
        }

        this.cup.setOnUpdateCb(() => {
            this.updateDice()
        });

        this.table.setOnUpdateCb(() => {
            this.updateDice();
        });
    }

    setPlayable(playable) {
        this.input.enabled = playable;
        this.cup.setVisible(false);
        this.cupRollButton.setEnabled(true);
        this.noMamesButton.setEnabled(true);
        this.table.getDice().forEach(dice => {
            dice.resetRoll();
        });
    }

    updateDice() {
        let update = {
            'cup': {
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
        this.playersList = playersList;
        this.setPlayable(playersList.getActivePlayer().isMe);
        this.playersLabel.updateWithPlayers(playersList);
        if (this.nomames) {
            this.onNoMames();
        }
    }

    onDiceUpdate(msg) {
        this.cup.setOnUpdateCb(() => {});
        this.table.setOnUpdateCb(() => {});

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

        this.cup.setOnUpdateCb(() => {
            this.updateDice()
        });

        this.table.setOnUpdateCb(() => {
            this.updateDice();
        });
    }

    onNoMames() {
        this.nomames = true;
        this.setPlayable(true);
        this.cup.setVisible(true);
        this.noMamesText.setVisible(true);
    }

    onReset() {
        this.scene.restart();
    }
}
