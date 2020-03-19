export class Dice extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y);
        console.log("hello!");

        this.lastClickTime = 0;

        this.setName('dice');
        this.setTexture('dice');
        this.setPosition(x, y);

        this.setInteractive();
        this.individualRoll = true;
        this.on('pointerdown', this.onClick, this);

        this.setFrame(1);
    }

    setIndividualRoll(enabled) {
        this.individualRoll = enabled;
    }

    onClick()
    {
        if (!this.individualRoll) {
            return;
        }
        // 350ms double click for rolling
        let clickDelay = this.scene.time.now - this.lastClickTime;
        this.lastClickTime = this.scene.time.now;
        if (clickDelay < 350) {
            this.roll();
        }
    }

    roll()
    {
        let n = Phaser.Math.RND.pick([0,1,2,4,5,6]);
        this.setFrame(n);
    }
}
