import { Server } from '../server';
import { TextButton } from '../text-button';
import { DraggersLabel } from '../draggerslabel';
import { SeatZone } from '../seatzone';

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'startScene' });
    };

    preload() {
        this.load.html('nameform', 'assets/nameform.html');
        this.load.html('hoststartform', 'assets/hoststartform.html');
    };

    create() {
        this.server = new Server({
            onPlayersUpdate: (players) => {
                this.onPlayersUpdate(players);
            },
            onGameStart: (msg) => {
                this.scene.start('diceScene', { server: this.server });
                this.scene.start('muteScene', { server: this.server });
            }
        });

        let text = this.add.text(50,30,'Welcome! \n\nTo start, enter a game ID\nThis will create a game.',{ color: 'white', fontSize: '20px '});

        this.hostJoinEl = this.add.dom(360, 150).createFromCache('hoststartform');
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

        this.channelText = this.add.text(50, 150, '', { color: '#0f0', fontsize: '36px' });
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
                    this.startButton.setVisible(true);
                    this.directionText.setVisible(true);
                    this.seat1.setVisible(true);
                    this.seat2.setVisible(true);
                    this.seat3.setVisible(true);
                    this.seat4.setVisible(true);
                    this.seat5.setVisible(true);
                    this.seat6.setVisible(true);
                    this.seat7.setVisible(true);
                    this.seat8.setVisible(true);
                }
            }

        });

        this.nameText = this.add.text(50,200, '',{color: '#0f0', fontsize: '36px'});
        this.nameText.setVisible(false);
        this.directionText = this.add.text(50,350,'To set the order of players,\ndrag players to a seat', {color: '#0f0', fontsize: '24px'});
        this.directionText.setVisible(false);

        
        this.startButton = new TextButton(this, 50, 300, '[ START ]', {
            onClick: () => {
                let names = [];
                this.seats.forEach(seat => {
                    let name = seat.getUuid()
                    if (name[0] !== undefined){
                        names.push(name[0].uuid);
                    }
                });
                this.server.playersList.orderByUUIDList(names);
                console.log(names);
                this.server.startGame();
            }
        });
        this.add.existing(this.startButton);
        this.startButton.setVisible(false);

        let playersList = this.server.getPlayersList();
        this.playersLabel = new DraggersLabel(this, 20, 400, playersList);

        this.add.existing(this.playersLabel);
        this.playersLabel.setVisible(false);

        this.seats = [];
        this.seat1 = new SeatZone(this, 500, 100, 100, 100, 'Seat 1');
        this.add.existing(this.seat1);
        this.seat1.setVisible(false);
        this.seats.push(this.seat1);

        this.seat2 = new SeatZone(this, 600, 150, 100, 100, 'Seat 2');
        this.add.existing(this.seat2);
        this.seat2.setVisible(false);
        this.seats.push(this.seat2);

        this.seat3 = new SeatZone(this, 650, 250, 100, 100, 'Seat 3');
        this.add.existing(this.seat3);
        this.seat3.setVisible(false);
        this.seats.push(this.seat3);

        this.seat4 = new SeatZone(this, 600, 350, 100, 100, 'Seat 4');
        this.add.existing(this.seat4);
        this.seat4.setVisible(false);
        this.seats.push(this.seat4);

        this.seat5 = new SeatZone(this, 500, 400, 100, 100, 'Seat 5');
        this.add.existing(this.seat5);
        this.seat5.setVisible(false);
        this.seats.push(this.seat5);

        this.seat6 = new SeatZone(this, 400, 350, 100, 100, 'Seat 6');
        this.add.existing(this.seat6);
        this.seat6.setVisible(false);
        this.seats.push(this.seat6);

        this.seat7 = new SeatZone(this, 350, 250, 100, 100, 'Seat 7');
        this.add.existing(this.seat7);
        this.seat7.setVisible(false);
        this.seats.push(this.seat7);

        this.seat8 = new SeatZone(this, 400, 150, 100, 100, 'Seat 8');
        this.add.existing(this.seat8);
        this.seat8.setVisible(false);
        this.seats.push(this.seat8);

        this.input.on('drag', function(pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragenter', function(pointer, gameObject, dropZone) {
            dropZone.setHighlighted(true);
        });

        this.input.on('dragleave', function(pointer, gameObject, dropZone) {
            dropZone.setHighlighted(false);
        });

        this.input.on('drop', function(pointer, gameObject, dropZone) {
            if (dropZone.getUuid().length === 0){
                dropZone.add(gameObject);
                dropZone.setHighlighted(false);
            }else {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                dropZone.setHighlighted(false);
            }
        });

        this.input.on('dragend', function(pointer, gameObject, dropZone) {
            if (!dropZone) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });


    }

    
    onPlayersUpdate(playersList) {
        console.log("Players update!");
        this.playersLabel.updateWithPlayers(playersList);
    }
}