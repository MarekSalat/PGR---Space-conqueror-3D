var Game = Game || function (){

    this.nextScreen = null;
    this.currentScreen = null;

    this.setScreen = function (screen){
        this.nextScreen = screen;
        console.log(screen);
    };

    this.init = function(){

    };

    this._clock = new THREE.Clock(true);

    this.animate = function (){
        var delta = this._clock.getElapsedTime();

        this.currentScreen = this.nextScreen;
        if(this.currentScreen == null) return;

        this.currentScreen.update(delta);
        this.currentScreen.render(delta);
    };
};