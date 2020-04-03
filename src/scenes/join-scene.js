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
            },
            onGameStart: (msg) => {
                this.scene.start('diceScene', { server: this.server });
            }
        });


        let text = this.add.text(
            50,
            30,
            'Welcome! \n\nTo start, enter a game ID\nThis will create or join a game.',
            { color: 'white', fontSize: '20px '}
        );

        this.hostJoinEl = this.add.dom(140, 150).createFromCache('hostjoinform');
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
                }
            }
        });

        this.channelText = this.add.text(100, 150, '', { color: 'white', fontsize: '20px' });
        this.channelText.setVisible(false);

        this.nameEl = this.add.dom(250, 200).createFromCache('nameform');
        this.nameEl.setVisible(false);
        this.nameEl.addListener('click');
        this.nameEl.on('click', (event) => {
            if (event.target.name === 'playButton') {
                let inputText = this.nameEl.getChildByName('nameField');
                if (inputText.value !== '') {
                    this.nameEl.removeListener('click');
                    this.nameEl.setVisible(false);
                    this.server.setName(inputText.value);
                    this.startButton.setVisible(true);
                }
            }

        });

        this.startButton = new TextButton(this, 100, 300, '[ START ]', () => {
            this.server.startGame();
        });
        this.add.existing(this.startButton);
        this.startButton.setVisible(false);

        let playersList = this.server.getPlayersList();
        this.playersLabel = new PlayersLabel(this, 20, 400, playersList);
        this.add.existing(this.playersLabel);
    }

    onPlayersUpdate(playersList) {
        console.log("Players update!");
        this.playersLabel.updateWithPlayers(playersList);
    }
}
