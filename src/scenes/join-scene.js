import { Server } from '../server';
import { SeatZone } from '../seatzone';
import { DraggableLabel } from '../draggable-label';
import { RFType } from '../message';
import { Dice } from '../dice';

export class JoinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'joinScene' });
    }

    preload() {
        this.load.html('nameform', 'assets/nameform.html');
        this.load.html('hostjoinform', 'assets/hostjoinform.html');
        this.load.spritesheet('dice', 'assets/dice-pixel.png', { frameWidth: 64, frameHeight: 64});
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
            },
            onRollFirst: (type, seats, value) => {
                this.onRollFirst(type, seats, value);
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
                    text.setVisible(false)
                }
            }
        });

        this.channelText = this.add.text(50, 120, '', { color: '#0f0', fontsize: '36px' });
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
                    for (let seat of this.seats) {
                        seat.setVisible(true);
                    }
                }
            }

        });

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
            seat.setVisible(false);
        }

        
        this.nameText = this.add.text(50,150, '',{color: '#0f0', fontsize: '36px'});
        this.nameText.setVisible(false);


        this.playersList = this.server.getPlayersList();
        this.playersLabel = new DraggableLabel(this, 5, 400, this.playersList);
        this.add.existing(this.playersLabel);
        this.playersLabel.setVisible(false);
    }

    // A bit confused about what to do here
    onSeatPlayer(seats) {
        this.removeInactivePlayers();
        for (let i=0;i<8;i++) {
            let uuid = seats[i]
            if (uuid !== -1){
                this.playersLabel.playerLabels.forEach((label) => {
                    if (label.uuid === uuid){
                        this.seats[i].add(label);
                    }
                });
            }
        }
    }

    onPlayersUpdate(playersList) {
        this.playersLabel.updateWithPlayers(playersList);
    }

    // FIXME should ultimately remove
    removeInactivePlayers() {
        this.playersLabel.playerLabels = this.playersLabel.playerLabels.filter(label => label.active);
    }

    onDieRoll(seat, value) {
        let update = {
            RFtype: RFType.UPDATE,
            seats: seat,
            value: value
        }
        this.server.rollFirst(update);
        console.log(update);
    }

    onRollFirst(type, seats, value) {
        switch (type){
            case RFType.START:{
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
                break;
            }
            case RFType.UPDATE:{
                this.seats.forEach((seat) => {
                    if (seat.name[seat.name.length-1] === seats[0]){
                        let die = seat.getDie()[0];
                        die.animate(function(target) {
                            target.setValue(value);
                        });
                    }
                });
                break;
            }
            case RFType.RESET:{
                this.dice.forEach((die) => {
                    if (die.value === value){
                        die.resetRoll();
                    } else {
                        die.setVisible(false);
                    }
                })
                break;
            }
        }
    }
}
