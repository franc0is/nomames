export class Dice extends Phaser.GameObjects.Container {

    constructor(scene, x, y, initial_value) {
        super(scene, x, y);
        this.x = x;
        this.y = y;
        
        scene.add.existing(this);
        this.lastClickTime = 0;

        this.setName('diceContainer');
        //this.setPosition(x, y);

        this.on('pointerdown', this.onClick, this);


        this.die = new DiceSprite(scene, x, y, initial_value);
        scene.add.existing(this.die);

        this.setSize(this.die.width,this.die.height+50);
        this.setInteractive();

        this.dieTag = scene.add.text(x-5,y+36,0,{color: 'yellow', fontsize: '6px'});
        this.dieTag.setVisible(false);

        this.rollCount = 0;
        this.maxRoll = 1;

        this.setValue(initial_value);
        this.onRollCb = () => {};
        this.onMoveCb = () => {};

        this.tween = this.die.tween;
        this.die.setValue = (value) => {this.setValue(value)};
        this.die.setRoll = (val) => {this.setRoll(val)};

        this.passFive = false;
        this.add(this.die);
        this.add(this.dieTag);
    }

    setVisible(visibility) {
        this.die.setVisible(visibility);
        if (this.passFive){
            this.dieTag.setVisible(visibility);
        }
    }

    setOnRoll(onRollCb) {
        this.onRollCb = onRollCb;
    }

    setOnMove(cb) {
        this.onMoveCb = cb;
    }

    didRoll(){
        return (this.rollCount >= this.maxRoll);
    }

    setValue(value) {
        this.value = value;
        this.die.setVal(value);
        this.dieTag.setText(this.rollCount);
    }

    getValue() {
        return this.value;
    }

    serialize() {
        return {
            'frame': this.getValue()
        }
    }

    resetRoll() {
        this.rollCount = 0;
        this.dieTag.setText(0);
    }

    setRoll(value) {
        this.rollCount = value;
        this.dieTag.setText(value);
    }

    markRolled() {
        this.rollCount++;
    }

    animate(cb) {
        // looks like there's phaser bug here
        // if I don't specify arguments, it crashes
        this.tween.setCallback('onLoop', cb, [this], this);
        this.tween.play();
    }

    onClick() {
        if (this.rollCount >= this.maxRoll) {
            return;
        }
        // 350ms double click for rolling
        let clickDelay = this.scene.time.now - this.lastClickTime;
        this.lastClickTime = this.scene.time.now;
        if (clickDelay < 350) {
            let n = Phaser.Math.RND.between(0, 5);
            this.setValue(n)
            this.onMoveCb(this);
            this.animate(function(target) {
                target.roll();
            });
        }
    }

    roll() {
        let n = Phaser.Math.RND.between(0, 5);
        this.markRolled();
        this.setValue(n);
        this.onRollCb(this);
    }
}

class DiceSprite extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, initial_value){
        super(scene, x, y);

        this.setName('dice');
        this.setTexture('dice');
        this.setPosition(x, y);
        
        this.setRoll = (value) => {};
        this.setValue = (value) => {};

        this.setVal(initial_value);

        this.tween = scene.tweens.add({
            targets: this,
            angle: { from: 0, to: 360 },
            ease: 'Linear',
            loop: 1,
            loopDelay: -2,
            duration: 350,
            repeat: 0,
            paused: true
        });
    }

    animate(cb) {
        // looks like there's phaser bug here
        // if I don't specify arguments, it crashes
        this.tween.setCallback('onLoop', cb, [this], this);
        this.tween.play();
    }

    setVal(value) {
        // FIXME frames do not match neatly to values
        this.setFrame(value);
    }
}
