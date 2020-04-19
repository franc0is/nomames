import { Life } from './life';

export class PlayersLabel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, playersList) {
        super(scene, x, y);
        this.scene = scene;
        this.heading = scene.add.text(20, -10, 'Players: ', { color: 'white' });
        this.add(this.heading);
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
            let x_coord = 100*(i % 7)
            let y_coord = 20 + Math.floor(i/7)*30
            let t = this.scene.add.text(x_coord, y_coord, playerName, { 'color': c })
            this.add(t);
            this.playerLabels.push(t);
            let l = new Life(this.scene, 89*i + 44, 468, 3-player.numLives);
            this.scene.add.existing(l);
            this.lives.push(l);
            i++;
        });
    }

}
