class Win extends Phaser.Scene {
    constructor() {
        super("Win");
    }

    preload() {
        // Load the assets needed for the Win scene
        this.load.setPath("./assets/");
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.tilemapTiledJSON("Win", "Win_Screen.tmj");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
    }

    create() {
        this.scale.on('resize',(gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height
            this.cameras.resize(width, height);
        });

        this.cameras.main.setZoom(3);
        // Tilemap
        this.map = this.make.tilemap ({ key: "Win"});
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.mainLayer = this.map.createLayer("Win_Screen", this.tileset, 0, 0);

        let centerX = 8 * 18 + 9;  // 153
        let centerY = 11 * 18 + 9; // 243
        this.cameras.main.setScroll(centerX - this.cameras.main.width / 2, centerY - this.cameras.main.height / 2);

        this.add.text(60,122, "You Win!", {
            fontSize: '35px',
            fontFamily: '"Pixelated Elegance"',
            color: '#FF0000',
        });

        this.add.text(28,288, "Press 'R' to Restart!", {
            fontSize: '20px',
            fontFamily: '"Pixelated Elegance"',
            color: '#FF0000',
        });

        my.sprite.player = this.add.sprite(153, 204, "platformer_characters", "tile_0000.png");

        this.rKey = this.input.keyboard.addKey('R');

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start("Start");
        }
    }
}