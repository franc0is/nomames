export class Dice extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, initial_value) {
        super(scene, x, y);

        this.lastClickTime = 0;

        this.setName('dice');
        this.setTexture('dice');
        this.setPosition(x, y);

        this.setInteractive();
        this.on('pointerdown', this.onClick, this);

        this.setValue(initial_value);
        this.onRollCb = () => {};
        this.didRoll = false;

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

    setIndividualRoll(enabled) {
        this.individualRoll = enabled;
    }

    setOnRoll(onRollCb) {
        this.onRollCb = onRollCb;
    }

    setValue(value) {
        // FIXME frames do not match neatly to values
        this.value = value;
        this.setFrame(value);
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
        this.didRoll = false;
    }

    markRolled() {
        this.didRoll = true;
    }

    animate(cb) {
        // looks like there's phaser bug here
        // if I don't specify arguments, it crashes
        this.tween.setCallback('onLoop', cb, [this], this);
        this.tween.play();
    }

    onClick() {
        if (this.didRoll) {
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
        this.setValue(n);
        this.onRollCb(this);
        this.markRolled();
    }
}
