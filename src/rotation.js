function convertRotationToMatrix(rotation) {
    const rad = (rotation * Math.PI) / 180;
    return [Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)];
}

/**
 * Converts degrees to a transformation matrix
 * [cos(r), -sin(r), 0]
 * [sin(r), cos(r), 0]
 * 
 * in this order:
 * [cos(r), sin(r), -sin(r), cos(r), 0, 0]
 */
function convertDegreesToMatrix(degrees) {
    const radians = degrees * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return [cos, sin, -sin, cos, 0, 0];
}

module.exports = {
    convertRotationToMatrix,
    convertDegreesToMatrix
};
