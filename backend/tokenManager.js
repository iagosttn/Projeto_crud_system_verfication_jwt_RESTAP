// backend/tokenManager.js
const invalidTokens = new Set();

function addInvalidToken(token) {
    invalidTokens.add(token);
}

function isTokenInvalid(token) {
    return invalidTokens.has(token);
}

module.exports = {
    addInvalidToken,
    isTokenInvalid
};