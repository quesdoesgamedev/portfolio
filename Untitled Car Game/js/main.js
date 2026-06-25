"use strict";

const canvas = document.getElementById('game');

//Create Window
const app = new PIXI.Application({
    view: canvas,
    width: 1000,
    height: 700,
    backgroundColor: 0x000000,
});

document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

//pre-load images for optimization
app.loader.
    add([
        "images/player.png",
        "images/enemy.png",
        "images/highway.png",
        "images/lights.png",
        "images/speed_inc_text.png",
        "images/title.png",
        "images/play_button.png",
        "images/game_over.png",
        "images/play_again.png",
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

//Game Variables
let stage;

let speed = 5;
let minSpeed = 3;
let maxSpeed = 5;
let highwaySpeed = 10;

let startScene, titleMusic;
let gameScene, car, highway, lights, scoreLabel, lifeLabel, gameMusic, gameOverMusic, crashSound, startSound, speedUpSound;
let gameOverScene;

let oncomingCars = [];

let score = 0;

let paused = true;

//flags for UI element
let speedTextShown = false;
let speedText2Shown = false;

// <-- STARTUP FUNCTIONS -->

//setup function
function setup() {
    //create start scene
    stage = new PIXI.Container();
    app.stage.addChild(stage);

    // #1 - Create the start `scene`
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

	// #4 - Create labels for all 3 scenes
	createLabelsandButtons();

    car = new Car(sceneWidth/ 2, 600);
    gameScene.addChild(car);

    //load sounds
    titleMusic = new Howl({
        src: ['sounds/game_title.mp3']
    });

    gameMusic = new Howl({
        src: ['sounds/game.mp3']
    });

    gameOverMusic = new Howl({
        src: ['sounds/game_over.mp3']
    });

    crashSound = new Howl({
        src: ['sounds/crashSFX.wav']
    });

    startSound = new Howl({
        src: ['sounds/startSFX.wav']
    });

    speedUpSound = new Howl({
        src: ['sounds/speedUpSFX.wav']
    });

    //start title music
    titleMusic.play();
}

//increasing score function
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

//Function for setting up labels for game scenes
function createLabelsandButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Verdana" 
    });


    let startLabel1 = new PIXI.Sprite.from("images/title.png");
    startLabel1.x = (sceneWidth - startLabel1.width) / 2;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // make middle start label
    let startLabel2 = new PIXI.Text("235 Final Project by Casey Blunt");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 16,
        fontFamily: "Verdana",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = (sceneWidth - startLabel2.width) / 2;
    startLabel2.y = 200;

    startScene.addChild(startLabel2);

    let startLabel3 = new PIXI.Text("Controls: arrow keys to move");
    startLabel3.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 16,
        fontFamily: "Verdana",
        fontStyle: "italic",
        strokeThickness: 6
    })
    startLabel3.x = (sceneWidth - startLabel2.width) / 2;
    startLabel3.y = 650;

    startScene.addChild(startLabel3);

    // make start game button
    let startButton = new PIXI.Sprite.from("images/play_button.png");
    startButton.style = buttonStyle;
    startButton.x = (sceneWidth - startButton.width) / 2;
    startButton.y = sceneHeight - 300;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); //startGame is a function reference
    startButton.on('pointerover', e => e.target.alpha = 0.7); //concise arrow function with now brackets
    startScene.addChild(startButton);

    // set up `gameOverScene`
    // make game over text
    let gameOverText = new PIXI.Sprite.from("images/game_over.png");
    let textStyle = new PIXI.TextStyle({
    	fill: 0xFFFFFF,
    	fontSize: 64,
    	fontFamily: "Verdana", //change later
    	stroke: 0xFF0000,
    	strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = (sceneWidth - gameOverText.width) / 2;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);
    
    //make "play again?" button
    let playAgainButton = new PIXI.Sprite.from("images/play_again.png");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = (sceneWidth - playAgainButton.width) / 2;
    playAgainButton.y = sceneHeight - 300;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", returnToMenu); // returnToMenu is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

//Game start setup function
function startGame(){
    titleMusic.stop();
    gameMusic.play();
    startSound.play();

    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    //set up `gameScene`
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Verdana", //change later
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    //score label
    score = 0;
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // Recreate the highway instance
    highway = new Highway(sceneWidth, sceneHeight, highwaySpeed);
    gameScene.addChildAt(highway, 0);

    lights = new Lights(sceneWidth, sceneHeight, highwaySpeed - 3);
    gameScene.addChildAt(lights, 3);

    console.log(highway.scrollSpeed);

    paused = false;

    //Start the game
    app.ticker.add(gameLoop);
}

function returnToMenu(){
    gameOverScene.visible = false;
    gameScene.visible = false;
    gameOverMusic.stop();
    setup();
}

// <-- GAME LOOP AND FUNCTIONS -->

function moveCar() {
    if (keyboard.right) {
        //move car and rotate for visual feedback
        car.x += speed;
        car.rotation = Math.PI / 16;
        if (car.x > sceneWidth - 70){
            car.x -= speed;
        }
    } else if (keyboard.left) {
        //Same for left
        car.x -= speed;
        car.rotation = -Math.PI / 16;
        if (car.x < 70){
            car.x += speed;
        }
    } else {
        // Reset rotation when no input is detected
        car.rotation = 0;
    }
}

// Add keyboard event listeners
const keyboard = {
    right: false,
    left: false,
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') keyboard.right = true;
    if (e.key === 'ArrowLeft') keyboard.left = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') keyboard.right = false;
    if (e.key === 'ArrowLeft') keyboard.left = false;
});

