import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';
import { DiceUpdateMessage } from '../message';
import { PlayersLabel } from '../playerslabel';

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
            }
        });
    }

    preload() {
        this.load.spritesheet('dice', 'assets/andrewDice.png', { frameWidth: 64, frameHeight: 64});
    }

    create() {
        let container = this.add.container();
        this.cup = new DiceZone(this, 305, 100, 600, 150, 'Cup');
        this.cup.setIndividualRoll(false);
        this.table = new DiceZone(this, 305, 300, 600, 150, 'Table');

        let cupRollButton = new TextButton(this, 610, 50, 'Roll', () => {
            this.cup.roll();
        });
        this.add.existing(cupRollButton);

        let cupLookButton = new TextButton(this, 610, 80, 'Look', () => {
            this.cup.setVisible(true);
        });
        this.add.existing(cupLookButton);

        let nextPlayerButton = new TextButton(this, 610, 110, 'Pass', () => {
            this.server.passCup();
        });
        this.add.existing(nextPlayerButton);

        this.dice = [];
        for (let i=0; i<5; i++) {
            let d = new Dice(this, 0, 0);
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
            dropZone.remove(gameObject);
            // XXX if the die is not in a container, it doesn't get rendered
            container.add(gameObject);
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

        let players = this.server.getPlayers();
        this.playersLabel = new PlayersLabel(this, 20, 400, players);
        this.add.existing(this.playersLabel);

        this.cup.setOnUpdateCb(() => {
            this.updateDice()
        });

        this.table.setOnUpdateCb(() => {
            this.updateDice();
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

    onPlayersUpdate(players) {
        console.log("Players update!");
        this.playersLabel.updateWithPlayers(players);
    }

    onDiceUpdate(msg) {
        // FIXME have concept of "active" player instead
        this.cup.setOnUpdateCb( () => {} );
        this.table.setOnUpdateCb( () => {} );

        console.log("Dice update! ", msg);
        let i = 0;
        msg.cup.dice.forEach(die => {
            console.log('cup die ', i, ' to ', die);
            this.dice[i].setValue(die);
            this.cup.add(this.dice[i]);
            i++
        });
        msg.table.dice.forEach(die => {
            console.log('table die ', i, ' to ', die);
            this.dice[i].setValue(die);
            this.table.add(this.dice[i]);
            i++
        });
        console.log('setting cup visibility to ', msg.cup.visible);
        this.cup.setVisible(msg.cup.visible);
        console.assert(i === 5);

        this.cup.setOnUpdateCb(() => {
            this.updateDice()
        });

        this.table.setOnUpdateCb(() => {
            this.updateDice();
        });
    }

}
