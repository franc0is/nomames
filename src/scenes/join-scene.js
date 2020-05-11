import { Server } from '../server';
import { TextButton } from '../text-button';
import { DraggableLabel } from '../draggable-label';

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
            onSeatPlayer: (seats) => {
                this.onSeatPlayer(seats)
            },
            onGameStart: (scene, adminscene, audioManager, playersList, isMe) => {
                this.scene.add('',scene,false);
                this.scene.add('',adminscene, false);
                this.scene.launch('adminMenuScene', { audioManager: audioManager, isMe: isMe});
                this.scene.start('diceScene', { audioManager: audioManager, playersList: playersList, isMe: isMe});
            }
        }, this);


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
        this.playersLabel = new DraggableLabel(this, 5, 400, playersList);
        this.add.existing(this.playersLabel);
        this.playersLabel.setVisible(false);
    }

    onPlayersUpdate(playersList) {
        console.log("Players update!");
        this.playersLabel.updateWithPlayers(playersList);
    }
}
