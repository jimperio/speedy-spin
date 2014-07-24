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
      currFallSpeed = -200,
      ledgeTimer,
      activeLedges = [],
      livesDisplay,
      lives = 1,
      gameOver = false,
      msgText;

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
    player.outOfBoundsKill = true;
    player.body.gravity.y = 800;

    player.events.onOutOfBounds.add(lifeLost, this);

    cursors = game.input.keyboard.createCursorKeys();

    // Walls and ledges.
    platforms = game.add.group();
    platforms.enableBody = true;

    var wall = platforms.create(0, 0, 'wall');
    wall.body.immovable = true;

    wall = platforms.create(290, 0, 'wall');
    wall.body.immovable = true;

    // Initial ledges. New ones are created as old ones
    // go out of bounds.
    var top = 50;
    for (i = 0; i <= 7; i++) {
      createLedge(getRandomLeft(), top);
      top += 50;
    }

    respawnPlayer();
  }

  function lifeLost() {
    lives -= 1;
    livesDisplay.text = lives;

    if (lives == 0) {
      for (i = 0; i < activeLedges.length; i++) {
        var ledge = activeLedges[i];
        ledge.body.velocity.y = 0;
      }
      gameOver = true;
      msgText = game.add.text(
        game.world.width/2,
        game.world.height/2,
        "GAME OVER\nT[R]Y AGAIN?",
        {
          font: '20pt Arial',
          fill: '#fff',
          align: 'center',
        }
      );
      msgText.anchor.set(0.5);
      return;
    }

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

    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
      player.body.velocity.x = -300;
    }
    else if (cursors.right.isDown)
    {
      player.body.velocity.x = 300;
    }
  }

  function spawnLedge() {
    if (gameOver) return;
    createLedge(getRandomLeft(), 390);
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
    spawnLedge();
  }

}