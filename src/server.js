import PubNub from 'pubnub';
import { Message, StartGameMessage, DiceUpdateMessage,
         PassCupMessage, KillPlayerMessage, NoMamesMessage,
         ResetMessage } from './message';
import { PlayersList } from './playerslist'
import { Player } from './player'
import { DiceScene } from './scenes/dice-scene';
import { PopUpScene } from './scenes/popup-scene';


/*
 * callbacks: onPlayersUpdate, onGameStart, onNoMames, onReset
 */

export class Server {
    constructor(callbacks) {
        // TODO change this to a map uuid => player
        this.setCallbacks(callbacks);
        this.myUUID = PubNub.generateUUID();
        this.playersList = new PlayersList(this.myUUID);
        this.widowUsed = false;
        this.lastTimetoken = 0;
        this.diceScene = new DiceScene();

        this.firstPass = true;
        this.clockwise = true;
        this.nomames = false;
        this.fiverPass = false;

        this.pubnub = new PubNub({
            subscribeKey: 'sub-c-b9b14632-698f-11ea-94ed-e20534093ea4',
            publishKey: 'pub-c-759cd5e9-128d-44d4-b7e7-925bc983f3f4',
            // FIXME UUID ideally more stable
            uuid: this.myUUID,
            ssl: true,
            heartbeatInterval: 30,
            presenceTimeout: 120
        });

        this.pubnub.addListener({
            status: (statusEvent) => {
                if (statusEvent.category === "PNConnectedCategory") {
                    // connected to server
                }
                if (statusEvent.category === "PNNetworkDownCategory") {
                    // no internet
                    this.callbacks.onPause('Disconnected :-(');
                }
                if (statusEvent.category === "PNNetworkUpCategory") {
                    // internet back
                    this.connect(this.channel);
                    this.callbacks.onResume();
                }
                if (statusEvent.category === "PNTimeoutCategory") {
                    // network timeout
                }
            },
            presence: (presenceEvent) => {
                this.handlePresence(presenceEvent);
            },
            message: (msg) => {
                let fromMe = (msg.publisher === this.myUUID);
                this.lastTimetoken = msg.timetoken;
                this.handleMessage(msg.message, fromMe);
            }
        })
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }

    resync() {
        this.connect(this.channel);
    }

    connect(channel) {
        this.channel = channel;

        this.pubnub.subscribe({
            channels: [this.channel],
            withPresence: true,
            timetoken: this.lastTimetoken
        });

        this.refreshPlayersList();
    }

    setName(name) {
        var newState = {
            name: name,
            timestamp: new Date()
        };
        this.pubnub.setState(
            {
                channels: [this.channel],
                state: newState
            }
        );
    }

    getPlayersList() {
        return this.playersList;
    }

    refreshPlayersList() {
        this.pubnub.hereNow(
            {
                channels: [this.channel],
                includeState: true
            },
            (status, response) => {
                let occupants = response['channels'][this.channel]['occupants'];
                for (var occupant of occupants) {
                    let state = occupant['state'];
                    let uuid = occupant['uuid'];
                    this.playersList.addPlayer(Player.fromState(uuid, state));
                }
            }
        );
        this.callbacks.onPlayersUpdate(this.playersList);
    }

    publish(msg) {
        this.pubnub.publish(
            {
                message: msg,
                channel: this.channel
            },
            (status) => {
                if (status.error) {
                    // handle error
                    console.log("Publish error with status: ", status, ". Retrying in 3s");
                    setTimeout(this.publish(msg), 3000);
                }
            }
        );
    }

    startGame() {
        this.playersList.setNextPlayerActive();
        let activePlayer = this.playersList.getActivePlayer();
        let uuidList = this.playersList.getUUIDList();
        let msg = new StartGameMessage(activePlayer.uuid, uuidList);
        this.publish(msg);
    }

    passCup(isClockwise, fiverPass) {
        this.playersList.setDirection(isClockwise);
        this.playersList.setNextPlayerActive();
        let activePlayer = this.playersList.getActivePlayer();
        let msg = new PassCupMessage(activePlayer.uuid,isClockwise,fiverPass);
        this.publish(msg);
    }

    updateDice(update) {
        let msg = new DiceUpdateMessage(update);
        this.publish(msg);
    }

    killPlayer(player) {
        let msg = new KillPlayerMessage(player.uuid);
        this.publish(msg);
    }

    noMames(nmtype, audionum) {
        let msg = new NoMamesMessage(nmtype, audionum);
        this.publish(msg);
    }

    reset() {
        let me = this.playersList.getMe();
        let msg = new ResetMessage(me.uuid);
        this.publish(msg);
    }

