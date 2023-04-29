let config = {
  renderer: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("road", "assets/road.png");
  this.load.image("column", "assets/column.png");
  this.load.spritesheet("bird", "assets/bird.png", {
    frameWidth: 64,
    frameHeight: 96,
  });
}

var bird;
let hasLanded = false;

let cursors;
let hasBumped = false;
let isGameStarted = false;
let messageToPlayer;

function create() {
  const background = this.add.image(0, 0, "background").setOrigin(0, 0);
  const roads = this.physics.add.staticGroup();
  const topColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 200, y: 0, stepX: 300 },
  });

  const bottomColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 350, y: 400, stepX: 300 },
  });

  const road = roads.create(400, 568, "road").setScale(2).refreshBody();

  bird = this.physics.add.sprite(0, 50, "bird").setScale(2);
  bird.setBounce(0.2);
  bird.setCollideWorldBounds(true);

  this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
  this.physics.add.collider(bird, road);

  cursors = this.input.keyboard.createCursorKeys();

  /* if bird hit the columns, hasBumped flag will be set to true */
  this.physics.add.overlap(bird, topColumns, ()=>hasBumped=true,null, this);
  this.physics.add.overlap(bird, bottomColumns, ()=>hasBumped=true,null, this);
  /* bird will not pass the column */
  this.physics.add.collider(bird, topColumns);
  this.physics.add.collider(bird, bottomColumns);

  /* Instructions */
  messageToPlayer = this.add.text(0, 0, `Instructions: Press space bar to start`, { fontFamily: '"Comic Sans MS", Times, serif', fontSize: "20px", color: "white", backgroundColor: "black" });
  Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);
}

function update() {
  /* don't start the game if the space button is not pressed */
  if (cursors.space.isDown && !isGameStarted) {
    isGameStarted = true;
  }
  
  if (!isGameStarted) {
    bird.setVelocityY(-160);
  }

  /* Up button - upward velocity of -160 */
  if (cursors.up.isDown) {
    bird.setVelocityY(-160);
  }

  /* Prevent user from moving up if the bird hits the ground */
  if (cursors.up.isDown && !hasLanded) {
    bird.setVelocityY(-160);
  }

  /* If the bird has not landed, give it a velocity of 50 in x-direction. 
  If it lands, make the velocity in the x-direction 0 to stop moving in the x-axis */
  if (!hasLanded) {
    bird.body.velocity.x = 50;
  }
  if (hasLanded) {
    bird.body.velocity.x = 0;
  }

  /* Make sure that it stops moving right if it bumps in a column */
  if (cursors.up.isDown && !hasLanded && !hasBumped) {
    bird.setVelocityY(-160);
  }

  if (!hasLanded || !hasBumped) {
    bird.body.velocity.x = 50;
  }
  
  if (hasLanded || hasBumped || !isGameStarted) {
    bird.body.velocity.x = 0;
  }

  /* Instructions to press the Up button */
  if (cursors.space.isDown && !isGameStarted) {
    isGameStarted = true;
    messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
  }

  /* Message if crashed */
  if (hasLanded || hasBumped) {
    messageToPlayer.text = `Oh no! You crashed!`;
  }

  /* Message if it crosses successfully - set velocity to 40 in the y-axis */
  if (bird.x > 750) {
    bird.setVelocityY(40);
    messageToPlayer.text = `Congrats! You won!`;
  } 
}