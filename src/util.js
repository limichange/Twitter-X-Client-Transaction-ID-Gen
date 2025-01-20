//need base64

// Convert float to hexadecimal string representation
function floatToHex(x) {
    let result = [];
    let quotient = Math.floor(x);
    let fraction = x - quotient;
    
    while (quotient > 0) {
        quotient = Math.floor(x / 16);
        let remainder = Math.floor(x - parseFloat(quotient) * 16);

        if (remainder > 9) {
            result.unshift(String.fromCharCode(remainder + 55));
        } else {
            result.unshift(remainder.toString());
        }

        x = quotient;
    }

    if (fraction === 0) {
        return result.join('');
    }

    result.push('.');

    while (fraction > 0) {
        fraction *= 16;
        let integer = Math.floor(fraction);
        fraction -= integer;

        if (integer > 9) {
            result.push(String.fromCharCode(integer + 55));
        } else {
            result.push(integer.toString());
        }
    }

    return result.join('');
}

// Check if number is odd
function isOdd(num) {
    return num % 2 ? -1.0 : 0.0;
}

// Base64 encode string or Uint8Array
function base64Encode(string) {
    if (typeof string === 'string') {
        return btoa(string);
    }
    // If input is Uint8Array
    return btoa(String.fromCharCode.apply(null, string));
}

// Base64 decode to string or byte array
function base64Decode(input) {
    try {
        return atob(input);
    } catch (e) {
        // Convert to byte array
        return Array.from(new TextEncoder().encode(input));
    }
}

module.exports = {
    floatToHex,
    isOdd,
    base64Encode,
    base64Decode
};