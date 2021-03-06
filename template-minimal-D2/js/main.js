
/*
 * CS 325 - Digital Assignment 2
 *
 */

import "./phaser.js";

var background;
var isRunning = 0;
var goalsScored = 0;
var time;
var score;
var textStyle;
var arrow;
var soccer;
var net;
var netWalls;
var instr1;
var instr2;


class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		// images
		this.load.image( 'background', 'assets/field.jpg' );
		this.load.image( 'soccer', 'assets/soccer.png' );
		this.load.image( 'arrow', 'assets/arrow.png' );
		this.load.image( 'net', 'assets/net.png' );
		this.load.image( 'person', 'assets/person.png' );
    }
    
    create() {
		// add background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.image(windowWidth / 2, windowHeight / 2, 'background');
		this.bg.setDisplaySize(windowWidth, windowHeight);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.spaceKey = this.input.keyboard.addKey('SPACE');
		
		// UI bar
		this.add.rectangle(400, 600, 800, 100, 0x000);

		textStyle = { font: "20px Verdana", fill: "#FFF" };
		const startBut = this.add.text(50, 560, 'Start', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.startButton() );
		const stopBut = this.add.text(150, 560, 'Stop', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.stopButton() );

		time = this.add.text(250, 560, "0", textStyle);
		score = this.add.text(350, 560, "0", textStyle);
		
		instr1 = this.add.text(20, 10, "Left/Right to aim", textStyle);
		instr2 = this.add.text(20, 40, "Space to kick", textStyle);
		
		// objects
		arrow = this.physics.add.image(400, 500, 'arrow');
		arrow.setScale(0.2);
		arrow.setAngle(-90);
		arrow.setOrigin(0, 0.5);
		
		soccer = this.physics.add.sprite(400, 500, 'soccer');
		soccer.setScale(0.03);
		
		net = this.physics.add.sprite(400, 0, 'net');
		net.setScale(0.1);
		net.body.immovable = true;
		
		netWalls = this.physics.add.sprite(400, -10, 'net');
		netWalls.setScale(0.11);
		netWalls.body.immovable = true;
		netWalls.visible = false;
		
		let p1 = this.physics.add.sprite(400, 150, 'person');
		let p2 = this.physics.add.sprite(400, 300, 'person');
		p1.setScale(0.3);
		p2.setScale(0.3);
		p1.body.velocity.x = 500;
		p2.body.velocity.x = -400;
		p1.body.immovable = true;
		p2.body.immovable = true;
		p1.setAngle(180);
		p2.setAngle(180);
		
		// collisions
		this.physics.add.collider(soccer, net, goalScored, null, this);
		this.physics.add.collider(soccer, netWalls, barHit, null, this);
		this.physics.add.collider(soccer, p1, playerHit, null, this);
		this.physics.add.collider(soccer, p2, playerHit, null, this);
		soccer.body.collideWorldBounds = true;
		soccer.body.bounce.set(1);
		p1.body.collideWorldBounds = true;
		p2.body.collideWorldBounds = true;
		p1.body.bounce.set(1);
		p2.body.bounce.set(1);
    }
    
    update() {
		var curTime = parseInt(time.text.toString());
		//console.log(curTime);

		// check if running
		if(isRunning) {
			// check if below max time
			if(curTime<3000) {
				// increment time
				time.setText(curTime+1);
				
				if (this.cursors.left.isDown) {
					//console.log(arrow.angle);
					arrow.setAngle(arrow.angle-3);
				}
				else if (this.cursors.right.isDown) {
					//console.log(arrow.angle);
					arrow.setAngle(arrow.angle+3);
				}
				
				if(this.spaceKey.isDown) {
					kickBall();
				}
			}
			else {
				// max time reached
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
		score.setText("0");
	}

	// reset scene
	stopButton() {
		console.log('Stopped');
		isRunning = 0;	
		this.scene.restart();
	}

}

// set velocity
function kickBall() {
	console.log("Ball kicked");
	let v0 = 150;
	let v = Math.max(v0, Math.sqrt(Math.pow(soccer.body.velocity.x,2)+
		Math.pow(soccer.body.velocity.y,2))+5);
	let ang = arrow.angle*Math.PI/180;
	soccer.body.velocity.x = Math.cos(ang)*v;
	soccer.body.velocity.y = Math.sin(ang)*v;
}

// reset ball, increment score
function goalScored(soccer, net) {
	console.log("Ball hit net");
	soccer.body.velocity.x = 0;
	soccer.body.velocity.y = 0;
	soccer.setX(400);
	soccer.setY(500);
	score.setText(parseInt(score.text.toString())+1);
}

// test
function barHit() {
	console.log("Ball hit crossbar");
}

// reset ball
function playerHit() {
	console.log("Ball hit crossbar");
	soccer.body.velocity.x = 0;
	soccer.body.velocity.y = 0;
	soccer.setX(400);
	soccer.setY(500);
}



const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: MyScene,
    physics: { default: 'arcade'},
    });