    handleMessage(msg, fromMe) {
        let deserialized = Message.deserialize(msg);
        switch (deserialized.type) {
            case StartGameMessage.getType(): {
                let uuid = deserialized.activePlayerUUID;
                let player = this.playersList.getPlayerByUUID(uuid);
                player.isActive = true;
                this.playersList.orderByUUIDList(deserialized.uuidList);
                this.callbacks.onGameStart(this.diceScene);

                this.diceScene.events.addListener('pass',(event) => {
                    let passFive = event[0];
                    if (!this.firstPass) {
                        this.passCup(this.clockwise, passFive);
                    } else {
                            this.diceScene.scene.remove('popUpScene');
                            let popDie = new PopUpScene(
                                'Who would you like to pass to?',
                                {
                                    label: '[ '+this.playersList.getNextClockwise().name+' ]',
                                    callbacks: {
                                        onClick: () => {
                                            this.diceScene.scene.stop('popUpScene');
                                            this.passCup(true, passFive);
                                        }
                                    }
                                },
                                {
                                    label: '[ '+this.playersList.getNextCounterClockwise().name+' ]',
                                    callbacks: {
                                        onClick: () => {
                                            this.diceScene.scene.stop('popUpScene');
                                            this.passCup(false, passFive);
                                        }
                                    }
                                }
                            );
                            this.diceScene.scene.add('',popDie,true);
                    }
                });

                this.diceScene.events.addListener('diceUpdate',(event) => {
                    let update = event[0];
                    this.updateDice(update);
                });

                this.diceScene.events.addListener('noMames',(event) => {
                    this.noMames(event[0], event[1]);
                });

                this.diceScene.events.addListener('killPlayer', (event) => {
                    this.diceScene.scene.remove('popUpScene');
                    let popDie = new PopUpScene(
                        'You are about to loose a life',
                        {
                            label: '[ confirm ]',
                            callbacks: {
                                onClick: () => {
                                    this.diceScene.scene.stop('popUpScene');
                                    let playersList = this.getPlayersList();
                                    this.killPlayer(playersList.getMe());
                                }
                            }
                        },
                        {
                            label: '[ cancel ]',
                            callbacks: {
                                onClick: () => {
                                    this.diceScene.scene.stop('popUpScene');
                                }
                            }
                        }
                    );
                    this.diceScene.scene.add('',popDie,true);
                });

                this.diceScene.events.addListener('roll',(event) => {
                    this.diceScene.roll();
                });
                break;
            }
            case DiceUpdateMessage.getType(): {
                if (!fromMe) {
                    this.diceScene.onDiceUpdate(deserialized);
                }
                break;
            }
            case PassCupMessage.getType(): {
                this.firstPass = false;
                this.clockwise = deserialized.isClockwise;
                this.playersList.setDirection(deserialized.isClockwise);
                //this.callbacks.onPassDirectionChange(deserialized.isClockwise);
                let uuid = deserialized.activePlayerUUID;
                this.playersList.getActivePlayer().isActive = false;
                this.playersList.getPlayerByUUID(uuid).isActive = true;
                this.diceScene.onFiver(deserialized.fiverPass);
                this.diceScene.onPlayersUpdate(this.playersList);
                break;
            }
            case KillPlayerMessage.getType(): {
                let uuid = deserialized.uuid;
                let player = this.playersList.getPlayerByUUID(uuid);
                if (player.numLives > 1){
                    player.numLives -= 1;
                    this.playersList.getActivePlayer().isActive= false;
                    player.isActive = true;
                } else if (!this.widowUsed){
                    this.widowUsed = true;
                    player.numLives = 0;
                    this.playersList.getActivePlayer().isActive= false;
                    player.isActive = true;
                } else {
                    player.numLives = -1;
                    player.isDead = true;
                    if (player.isActive) {
                        this.playersList.setPreviousPlayerActive();
                    }
                }
                this.playersList.setDirection(true);
                this.diceScene.onReset();
                break;
            }
            case NoMamesMessage.getType(): {
                this.diceScene.onNoMames(deserialized.nmtype, deserialized.audionum);
                break;
            }
            case ResetMessage.getType(): {
                let uuid = deserialized.uuid;
                this.playersList.getActivePlayer().isActive = false;
                this.playersList.getPlayerByUUID(uuid).isActive = true;
                this.playersList.setDirection(true);
                this.diceScene.onReset();
                break;
            }
        }
    }

    handlePresence(presenceEvent) {
        let uuid = presenceEvent['uuid'];
        switch (presenceEvent['action']) {
            case 'state-change':
                let state = presenceEvent['state'];
                this.playersList.addPlayer(Player.fromState(uuid, state));
                break;
            case 'join':
                this.playersList.addPlayer(new Player(uuid));
                break;
            case 'timeout':
            case 'leave':
                let player = this.playersList.getPlayerByUUID(uuid);
                player.numLives = -1;
                player.isDead = true;
                if (player.isActive) {
                    this.playersList.setNextPlayerActive();
                }
                break;
        }
        console.log('Received ', presenceEvent['action'], ' with state ',
            presenceEvent['state'], ' playersList is now ' ,this.playersList);
        this.callbacks.onPlayersUpdate(this.playersList);
    }
}