function createOncomingCar() {
    let oncomingCar = new OncomingCar(Math.random() * (maxSpeed - minSpeed) + minSpeed);
    oncomingCars.push(oncomingCar);
    return oncomingCar;
}

function gameLoop() {
    if (paused){return;}

    //calculate delta time
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    //move player car
    moveCar();

    //spawn oncoming cars at random intervals
    if (Math.random() < 0.015) {
        createOncomingCar();
    }

    // Move and check collisions for oncoming cars
    for (let c of oncomingCars){
        c.update();
        if (car.getBounds().intersects(c.getBounds())) {
            console.log('Game Over!');
            end();
            return;
        }
    }

    //Move highway
    highway.scroll();
    lights.scroll();

    //increase score
    increaseScoreBy(1);
    
    if (score > 2000 && !speedTextShown) {
        maxSpeed = 8;
        minSpeed = 5;
        highwaySpeed = 13;
        showSpeedText();
        speedTextShown = true;
    } 
    else if (score > 4000 && !speedText2Shown) {
        maxSpeed = 10;
        minSpeed = 7;
        highwaySpeed = 15;
        showSpeedText();
        speedText2Shown = true;
    }
}

// End function
function end() {
    //music start/stop
    gameMusic.stop();
    crashSound.play();
    gameOverMusic.play();

    paused = true;
    
    //remove all cars
    for (let c of oncomingCars){
        gameScene.removeChild(c);
    }

    //reset array
    oncomingCars = [];

    //remove old instantiations
    gameScene.removeChild(car);
    gameScene.removeChild(highway);

    highway.destroy();
    lights.destroy();

    //reset variables
    maxSpeed = 5;
    minSpeed = 3;
    highwaySpeed = 10;

    speedTextShown = false;
    speedText2Shown = false;

    gameOverScene.visible = true;
    gameScene.visible = true;
    app.ticker.remove(gameLoop);
}

//Used ChatGPT for text effect
function showSpeedText() {

    speedUpSound.play();

    // Create a sprite
    const image = new PIXI.Sprite.from("images/speed_inc_text.png");
    image.anchor.set(0.5, 0.5);

    // Set initial position above the screen
    image.position.set(app.view.width / 2, -image.height / 2);

    // Add the sprite to the stage
    app.stage.addChild(image);

    // Create a GSAP timeline
    const tl = gsap.timeline();

    // Tween to slide down
    tl.to(image.position, { y: app.view.height / 2, duration: 1, ease: "power1.out" });

    // Wait for a few seconds
    const waitTime = 2;  // Adjust wait time as needed

    // Tween to slide back up
    tl.to(image.position, { y: -image.height / 2, duration: 1, ease: "power1.in" }, `+=${waitTime}`);

    // You can continue chaining more tweens if needed

    // Start the timeline
    tl.play();
}