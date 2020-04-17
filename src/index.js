import 'phaser';

import { DiceScene } from './scenes/dice-scene';
import { JoinScene } from './scenes/join-scene';
import { PauseScene } from './scenes/pause-scene';
import { StartScene } from './scenes/start-scene';
import { FirstScene } from './scenes/first-scene';
import { MuteScene } from './scenes/mute-scene';
import { init } from '@sentry/browser';
import { PopDieScene } from './scenes/popdiescene';

/* Sentry */
init({
    dsn: 'https://dce05a1d3d1948b680aa3525cd81a19c@o377854.ingest.sentry.io/5200519',
});
/* !Sentry */

const gameConfig = {
    type: Phaser.AUTO,
    width: 720,
    height: 480,
    parent: 'no-mames',
    dom: {
        createContainer: true
    },
    scene: [ FirstScene, StartScene, JoinScene, DiceScene, PauseScene, MuteScene, PopDieScene ]
};

var game = new Phaser.Game(gameConfig);
