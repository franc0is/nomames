import { Server } from '../server';
import { TextButton } from '../text-button';
import { PlayersLabel } from '../playerslabel';

export class JoinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'joinScene' });
    }

    preload() {
        this.load.html('nameform', 'assets/nameform.html');
        this.load.html('hostjoinform', 'assets/hostjoinform.html');
    }

    create() {
        this.server = new Server({
            onPlayersUpdate: (players) => {
                this.onPlayersUpdate(players);
                //this.removeInactivePlayers(); // FIXME normally for every player, there are ~2 additional inactive players. This manages to reduce it to ~1 additional inactive player per player
            },
            onGameStart: (msg) => {
                this.scene.start('diceScene', { server: this.server });
            }
        });


        let text = this.add.text(50,30,'Welcome! \n\nTo join, enter the game ID.',{ color: 'white', fontSize: '20px '});

        this.hostJoinEl = this.add.dom(360, 150).createFromCache('hostjoinform');
        this.hostJoinEl.addListener('click');
        this.hostJoinEl.on('click', (event) => {
            if (event.target.name === 'playButton') {
                let inputText = this.hostJoinEl.getChildByName('gameIdField');
                if (inputText.value !== '') {
                    this.hostJoinEl.removeListener('click');
                    this.server.connect(inputText.value);
                    this.nameEl.setVisible(true);
                    this.hostJoinEl.setVisible(false);
                    this.channelText.setVisible(true);
                    this.channelText.setText('GameID: ' + inputText.value);
                    this.playersLabel.setVisible(true);
                }
            }
        });

        this.channelText = this.add.text(200, 150, '', { color: '#0f0', fontsize: '36px' });
        this.channelText.setVisible(false);

        this.nameEl = this.add.dom(360, 200).createFromCache('nameform');
        this.nameEl.setVisible(false);
        this.nameEl.addListener('click');
        this.nameEl.on('click', (event) => {
            if (event.target.name === 'playButton') {
                let inputText = this.nameEl.getChildByName('nameField');
                if (inputText.value !== '') {
                    this.nameEl.removeListener('click');
                    this.nameEl.setVisible(false);
                    this.server.setName(inputText.value);
                    this.nameText.setText('Name: ' +inputText.value);
                    this.nameText.setVisible(true);
                }
            }

        });

        
        this.nameText = this.add.text(200,200, '',{color: '#0f0', fontsize: '36px'});
        this.nameText.setVisible(false);


        let playersList = this.server.getPlayersList();
        this.playersLabel = new PlayersLabel(this, 20, 400, playersList);
        this.add.existing(this.playersLabel);
        this.playersLabel.setVisible(false);
    }

    onPlayersUpdate(playersList) {
        console.log("Players update!");
        this.playersLabel.updateWithPlayers(playersList);
    }

    // FIXME should ultimately remove
    removeInactivePlayers() {
        var i;
        for (i = 0; i < this.playersLabel.playerLabels.length; i++) {
            if (!this.playersLabel.playerLabels[i].active) {
                this.playersLabel.playerLabels.splice(i, 1)
            }
        }
    }
}
