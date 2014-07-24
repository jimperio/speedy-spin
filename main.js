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
      activeLedges = [],
      hasSkippedLedge = false,
      livesDisplay,
      lives = 3;

  function preload() {
    game.load.image('star', 'assets/star.png');
    game.load.image('ground', 'assets/ledge.png');
    game.load.image('wall', 'assets/wall.png');
  }

  function create() {
    livesDisplay = game.add.text(15, 
                                 0, 
                                 lives,
                                 {
                                   fill: "#fff",
                                 });
    
    player = game.add.sprite(32, 0, 'star');
    game.physics.arcade.enable(player);
    player.checkWorldBounds = true;
    player.body.gravity.y = 400;

    player.events.onOutOfBounds.add(lifeLost, this);

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
    var left;
    for (i = 0; i <= 5; i++) {
      left = getRandomLeft();
      createLedge(left, top);
      if (i==0) {
        player.reset(left + 35, top - 20);
      }
      top += 50;
    }

  }

  function lifeLost() {
    lives -= 1;
    livesDisplay.text = lives;

    if (lives == 0) {
      // TODO: Game over!
    }

    // Respawn at a ledge nearer the bottom.
    setTimeout(respawnPlayer, 400);
  }

  function respawnPlayer() {
    for (i = 0; i < activeLedges.length; i++) {
      var ledge = activeLedges[i];
      if (ledge.y > 300) {
        player.reset(ledge.x + 35, ledge.y - 20);
        break;
      }
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
    ledge.checkWorldBounds = true;
    ledge.events.onOutOfBounds.add(removeLedge, this);
    activeLedges.push(ledge)
  }

  function removeLedge(ledge) {
    var i = activeLedges.indexOf(ledge);
    if (i > -1) {
      activeLedges.splice(i, 1);
    }
  }

}