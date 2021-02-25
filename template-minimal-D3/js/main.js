
/*
 * CS 325 - Digital Assignment 3
 *
 */

import "./phaser.js";

var background;
var isRunning = 0;
var goalsScored = 0;
var time;
var curTime = 0;
var health;
var textStyle;
var instr1;
var instr2;
var boat;
var barrel;
var ang;
var curHealth = 1000;
var lastShot = 0;
var boatLine;
var enemies = [];
var balls = [];


class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		// images
		this.load.image( 'background', 'assets/sky.png' );
		this.load.image( 'barrel', 'assets/barrel_rotated.png' );
		this.load.image( 'boat', 'assets/boat_flipped.png' );
		this.load.image( 'triangle', 'assets/triangle.png' );
		this.load.image( 'water', 'assets/water.png' );
		this.load.image( 'line', 'assets/line.png' );
		
		
		//this.load.image( 'ball', 'assets/ball_cropped.png' );
		this.load.image( 'ball', 'assets/ball_small.png' );
		
		this.load.image( 'ship', 'assets/ship_small.png' );
		//this.load.image( 'ship', 'assets/ship_flipped.png' );
    }
    
    create() {
		// add background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.image(windowWidth / 2, windowHeight / 2, 'background');
		this.bg.setDisplaySize(windowWidth, windowHeight);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.spaceKey = this.input.keyboard.addKey('SPACE');
		this.mouse = this.input.mousePointer;

		
		// objects
		let water = this.physics.add.sprite(400, 450, 'water');
		water.setScale(2);
		
		boat = this.physics.add.sprite(-130, 250, 'boat');
		boat.setScale(1.7);
		boat.body.immovable = true;
		
		barrel = this.physics.add.sprite(115, 340, 'barrel');
		barrel.setScale(0.15);
		barrel.setOrigin(0, 0.5);
		
		let triangle = this.physics.add.sprite(135, 340, 'triangle');
		triangle.setScale(0.16);
		
		
		// UI
		this.add.rectangle(400, 600, 800, 100, 0x000);

		textStyle = { font: "20px Verdana", fill: "#FFF" };
		let textStyle2 = { font: "20px Verdana", fill: "#000" };
		const startBut = this.add.text(50, 560, 'Start', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.startButton() );
		const stopBut = this.add.text(150, 560, 'Stop', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.stopButton() );
			
		time = this.add.text(250, 560, "0", textStyle);
		health = this.add.text(380, 560, "1000", textStyle);
		
		instr1 = this.add.text(20, 10, "Mouse to aim", textStyle2);
		instr2 = this.add.text(20, 40, "Space to shoot", textStyle2);
    }
    
    update() {
		curTime++;
		health.setText(curHealth);
		//console.log(curTime);

		// check if running
		if(isRunning) {
			// check if health remains
			if(curHealth > 0) {
				// increment time
				time.setText((curTime+1)/100);
				
				// check if boat hit by closest enemy
				/*if(enemies.length>0 && enemies[0].x<=200) 
					this.boatHit(enemies[0]);*/
				
				for(var i=0; i<enemies.length; i++) {
					if(enemies[i].x<=200) 
						this.boatHit(enemies[i]);
				}
				
				for(var i=0; i<balls.length; i++) {
					if(balls[i].y>=550) 
						this.removeBall(balls[i]);
				}
				
				// spawn enemy ship
				if(curTime % 300 == 0 && enemies.length<=20)
					this.spawnShip();
				
				// update cannon angle
				this.updateCannon();
				
				// shoot cannon
				if(this.spaceKey.isDown) {
					this.shootCannon();
				}
			}
			else {
				// health depleted
				isRunning = 0;
			}
		}

    }

	// reset scene, then start timer and set to running
	startButton() {
		console.log("Game started");
		this.scene.restart();
		isRunning = 1;
		time.setText("0");
		health.setText("1000");
		curHealth = 1000;
		curTime = 0;
		lastShot = 0;
	}

	// reset scene
	stopButton() {
		console.log('Stopped');
		isRunning = 0;	
		curHealth = 1000;
		curTime = 0;
		lastShot = 0;
		this.scene.restart();
	}
	
	// shoots cannon from mouse position
	shootCannon() {
		let cx = barrel.x;
		let cy = barrel.y;
		let L = 145;
		let angle = barrel.angle*Math.PI/180;
		let x = cx + Math.cos(angle)*L;
		let y = cy + Math.sin(angle)*L;
		let v = 200;
	
		
		if((curTime - lastShot >= 150 || curTime==0)) {
			let ball = this.physics.add.sprite(x, y, 'ball');
			//ball.setScale(0.16);
			//ball.setScale(0.01);
			
			ball.body.velocity.x = Math.cos(angle)*v;
			ball.body.velocity.y = Math.sin(angle)*v;
			ball.body.acceleration.y = 150;
			
			ball.body.setSize(ball.width, ball.height, 800,600);
			//ball.body.setBoundsRectangle(new Phaser.Geom.Rectangle(20,20, x,y));
			//ball.body.setSize(5,5, x,y);
			//ball.body.setOffset(800,600);
			
			//ball.body.width = 5;
			//ball.body.height = 5;
			
			//ball.refreshBody();
			
			for (var i = 0; i < enemies.length; i++) {
				this.physics.add.collider(ball, enemies[i], 
					this.enemyHit(enemies[i], ball), null, this);
			}
			
			balls.push(ball);
			lastShot = curTime;
		}
	}
	
	// update cannon angle
	updateCannon() {
		//console.log("Updating cannon");
		let mx = this.mouse.x;
		let my = this.mouse.y;
		let cx = barrel.x;
		let cy = barrel.y;
		let x = mx - cx;
		let y = my - cy;
		ang = (Math.atan(y/x)*180) / (Math.PI);
		
		if(ang<=10 && ang>=-60)
			barrel.setAngle(ang);
	}
	
	// spawn enemy ship
	spawnShip() {
		let minY = 350;
		let maxY = 490;
		let y = Math.floor(Math.random() * (maxY - minY) + minY);
		let ship = this.physics.add.sprite(900, y, 'ship');
		
		ship.body.velocity.x = -150;
		
		ship.body.collideWorldBounds = true;
		ship.body.checkCollision.up = false;
		ship.body.checkCollision.down = false;
		ship.body.bounce.set(1);
		
		//ship.setScale(0.3);
		//ship.setScale(0.05);
		
		ship.body.setSize(ship.width, ship.height, 800,0);
		//ship.body.setBoundsRectangle(new Phaser.Geom.Rectangle(20,20, 900,y));
		//ship.body.setSize(5,5, 900,y);
		//ship.body.width = 5;
		//ship.body.height = 5;
		//ship.body.setOffset(800,0);
		
		//ship.refreshBody();
		
		
		//this.physics.add.collider(ship, boat, this.boatHit(ship), null, this);
		enemies.push(ship);
	}
	
	// main boat hit by enemy
	boatHit(ship) {
		//console.log(ship.x);
		console.log("Boat hit");
	
		curHealth -= 50;
		let index = enemies.indexOf(ship);
		if (index > -1) {
			enemies.splice(index, 1);
		}
		
		ship.destroy();
	}
	
	// enemy hit by cannonball
	enemyHit(ship, ball) {
		//console.log("Enemy hit");
		let dx = ball.x - ship.x;
		let dy = ball.y - ship.y;
		let d = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
		//let d = this.distanceBetween(ship,ball);
		
		console.log(d);
		console.log(dx);
		console.log(dy);
		
		if(Math.abs(d) <= 200) {
			console.log("Enemy hit");
			this.removeBall(ball);
			this.removeEnemy(ship);
		}
		else {
			console.log("Too far");
		}
	}
	
	// remove ball
	removeBall(ball) {
		let index = balls.indexOf(ball);
		if (index > -1) {
			balls.splice(index, 1);
		}
		
		if(typeof ball!=='undefined')
			ball.destroy();
	}
	
	// remove ball
	removeEnemy(ship) {
		let index = enemies.indexOf(ship);
		if (index > -1) {
			enemies.splice(index, 1);
		}
		
		if(typeof ship!=='undefined')
			ship.destroy();
	}
}




const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: MyScene,
    physics: { default: 'arcade' },
    });








