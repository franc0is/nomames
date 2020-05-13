import { Server } from '../server';
import { TextButton } from '../text-button';
import { DraggableLabel } from '../draggable-label';
import { SeatZone } from '../seatzone';
import { PopUpScene } from './popup-scene';
import { humanReadableIds } from 'human-readable-ids'
import { Dice } from '../dice';
import { RFType } from '../message';

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'startScene' });
    };

    preload() {
        this.load.html('nameform', 'assets/nameform.html');
        this.load.spritesheet('dice', 'assets/dice-pixel.png', { frameWidth: 64, frameHeight: 64});
    };

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
                this.scene.start('diceScene', { audioManager: audioManager, playersList: playersList, isMe: isMe });
            },
            onRollFirst: (type, seats, value) => {
                this.onRollFirst(type, seats, value);
            }
        }, this);

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
                    this.doneSeatingButton.setVisible(true);
                    this.directionText.setVisible(true);
                    this.randomizeButton.setVisible(true);
                    this.seats.forEach((seat) => {
                        seat.setVisible(true);
                    });
                }
            }
        });

        this.nameText = this.add.text(50,200, '',{color: '#0f0', fontsize: '36px'});
        this.nameText.setVisible(false);
        this.directionText = this.add.text(50,350,'To set the order of players,\ndrag players to a seat or \nclick on "RANDOMIZE SEATING"', {color: '#0f0', fontsize: '24px'});
        this.directionText.setVisible(false);

        this.startButton = new TextButton(this, 50, 250, '[ START ]', {
            onClick: () => {
                let names = this.getSeated();
                this.server.playersList.orderByUUIDList(names);
                this.server.startGame();
            }
        });
        this.add.existing(this.startButton);
        this.startButton.setVisible(false);

        this.doneSeatingButton = new TextButton (this, 50, 270, '[ DONE SEATING ]', {
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
                                        this.doneSeatingButton.setVisible(false);
                                        this.randomizeButton.setVisible(false);
                                        this.directionText.setVisible(false);
                                        this.startButton.setVisible(true);
                                        this.rollFirstButton.setVisible(true);
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
                    this.doneSeatingButton.setVisible(false);
                    this.randomizeButton.setVisible(false);
                    this.directionText.setVisible(false);
                    this.startButton.setVisible(true);
                    this.rollFirstButton.setVisible(true);
                }
            }
        });
        this.add.existing(this.doneSeatingButton);
        this.doneSeatingButton.setVisible(false);
        this.doneSeatingButton.setEnabled(false);

        this.rollFirstButton = new TextButton (this, 50, 280, '[ ROLL FOR FIRST ]', {
            onClick: () => {
                this.startButton.setEnabled(false);
                this.resetRollButton.setVisible(true);
                this.resetRollButton.setEnabled(false);
                this.rollFirstButton.setEnabled(false);
                this.dice = [];
                this.seats.forEach((seat) => {
                    let name = seat.getUuid()
                    if (name.length > 0) {
                        let uuid = name[0].uuid;
                        name[0].setVisible(false);
                        let die = new Dice (this, 30, 5, 0);
                        this.add.existing(die);
                        seat.add(die);
                        this.dice.push(die);
                        seat.setLabel(name[0].text);
                        if(this.playersList.getMe().uuid !== uuid){
                            die.setClick(() => {});
                        }else {
                            seat.setHighlighted(true);
                            die.setOnRoll(() => {
                                this.onDieRoll(seat.name[seat.name.length-1], die.value);
                            });
                        }
                    }
                });
                let update = {
                    RFtype: RFType.START,
                    seats: [],
                    value: 0
                }
                this.server.rollFirst(update);
            }
        });
        this.add.existing(this.rollFirstButton);
        this.rollFirstButton.setVisible(false);

        this.resetRollButton = new TextButton (this, 50, 310, '[ RESET ROLLS ]', {
            onClick: () => {
                this.dice.forEach((die) => {
                    die.resetRoll();
                })
                let update = {
                    RFtype: RFType.RESET,
                    seats: [],
                    value: 0
                }
                this.server.rollFirst(update);
                this.resetRollButton.setEnabled(false);
            }
        });
        this.add.existing(this.resetRollButton);
        this.resetRollButton.setVisible(false);

        this.playersList = this.server.getPlayersList();
        this.playersLabel = new DraggableLabel(this, 5, 400, this.playersList);
        this.add.existing(this.playersLabel);

        this.seats = [
            new SeatZone(this, 500, 80, 100, 100, 'Seat 1'),
            new SeatZone(this, 610, 140, 100, 100, 'Seat 2'),
            new SeatZone(this, 670, 250, 100, 100, 'Seat 3'),
            new SeatZone(this, 610, 360, 100, 100, 'Seat 4'),
            new SeatZone(this, 500, 420, 100, 100, 'Seat 5'),
            new SeatZone(this, 390, 360, 100, 100, 'Seat 6'),
            new SeatZone(this, 330, 250, 100, 100, 'Seat 7'),
            new SeatZone(this, 390, 140, 100, 100, 'Seat 8')
        ];

        for (let seat of this.seats) {
            this.add.existing(seat);
            seat.setUpdate(() => {this.updateSeating();});
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
                this.scene.doneSeatingButton.setEnabled(true);
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

        this.randomizeButton = new TextButton(this, 50, 300, '[ RANDOMIZE SEATING ]', {
            onClick: () => {
                // Make an array all the seats and randomly pick them off for each player
                this.removeInactivePlayers() ; // FIXME normally for every player, there are ~2 additional inactive players. This manages to remove all of them
                let emptySeats = [...this.seats];
                this.playersLabel.playerLabels.forEach(label => {
                    let randomIndex = Phaser.Math.RND.integerInRange(0, emptySeats.length-1);
                    let next_seat = emptySeats.splice(randomIndex, 1)[0];
                    next_seat.add(label);
                });
                this.doneSeatingButton.setEnabled(true);
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
        this.playersLabel.updateWithPlayers(playersList);
    }

    // A bit confused about what to do here
    onSeatPlayer(seats) {
        let i = 0;
        this.seats.forEach((seat) => {
            seat = seats[i];
            i++;
        });
    }

    updateSeating() {
        let seatChart = []
        this.seats.forEach((seat) => {
            let name = seat.getUuid();
            if (name[0] !== undefined){
                seatChart.push(name[0].uuid)
            } else {
                seatChart.push(-1);
            }
        });
        let update = {
            'seats': seatChart
        };
        this.server.seatPlayer(update);
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
        return (this.playersLabel.playerLabels.length !== names.length);
    }

    checkHighRoll(){
        let allRolled = this.dice.reduce((previous, die) => (previous && die.didRoll()), true);
        if(allRolled){
            this.highnum = -1;
            let counter = 0;
            let highDice = [];
            this.dice.forEach((die) => {
                let v = die.value;
                if (v>this.highnum){
                    highDice = [];
                    highDice.push(die);
                    this.highnum = v;
                    counter = 1;
                } else if (v === this.highnum) {
                    counter++;
                }
            });
            if (counter === 1){
                this.seats.forEach((seat) => {
                    let items = seat.getUuid();
                    if (items.length >1){
                        if (items[1].value === this.highnum){
                            let uuid = items[0].uuid;   
                            this.server.playersList.getPlayerByUUID(uuid).isActive = true;
                        }
                    }
                });
                this.startButton.setEnabled(true);
            } else if (counter > 1){
                this.resetRollButton.setEnabled(true);
            }
        }
    }

    onRollFirst(type, seats, value) {
        switch (type){
            case RFType.START:{
                this.dice = [];
                this.seats.forEach((seat) => {
                    this.resetRollButton.setVisible(true);
                    this.rollFirstButton.setEnabled(false);
                    let name = seat.getUuid()
                    if (name.length > 0) {
                        let uuid = name[0].uuid;
                        name[0].setVisible(false);
                        let die = new Dice (this, 30, 5, 0);
                        this.add.existing(die);
                        seat.add(die);
                        this.dice.push(die);
                        seat.setLabel(name[0].text);
                        if(this.playersList.getMe().uuid !== uuid){
                            die.setClick(() => {});
                        }else {
                            seat.setHighlighted(true);
                            die.setOnRoll(() => {
                                this.onDieRoll(seat.name[seat.name.length-1], die.value);
                            });
                        }
                    }
                });
                break;
            }
            case RFType.UPDATE:{
                    this.seats.forEach((seat) => {
                        if (seat.name[seat.name.length-1] === seats[0]){
                            let die = seat.getDie()[0];
                            die.animate(function(target) {
                                target.setValue(value);
                            });
                            die.rollCount++;
                        }
                    });
                break;
            }
            case RFType.RESET:{
                    this.dice.forEach((die) => {
                        die.resetRoll();
                    })
                break;
            }
        }
        this.checkHighRoll();
    }

    onDieRoll(seat, value) {
        let update = {
            RFtype: RFType.UPDATE,
            seats: seat,
            value: value
        }
        this.server.rollFirst(update);
        this.checkHighRoll();
    }
}