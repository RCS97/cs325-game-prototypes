
/*
 * CS 325 - Digital Assignment 5
 *		Title: 
 *
 */

import "./phaser.js";

var isRunning = 0;		// 1 if game active, else 0

var time;
var curTime = 0;

var money;
var startMoney = 0;
var curMoney = 0;

var textStyle;
var textStyle2;
var textStyle3;
var headerStyle;
var instr1;
var instr2;

var people = ['worker', 'guy', 'girl'];
var items = ['towel','water','food'];
var waitTime = 3000;	// longer = will wait more time before report
var spawnRate = 300;	// lower = faster
spawnRate = 100;

var winWidth = 800;
var winHeight = 600;

var towerStartHealth = 100;
var spikesCost = 2;
var spikesHealth = 2;



class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		// images
		this.load.image( 'background', 'assets/grass.jpg' );
		this.load.image( 'player', 'assets/spartan_trans.png' );
		this.load.image( 'enemy', 'assets/persian.png' );
		this.load.image( 'tower', 'assets/tower.png' );
		this.load.image( 'lineH', 'assets/line_h.png' );
		this.load.image( 'spikes', 'assets/spikes_trans2.png' );
		
		
		// audio
		this.load.audio('coin', 'assets/coin.wav');
		this.load.audio('fail', 'assets/fail.wav');
    }
    
    create() {
		// add background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.sprite(400, 275, 'background');
		this.bg.setInteractive();
		this.bg.setScale(1.6);
		this.bg.on('pointerdown', this.bgClicked, this);
		
		// inputs
		this.cursors = this.input.keyboard.createCursorKeys();
		this.spaceKey = this.input.keyboard.addKey('SPACE');
		this.mouse = this.input.mousePointer;
		this.cursors = this.input.keyboard.createCursorKeys();

		// text styles
		textStyle = { font: "20px Verdana", fill: "#FFF" };
		textStyle2 = { font: "20px Verdana", fill: "#000" };
		textStyle3 = { font: "15px Verdana", fill: "#FFF" };
		headerStyle = { font: "10px Verdana", fill: "#00CC00" };

		// objects
		this.player = this.physics.add.sprite(400,300, 'player');
		this.player.setScale(0.15);
		
		this.tower1 = this.physics.add.sprite(75,150, 'tower');
		this.tower1.setScale(0.1);
		this.tower1.body.immovable = true;
		
		this.tower1.setData('health', towerStartHealth);
		this.tower1.setData('tower', 0);
		this.t1Health = this.add.text(40, 100, "", textStyle3);
		this.t1Health.setText([
            'Health: ' + this.tower1.data.get('health')
        ]);
		
		this.tower2 = this.physics.add.sprite(75,450, 'tower');
		this.tower2.setScale(0.1);
		this.tower2.body.immovable = true;
		
		this.tower2.setData('health', towerStartHealth);
		this.tower2.setData('tower', 1);
		this.t2Health = this.add.text(40, 400, "", textStyle3);
		this.t2Health.setText([
            'Health: ' + this.tower2.data.get('health')
        ]);
		
		
		this.towerTexts = [this.t1Health, this.t2Health];
		this.towers = [this.tower1, this.tower2];
		this.enemyGroups = [];	// store current enemies
		this.curTraps = [];
		
		
		// UI border line
		this.line = this.physics.add.sprite(400,555, 'lineH');
		this.line.setScale(0.6);
		this.line.body.setSize(800/this.line.scale, 5);
		this.line.body.immovable = true;
		this.line.visible = false;
		
		// collisions
		this.player.body.collideWorldBounds = true;
		this.physics.add.collider(this.player, this.enemy, 
			this.towelCollected, null, this);
		this.physics.add.collider(this.player, this.line, 
			null, null, this);
		this.physics.add.collider(this.player, this.tower1, 
			null, null, this);
		this.physics.add.collider(this.player, this.tower2, 
			null, null, this);
		
		
		// UI
		this.add.rectangle(400, 600, 800, 100, 0x000);
		this.add.rectangle(400, 550, 800, 2, 0xFFFFFF);
		
		const startBut = this.add.text(50, 560, 'Start', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.startButton() );
		const stopBut = this.add.text(150, 560, 'Stop', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.stopButton() );
		
		// UI value text
		let heightUI = 568;
		time = this.add.text(250, heightUI, "0", textStyle);
		money = this.add.text(380, heightUI, "", textStyle);
		money.setText([
            ''+curMoney
        ]);
		
		this.curTrap = '';
		
		this.spikeTrap = this.physics.add.sprite(760,580, 'spikes').setInteractive();
		this.spikeTrap.setScale(0.07);
		this.spikeTrap.on('pointerdown', this.spikesSelected, this);
		
		
		//this.speedTrap = this.physics.add.sprite(760,580, 'question');
		//this.speedTrap.setScale(0.04);
		
		// UI header/type text
		let heightHeader = 555;
		let timeHeader = this.add.text(250, heightHeader, "TIME", headerStyle);
		let moneyHeader = this.add.text(380, heightHeader, 
			"MONEY", headerStyle);
			
		this.spikesHeader = this.add.text(740, heightHeader, 
			"SPIKES ["+spikesCost+"]", headerStyle);
		
		instr1 = this.add.text(20, 10, "Collect/give items with collision", textStyle2);
		instr2 = this.add.text(20, 40, "Arrows to move", textStyle2);
    }
    
    update() {
		//console.log(curTime);

		// check if running
		if(isRunning) {
			curTime++;
			// check if health remains
			if(this.tower1.data.get('health') > 0 || 
				this.tower2.data.get('health') > 0) {
				// increment time
				time.setText((curTime+1)/100);
				
				// check if time to spawn new enemy
				if(curTime % spawnRate == 0) {
					this.spawnEnemy();
				}
				
				
				// player movement
				let v = 150;
				// horizontal movement
				if (this.cursors.left.isDown) {
					this.player.flipX = false;
					this.player.body.velocity.x = -v;
				}
				else if (this.cursors.right.isDown) {
					this.player.flipX = true;
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
			else {
				// health depleted
				isRunning = 0;
				this.playerLost();
			}
		}

    }

	// reset scene, then start timer and set to running
	startButton() {
		console.log("Game started");
		isRunning = 1;
		
		curTime = 0;
		curMoney = startMoney;
		
		time.setText(curTime.toString());
		money.setText(startMoney.toString());
		
		this.scene.restart();
	}

	// reset scene
	stopButton() {
		console.log('Stopped');
		isRunning = 0;	
		//curHealth = 1000;
		//curTime = 0;
		//this.scene.restart();
	}
	
	
	// decrement health of tower hit
	towerHit(enemy, tower) {
		tower.setData('health', tower.data.get('health')-1);
		let towerIdx = tower.data.get('tower');
		let towerHealth = tower.data.get('health');
		
		this.towerTexts[towerIdx].setText([
            'Health: ' + towerHealth
        ]);
		
		this.despawnEnemy(enemy);
		
		// tower demolished, re-route enemies
		if(towerHealth === 0) {
			for(var i=0; i<this.enemyGroups.length; i++) {
				this.setEnemyRoute(this.enemyGroups[i].enemy);
			}
		}
	}
	
	// sets enemy trajectory based on randomness and tower statuses
	setEnemyRoute(enemy) {
		let x = enemy.x;
		let y = enemy.y;
		let tower = Math.floor(Math.random() * 2);
		
		if(this.towers[0].data.get('health')===0 &&
			this.towers[1].data.get('health')===0) {
			// no tower has health
			console.log("Spawn denied");
			enemy.body.velocity.x = 0;
			enemy.body.velocity.y = 0;
			return -1;	
		}
		
		if(this.towers[tower].data.get('health') === 0) {
			// no health, change towers
			tower = tower===0 ? 1 : 0;
		}
		
		let tx = this.towers[tower].x;
		let ty = this.towers[tower].y;
		let dx = tx - x;
		let dy = ty - y;
		let angle = Math.atan(dy / dx);
		

		let v = -100;
		enemy.body.velocity.x = v * Math.cos(angle);
		enemy.body.velocity.y = v * Math.sin(angle);
		
		return tower;
	}
	
	// spawns enemy with randomized components
	spawnEnemy() {
		//console.log("Spawn enemy");
		
		let x = 700;
		let y = Math.floor(Math.random() * 400) + 50;
		
		let enemy = this.physics.add.sprite(x,y, 'enemy');
		enemy.setScale(0.15);
	
		let tower = this.setEnemyRoute(enemy);
		
		var enemyGroup = {
			enemy: enemy,
			tower: tower
		};
		
		this.enemyGroups.push(enemyGroup);
		
		this.physics.add.collider(enemy, this.tower1, 
			this.towerHit, null, this);
		this.physics.add.collider(enemy, this.tower2, 
			this.towerHit, null, this);
		this.physics.add.collider(this.player, enemy, 
			this.enemyHit, null, this);
			
		this.addCollisionsToEnemy(enemy)
	}
	
	// player hit enemy
	enemyHit(player, enemy) {
		this.despawnEnemy(enemy);
		this.updateMoney(curMoney + 1);
		this.sound.play('coin', {volume: 0.3});
	}
	
	// despawn enemy when hit
	despawnEnemy(enemy) {
		// search for enemy in enemy container array
		let index = -1;
		for(var i=0; i<this.enemyGroups.length; i++) {
			if(this.enemyGroups[i].enemy === enemy) {
				index = i;
				break;
			}
		}
		
		// remove enemy if found
		if (index > -1) {
			this.enemyGroups.splice(index, 1);
		}
		
		enemy.destroy();
	}
	
	// despawn trap when hit
	despawnTrap(trap) {
		// search for trap in enemy container array
		let index = -1;
		for(var i=0; i<this.curTraps.length; i++) {
			if(this.curTraps.trap === trap) {
				index = i;
				break;
			}
		}
		
		// remove trap if found
		if (index > -1) {
			this.curTraps.splice(index, 1);
		}
		
		trap.data.get('healthText').destroy();
		
		trap.destroy();
	}
	
	//
	spikesSelected() {
		this.curTrap = 'spikes';
		console.log("Spikes clicked", this.curTrap);
		this.spikesHeader.setColor("#FF0000");
	}
	
	//
	bgClicked() {
		let x = this.mouse.x;
		let y = this.mouse.y;
		console.log("BG clicked", this.curTrap);
		
		if(this.curTrap === 'spikes' && curMoney>=spikesCost) {
			this.updateMoney(curMoney-spikesCost);
			console.log("spikes placed");
			
			let spikeTrap = this.physics.add.sprite(x,y, 'spikes');
			spikeTrap.setScale(0.07);
			spikeTrap.body.immovable = true;
			spikeTrap.setData('health', spikesHealth);
			spikeTrap.setData('handler', this.spikeHit);
			
			let trapHealth = this.add.text(x, y+10, "", textStyle3);
			trapHealth.setText([
				''+spikesHealth
			]);
			spikeTrap.setData('healthText', trapHealth);
			
			this.addCollisionsToTrap(spikeTrap);
			
			this.curTraps.push(spikeTrap);
		}
	}
	
	// add enemy collisions to new trap
	addCollisionsToTrap(trap) {
		let handler = trap.data.get('handler');
		
		for(var i=0; i<this.enemyGroups.length; i++) {
			if(this.enemyGroups[i].enemy === undefined)
				continue;
			
			this.physics.add.collider(trap, this.enemyGroups[i].enemy, 
				handler, null, this);
		}
	}
	
	// add trap collisions to new enemy
	addCollisionsToEnemy(enemy) {
		for(var i=0; i<this.curTraps.length; i++) {
			if(this.curTraps[i] === undefined)
				continue;
			
			let handler = this.curTraps[i].data.get('handler');
			
			this.physics.add.collider(this.curTraps[i], enemy, 
				handler, null, this);
		}
	}
	
	// register enemy hitting spike
	spikeHit(spike, enemy) {
		console.log("Spike hit");
		
		this.despawnEnemy(enemy);
		let curSpikeHealth = spike.data.get('health');
		
		// check spike health
		if(curSpikeHealth === 1) 
			this.despawnTrap(spike);
		else {
			spike.setData('health', curSpikeHealth-1);
			
			let trapHealth = spike.data.get('healthText');
			trapHealth.setText([
				''+curSpikeHealth-1
			]);
		}
		
		this.sound.play('coin', {volume: 0.3});
	}
	
	// updates money amount to value given
	updateMoney(value) {
		curMoney = value;
		money.setText([
            ''+curMoney
        ]);
	}
	
	// notify player that they have lost/ended the game
	playerLost() {
		console.log("GAME OVER");
		//let fired = this.add.image(400, 150, 'fired');
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






