export class DraggableLabel extends Phaser.GameObjects.Container {
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
            let t = this.scene.add.text(100*i,
                                        40,
                                        playerName,
                                        { 'color': 'white' });
            t.uuid = player.uuid;
            this.add(t);
            t.setInteractive();
            this.scene.input.setDraggable(t);
            this.playerLabels.push(t);
            i++;
        });
    }
}