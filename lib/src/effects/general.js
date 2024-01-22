class General {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
        this.gear = null
        this.last = null
        this.prevSus = [0,0,0,0]
        this.prevSpeed = 0
        this.speedOnGearShift = 0
        this.maxThrottle = 1
    }

    handle(gameData) { 
        let local = gameData.localAcc;

        // strong brake
        if(this.prevSpeed - gameData.speed > 0.45 && gameData.speed != 0) {
            //console.log('BRAKE', this.prevSpeed - gameData.speed)
            this.tactPlay.playEffect('BRAKE_ARMS',this.options)
            this.tactPlay.playEffect('BRAKE_FACE',this.options)
            this.tactPlay.playEffect('BRAKE_FEET',this.options)
            this.tactPlay.playEffect('BRAKE_VEST',this.options)
        }

        // gas
        if (gameData.throttle > 0) {
            if (gameData.throttle > this.maxThrottle)
            {
                this.maxThrottle = gameData.throttle
            }
            const f_int = gameData.throttle / this.maxThrottle;
            this.tactPlay.playEffect('ACCELERATION_E_FACE', {intensity: f_int * 0.75, duration:this.options['duration']})
            this.tactPlay.playEffect('ACCELERATION_E_FEET', {intensity: f_int * 0.75, duration:this.options['duration']})
            this.tactPlay.playEffect('ACCELERATION_E_VEST', {intensity: f_int * 0.75, duration:this.options['duration']})
        }

        if (gameData.speed > 2 && gameData.speed > this.prevSpeed) {
            let intensity = (gameData.speed - this.speedOnGearShift) / 25
            let inten = (intensity < 4) ? ((intensity < 0.2) ? 0.2 : intensity ) : 4
            console.log(inten);
            this.tactPlay.playEffect('ACCELERATION_F_ARMS',
                {intensity: inten, duration:this.options['duration']})
            this.tactPlay.playEffect('ACCELERATION_F_FACE',
                {intensity: inten, duration:this.options['duration']})
            this.tactPlay.playEffect('ACCELERATION_F_FEET',
                {intensity: inten, duration:this.options['duration']})
            this.tactPlay.playEffect('ACCELERATION_F_VEST',
                {intensity: inten, duration:this.options['duration']})
        }

        if (gameData.speed != 0)
        {
            this.prevSpeed = gameData.speed;
        }

        // clutch engage
        
        if(this.gear != null && this.gear != gameData.gear && gameData.gear != 0) {
            this.tactPlay.playEffect('CLUTCH_ENGAGE_FEET', {intensity:0.75, duration:this.options['duration']})
            this.tactPlay.playEffect('CLUTCH_ENGAGE_VEST', {intensity:0.75, duration:this.options['duration']})
            
            if (gameData.gear != 0 && gameData.gear != 96)
            {
                this.speedOnGearShift = (this.gear < gameData.gear) ? gameData.speed : 0;
            }
        }
        if (gameData.gear != 0)
        {
            this.gear = gameData.gear
        }

        // wheel shock absorber
        let diff = 0.01;        

        if(gameData.susHeight[0] != 0)
        {
            if(Math.abs(gameData.susHeight[0] - this.prevSus[0]) > diff) {
                //console.log('wheel_shock_absorber_LEFT_FRONT_C')
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_FRONT_C_ARMS', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_FRONT_C_FACE', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_FRONT_C_FEET', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_FRONT_C_VEST', {intensity:0.75, duration:this.options['duration']})
            }            
            
            if(Math.abs(gameData.susHeight[1] - this.prevSus[1]) > diff) {
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_FRONT_C_ARMS', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_FRONT_C_FACE', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_FRONT_C_FEET', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_FRONT_C_VEST', {intensity:0.75, duration:this.options['duration']})
            } 
            
            if(Math.abs(gameData.susHeight[2] - this.prevSus[2]) > diff) {
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_BACK_C_ARMS', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_BACK_C_FACE', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_BACK_C_FEET', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_RIGHT_BACK_C_VEST', {intensity:0.75, duration:this.options['duration']})
            } 
            
            if(Math.abs(gameData.susHeight[3] - this.prevSus[3]) > diff) {
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_BACK_C_ARMS', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_BACK_C_FACE', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_BACK_C_FEET', {intensity:0.75, duration:this.options['duration']})
                this.tactPlay.playEffect('wheel_shock_absorber_LEFT_BACK_C_VEST', {intensity:0.75, duration:this.options['duration']})
            } 
            
            this.prevSus = gameData.susHeight;
        }

        // gears arms
        
        if(gameData.gear != 0 && gameData.gear != gameData.nGear && this.gear != gameData.nGear) {
            if(this.gear != null &&  this.gear > gameData.gear) {
                this.tactPlay.playEffect('leftGear_ARMS',this.options)
                
                // gauche
            }
            if(this.gear != null && this.gear < gameData.gear) {
                this.tactPlay.playEffect('rightGear_ARMS',this.options)
                // droite
            }

            this.gear = gameData.gear
        }

        // gforce
        let top = Math.round(local[2]);
        let left = Math.round(local[0]); 
        let gForce = Math.sqrt(Math.pow(local[0],2)+Math.pow(local[1],2)+Math.pow(local[2],2)) / 9.80665; //intensité vibration

        let newForce = this.options["intensity"]*gForce*0.2

        if(newForce < 0.2) newForce = 0.2;
        if(newForce > 5) newForce = 5;

        let newOptions = {intensity:newForce, duration:this.options['duration']}
        
        let negForce = Math.abs(this.options["intensity"]*gForce*0.1)

        if(negForce < 0.2) negForce = 0.2;
        if(negForce > 5) negForce = 5;

        let negOptions = {intensity:negForce, duration:this.options['duration']}

        if(top != 0 && Math.sign(top) == 1) {
            this.tactPlay.playEffect('back',newOptions)
        } else if (top != 0) {
            this.tactPlay.playEffect('front',negOptions)
        }
        
        if(left != 0 && Math.sign(left) == 1) {
            this.tactPlay.playEffect('right_FACE',newOptions)
            this.tactPlay.playEffect('right_VEST',newOptions)
        } else if (left != 0) {
            this.tactPlay.playEffect('left_FACE',negOptions)
            this.tactPlay.playEffect('left_VEST',negOptions)
        }
    }
}

module.exports = General