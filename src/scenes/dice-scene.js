import PubNub from 'pubnub';
import { Dice } from '../dice';
import { DiceZone } from '../dice-zone';
import { TextButton } from '../text-button';

export class DiceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'diceScene' });
    }

    init(data) {
        this.server = data.server;
    }

    preload() {
        this.load.spritesheet('dice', 'assets/diceRed.png', { frameWidth: 64, frameHeight: 64});
    }

    create() {
        let container = this.add.container();
        let cup = new DiceZone(this, 305, 100, 600, 150, 'Cup');
        cup.setIndividualRoll(false);
        let table = new DiceZone(this, 305, 300, 600, 150, 'Table');

        let cupRollButton = new TextButton(this, 610, 50, 'Roll', () => {
            cup.roll();
        });
        this.add.existing(cupRollButton);

        let cupLookButton = new TextButton(this, 610, 80, 'Look', () => {
            cup.setVisible(true);
        });
        this.add.existing(cupLookButton);

        let cupLiftButton = new TextButton(this, 610, 110, 'Lift', () => {
            // TODO
        });
        this.add.existing(cupLiftButton);

        for (let i=0; i<5; i++) {
            let d = new Dice(this, 0, 0);
            this.add.existing(d);
            this.input.setDraggable(d);
            cup.add(d);
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
    }
}
