export class Dice extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y);

        this.lastClickTime = 0;

        this.setName('dice');
        this.setTexture('dice');
        this.setPosition(x, y);

        this.setInteractive();
        this.individualRoll = true;
        this.on('pointerdown', this.onClick, this);

        this.setValue(1);
        this.onRollCb = () => {};
        this.didRoll = false;
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

    onClick() {
        if (!this.individualRoll || this.didRoll) {
            return;
        }
        // 350ms double click for rolling
        let clickDelay = this.scene.time.now - this.lastClickTime;
        this.lastClickTime = this.scene.time.now;
        if (clickDelay < 350) {
            this.roll();
            this.didRoll = true;
        }
    }

    roll() {
        let n = Phaser.Math.RND.between(0, 5);
        this.setValue(n);
        this.onRollCb(this);
    }
}
