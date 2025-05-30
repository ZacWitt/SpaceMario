// Jim Whitehead
// Created: 5/14/2025
// Phaser: 3.70.0
//
// Particle Practice Kit
//
// An example platformer layer with coin objects.
// The goal is to add particle effects for when the player collects a coin, and
// for the water to have bubbles, and for when the player falls in the water.
//

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,    // base logical width
        height: 800,    // base logical height (square)
        max: {
            width: 1500,
            height: 800
        },
        min: {
            width: 700,
            height: 400
        }
    },
    backgroundColor: "#87ceeb",
    scene: [Load, Platformer, Win, Start]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

//const game = new Phaser.Game(config);