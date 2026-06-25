// Player car class
class Car extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/player.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        stage.addChildAt(this, 2);
    }
}

// OncomingCar class
class OncomingCar extends PIXI.Sprite {
    constructor(speed) {
        super(app.loader.resources["images/enemy.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.position.set((Math.random() * (app.screen.width - 140) + 70), -100);
        gameScene.addChildAt(this, 2);
        // Adjust speed and other properties as needed
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
        if (this.y > app.screen.height + 100) {
            // Remove car if it goes off-screen
            gameScene.removeChild(this);
        }
    }
}

class Highway extends PIXI.TilingSprite{
    constructor(width, height, scrollSpeed){
        super(app.loader.resources["images/highway.png"].texture, width, height);
        this.position.set(0, 0);
        this.scrollSpeed = scrollSpeed;
        stage.addChild(this);
    }

    scroll(){
        this.tilePosition.y += this.scrollSpeed;
    }
}

class Lights extends PIXI.TilingSprite{
    constructor(width, height, scrollSpeed){
        super(app.loader.resources["images/lights.png"].texture, width, height);
        this.position.set(0, 0);
        this.scrollSpeed = scrollSpeed;
        this.alpha = 0.4;
        stage.addChild(this);
    }

    scroll(){
        this.tilePosition.y += this.scrollSpeed;
    }
}