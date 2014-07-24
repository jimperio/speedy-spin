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
      currFallSpeed = -100,
      ledgeTimer,
      hasSkippedLedge = false;

  function preload() {
    game.load.image('star', 'assets/star.png');
    game.load.image('ground', 'assets/ledge.png');
    game.load.image('wall', 'assets/wall.png');
  }

  function create() {
    game.add.text(15, 
                  0, 
                  "3",
                  {
                    fill: "#fff",
                  });
    player = game.add.sprite(32, 0, 'star');

    game.physics.arcade.enable(player);

    player.body.gravity.y = 300;

    cursors = game.input.keyboard.createCursorKeys();

    //  Walls.
    platforms = game.add.group();
    platforms.enableBody = true;

    var wall = platforms.create(0, 0, 'wall');
    wall.body.immovable = true;

    wall = platforms.create(290, 0, 'wall');
    wall.body.immovable = true;

    // Setup ledge creation.
    // TODO: Is there a more direct way to tie ledge generation
    // to current speed? Ledges will speed up as game progresses.
    ledgeGenerator = game.time.events.loop(550, spawnLedge);

    var top = 150;
    for (i = 0; i <= 5; i++) {
      createLedge(getRandomLeft(), top);
      top += 50;
    }

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

  function spawnLedge(left, top) {
    if (!hasSkippedLedge && Math.random() <= 0.25) {
      hasSkippedLedge = true;
      return;
    }
    hasSkippedLedge = false;
    createLedge(getRandomLeft(), 400);
  }

  function getRandomLeft() {
    return Math.random() * (300 - 90 - 20) + 10;
  }

  function createLedge(left, top) {
    var ledge = platforms.create(left, top, 'ground');
    ledge.body.velocity.y = currFallSpeed;
    ledge.body.immovable = true;
  }

}