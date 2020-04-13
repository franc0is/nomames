import 'phaser';

import { DiceScene } from './scenes/dice-scene';
import { JoinScene } from './scenes/join-scene';
import { PauseScene } from './scenes/pause-scene';
import { StartScene } from './scenes/start-scene';
import { FirstScene } from './scenes/first-scene';
import { MuteScene } from './scenes/mute-scene';

const gameConfig = {
    type: Phaser.AUTO,
    width: 720,
    height: 480,
    parent: 'no-mames',
    dom: {
        createContainer: true
    },
    scene: [ FirstScene, StartScene, JoinScene, DiceScene, PauseScene, MuteScene ]
};

var game = new Phaser.Game(gameConfig);
