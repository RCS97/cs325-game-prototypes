
/*
 * CS 325 - Digital Assignment 4
 *		Title: Hotel Hassle
 *
 */

import "./phaser.js";

var isRunning = 0;		// 1 if game active, else 0

var time;
var curTime = 0;

var health;
var startHealth = 5;
var curHealth = 5;

var score;
var curScore = 0;

var textStyle;
var textStyle2;
var headerStyle;
var instr1;
var instr2;

var people = ['guy','girl'];
var items = ['towel','water','food'];
var waitTime = 3000;	// longer = will wait more time before report
var spawnRate = 300;	// lower = faster

var winWidth = 800;
var winHeight = 600;


class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		// images
		this.load.image( 'background', 'assets/hotel.jpg' );
		this.load.image( 'worker', 'assets/worker.png' );
		this.load.image( 'guy', 'assets/guy.png' );
		this.load.image( 'girl', 'assets/girl.png' );
		this.load.image( 'towel', 'assets/towel.png' );
		this.load.image( 'water', 'assets/water.png' );
		this.load.image( 'food', 'assets/food.png' );
		this.load.image( 'question', 'assets/question.png' );
		this.load.image( 'fired', 'assets/fired.png' );
		this.load.image( 'hourglass', 'assets/hourglass.png' );
    }
    
    create() {
		// add background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		//this.bg = this.add.image(windowWidth/2, windowHeight/2, 'background');
		this.bg = this.add.image(400, 250, 'background');
		//this.bg = this.add.image(windowWidth/2, windowHeight/2, 'background');
		//this.bg.setDisplaySize(windowWidth, windowHeight);
		this.bg.setScale(1.6);
		/*let bgHeight = windowWidth;
		let bgWidth = (382/612)*bgHeight;
		this.bg.setDisplaySize(bgWidth, bgHeight);*/
		
		// inputs
		this.cursors = this.input.keyboard.createCursorKeys();
		this.spaceKey = this.input.keyboard.addKey('SPACE');
		this.mouse = this.input.mousePointer;
		this.cursors = this.input.keyboard.createCursorKeys();


		// objects
		this.worker = this.physics.add.sprite(400,300, 'worker');
		this.worker.setScale(0.07);
		//this.worker.body.setSize(5,5);
		//this.worker.body.setOffset(800, 300);
		
		this.towel = this.physics.add.sprite(50,300, 'towel');
		this.towel.setScale(0.1);
		this.towel.body.immovable = true;
		
		this.water = this.physics.add.sprite(750,300, 'water');
		this.water.setScale(0.1);
		this.water.body.immovable = true;
		
		this.food = this.physics.add.sprite(400,480, 'food');
		this.food.setScale(0.1);
		this.food.body.immovable = true;
		
		this.curCustomers = [];	// store current customers
		
		
		// collisions
		this.worker.body.collideWorldBounds = true;
		this.physics.add.collider(this.worker, this.towel, 
			this.towelCollected, null, this);
		this.physics.add.collider(this.worker, this.food, 
			this.foodCollected, null, this);
		this.physics.add.collider(this.worker, this.water, 
			this.waterCollected, null, this);
		
		
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
		
		// UI value text
		let heightUI = 568;
		time = this.add.text(250, heightUI, "0", textStyle);
		health = this.add.text(380, heightUI, startHealth.toString(), textStyle);
		score = this.add.text(510, heightUI, "0", textStyle);
		
		this.curItem = this.physics.add.sprite(760,580, 'question');
		this.curItemName = 'question';
		this.curItem.setScale(0.04);
		
		// UI header/type text
		let heightHeader = 555;
		let timeHeader = this.add.text(250, heightHeader, "TIME", headerStyle);
		let healthHeader = this.add.text(380, heightHeader, 
			"HEALTH", headerStyle);
		let scoreHeader = this.add.text(510, heightHeader, 
			"SCORE", headerStyle);
		let itemHeader = this.add.text(750, heightHeader, 
			"ITEM", headerStyle);
		
		instr1 = this.add.text(20, 10, "Collect/give items with collision", textStyle2);
		instr2 = this.add.text(20, 40, "Arrows to move", textStyle2);
    }
    
    update() {
		//console.log(curTime);

		// check if running
		if(isRunning) {
			curTime++;
			// check if health remains
			if(curHealth > 0) {
				// increment time
				time.setText((curTime+1)/100);
				
				// check if customer has waited too long
				for(var i=0; i<this.curCustomers.length; i++) {
					let curCust = this.curCustomers[i];
					let activeTime = curTime - curCust.timeSpawned;
					
					if(activeTime > curCust.wait) {
						// customer waited too long
						console.log("Customer waited too long");
						
						let cust = this.curCustomers[i];
						this.curCustomers.splice(i, 1);
						cust.container.destroy();
						i--;
						
						this.decreaseHealth();
					}
					else if(activeTime > curCust.wait*0.75) {
						// indicate customer about to expire
						//curCust.customer.tint = 0x0000FF;
						let hourglass = this.physics.add.sprite(0,-70, 'hourglass');
						hourglass.setScale(0.03);
						curCust.container.add(hourglass);
					}
				}
				
				// check if time to spawn new customer
				if(curTime % spawnRate == 0) {
					this.spawnCustomer();
				}
				
				// player movement
				let v = 150;
				// horizontal movement
				if (this.cursors.left.isDown) {
					this.worker.body.velocity.x = -v;
				}
				else if (this.cursors.right.isDown) {
					this.worker.body.velocity.x = v;
				}
				else {
					this.worker.body.velocity.x = 0;
				}
				// vertical movement
				if (this.cursors.up.isDown && this.worker.y>240) {
					this.worker.body.velocity.y = -v;
				}
				else if (this.cursors.down.isDown) {
					this.worker.body.velocity.y = v;
				}
				else {
					this.worker.body.velocity.y = 0;
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
		curHealth = startHealth;
		curScore = 0;
		
		time.setText(curTime.toString());
		health.setText(startHealth.toString());
		score.setText(curScore.toString());
		
		this.curItem.setTexture('question');
		this.curItemName = 'question';
		this.curCustomers = [];
		
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
	
	// player collected towel item, notify and update
	towelCollected() {
		console.log("Towel collected");	
		this.curItemName = 'towel';
		this.curItem.setTexture('towel');
	}
	
	// player collected food item, notify and update
	foodCollected() {
		console.log("Food collected");	
		this.curItemName = 'food';
		this.curItem.setTexture('food');
	}
	
	// player collected water item, notify and update
	waterCollected() {
		console.log("Water collected");	
		this.curItemName = 'water';
		this.curItem.setTexture('water');
	}
	
	// spawn a new customer based on RNG conditions, add to customer list
	spawnCustomer() {
		console.log('Customer spawned');
		// random attributes
		let isAngry = Math.floor(Math.random() * 5) === 0;	// 20% chance of angry
		
		let personIdx = Math.floor(Math.random() * (people.length));
		let itemIdx = Math.floor(Math.random() * (items.length));
		let v = Math.floor(Math.random() * 100) + 50;
		let xDecide = Math.floor(Math.random() * 2);
		let x = xDecide==0 ? 750 : 50;
		let y = Math.floor(Math.random() * 250) + 240;
		let dir = Math.floor(Math.random() * 2);
		
		let cust = this.physics.add.sprite(0,0, people[personIdx]);
		cust.setScale(0.07);
		
		let custItem = this.physics.add.sprite(0,0, items[itemIdx]);
		custItem.setScale(0.06);
		
		let custContainer = this.add.container(x, y, [cust, custItem]);﻿﻿
		this.physics.world.enableBody(custContainer);
		custContainer.body.collideWorldBounds = true;
		custContainer.body.bounce.set(1);
		custContainer.body.velocity.x = Math.pow(-1, dir) * v;
		custContainer.body.setSize(5,5);
		//custContainer.body.setOffset(400, 0);
		
		// modify customer properties if angry
		let custWait = waitTime;
		if(isAngry) {
			custWait /= 2;			// less wait time
			cust.tint = 0xee0000	// tinted red
		}
		
		var customerGroup = {
			timeSpawned: curTime,
			container: custContainer,
			customer: cust,
			itemName: items[itemIdx],
			item: custItem,
			wait: custWait
		};
		
		this.physics.add.overlap(this.worker, custContainer, 
			this.custCollided, null, this);
		
		this.curCustomers.push(customerGroup);
	}
	
	// detects collision between worker/player and customer. 
	// 		despawn customer and remove from list if needs are met
	custCollided(worker, container) {
		//console.log("Customer collided with");
		let itemName = container.list[1].texture.key;
	
		// check if worker has item customer needs
		if(itemName === this.curItemName && isRunning) {
			console.log("Customer received item: "+itemName+" "+this.curItemName);
			
			curScore+=1;
			score.setText(curScore.toString());
			
			// search for customer in customer array
			let index = -1;
			for(var i=0; i<this.curCustomers.length; i++) {
				if(this.curCustomers[i].container === container) {
					index = i;
					break;
				}
			}
			
			// remove customer if found
			if (index > -1) {
				this.curCustomers.splice(index, 1);
			}
			
			container.destroy();
		}
	}
	
	// decrement player health
	decreaseHealth() {
		curHealth--;
		let healthVal = Math.max(curHealth,0);
		health.setText(healthVal.toString());
	}
	
	// notify player that they have lost/ended the game
	playerLost() {
		let fired = this.add.image(400, 150, 'fired');
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








