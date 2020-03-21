import 'phaser';

import { DiceScene } from './scenes/dice-scene';
import { JoinScene } from './scenes/join-scene';

const gameConfig = {
    type: Phaser.AUTO,
    width: 680,
    height: 480,
    parent: 'no-mames',
    dom: {
        createContainer: true
    },
    scene: [ JoinScene, DiceScene ]
};

var game = new Phaser.Game(gameConfig);
