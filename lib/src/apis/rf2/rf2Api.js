const ApiAbstract = require("../apiAbstract");
const shared_memory = require('@markusjx/shared_memory');

class Rf2Api extends ApiAbstract {

    constructor() {
        super();
    }

    handleBuffer(buffer){
        const res = {
            data: {},
            type: 'sTelemetryData',
        };

        //numVehicles
        const numVehic = buffer.readInt32LE(12);
        const maxVehic = 128;

        //cars array
        const carsArr = {};
        const cars = buffer.subarray(16, buffer.length);
        const carsBufferLength = cars.length / maxVehic;

        for (let i = 1; i <= numVehic; i++)
        {
            let start = (i-1) * carsBufferLength;
            let end = i * carsBufferLength;
            let tempBuf = cars.subarray(start, end);
            let speedAxis = {
                x: tempBuf.readDoubleLE(184),
                y: tempBuf.readDoubleLE(192),
                z: tempBuf.readDoubleLE(200)
            };

            carsArr[tempBuf.readUInt32LE(0)] =
            {
                //mVehicleName: tempBuf.toString('utf8', 32, 96),
                sSpeed:  Math.sqrt(
                    (speedAxis.x * speedAxis.x) +
                    (speedAxis.y * speedAxis.y) +
                    (speedAxis.z * speedAxis.z)) * 10 / 36,
                //mUnfilteredThrottle: tempBuf.readDoubleLE(388),
                //mFilteredThrottle: tempBuf.readDoubleLE(420),
                sThrottle: tempBuf.readDoubleLE(420),
                sLocalAcceleration: [
                    tempBuf.readDoubleLE(208),
                    tempBuf.readDoubleLE(216),
                    tempBuf.readDoubleLE(224)
                ],
                sCrashState: 0,
                sRideHeight: [tempBuf.readDoubleLE(484),tempBuf.readDoubleLE(484),tempBuf.readDoubleLE(492),tempBuf.readDoubleLE(492)],
                sGearNumGears: tempBuf.readInt32LE(352),
                mGameState: 84
            };
        }

        res.data = carsArr[this.getPlayerID(numVehic)];
        return res;
    }

    getPlayerID(numVehic) {
        const memory = new shared_memory("$rFactor2SMMP_Scoring$", 75312, false, false);
        const buf = memory.readBuffer();
        const mVehicles = buf.subarray(560, 75312);
        const maxVehic = 128;
        const mVehiclesBufferLength = mVehicles.length / maxVehic;
        let playerID = -1;

        for (let i = 1; i <= numVehic; i++)
        {
            let start = (i-1) * mVehiclesBufferLength;
            let end = i * mVehiclesBufferLength;
            let tempBuf = mVehicles.subarray(start, end);

            let mIsPlayer = tempBuf.readUIntLE(196, 1);
            let mControl = tempBuf.readUIntLE(197,1);
            let mID = tempBuf.readInt32LE(0,4);
            //console.log(i, mID, mControl, mIsPlayer);
            if(mIsPlayer == 1)
            {
                playerID = mID;
                break;
            }

        }
        return playerID;
    }

    readData() {        
        const memory = new shared_memory("$rFactor2SMMP_Telemetry$", 241680, false, false);
        const buf = memory.readBuffer();
        const json = this.handleBuffer(buf);
        if(json && json.data && Object.keys(json.data).length !== 0)
        {
            this.handleEffects(json);
        }
    }

    loop() {
        this.readData();
        return new Promise((resolve) => setTimeout(resolve, 50)).then(() => this.loop());
    }

    request() {      
        try {
            //init state
            this.static.state = 84;
            this.loop();
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Rf2Api