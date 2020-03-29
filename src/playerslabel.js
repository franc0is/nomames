export class PlayersLabel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, players) {
        super(scene, x, y);
        this.scene = scene;
        this.heading = scene.add.text(20, 20, 'Players: ', { color: 'white' });
        this.add(this.heading);
        this.playerLabels = [];
        this.updateWithPlayers(players);
        this.setPosition(x, y);
    }

    updateWithPlayers(players) {
        this.players = players;
        // Delete all labels
        this.playerLabels.forEach(label => {
            label.destroy();
        });
        // Recreate a label for each player
        let i = 0;
        for (let [uuid, player] of Object.entries(players)) {
            if (player.name !== '') {
                let t = this.scene.add.text(100*i, 40, player.name, { color: 'white' })
                this.add(t);
                this.playerLabels.push(t);
                i++;
            }
        }
    }
}
