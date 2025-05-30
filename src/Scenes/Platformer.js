class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 300;
        this.DRAG = this.ACCELERATION + 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -400;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2;
        this.maxSpeed = 300;
        this.water = false;
        this.win = false;
        this.physics.world.drawDebug = false;
        this.score = 0;
    }

    create() {
        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            this.cameras.resize(width, height);
        });
        this.jumpCooldown = 0;
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        //this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        this.map = this.make.tilemap({ key: "platformer-level-1" });

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Foreground", this.tileset, 0, 0);
        this.flagLayer = this.map.createLayer("Flags", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        // New Collisions
        this.swimmableTiles = this.groundLayer.filterTiles(tile => tile.properties.swimmable === true);
        this.killerTiles = this.groundLayer.filterTiles(tile => tile.properties.kills === true);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Create coins from Objects layer in tilemap
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        // Find water tiles
        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.water == true;
        });

        ////////////////////
        // Water bubble particle effect
        ////////////////////


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Coin collect particle effect (not running initially)
        this.coinCollectEmitter = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_01.png',
            speed: { min: 100, max: 200 },
            scale: { start: 0.03, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 5,
            emitting: false
        });

        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            ////////////////////
            // Start the coin collect particle effect
            ////////////////////
            this.coinCollectEmitter.explode(8, obj2.x, obj2.y);
            this.coinSfx.play();
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            if (this.physics.world.debugGraphic) {
                this.physics.world.debugGraphic.clear();
            }
        });

        // Movement smoke particle effect
        this.smokeEmitter = this.add.particles(0, 0, 'kenny-particles', {
            frame: ['smoke_01.png', 'smoke_02.png', 'smoke_03.png', 'smoke_04.png', 'smoke_05.png'],
            speed: { min: 10, max: 30 },
            scale: { start: 0.03, end: 0.07 },
            alpha: { start: 0.2, end: 0 },
            lifespan: 400,
            quantity: 2,
            emitting: false
        });

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.setZoom(this.SCALE); //this.SCALE

        this.jumpSfx = this.sound.add('jumpSfx', { volume: 0.3 }); 
        this.coinSfx = this.sound.add('coinSfx');
    }

    update() {
        // Check current tile below player
        let tileBelow = this.groundLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y /* + (my.sprite.player.height / 2) */, true);
        let flagCollide = this.flagLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y, true);
        
        // Kill functionality
        if (tileBelow?.properties.kills){
            //my.sprite.player.setPosition(30, 345);
            //my.sprite.player.setVelocity(0, 0);
        }
        
        // Flag touchie
        if (flagCollide?.properties.flagability && !this.win) {
            console.log("U win!!!");
            this.win = true;
            this.scene.start('Win');
        }
        
        // Swimming
        if (tileBelow?.properties.swimmable) {
            // Swim stuffz
            this.water = true;
            if (my.sprite.player.anims.currentAnim?.key !== 'walk' && this.water) {
                my.sprite.player.anims.play('walk', true);
                console.log("SWIMMING");
            }
        } else {
            this.water = false;
        }
        
        if(cursors.left.isDown) {
            my.sprite.player.resetFlip();
            if (!this.water) {
                my.sprite.player.anims.play('walk', true);
                // Emit smoke particles when moving left
                this.smokeEmitter.explode(3, my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
            }
            if (my.sprite.player.body.velocity.x < -this.maxSpeed){
                my.sprite.player.body.velocity.x = -this.maxSpeed;
            } else {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setFlip(true, false);
            if (!this.water) {
                my.sprite.player.anims.play('walk', true);
                // Emit smoke particles when moving right
                this.smokeEmitter.explode(3, my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
            }
            if (my.sprite.player.body.velocity.x > this.maxSpeed){
                my.sprite.player.body.velocity.x = this.maxSpeed;
            } else {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            if (!this.water){
                my.sprite.player.anims.play('idle');
            }
            // Stop smoke particles when not moving
            this.smokeEmitter.stop();
        }
        
        // Falling out of map
        if (my.sprite.player.y === 438 && !this.water) {
            this.scene.restart();
        }
        

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down && !this.water) {
            my.sprite.player.anims.play('jump');
        }
        if(this.jumpCooldown < 1 && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (this.water) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY/2);
                this.physics.world.gravity.y = 700;
            } else {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.jumpCooldown++;
                this.physics.world.gravity.y = 1500;
                this.jumpSfx.play();
                // Smoke here
                this.smokeEmitter.explode(10, my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
            }
        }
        if (my.sprite.player.body.blocked.down) {
            this.jumpCooldown = 0;
        }
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
            //this.scene.start("Win"); 
        }
        ///*
        // Camera visible bounds
        const cam = this.cameras.main;
        const camLeft = cam.scrollX;
        const camTop = cam.scrollY;
        const camRight = cam.scrollX + cam.width;
        const camBottom = cam.scrollY + cam.height;
    }
        
}