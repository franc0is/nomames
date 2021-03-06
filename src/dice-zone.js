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
        this.rollCount = 0;
        this.maxRoll = 1;
        this.onUpdateCb = (action, dice) => {};
        this.onMoveCb = (action, dice) => {};
        this.fiver = false;

        this.fpText = scene.add.text(this.x+this.width/2-50,this.y + this.height/2-15,'0/5',{color: 'yellow', fontsize: '6px'});
        this.fpText.setVisible(false);
    }

    reorder() {
        var objs = this.container.getAll();
        var i = 0;
        for (var obj of objs) {
            obj.x = this.x - (this.width / 2) + 96 * i++ + 45;
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

    setOnMoveCb(cb) {
        this.onMoveCb = cb;
    }

    setVisible(value) {
        this.container.setVisible(value);
        this.fpText.setVisible(this.fiver);
        var dice = this.container.getAll();
        for (var die of dice){
            die.setVisible(value);
        }
        this.onUpdateCb(Action.SHOW_MANY, this.getDice());
    }

    reset() {
        this.rollCount = 0;
        this.setVisible(false);
        this.fpText.setText('0/5');
    }

    didRoll() {
        return (this.rollCount >= this.maxRoll)
    }

    roll() {
        // disable onupdatecb so we don't get updates for individual rolls
        let cb = this.onUpdateCb;
        this.onUpdateCb = (action, dice) => {};

        var dice = this.container.getAll();
        for (var die of dice) {
            die.roll();
        }
        this.setVisible(false);
        this.rollCount++;
        this.fpText.setText(this.rollCount + '/5');
        // re-enable onupdatecb
        this.onUpdateCb = cb;
        this.onUpdateCb(Action.ROLL_MANY, this.getDice());
    }

    add(die) {
        die.x = this.x;
        die.y = this.y;
        die.setOnRoll((d) => {
            this.onDieRoll(d);
        });
        die.setOnMove((d) => {
            this.onDieMove(d);
        });
        
        die.setVisible(this.getVisible());
        this.container.add(die);
        this.reorder();
        this.onUpdateCb(Action.MOVE_ONE, [die]);
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
        this.onUpdateCb(Action.ROLL_ONE, [die]);
    }

    onDieMove(die) {
        this.onMoveCb(Action.ROLL_ONE, [die]);
    }

    incRoll(){
        this.rollCount++
        this.fpText.setText(this.rollCount + '/5');
    }
}
