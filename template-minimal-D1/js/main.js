
/*
 * CS 325 - Digital Assignment 1
 *
 */

import "./phaser.js";

var background;
var isRunning = 0;
var circlesClicked = 0;
var time;
var score;
var elems = ["He", "Ne", "C", "Ag", "Xe", "Au", "Na", "Si", "P", "Cl", "Ar",
	"Br", "I", "Pb", "Rn", "U", "Li", "Mg", "Al"];
var elemRads = [31, 38, 67, 165, 108, 174, 190, 111, 98, 79, 71,
	94, 115, 154, 120, 175, 167, 145, 118];
var textStyle;



class MyScene extends Phaser.Scene {

    constructor() {
        super();
    }
    
    preload() {
		this.load.image( 'background', 'assets/starfield.jpg' );
    }
    
    create() {
		// add background
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		this.bg = this.add.image(windowWidth / 2, windowHeight / 2, 'background');
		this.bg.setDisplaySize(windowWidth, windowHeight);
		

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
    }
    
    update() {
		var curTime = parseInt(time.text.toString());
		//console.log(curTime);

		var x = Math.floor(Math.random()*800);
		var y = Math.floor(Math.random()*500);

		// check if running
		if(isRunning) {
			// check if below max time
			if(curTime<1500) {
				// increment time
				time.setText(curTime+1);

				if(curTime%30==0) {
					// add circle at certain times
					var group = this.add.group();
					var elemIndex = Math.floor(Math.random()*elems.length);
					var elemText = elems[elemIndex];
					var rad = elemRads[elemIndex];
					
					// create circle and text for atom
					var circle = this.add.circle(x, y-rad/4, rad/2, 
						get_hex_color()).setInteractive()
						.on('pointerdown', () => this.circleClick(group));
					var elemStyle = { font: rad/3+"px Verdana", fill: "#FFF" }
					var circleText = this.add.text(x-rad/6, y-rad/2, elemText, elemStyle);
					
					group.add(circle);
					group.add(circleText);
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
		this.scene.restart();
		console.log('Started');
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

	// increment score if game is running, remove atom/group
	circleClick(elemGroup) {
		if(isRunning) {
			score.setText(parseInt(score.text.toString())+1);
			elemGroup.clear(true, true);
		}
	}

}

// get random hex color above a color threshold
function get_hex_color() {
	var r = Math.floor(Math.max(Math.random()*Math.pow(16, 2), 60)).toString(16);
	var g = Math.floor(Math.max(Math.random()*Math.pow(16, 2), 60)).toString(16);
	var b = Math.floor(Math.max(Math.random()*Math.pow(16, 2), 60)).toString(16);
	
	if(r.length==1)r="0"+r;
	if(g.length==1)g="0"+g;
	if(b.length==1)b="0"+b;
	
	return"0x"+r+g+b;
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: MyScene,
    physics: { default: 'arcade'},
    });








