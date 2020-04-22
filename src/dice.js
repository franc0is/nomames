export class Dice extends Phaser.GameObjects.Container {

    constructor(scene, x, y, initial_value) {
        super(scene, x, y);

        this.lastClickTime = 0;

        this.setName('diceContainer');
        this.setPosition(x, y);
        this.setSize(100,150);
        this.setInteractive();

        this.on('pointerdown', this.onClick, this);

        this.die = new DiceSprite(scene, x, y, initial_value);
        scene.add.existing(this.die);

        this.dieTag = scene.add.text(x-5,y+36,0,{color: 'yellow', fontsize: '6px'});
        this.dieTag.setVisible(false);

        this.rollCount = 0;
        this.maxRoll = 1;

        this.setValue(initial_value);
        this.onRollCb = () => {};

        this.tween = this.die.tween;

        this.passFive = false;

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

    didRoll(){
        return (this.rollCount >= this.maxRoll);
    }

    setValue(value) {
        this.value = value;
        this.die.setValue(value);
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

    setX(x){
        this.x = x;
        this.die.x = x;
        this.dieTag.x = x-5;
    }

    setY(y) {
        this.y = y;
        this.die.y = y;
        this.dieTag.y = y+36;
    }
    
    setLocation(x,y) {
        this.setPosition(x,y);
        this.die.setPosition(x,y);
        this.dieTag.setPosition(x-5,y+36);
    }
}

class DiceSprite extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, initial_value){
        super(scene, x, y);

        this.setName('dice');
        this.setTexture('dice');
        this.setPosition(x, y);
        
        this.setValue(initial_value);

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

    setValue(value) {
        // FIXME frames do not match neatly to values
        this.value = value;
        this.setFrame(value);
    }
}
