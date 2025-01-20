const crypto = require('crypto');
const rp = require('request-promise');
const cheerio = require('cheerio');
const { Buffer } = require('buffer');
const Cubic = require('./cubic');
const { interpolate } = require('./interpolate');
const { convertRotationToMatrix } = require('./rotation');
const { floatToHex, isOdd, base64Encode } = require('./util');

const ON_DEMAND_FILE_REGEX = /['|"]{1}ondemand\.s['|"]{1}:\s*['|"]{1}([\w]*)['|"]{1}/;
const INDICES_REGEX = /(\(\w{1}\[(\d{1,2})\],\s*16\))+/g;

class ClientTransaction {
    static DEFAULT_KEYWORD = "obfiowerehiring";
    static ADDITIONAL_RANDOM_NUMBER = 3;
    static DEFAULT_ROW_INDEX = 0;
    static DEFAULT_KEY_BYTES_INDICES = [1, 2, 3];

    constructor(homePageResponse) {
        this.homePageResponse = this.validateResponse(homePageResponse);
        this.DEFAULT_ROW_INDEX = ClientTransaction.DEFAULT_ROW_INDEX;
        this.DEFAULT_KEY_BYTES_INDICES = ClientTransaction.DEFAULT_KEY_BYTES_INDICES;
        this.key = this.getKey(this.homePageResponse);
        this.keyBytes = this.getKeyBytes(this.key);
        this.animationKey = this.getAnimationKey(this.keyBytes, this.homePageResponse);
    }

    async init() {
        try {
            const [rowIndex, keyBytesIndices] = await this.getIndices(this.homePageResponse);
            this.DEFAULT_ROW_INDEX = rowIndex;
            this.DEFAULT_KEY_BYTES_INDICES = keyBytesIndices;
            this.animationKey = this.getAnimationKey(this.keyBytes, this.homePageResponse);
            return this;
        } catch (error) {
            console.error('Failed to initialize indices:', error);
            // Fall back to default values
            return this;
        }
    }

    async getIndices(homePageResponse = null) {
        try {
            const keyByteIndices = [];
            const response = this.validateResponse(homePageResponse) || this.homePageResponse;
            let onDemandFile = ["ondemand.s", "abb5e6a"];
            try{
                const text = await rp({
                    uri: 'https://raw.githubusercontent.com/fa0311/TwitterInternalAPIDocument/refs/heads/develop/docs/json/ScriptLoadJson.json',
                    method: 'GET'
                });
                const json = JSON.parse(text);
                onDemandFile = json['ondemand.s'];
            }catch(e){
                console.log(e);
            }
            if (onDemandFile) {
                let onDemandFileUrl = onDemandFile;
                // const onDemandFileUrl = `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${onDemandFile[1]}a.js`;
                console.log(`Fetching from URL: ${onDemandFileUrl}`);
                console.log
                const text = await rp({
                    uri: onDemandFileUrl,
                    method: 'GET'
                });
                
                console.log('Response received, searching for indices...');
                let match;
                while ((match = INDICES_REGEX.exec(text)) !== null) {
                    keyByteIndices.push(match[2]);
                }
                
                if (keyByteIndices.length > 0) {
                    console.log(`Found indices: ${keyByteIndices.join(', ')}`);
                    return [parseInt(keyByteIndices[0]), keyByteIndices.slice(1).map(i => parseInt(i))];
                }
            }
            
            console.log('Using default indices');
            return [ClientTransaction.DEFAULT_ROW_INDEX, ClientTransaction.DEFAULT_KEY_BYTES_INDICES];
        } catch (error) {
            console.error('Error in getIndices:', error);
            return [ClientTransaction.DEFAULT_ROW_INDEX, ClientTransaction.DEFAULT_KEY_BYTES_INDICES];
        }
    }

    validateResponse(response) {
        // if (!response || typeof response !== 'object') {
        //     throw new Error("invalid response");
        // }
        // return response instanceof JSDOM ? response : new JSDOM(response);
        return response;
    }

    getKey(response = null) {
        const doc = (this.validateResponse(response) || this.homePageResponse);
        const $ = cheerio.load(doc);
        const element = $('[name="twitter-site-verification"]');
        if (!element) {
            throw new Error("Couldn't get twitter site verification code");
        }
        return element.attr('content');
    }

    getKeyBytes(key) {
        return Array.from(Buffer.from(key, 'base64'));
    }

    getFrames(response = null) {
        const doc = (this.validateResponse(response) || this.homePageResponse);
        const $ = cheerio.load(doc);
        return $('[id^="loading-x-anim"]');
    }

    get2dArray(keyBytes, response, frames = null) {
        if (!frames) {
            frames = this.getFrames(response);
        }
        const pathD = frames[keyBytes[5] % 4].firstChild.children[1].attribs.d.slice(9);;
        return pathD.split("C").map(item => 
            item.replace(/[^\d]+/g, " ").trim().split(" ").map(x => parseInt(x))
        );
    }

    solve(value, minVal, maxVal, rounding) {
        const result = value * (maxVal - minVal) / 255 + minVal;
        return rounding ? Math.floor(result) : Number(result.toFixed(2));
    }

    animate(frames, targetTime) {
        const fromColor = [...frames.slice(0, 3).map(Number), 1];
        const toColor = [...frames.slice(3, 6).map(Number), 1];
        const fromRotation = [0.0];
        const toRotation = [this.solve(Number(frames[6]), 60.0, 360.0, true)];
        const remainingFrames = frames.slice(7);
        
        const curves = remainingFrames.map((item, counter) => 
            this.solve(Number(item), isOdd(counter), 1.0, false)
        );

        const cubic = new Cubic(curves);
        const val = cubic.getValue(targetTime);
        let color = interpolate(fromColor, toColor, val);
        color = color.map(value => value > 0 ? value : 0);
        const rotation = interpolate(fromRotation, toRotation, val);
        const matrix = convertRotationToMatrix(rotation[0]);

        const strArr = [
            ...color.slice(0, -1).map(value => Math.round(value).toString(16)),
            ...matrix.map(value => {
                const rounded = Math.abs(Math.round(value * 100) / 100);
                const hex = floatToHex(rounded);
                return hex.startsWith(".") ? `0${hex}`.toLowerCase() : hex || '0';
            }),
            "0",
            "0"
        ];

        return strArr.join("").replace(/[.-]/g, "");
    }

    getAnimationKey(keyBytes, response) {
        const totalTime = 4096;
        const rowIndex = keyBytes[this.DEFAULT_ROW_INDEX] % 16;
        const frameTime = this.DEFAULT_KEY_BYTES_INDICES.reduce(
            (num1, num2) => num1 * (keyBytes[num2] % 16), 1
        );
        const arr = this.get2dArray(keyBytes, response);
        const frameRow = arr[rowIndex];
        const targetTime = frameTime / totalTime;
        return this.animate(frameRow, targetTime);
    }

    generateTransactionId(method, path, response = null, key = null, animationKey = null, timeNow = null) {
        try {
            timeNow = timeNow || Math.floor((Date.now() - 1682924400000) / 1000);
            const timeNowBytes = new Array(4).fill(0).map((_, i) => (timeNow >> (i * 8)) & 0xFF);
            
            key = key || this.key || this.getKey(response);
            const keyBytes = this.getKeyBytes(key);
            animationKey = animationKey || this.animationKey || this.getAnimationKey(keyBytes, response);
            
            const hashInput = `${method}!${path}!${timeNow}${ClientTransaction.DEFAULT_KEYWORD}${animationKey}`;
            const hashVal = crypto.createHash('sha256').update(hashInput).digest();
            const hashBytes = Array.from(hashVal);
            
            const randomNum = Math.floor(Math.random() * 256);
            const bytesArr = [
                ...keyBytes,
                ...timeNowBytes,
                ...hashBytes.slice(0, 16),
                ClientTransaction.ADDITIONAL_RANDOM_NUMBER
            ];
            
            const out = new Uint8Array([randomNum, ...bytesArr.map(item => item ^ randomNum)]);
            return base64Encode(out).replace(/=/g, "");
        } catch (error) {
            throw new Error(`Couldn't generate transaction ID.\n${error}`);
        }
    }
}

module.exports = ClientTransaction;
