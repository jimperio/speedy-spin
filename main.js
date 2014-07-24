var STARTING_LIVES = 3;

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
      lives,
      gameStarted = false,
      gameOver = false,
      msgText,
      startKey;

  function preload() {
    game.load.image('star', 'assets/hamster-wheel.png');
    game.load.image('ground', 'assets/ledge.png');
    game.load.image('wall', 'assets/wall.png');
  }

  function create() {
    player = game.add.sprite(game.world.width/2, 
                             game.world.height/2 - 30, 
                             'star');
    player.anchor.set(0.5);
    game.physics.arcade.enable(player);
    player.checkWorldBounds = true;
    player.outOfBoundsKill = true;
    player.body.gravity.y = 800;
    player.body.allowGravity = false;

    player.events.onOutOfBounds.add(lifeLost, this);

    // Walls and ledges.
    walls = game.add.group();
    walls.enableBody = true;
    var wall = walls.create(0, 0, 'wall');
    wall.body.immovable = true;

    wall = walls.create(290, 0, 'wall');
    wall.body.immovable = true;

    platforms = game.add.group();
    platforms.enableBody = true;

    livesDisplay = game.add.text(15, 
                                 0, 
                                 lives,
                                 {
                                   fill: "#fff",
                                 });

    msgText = game.add.text(
        game.world.width/2,
        game.world.height/2,
        "",
        {
          font: '18pt Arial',
          fill: '#fff',
          align: 'center',
        }
      );
    msgText.anchor.set(0.5);
    msgText.text = "[S]TART SPEEDY SPIN";

    cursors = game.input.keyboard.createCursorKeys();
    // S to start the game
    startKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    startKey.onDown.add(start, this);
  }
  
  function start() {
    if (gameStarted) return;

    platforms.removeAll();
    gameStarted = true;
    msgText.text = "";
    lives = STARTING_LIVES;
    livesDisplay.text = lives;

    for (i = 0; i < activeLedges.length; i++) {
      var ledge = activeLedges[i];
      ledge.destroy();
    }
    activeLedges = [];

    // Initial ledges. New ones are created as old ones
    // go out of bounds.
    var top = 50;
    for (i = 0; i <= 7; i++) {
      createLedge(getRandomLeft(), top);
      top += 50;
    }

    respawnPlayer();
    player.body.allowGravity = true;
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
      gameStarted = false;
      msgText.text = "GAME OVER\nRE[S]TART?";
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
    if (!gameStarted) {
      return;
    }

    game.physics.arcade.collide(player, walls);
    game.physics.arcade.collide(player, platforms);

    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
      player.body.velocity.x = -300;
      player.scale.x = 1;
    }
    else if (cursors.right.isDown)
    {
      player.body.velocity.x = 300;
      player.scale.x = -1;
    }
  }

  function spawnLedge() {
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
    ledge.outOfBoundsKill = true;
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