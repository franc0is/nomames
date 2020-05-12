export class SeatZone extends Phaser.GameObjects.Zone {
    constructor(scene, x, y, width, height, name) {
        super(scene, x, y, width, height);
        scene.add.existing(this);
        this.nameText = scene.add.text(
            x + 10 - width/2,
            y + 80 - height/2,
            name,
            { fill: '#0f0'}
        );

        this.setInteractive({dropZone: true});
        this.container = scene.add.container();
        this.setName(name);
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(2, 0xffff00);
        this.graphics.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width - 20, this.height - 20);
        this.onUpdateCb = () => {};
    }

    setLabel(value){
        console.log('value received: '+value);
        this.nameText.text = value;
    }

    setUpdate(CB){
        this.onUpdateCb = CB;
    }
    
    reorder() {
        var objs = this.container.getName();
        var i = 1;
        for (var obj of objs) {
            obj.x = this.x - this.width / 2 + 96 * i++;
            obj.y = this.y;
        }
    }

    getVisible(value) {
        return this.container.visible;
    }

    getUuid() {
        return this.container.getAll();
    }

    getDie() {
        console.log(this.container.getAll('rollCount'));
        return this.container.getAll('rollCount');
        }

    reset() {
        this.rolled = false;
        this.setVisible(false);
    }

    setVisible(value){
            this.graphics.setVisible(value);
            this.nameText.setVisible(value);
    }

    add(playerlabel) {  
        playerlabel.x = this.x-40;
        playerlabel.y = this.y-15;
        this.container.add(playerlabel);
        console.log('added: '+playerlabel);
        this.onUpdateCb();
    };

    remove(playerlabel) {
        this.container.remove(playerlabel);
    };

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