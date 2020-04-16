import { Action } from './message'

export class DiceZone extends Phaser.GameObjects.Zone {
    constructor(scene, x, y, width, height, name) {
        super(scene, x, y, width, height);
        scene.add.existing(this);
        scene.add.text(
            x + 10 - width/2,
            y + 10 - height/2,
            name,
            { fill: '#0f0'}
        );

        this.setInteractive({dropZone: true});
        this.container = scene.add.container();
        this.setName(name);
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(2, 0xffff00);
        this.graphics.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width - 20, this.height - 20);

        this.onUpdateCb = (action) => {};
        this.rolled = false;
    }

    reorder() {
        var objs = this.container.getAll();
        var i = 1;
        for (var obj of objs) {
            obj.x = this.x - this.width / 2 + 96 * i++;
            obj.y = this.y;
        }
    }

    getVisible() {
        return this.container.visible;
    }

    getDice() {
        return this.container.getAll();
    }

    setOnUpdateCb(onUpdateCb) {
        this.onUpdateCb = onUpdateCb;
    }

    setVisible(value) {
        this.container.setVisible(value);
        this.onUpdateCb(Action.SHOW_MANY);
    }

    reset() {
        this.rolled = false;
        this.setVisible(false);
    }

    didRoll() {
        return this.rolled;
    }

    roll() {
        var dice = this.container.getAll();
        for (var die of dice) {
            die.roll();
        }
        this.setVisible(false);
        this.rolled = true;
        this.onUpdateCb(Action.ROLL_MANY);
    }


    add(die) {
        die.x = this.x;
        die.y = this.y;
        
        die.setOnRoll((d) => {
            this.onDieRoll(d);
        });

        this.container.add(die);
        this.reorder();
        this.onUpdateCb(Action.MOVE_ONE);
    }

    remove(die) {
        this.container.remove(die);
        this.reorder();
    }

    setHighlighted(enable) {
        this.graphics.clear();
        if (enable) {
            this.graphics.lineStyle(2, 0x00ffff);
        } else {
            this.graphics.lineStyle(2, 0xffff00);
        }
        this.graphics.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width - 20, this.height - 20);
    }

    onDieRoll(die) {
        this.onUpdateCb(Action.ROLL_ONE);
    }
}
