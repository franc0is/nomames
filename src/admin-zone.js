export class AdminZone extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.setName('adminZone');
        this.text = scene.add.text(20,35,'Admin Menu',{ color: 'white', fontSize: '16px '});        
    }

    setVisible(value){
        this.text.setVisible(value);
        this.getAll().forEach(obj => {
            obj.setVisible(value);
        });
    }
}