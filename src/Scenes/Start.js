class Start extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.tilemapTiledJSON("platformer-level-1", "Platformer_Kewl.tmj");
    }

    create() {
        if (!window.my) window.my = {};
        if (!my.sprite) my.sprite = {};

        this.cameras.main.setZoom(2.3);
        this.cameras.main.setScroll(250, -300);

        this.map = this.make.tilemap({ key: "platformer-level-1" });
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.backgroundLayer.setDepth(-1);

        const atlasKey = "platformer_characters";
        const fallbackFrame = "tile_0000.png";

        if (this.textures.exists(atlasKey)) {
            const frames = this.textures.get(atlasKey).getFrameNames();
            console.log("Atlas loaded. Frames:", frames);

            const frameName = frames.includes(fallbackFrame) ? fallbackFrame : frames[0];
            my.sprite.player = this.add.sprite(1035, 134, atlasKey, frameName);
        } else {
            console.warn("Atlas 'platformer_characters' not loaded. No sprite shown.");
        }

        this.add.text(1050, -25, "Alien Mario", {
            fontFamily: "Pixelated Elegance",
            fontSize: "32px",
            color: "#90EE90",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(1050, 65, "Use Arrow Keys to Move \n Space To Jump / Double Jump \n Press R to Start", {
            fontFamily: "Pixelated Elegance",
            fontSize: "16px",
            color: "#90EE90",
            align: "center",
            stroke: "#000000",
            strokeThickness: 3,
            lineSpacing: 10
        }).setOrigin(0.5);

        this.rKey = this.input.keyboard.addKey('R');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start("platformerScene");
        }
    }
}

window.Start = Start;


