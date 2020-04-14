export class DraggersLabel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, playersList) {
        super(scene, x, y);
        this.scene = scene;
        this.heading = scene.add.text(20, 20, 'Players: ', { color: 'white' });
        this.add(this.heading);
        this.playerLabels = [];
        this.updateWithPlayers(playersList);
        this.setPosition(x, y);
    }

    updateWithPlayers(playersList) {
        this.playersList = playersList;
        // Delete all labels
        this.playerLabels.forEach(label => {
            label.destroy();
        });
        // Recreate a label for each player
        let i = 0;
        this.playersList.getPlayers().forEach(player => {
            let playerName = player.name;
            if (playerName === '') {
                playerName = 'Unnamed';
            }
            if (player.isMe) {
                playerName += '*';
            }
            playerName += ":" + player.numLives;
            let c = player.isActive ? 'red' : 'white';
            if (player.isDead) {
                c = '#888888';
            }
            let t = this.scene.add.text(100*i, 40, playerName, { 'color': c })
            this.add(t);
            this.playerLabels.push(t);
            i++;
        });
    }
}

/*
function preload() {

    game.load.bitmapFont('carrier_command', 'assets/fonts/bitmapFonts/carrier_command.png', 'assets/fonts/bitmapFonts/carrier_command.xml');

}

var bpmText;

function create() {

    bmpText = game.add.bitmapText(10, 100, 'carrier_command','Drag me around !',34);

    bmpText.inputEnabled = true;

    bmpText.input.enableDrag();

}*/