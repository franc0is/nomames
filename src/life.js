export class Life extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, initial_value) {
        super(scene, x, y);

        this.setName('life');
        this.setTexture('life');
        this.origin = 0;
        this.setPosition(x, y);
        this.setInteractive(new Phaser.Geom.Rectangle(x, y, 30, 22), Phaser.Geom.Rectangle.Contains);
        //this.on();

        this.setValue(initial_value);
    }

    setValue(value) {
        this.value = value;
       this.setFrame(value);
   }
   
   getValue() {
       console.log(this.value);
       return this.value;
   }
}

