
/*
 * CS 325 - Digital Assignment 7 (iteration)
 *		Title: Fleeing Fame
 *
 */

import "./phaser.js";

var isRunning = 0;		// 1 if game active, else 0

var time;
var curTime = 0;

var fails;
var curFails = 0;

var hasKeys = 0;

var textStyle;
var textStyle2;
var headerStyle;
var instr1;
var instr2;

var winWidth = 800;
var winHeight = 600;

var level = 1;

var people = ['worker', 'guy', 'girl'];

var playerStunned = 0;
var timeStunned = -1000;


class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		// images
		
		// backgrounds
		this.load.image('lot1', 'assets/parking_lot.jpg' );
		this.load.image('lot2', 'assets/parking_lot_3.jpg' );
		this.load.image('lot3', 'assets/parking_lot_4.jpg' );
	
		
		// characters
		this.load.image('celeb', 'assets/celebrity.png' );
		this.load.image('girl', 'assets/girl.png' );
		this.load.image('guy', 'assets/guy.png' );
		this.load.image('worker', 'assets/worker.png' );
		
		
		// audio
		this.load.audio('coin', 'assets/coin.wav');
		this.load.audio('win', 'assets/win.wav');
		this.load.audio('fail', 'assets/fail.wav');
		
		// other
		this.load.image('lineH', 'assets/line_h.png' );
		this.load.image('trophy', 'assets/trophy.png' );
		this.load.image('car', 'assets/car_trans.png' );
		this.load.image('keys', 'assets/keys.png' );
		this.load.image('keys_grey', 'assets/keys_grey.png' );
		this.load.image('camera', 'assets/camera.png' );
		
		// iteration
		this.load.image('blue_car', 'assets/iter_blue_car.png' );
		this.load.image('green_car', 'assets/iter_green_car.png' );
		this.load.image('grey_car', 'assets/iter_grey_car.png' );
    }
    
    create() {
		// initiate level
		this.resetLevel();
		
		// inputs
		this.cursors = this.input.keyboard.createCursorKeys();
		this.spaceKey = this.input.keyboard.addKey('SPACE');
		this.mouse = this.input.mousePointer;
		this.cursors = this.input.keyboard.createCursorKeys();		
		
		// UI
		this.add.rectangle(400, 600, 800, 100, 0x000);
		this.add.rectangle(400, 550, 800, 2, 0xFFFFFF);

		// text styles
		textStyle = { font: "20px Verdana", fill: "#FFF" };
		textStyle2 = { font: "20px Verdana", fill: "#000" };
		headerStyle = { font: "10px Verdana", fill: "#00CC00" };
		
		const startBut = this.add.text(50, 560, 'Start', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.startButton() );
		const stopBut = this.add.text(150, 560, 'Stop', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.stopButton() );
		const resetBut = this.add.text(250, 560, 'Reset', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.resetButton() );
		
		// UI value text
		let heightUI = 568;
		time = this.add.text(350, heightUI, (curTime)/100, textStyle);
		fails = this.add.text(650, heightUI, curFails.toString(), textStyle);
		
		this.keysUI = this.physics.add.sprite(760,575, 'keys_grey');
		this.keysUI.setScale(0.15);
		
		// UI header/type text
		let heightHeader = 555;
		let timeHeader = this.add.text(350, heightHeader, "TIME", headerStyle);
		let failsHeader = this.add.text(650, heightHeader, 
			"FAILS", headerStyle);
		
		instr1 = this.add.text(20, 10, "Avoid paparazzi, get keys, go to white car", textStyle2);
		instr2 = this.add.text(20, 40, "Arrows to move", textStyle2);
    }
    
    update() {
		//console.log(curTime);

		// check if running
		if(isRunning) {
			// update time
			curTime++;
			time.setText((curTime+1)/100);
				
			// player movement
			let v = 175;
			if(playerStunned && curTime-timeStunned < 100) {
				// player stunned by car still
				if(curTime-timeStunned > 90) {
					// un-stun
					console.log("Player un-stunned");
					playerStunned = 0;
					this.player.body.velocity.x = 0;
					this.player.body.velocity.y = 0;
				}
			}
			else {
				// standard, player-controlled movement
				playerStunned = 0;
				
				// horizontal movement
				if (this.cursors.left.isDown) {
					this.player.body.velocity.x = -v;
				}
				else if (this.cursors.right.isDown) {
					this.player.body.velocity.x = v;
				}
				else {
					this.player.body.velocity.x = 0;
				}
				// vertical movement
				if (this.cursors.up.isDown) {
					this.player.body.velocity.y = -v;
				}
				else if (this.cursors.down.isDown) {
					this.player.body.velocity.y = v;
				}
				else {
					this.player.body.velocity.y = 0;
				}
			}
			
			// update enemy/paparazzi positions
			for(var i=0; i<this.enemies.length; i++) {
				this.updateEnemy(this.enemies[i], curTime*this.speed);
			}
			
			// update car obstacle positions
			for(var i=0; i<this.carObstacles.length; i++) {
				this.updateCar(this.carObstacles[i], curTime*this.speed);
			}
		}

    }

	// reset scene, then start timer and set to running
	startButton() {
		isRunning = 1;
		console.log("Game started");
		
		//curTime = 0;
		//time.setText(curTime.toString());
		
		this.scene.restart();
		
		// launch circle item
		//this.resetLevel();
		//this.launchCircle();
	}

	// stop current level
	stopButton() {
		console.log('Stopped');
		isRunning = 0;	
		//curHealth = 1000;
		//curTime = 0;
		//this.scene.restart();
		
		if(!(this.player.body === undefined)) {
			this.player.body.velocity.x = 0;
			this.player.body.velocity.y = 0;
		}
	}
	
	// reset game to level 1
	resetButton() {
		console.log("Game reset");
		level = 1;
		isRunning = 0;
		
		curTime = 0;
		curFails = 0;
		
		this.scene.restart();
	}
	
	// Background: parking lot 1
	// Enemy Type: simple patterns (lines)
	// Enemy Speed: low
	setupLevel1() {
		// createLevel(lvlNum, bgImg, bgScale, enemySpeed)
		this.createLevel(1, 'lot1', 1.75, 1.3);
		
		// objects
		
		// player/celebrity
		this.player = this.physics.add.sprite(60,490, 'celeb');
		this.player.setScale(0.1);
		this.player.body.collideWorldBounds = true;
		
		// car
		this.car = this.physics.add.sprite(710,50, 'car');
		this.car.setScale(0.15);
		this.car.body.immovable = true;
		
		// keys
		this.keys = this.physics.add.sprite(500,300, 'keys');
		this.keys.setScale(0.15);
		
		// enemies/paparazzi
		// diagonal line
		let enemyGroup1 = this.getEnemyGroup(575, 150, 'guy', 
			'200 * sin(t deg)', 
			'200 * sin(t deg)');
		// vertical line
		let enemyGroup2 = this.getEnemyGroup(200, 300, 'girl', 
			'0', 
			'300 * cos(t deg)');
		// horizontal line
		let enemyGroup3 = this.getEnemyGroup(500, 350, 'worker', 
			'300* cos(t deg)', 
			'0');
		
		// create list of enemy group objects
		this.enemies = [enemyGroup1, enemyGroup2, enemyGroup3];
		
		// UI border line
		this.line = this.physics.add.sprite(400,555, 'lineH');
		this.line.setScale(0.6);
		this.line.body.setSize(800/this.line.scale, 5);
		this.line.body.immovable = true;
		this.line.visible = false;
		
		// car obstacles
		let carGroup1 = this.getCarGroup(400,350, 'blue_car', 45, 
			'-100 * sin(t deg)', 
			'-100 * sin(t deg)');
		
		this.carObstacles = [carGroup1];
		
		// collisions
		this.physics.add.collider(this.player, this.car, 
			this.carHit, null, this);
		this.physics.add.collider(this.player, this.keys, 
			this.keysCollected, null, this);
		this.physics.add.collider(this.player, this.line, 
			null, null, this);
	}
	
	// Background: parking lot 1
	// Enemy Type: somewhat complex patterns (circles, ellipses)
	// Enemy Speed: medium
	setupLevel2() {
		// createLevel(lvlNum, bgImg, bgScale, enemySpeed)
		this.createLevel(2, 'lot2', 1.32, 1.2);
		
		// objects
		
		// player/celebrity
		this.player = this.physics.add.sprite(60,490, 'celeb');
		this.player.setScale(0.1);
		this.player.body.collideWorldBounds = true;
		
		// car
		this.car = this.physics.add.sprite(90,100, 'car');
		this.car.setScale(0.15);
		this.car.body.immovable = true;
		
		// keys
		this.keys = this.physics.add.sprite(500,400, 'keys');
		this.keys.setScale(0.15);
		
		// enemies/paparazzi
		// circle
		let enemyGroup1 = this.getEnemyGroup(200, 100, 'guy', 
			'200 * cos(t deg)', 
			'200 * sin(t deg)');
		// horizontal ellipse
		let enemyGroup2 = this.getEnemyGroup(500, 350, 'girl', 
			'150* sin(t deg)', 
			'300* cos(t deg)');
		// vertical ellipse
		let enemyGroup3 = this.getEnemyGroup(400, 300, 'worker', 
			'300 * sin(t deg)', 
			'150 * cos(t deg)');
		
		// create list of enemy group objects
		this.enemies = [enemyGroup1, enemyGroup2, enemyGroup3];
		
		// UI border line
		this.line = this.physics.add.sprite(400,555, 'lineH');
		this.line.setScale(0.6);
		this.line.body.setSize(800/this.line.scale, 5);
		this.line.body.immovable = true;
		this.line.visible = false;
		
		// car obstacles
		let carGroup1 = this.getCarGroup(575,450, 'blue_car',45, 
			'150 * sin(t deg)', 
			'150 * sin(t deg)');
			
		let carGroup2 = this.getCarGroup(150,250, 'green_car',-45, 
			'150 * sin(-1*t deg)', 
			'150 * sin(t deg)');
		
		this.carObstacles = [carGroup1, carGroup2];
		
		// collisions
		this.physics.add.collider(this.player, this.car, 
			this.carHit, null, this);
		this.physics.add.collider(this.player, this.keys, 
			this.keysCollected, null, this);
		this.physics.add.collider(this.player, this.line, 
			null, null, this);
	}
	
	// Background: parking lot 1
	// Enemy Type: complex patterns (flowers, stars, ...)
	// Enemy Speed: high
	setupLevel3() {
		// createLevel(lvlNum, bgImg, bgScale, enemySpeed)
		this.createLevel(3, 'lot3', 1.65, 2.0);
		
		// objects
		
		// player/celebrity
		this.player = this.physics.add.sprite(60,490, 'celeb');
		this.player.setScale(0.1);
		this.player.body.collideWorldBounds = true;
		
		// car
		this.car = this.physics.add.sprite(710,500, 'car');
		this.car.setScale(0.15);
		this.car.body.immovable = true;
		
		// keys
		this.keys = this.physics.add.sprite(200,200, 'keys');
		this.keys.setScale(0.15);
		
		// enemies/paparazzi
		// diamond
		let enemyGroup1 = this.getEnemyGroup(400, 300, 'guy', 
			'400* (cos((t/2) deg))^3', 
			'400* (sin((t/2) deg))^3');
		// flower
		let enemyGroup2 = this.getEnemyGroup(500, 200, 'girl', 
			'400 * cos((t/8) deg) * sin(4*(t/10) deg)', 
			'400* sin((t/8) deg) * sin(4*(t/10) deg)');
		// star
		let enemyGroup3 = this.getEnemyGroup(400, 200, 'worker', 
			'50*(2*cos(t deg) + 5*cos((2*t/3) deg))', 
			'50*(2*sin(t deg) - 5*sin((2*t/3) deg))');
		
		// create list of enemy group objects
		this.enemies = [enemyGroup1, enemyGroup2, enemyGroup3];
		
		// UI border line
		this.line = this.physics.add.sprite(400,555, 'lineH');
		this.line.setScale(0.6);
		this.line.body.setSize(800/this.line.scale, 5);
		this.line.body.immovable = true;
		this.line.visible = false;
		
		// car obstacles
		let carGroup1 = this.getCarGroup(585,425, 'blue_car',-45, 
			'150 * sin(t deg)', 
			'150 * sin(-1*t deg)');
			
		let carGroup2 = this.getCarGroup(100,300, 'green_car',0, 
			'250 * sin(-1*t deg)', 
			'0');
			
		let carGroup3 = this.getCarGroup(300,100, 'grey_car',90, 
			'0', 
			'300 * sin(t deg)');
		
		this.carObstacles = [carGroup1, carGroup2, carGroup3];
		
		// collisions
		this.physics.add.collider(this.player, this.car, 
			this.carHit, null, this);
		this.physics.add.collider(this.player, this.keys, 
			this.keysCollected, null, this);
		this.physics.add.collider(this.player, this.line, 
			null, null, this);
	}
	
	// create game level based on given parameters
	createLevel(lvlNum, bgImg, bgScale, enemySpeed) {
		// set data
		// this.scene.restart();
		level = lvlNum;					// set level
		this.speed = enemySpeed;		// speed enemies will travel
		//curTime = 0;					// reset time
		hasKeys = 0;					// take away keys
		playerStunned = 0;				// player starts un-stunned by cars
		timeStunned = -1000;			// make sure stun-time resets

		
		// set background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.image(400, 250, bgImg);
		this.bg.setScale(bgScale);
		
		console.log("Level "+lvlNum+" setup");
	}
	
	// creates group object for enemies
	getEnemyGroup(xStart, yStart, enemyImg, xEq, yEq) {
		// enemy/paparazzi
		let enemyNew = this.physics.add.sprite(0,0, enemyImg);
		enemyNew.setScale(0.04);
		
		// enemy's camera
		let camera = this.physics.add.sprite(0,0, 'camera');
		camera.setScale(0.05);
		
		this.physics.add.collider(this.player, enemyNew, this.enemyHit, null, this);
		
		// group enemy with camera
		let enemyContainer = this.add.container(xStart, yStart, 
			[enemyNew, camera]);﻿﻿
		//this.physics.world.enableBody(enemyContainer);
		//enemyContainer.body.setSize(10, 40);
		
		//this.physics.add.collider(this.player, enemyContainer, this.enemyHit, null, this);
		
		// group all relevant items/data
		var enemyGroup = {
			enemy: enemyContainer,
			x0: xStart,
			y0: yStart,
			x: xEq,
			y: yEq
		};
		
		return enemyGroup;
	}
	
	// creates group for car obstacle
	getCarGroup(xStart, yStart, carImg, rotation, xEq, yEq) {
		// enemy/paparazzi
		let carNew = this.physics.add.sprite(xStart,yStart, carImg);
		carNew.setScale(0.25);
		carNew.angle = rotation;
		//carNew.body.immovable = true;
		
		this.physics.add.overlap(this.player, carNew, this.carObstacleHit, null, this);
		
		// group all relevant items/data
		var carGroup = {
			car: carNew,
			x0: xStart,
			y0: yStart,
			x: xEq,
			y: yEq
		};
		
		return carGroup;
	}
	
	// update enemy position based on parametric equation
	updateEnemy(enemyGroup, val) {
		let x0 = enemyGroup.x0;
		let y0 = enemyGroup.y0;
		let x1 = math.evaluate(enemyGroup.x, {t:val});
		let y1 = math.evaluate(enemyGroup.y, {t:val});
		
		enemyGroup.enemy.x = x0 + x1;
		enemyGroup.enemy.y = y0 + y1;
	}
	
	// update enemy position based on parametric equation
	updateCar(carGroup, val) {
		let x0 = carGroup.x0;
		let y0 = carGroup.y0;
		let x1 = math.evaluate(carGroup.x, {t:val});
		let y1 = math.evaluate(carGroup.y, {t:val});
		
		carGroup.car.x = x0 + x1;
		carGroup.car.y = y0 + y1;
	}
	
	// reset level, hit enemy
	enemyHit(player, enemy) {
		console.log("FAIL: Enemy hit");
		
		this.sound.play('fail', {volume: 0.3});
		this.scene.restart();
		isRunning = 0;
		curFails += 1;
		fails.setText(curFails.toString());
	}
	
	// move player based on hitting car obstacle and stun
	carObstacleHit(player, carObs) {
		console.log("Car obstacle hit");
		
		if(playerStunned) return;
		
		// make player stunned
		playerStunned = 1;
		timeStunned = curTime;
		
		
		// player to car position difference
		let dx = (player.x - carObs.x);
		let dy = (player.y - carObs.y);
		
		let xDir = dx<0 ? -1 : 1;
		let yDir = dy<0 ? -1 : 1;
		
		//console.log(dx, dy);
		
		let angle = Math.atan(dy / dx);
		
		// move based on collision positions
		let v = 200;
		let vx = Math.abs(v * Math.cos(angle)) * xDir;
		let vy = Math.abs(v * Math.sin(angle)) * yDir;
		
		//console.log(vx, vy);
		
		this.player.body.velocity.x = vx;
		this.player.body.velocity.y = vy;
	}
	
	// player collected keys, can go to car. remove keys and update
	// 		hasKeys and UI
	keysCollected(player, keys) {
		// remove keys
		this.keys.destroy();
		
		// give feedback and update info/UI
		this.sound.play('coin', {volume: 0.3});
		hasKeys = 1;
		this.keysUI = this.physics.add.sprite(760,575, 'keys');
		this.keysUI.setScale(0.15);
	}
	
	// go to next level or complete game
	carHit() {
		if(!hasKeys) {
			// cannot drive car without keys
			console.log("Must first collect keys");
			return;
		}
		else {
			console.log("SUCCESS: Car hit");
			isRunning = 0;
		}
		
		if(level === 1) {
			// go to level 2
			//this.setupLevel2();
			this.sound.play('coin', {volume: 0.3});
			level = 2;
			this.scene.restart();
		}
		else if(level === 2) {
			// got to level 3
			//this.setupLevel3();
			this.sound.play('coin', {volume: 0.3});
			level = 3;
			this.scene.restart();
		}
		else if(level === 3) {
			// finish game
			this.sound.play('win', {volume: 0.3});
			this.playerWin();
		}
	}
	
	// resets current level (loads/reloads corresponding setup)
	resetLevel() {
		//this.scene.restart();
		
		if(level === 1) {
			// setup 1
			this.setupLevel1();
		}
		else if(level === 2) {
			// setup 2
			this.setupLevel2();
		}
		else if(level === 3) {
			// setup 3
			this.setupLevel3();
		}
	}
	
	// notify player that they have won/ended the game
	playerWin() {
		this.player.destroy();
		let trophy = this.add.image(400, 250, 'trophy');
		trophy.setScale(0.25);
	}
	
}




const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: MyScene,
    physics: { 
		default: 'arcade' ,
		arcade: {
			debug: false
		}
	},
});








