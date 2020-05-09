import { Server } from '../server';
import { TextButton } from '../text-button';
import { DraggableLabel } from '../draggable-label';
import { SeatZone } from '../seatzone';
import { PopUpScene } from './popup-scene';
import { humanReadableIds } from 'human-readable-ids'

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'startScene' });
    };

    preload() {
        this.load.html('nameform', 'assets/nameform.html');
    };

    create() {
        this.server = new Server({
            onPlayersUpdate: (players) => {
                this.onPlayersUpdate(players);
            },
            onGameStart: (audioManager, playersList, isMe) => {
                this.scene.launch('adminMenuScene', { audioManager: audioManager, isMe: isMe});
                this.scene.start('diceScene', { audioManager: audioManager, playersList: playersList, isMe: isMe });
            }
        }, this, this.game, this.scene.get('diceScene'), this.scene.get('adminMenuScene'));

        this.welcomeText = this.add.text(50,30,
                                         'Welcome! \n\nShare this game ID with other players\n',
                                         { color: 'white', fontSize: '20px '});

        this.nameEl = this.add.dom(360, 200).createFromCache('nameform');
        this.nameEl.addListener('click');
        this.nameEl.on('click', (event) => {
            if (event.target.name === 'playButton') {
                let inputText = this.nameEl.getChildByName('nameField');
                if (inputText.value !== '') {
                    this.nameEl.removeListener('click');
                    this.nameEl.setVisible(false);
                    this.server.setName(inputText.value);
                    this.nameText.setText('Name: ' +inputText.value);
                    this.welcomeText.setVisible(false);
                    this.nameText.setVisible(true);
                    this.startButton.setVisible(true);
                    this.directionText.setVisible(true);
                    this.randomizeButton.setVisible(true);
                    for (let seat of this.seats) {
                        seat.setVisible(true);
                    }
                }
            }
        });

        this.nameText = this.add.text(50,200, '',{color: '#0f0', fontsize: '36px'});
        this.nameText.setVisible(false);
        this.directionText = this.add.text(50,350,'To set the order of players,\ndrag players to a seat or \nclick on "RANDOMIZE SEATING"', {color: '#0f0', fontsize: '24px'});
        this.directionText.setVisible(false);

        this.startButton = new TextButton(this, 90, 250, '[ START ]', {
            onClick: () => {
                if (this.getUnseated()){
                    this.scene.remove('popUpScene');
                        let popReset = new PopUpScene(
                            'There are unseated players',
                            {
                                label: '[ start anyway ]',
                                callbacks: {
                                    onClick: () => {
                                        this.scene.stop('popUpScene');
                                        let names = this.getSeated();
                                        this.server.playersList.orderByUUIDList(names);
                                        this.server.startGame();
                                    }
                                }
                            },
                            {
                                label: '[ cancel ]',
                                callbacks: {
                                    onClick: () => {
                                        this.scene.stop('popUpScene');
                                    }
                                }
                            });
                    this.scene.add('',popReset,true);
                }else {
                    let names = this.getSeated();
                    this.server.playersList.orderByUUIDList(names);
                    this.server.startGame();
                }
            }
        });
        this.add.existing(this.startButton);
        this.startButton.setVisible(false);
        this.startButton.setEnabled(false);

        let playersList = this.server.getPlayersList();
        this.playersLabel = new DraggableLabel(this, 5, 400, playersList);
        this.add.existing(this.playersLabel);

        this.seats = [
            new SeatZone(this, 500, 100, 100, 100, 'Seat 1'),
            new SeatZone(this, 600, 150, 100, 100, 'Seat 2'),
            new SeatZone(this, 650, 250, 100, 100, 'Seat 3'),
            new SeatZone(this, 600, 350, 100, 100, 'Seat 4'),
            new SeatZone(this, 500, 400, 100, 100, 'Seat 5'),
            new SeatZone(this, 400, 350, 100, 100, 'Seat 6'),
            new SeatZone(this, 350, 250, 100, 100, 'Seat 7'),
            new SeatZone(this, 400, 150, 100, 100, 'Seat 8')
        ];

        for (let seat of this.seats) {
            this.add.existing(seat);
            seat.setVisible(false);
        }

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
                this.scene.startButton.setEnabled(true);
            } else {
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

        this.randomizeButton = new TextButton(this, 50, 300, '[RANDOMIZE SEATING]', {
            onClick: () => {
                // Make an array all the seats and randomly pick them off for each player
                this.removeInactivePlayers() ; // FIXME normally for every player, there are ~2 additional inactive players. This manages to remove all of them
                let emptySeats = [...this.seats];
                this.playersLabel.playerLabels.forEach(label => {
                    let randomIndex = Phaser.Math.RND.integerInRange(0, emptySeats.length-1);
                    let next_seat = emptySeats.splice(randomIndex, 1)[0];
                    next_seat.add(label);
                });
                this.startButton.setEnabled(true);
            }
        });
        this.randomizeButton.setVisible(false);
        this.add.existing(this.randomizeButton);

        let game_id = humanReadableIds.random();
        this.server.connect(game_id);
        this.channelText = this.add.text(50, 120, 'GameID: ' + game_id,
                                         { color: '#0f0', fontsize: '36px' });
    }


    onPlayersUpdate(playersList) {
        console.log("Players update!");
        this.playersLabel.updateWithPlayers(playersList);
    }

    // FIXME should ultimately remove
    removeInactivePlayers() {
        this.playersLabel.playerLabels = this.playersLabel.playerLabels.filter(label => label.active);
    }
    getSeated(){
        let names = [];
        this.seats.forEach(seat => {
            let name = seat.getUuid()
            if (name[0] !== undefined){
                names.push(name[0].uuid);
            }
        });
        return names
    }

    getUnseated(){
        this.removeInactivePlayers();
        let names = this.getSeated();
        console.log(this.playersLabel.playerLabels)
        console.log({names})
        return (this.playersLabel.playerLabels.length !== names.length);
    }
}