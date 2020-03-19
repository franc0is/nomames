export class Cup extends Phaser.GameObjects.Zone {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, width, height);
        this.setRectangleDropZone(width, height);
    }
}
