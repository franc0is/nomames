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
        this.individualRoll = true
    }

    reorder() {
        var objs = this.container.getAll('visible', true);
        var i = 1;
        for (var obj of objs) {
            obj.x = this.x - this.width / 2 + 96 * i++;
            obj.y = this.y;
        }
    }

    setVisible(value) {
        this.container.setVisible(value);
    }

    roll() {
        var dice = this.container.getAll('visible', true);
        for (var die of dice) {
            die.roll();
        }
        this.setVisible(false);
    }

    setIndividualRoll(enabled) {
        var dice = this.container.getAll('visible', true);
        for (var die of dice) {
            die.setIndividualRoll(enabled);
        }
        this.individualRoll = enabled;
    }

    add(gameObject) {
        gameObject.x = this.x;
        gameObject.y = this.y;
        gameObject.setIndividualRoll(this.individualRoll);
        this.container.add(gameObject);
        this.reorder();
    }

    remove(gameObject) {
        this.container.remove(gameObject);
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
}
