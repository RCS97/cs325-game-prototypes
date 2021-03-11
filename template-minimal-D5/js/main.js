
/*
 * CS 325 - Digital Assignment 5
 *		Title: Clean Freak
 *
 */

import "./phaser.js";

var isRunning = 0;		// 1 if game active, else 0

var time;
var curTime = 0;

var points;
var curPoints = 0;

var fails;
var curFails = 0;

var textStyle;
var textStyle2;
var headerStyle;
var instr1;
var instr2;

var winWidth = 800;
var winHeight = 600;

var level = 1;


class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		// images
		
		// backgrounds
		this.load.image('bathroom', 'assets/bathroom.jpg' );
		this.load.image('kitchen', 'assets/kitchen.jpg' );
		this.load.image('living', 'assets/living_room.jpg' );
		
		// items
		this.load.image('soap', 'assets/soap_bar.png' );
		this.load.image('sponge', 'assets/sponge.png' );
		this.load.image('spray', 'assets/spray.png' );
		
		// enemies
		this.load.image('bacteria', 'assets/bacteria_face.png' );
		this.load.image('corona', 'assets/corona.png' );
		this.load.image('dirt', 'assets/dirt_face.png' );
		
		// audio
		this.load.audio('coin', 'assets/coin.wav');
		this.load.audio('win', 'assets/win.wav');
		
		// other
		this.load.image('lineV', 'assets/line.png' );
		this.load.image('lineH', 'assets/line_h.png' );
		this.load.image('circle', 'assets/circle.png' );
		this.load.image('trophy', 'assets/trophy.png' );
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
		points = this.add.text(750, heightUI, curPoints.toString(), textStyle);
		
		this.curItem = this.physics.add.sprite(760,580, 'question');
		this.curItemName = 'question';
		this.curItem.setScale(0.04);
		
		// UI header/type text
		let heightHeader = 555;
		let timeHeader = this.add.text(350, heightHeader, "TIME", headerStyle);
		let failsHeader = this.add.text(650, heightHeader, 
			"FAILS", headerStyle);
		let pointsHeader = this.add.text(750, heightHeader, 
			"POINTS", headerStyle);
		
		instr1 = this.add.text(20, 10, "SPACE to place weighting point (must use all)", textStyle2);
		instr2 = this.add.text(20, 40, "Aim cleaning tool at dirt/germ with points", textStyle2);
    }
    
    update() {
		//console.log(curTime);

		// check if running
		if(isRunning) {
			// update time
			curTime++;
			time.setText((curTime+1)/100);
				
			// place point if possible
			if(this.spaceKey.isDown) {
				this.placeCircle();
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
		
		if(!(this.circle.body === undefined)) {
			this.circle.body.velocity.x = 0;
			this.circle.body.velocity.y = 0;
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
	
	// Background: living room
	// Item: spray
	// Enemy: dirt
	// Speed: low
	// Circles/Points: 4
	setupLevel1() {
		// createLevel(lvlNum, bgImg, itemImg, enemyImg, itemSpeed, numPoints, 
		//		bgScale, itemScale, enemyScale)
		this.createLevel(1, 'living', 'spray', 'dirt', 750, 5,
			1.7, .2, 0.1);
	}
	
	// Background: bathroom
	// Item: soap
	// Enemy: bacteria
	// Speed: medium
	setupLevel2() {
		// createLevel(lvlNum, bgImg, itemImg, enemyImg, itemSpeed, numPoints, 
		//		bgScale, itemScale, enemyScale)
		this.createLevel(2, 'bathroom', 'soap', 'bacteria', 1000, 5,
			1.5, .15, 0.15);
	}
	
	// Background: kitchen
	// Item: sponge
	// Enemy: corona
	// Speed: high
	setupLevel3() {
		// createLevel(lvlNum, bgImg, itemImg, enemyImg, itemSpeed, numPoints, 
		//		bgScale, itemScale, enemyScale)
		this.createLevel(3, 'kitchen', 'sponge', 'corona', 1250, 5,
			1, .2, 0.03);
	}
	
	// create game level based on given parameters
	createLevel(lvlNum, bgImg, itemImg, enemyImg, itemSpeed, numPoints, 
		bgScale, itemScale, enemyScale) {
		// set data
		// this.scene.restart();
		level = lvlNum;					// set level
		this.circlesNeeded = numPoints	// need to place
		this.circleCount = 0;			// currently placed
		this.speed = itemSpeed;			// speed circle/items will travel
		this.angle = -70;				// angle circle initially goes
		this.lastCircle = 0;			// time point was placed
		//curTime = 0;					// reset time
		this.curPoints = [];			// points placed
		
		curPoints = this.circlesNeeded;
		
		// set background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.image(400, 250, bgImg);
		this.bg.setScale(bgScale);
		
		// objects
		this.item = this.physics.add.sprite(40, 250, itemImg);
		this.item.setScale(itemScale);
		this.item.body.immovable = true;
		this.item.body.setSize(180,270);
		
		this.circle = this.physics.add.sprite(40, 250, 'circle');
		this.circle.setScale(0.1);
		this.circle.body.collideWorldBounds = true;
		this.circle.body.bounce.set(1);
		//this.circle.body.immovable = true;
		
		this.enemy = this.physics.add.sprite(760, 250, enemyImg);
		this.enemy.setScale(enemyScale);
		this.enemy.body.immovable = true;
		
		// border lines
		this.line1 = this.physics.add.sprite(790, 250, 'lineV');
		this.line1.setScale(1.5);
		this.line1.body.immovable = true;
		this.line1.body.setSize(5, 800);
		
		this.line2 = this.physics.add.sprite(10, 250, 'lineV');
		this.line2.setScale(1.5);
		this.line2.body.immovable = true;
		this.line2.body.setSize(5, 800);
		
		this.line3 = this.physics.add.sprite(400, 10, 'lineH');
		this.line3.setScale(1);
		this.line3.body.immovable = true;
		this.line3.body.setSize(800,5);
		
		this.line4 = this.physics.add.sprite(400, 545, 'lineH');
		this.line4.setScale(1);
		this.line4.body.immovable = true;
		this.line4.body.setSize(800,5);
		
		// make border lines transparent
		this.line1.visible = false;
		this.line2.visible = false;
		this.line3.visible = false;
		this.line4.visible = false;
		
		// collisions
		this.physics.add.collider(this.item, this.line1, 
					this.hitLine, null, this);
		this.physics.add.collider(this.item, this.line2, 
					this.hitLine, null, this);
		this.physics.add.collider(this.item, this.line3, 
					this.hitLine, null, this);
		this.physics.add.collider(this.item, this.line4, 
					this.hitLine, null, this);
					
		this.physics.add.collider(this.circle, this.line1, 
					this.removeCircle, null, this);
		/*this.physics.add.collider(this.circle, this.line3, 
					this.borderBounce, null, this);*/
		this.physics.add.collider(this.circle, this.line4, 
					this.borderBounce, null, this);
					
		this.physics.add.collider(this.item, this.enemy, 
					this.enemyHit, null, this);
				
		if(isRunning)
			this.launchCircle();
		
		console.log("Level "+lvlNum+" setup");
	}
	
	// reset level, missed enemy
	hitLine(item, line) {
		console.log("Border line hit");
		
		this.scene.restart();
		isRunning = 0;
		curFails += 1;
		fails.setText(curFails.toString());
	}
	
	// use linear regression to get line from placed points, then
	//		shoot item in line's trajectory
	shootItem() {
		console.log("Shoot item");
		let params = this.linearReg(this.curPoints);
		let a = params[0];
		let b = params[1];
		
		//console.log(a, b);
		/*a = -1*a;
		b = -1*b;*/
		
		let angleRad = Math.atan(a);
		let angleDeg = angleRad*180/Math.PI;
		
		//let traj = this.add.rectangle(0, b, 10, 1000, 0x000);
		//traj.setAngle(angle);
		
		/*let lineLen = 1500;
		let traj = this.add.line(0,0, 0,b, lineLen,a*lineLen+b, 0x000);*/
		
		let x0 = this.item.x;
		let safety = 75;	// safety margin to ensure valid placement of item
		let timeout = 0;	// timeout to avoid infinite loop if invalid line
		// increment x to find valid position
		while(((x0<safety || x0>800-safety) || 
			(x0*a+b<safety || x0*a+b>500-safety)) && timeout<1000) {
			console.log("Adjust item location");
			x0+=5;
			timeout++;
		}
		
		// invlaid line, reset
		if(timeout===1000) {
			this.scene.restart();
			return;
		}
		
		// place and shoot cleaning item
		this.item.x = x0
		this.item.y = this.item.x*a + b;
		let vx = Math.cos(angleRad)*this.speed;
		let vy = Math.sin(angleRad)*this.speed;
		
		this.item.body.velocity.x = vx;
		this.item.body.velocity.y = vy;
	}
	
	// given list of (x,y), return [a,b] for y = ax + b
	//		by using linear regression through linear algebra
	// 		and Normal Equations, minimizing least squares error
	linearReg(points) {
		let A = [];
		let b = [];
		
		// build A and b matrices (the data)
		for(var i=0; i<points.length; i++) {
			let x = points[i][0];
			let y = points[i][1];
			
			//console.log("x,y: "+x+", "+y);
			
			A.push([1, x]);
			b.push([y]);
		}
		
		// convert to math.js matrices
		let A_mat = math.matrix(A);
		let b_mat = math.matrix(b);
		
		//console.log(A_mat);
		//console.log(b_mat);
		
		// setup for Normal Equations
		let ATA = math.multiply(math.transpose(A_mat), A_mat);
		let ATB = math.multiply(math.transpose(A_mat), b_mat);
		
		// compute a and b line parameters
		let res = math.multiply(math.inv(ATA), ATB);
		
		/*console.log(res);
		res.forEach(function (value, index, matrix) {
		  console.log('value:', value, 'index:', index) 
		}) */
		
		// extract line parameters from result
		let a_res = math.subset(res, math.index(1, 0));
		let b_res = math.subset(res, math.index(0, 0));
		
		//console.log(a_res, b_res);
		
		return [a_res, b_res];
	}
	
	// go to next level or complete game
	enemyHit() {
		console.log("Enemy hit");
		isRunning = 0;
		
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
	
	// place point to be used when shooting item
	placeCircle() {
		// current circle location
		let x = this.circle.x;
		let y = this.circle.y;
		
		// place circle at current circle location, if possible
		if((curTime - this.lastCircle >= 20 || curTime==0) &&
			this.circlesNeeded > this.circleCount) {
			let circle = this.physics.add.sprite(x, y, 'circle');
			circle.setScale(0.05);
			this.curPoints.push([x,y]);
			
			this.lastCircle = curTime;
			this.circleCount += 1;
			
			curPoints--;
			points.setText(curPoints.toString());
		}
		
		if(this.circleCount === this.circlesNeeded) {
			// shoot item since all points placed
			this.circle.destroy();
			this.shootItem();
		}
	}
	
	// shoots the 'guiding circle'
	launchCircle() {
		console.log("Launch circle");
		
		let vx = Math.cos(Math.PI*this.angle/180)*this.speed;
		let vy = Math.sin(Math.PI*this.angle/180)*this.speed;
		
		this.circle.body.velocity.x = vx;
		this.circle.body.velocity.y = vy;
		
		//console.log("Circle vy: "+this.circle.body.velocity.y);
	}
	
	// removes the 'guiding circle' after end of path
	removeCircle(circle, line) {
		circle.destroy();
		
		if(this.circleCount < this.circlesNeeded) {
			// failed by not placing all points
			this.scene.restart();
			isRunning = 0;
			curFails += 1;
			fails.setText(curFails.toString());
		}
		else {
			// placed all points, shoot (should have already shot)
			this.shootItem();
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
	
	// tracks when 'guiding circle' bounces off horizontal walls
	borderBounce() {
		console.log("Circle bounced off wall");
	}
	
	// notify player that they have won/ended the game
	playerWin() {
		this.item.destroy();
		let trophy= this.add.image(400, 250, 'trophy');
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








