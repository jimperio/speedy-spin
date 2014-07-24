function init(parent) {
	var state = {
		preload: preload,
		create: create,
		update: update
	};

	var game = new Phaser.Game(
		300,
		400,
		Phaser.AUTO,
		parent,
		state,
		false,
		false
	);

	var player,
	    cursors,
	    platforms,
	    currFallSpeed = -50;

	function preload() {
    game.load.image('star', 'assets/star.png');
    game.load.image('ground', 'assets/platform.png');
	}

	function create() {
    player = game.add.sprite(32, 0, 'star');

    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();

    // The ledges
    platforms = game.add.group();
    platforms.enableBody = true;
    var ledge = platforms.create(100, 150, 'ground');
    ledge.scale.setTo(0.5,0.5);
    ledge.body.velocity.y = currFallSpeed;
    ledge.body.immovable = true;

    ledge = platforms.create(-100, 200, 'ground');
    ledge.scale.setTo(0.5,0.5);
    ledge.body.velocity.y = currFallSpeed;
    ledge.body.immovable = true;
	}

	function update() {
		game.physics.arcade.collide(player, platforms);

		//  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
    }

	}

}