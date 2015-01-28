var STARTING_LIVES = 3;
var INITIAL_FALL_SPEED = -150;
var INITIAL_PLAYER_VELOCITY = 300;
var INITIAL_PLAYER_GRAVITY = 1000;

function init(parent) {
  var state = {
    preload: preload,
    create: create,
    update: update
  };

  var game = new Phaser.Game(
    500,
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
      currFallSpeed,
      activeLedges = [],
      ledgeCounter = 0,
      livesDisplay,
      lives,
      scoreDisplay,
      score = 0,
      scorePadding = "000000",
      highScore = 0,
      currLevel = 0,
      currPlayerVelocity,
      currPlayerGravity,
      gameStarted = false,
      gameOver = false,
      msgText,
      startKey;

  function preload() {
    game.load.image('player', 'assets/hamster-wheel.png');
    game.load.image('ground', 'assets/ledge.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.image('sky', 'assets/sky.png');
    game.load.image('heart', 'assets/heart.png');
  }

  function create() {
    game.add.sprite(0, 0, 'sky');

    player = game.add.sprite(game.world.width/2,
                             game.world.height/2 - 30,
                             'player');
    player.anchor.set(0.5);
    game.physics.arcade.enable(player);
    player.checkWorldBounds = true;
    player.outOfBoundsKill = true;
    player.body.allowGravity = false;

    player.events.onOutOfBounds.add(lifeLost, this);

    // Walls and ledges.
    walls = game.add.group();
    walls.enableBody = true;
    var wall = walls.create(0, 0, 'wall');
    wall.body.immovable = true;

    wall = walls.create(490, 0, 'wall');
    wall.body.immovable = true;

    platforms = game.add.group();
    platforms.enableBody = true;

    hearts = game.add.group();
    hearts.enableBody = true;

    game.add.sprite(15, 5, 'player');
    livesDisplay = game.add.text(55,
                                 5,
                                 lives,
                                 {
                                   fill: "#fff",
                                 });

    scoreDisplay = game.add.text(395,
                                 5,
                                 scorePadding,
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
    hearts.removeAll();

    gameStarted = true;
    msgText.text = "";
    
    currLevel = 0;
    currFallSpeed = INITIAL_FALL_SPEED;
    currPlayerVelocity = INITIAL_PLAYER_VELOCITY;
    currPlayerGravity = INITIAL_PLAYER_GRAVITY;
    player.body.gravity.y = currPlayerGravity;
    
    lives = STARTING_LIVES;
    livesDisplay.text = 'x ' + lives;
    
    score = 0;
    scoreDisplay.text = scorePadding;

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
    livesDisplay.text = 'x ' + lives;

    if (lives === 0) {
      platforms.setAll('body.velocity.y', 0);
      hearts.setAll('body.velocity.y', 0);
      gameOver = true;
      gameStarted = false;
      if (score > highScore) {
        highScore = score;
      }
      msgText.text = "HIGH SCORE: " + highScore + "\n\nRE[S]TART?";
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
    
    game.physics.arcade.overlap(player, hearts, collectHeart, null, this);

    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
      player.body.velocity.x = -currPlayerVelocity;
      player.scale.x = 1;
    }
    else if (cursors.right.isDown)
    {
      player.body.velocity.x = currPlayerVelocity;
      player.scale.x = -1;
    }

    score += 1;
    var scoreString = String(score);
    scoreDisplay.text = scorePadding.substring(0, scorePadding.length - scoreString.length) + scoreString;

    var level = Math.floor(score/250);
    if (level > currLevel) {
      currLevel = level;
      currFallSpeed -= 25;
      platforms.setAll('body.velocity.y', currFallSpeed);
      hearts.setAll('body.velocity.y', currFallSpeed);
      currPlayerVelocity += 50;
      currPlayerGravity += 150;
      player.body.gravity.y = currPlayerGravity;
    }
  }

  function spawnLedge() {
    if (!gameStarted) { return; }
    createLedge(getRandomLeft(), 390);
  }

  function getRandomLeft() {
    return Math.random() * (500 - 90 - 20) + 10;
  }

  function createLedge(left, top) {
    ledgeCounter++;
    if (ledgeCounter % (10 + currLevel*5) === 0) {
      var heart = hearts.create(left + 10, top - 12, 'heart');
      heart.body.velocity.y = currFallSpeed;
    }
    var ledge = platforms.create(left, top, 'ground');
    ledge.body.velocity.y = currFallSpeed;
    ledge.body.immovable = true;
    ledge.checkWorldBounds = true;
    ledge.outOfBoundsKill = true;
    ledge.events.onOutOfBounds.add(removeLedge, this);
    activeLedges.push(ledge);
  }

  function removeLedge(ledge) {
    var i = activeLedges.indexOf(ledge);
    if (i > -1) {
      activeLedges.splice(i, 1);
    }
    spawnLedge();
  }

  function collectHeart(player, heart) {
    heart.kill();
    lives += 1;
    livesDisplay.text = 'x ' + lives;
  }

}