
/*
 * CS 325 - Digital Assignment 3
 *
 */

import "./phaser.js";

var isRunning = 0;
var time;
var curTime = 0;
var health;
var textStyle;
var instr1;
var instr2;
var startHealth = 5;
var curHealth = 5;
var people = ['guy','girl'];
var items = ['towel','water','food'];
var waitTime = 1500;


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
    }
    
    create() {
		// add background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.image(windowWidth/2-35, windowHeight/2-100, 'background');
		//this.bg.setDisplaySize(windowWidth, windowHeight);
		this.bg.setScale(1.5);
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

		textStyle = { font: "20px Verdana", fill: "#FFF" };
		let textStyle2 = { font: "20px Verdana", fill: "#000" };
		const startBut = this.add.text(50, 560, 'Start', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.startButton() );
		const stopBut = this.add.text(150, 560, 'Stop', textStyle)
			.setInteractive()
			.on('pointerdown', () => this.stopButton() );
			
		time = this.add.text(250, 560, "0", textStyle);
		health = this.add.text(380, 560, startHealth.toString(), textStyle);
		
		instr1 = this.add.text(20, 10, "Collect/give items with collision", textStyle2);
		instr2 = this.add.text(20, 40, "Arrows to move", textStyle2);
		
		this.curItem = this.physics.add.sprite(750,575, 'question');
		this.curItemName = 'question';
		this.curItem.setScale(0.06);
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
					if(curTime - this.curCustomers[i].timeSpawned > waitTime) {
						console.log("Customer waited too long");
						
						let cust = this.curCustomers[i];
						this.curCustomers.splice(i, 1);
						cust.container.destroy();
						i--;
						
						this.decreaseHealth();
					}
					else {
						//console.log(curTime - this.curCustomers[i].timeSpawned);
					}
				}
				
				// check if time to spawn new customer
				if(curTime % 400 == 0) {
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
				if (this.cursors.up.isDown && this.worker.y>250) {
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
			}
		}

    }

	// reset scene, then start timer and set to running
	startButton() {
		console.log("Game started");
		isRunning = 1;
		time.setText("0");
		health.setText(startHealth.toString());
		curHealth = startHealth;
		curTime = 0;
		
		this.curItem.setTexture('question');
		this.curItemName = 'question';
		this.curCustomers = [];
		this.leavingCustomers = [];
		
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
	
	//
	towelCollected() {
		console.log("Towel collected");	
		this.curItemName = 'towel';
		this.curItem.setTexture('towel');
	}
	
	//
	foodCollected() {
		console.log("Food collected");	
		this.curItemName = 'food';
		this.curItem.setTexture('food');
	}
	
	//
	waterCollected() {
		console.log("Water collected");	
		this.curItemName = 'water';
		this.curItem.setTexture('water');
	}
	
	//
	spawnCustomer() {
		console.log('Customer spawned');
		// random attributes
		let personIdx = Math.floor(Math.random() * (people.length));
		let itemIdx = Math.floor(Math.random() * (items.length));
		let v = Math.floor(Math.random() * 100);
		let xDecide = Math.floor(Math.random() * 2);
		let x = xDecide==0 ? 750 : 50;
		let y = Math.floor(Math.random() * 250) + 250;
		let dir = Math.floor(Math.random() * 2);
		
		let cust = this.physics.add.sprite(0,0, people[personIdx]);
		cust.setScale(0.07);
		/*cust.body.collideWorldBounds = true;
		cust.setBounce(1);
		cust.body.velocity.x = Math.pow(-1, dir) * v;*/
		
		let custItem = this.physics.add.sprite(0,0, items[itemIdx]);
		custItem.setScale(0.06);
		/*custItem.body.collideWorldBounds = true;
		custItem.setBounce(1);
		custItem.body.velocity.x = Math.pow(-1, dir) * v;*/
		
		let custContainer = this.add.container(x, y, [cust, custItem]);﻿﻿
		this.physics.world.enableBody(custContainer);
		custContainer.body.collideWorldBounds = true;
		custContainer.body.bounce.set(1);
		custContainer.body.velocity.x = Math.pow(-1, dir) * v;
		custContainer.body.setSize(5,5);
		//custContainer.body.setOffset(400, 0);
		
		var customerGroup = {
			timeSpawned: curTime,
			container: custContainer,
			customer: cust,
			itemName: items[itemIdx],
			item: custItem
		};
		
		this.physics.add.overlap(this.worker, custContainer, 
			this.custCollided, null, this);
		
		this.curCustomers.push(customerGroup);
	}
	
	custCollided(worker, container) {
		//console.log("Customer collided with");
		let itemName = container.list[1].texture.key;
	
		// check if worker has item customer needs
		if(itemName === this.curItemName) {
			console.log("Customer received item: "+itemName+" "+this.curItemName);
			
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
	
	decreaseHealth() {
		curHealth--;
		health.setText(curHealth.toString());
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








