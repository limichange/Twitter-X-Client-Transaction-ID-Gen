function interpolate(fromList, toList, f) {
    if (fromList.length !== toList.length) {
        throw new Error(`Mismatched interpolation arguments ${fromList}: ${toList}`);
    }
    return fromList.map((fromVal, i) => interpolateNum(fromVal, toList[i], f));
}

function interpolateNum(fromVal, toVal, f) {
    // Check if both values are numbers
    if (typeof fromVal === 'number' && typeof toVal === 'number') {
        return fromVal * (1 - f) + toVal * f;
    }

    // Check if both values are booleans
    if (typeof fromVal === 'boolean' && typeof toVal === 'boolean') {
        return f < 0.5 ? fromVal : toVal;
    }
}

module.exports = {
    interpolate,
    interpolateNum
};
