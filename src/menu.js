export class Menu extends Phaser.GameObjects.Container {
    constructor(scene, x, y, name){
        super(scene, x, y);
        this.x = x;
        this.y = y;

        scene.add.existing(this);

        this.setName(name);
    }

    setInput(value){
        this.input.enabled(value);
        this.setVisible(value);
    }
}