import 'phaser';

import { DiceScene } from './scenes/dice-scene';
import { JoinScene } from './scenes/join-scene';
import { PauseScene } from './scenes/pause-scene';

const gameConfig = {
    type: Phaser.AUTO,
    width: 720,
    height: 480,
    parent: 'no-mames',
    dom: {
        createContainer: true
    },
    scene: [ JoinScene, DiceScene, PauseScene ]
};

var game = new Phaser.Game(gameConfig);
