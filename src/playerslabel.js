import { Life } from './life';

export class PlayersLabel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, playersList) {
        super(scene, x, y);
        this.scene = scene;
        this.playerLabels = [];
        this.lives = [];
        this.updateWithPlayers(playersList);
        this.setPosition(x, y);
        this.container = scene.add.container();
    }


    updateWithPlayers(playersList) {
        this.playersList = playersList;
        // Delete all labels
        this.playerLabels.forEach(label => {
            label.destroy();
        });
        // Delete all lives
        this.lives.forEach(life => {
            life.destroy();
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
            let c = player.isActive ? 'red' : 'white';
            if (player.isDead) {
                c = '#888888';
            }
            let x_coord = 5;
            let y_coord = 30 * i + 5;
            let t = this.scene.add.text(x_coord, y_coord, playerName, { 'color': c });
            this.add(t);
            this.playerLabels.push(t);
            let l = new Life(this.scene, x_coord + 110, y_coord + 5, 3-player.numLives);
            this.add(l);
            this.lives.push(l);
            i++;
        });
    }

}
