
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/auth.js');
const tokenManager = require('../tokenManager');


router.post('/registrar', authController.registrar);
router.post('/login', authController.login);

router.post('/logout', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    tokenManager.addInvalidToken(token);
    
    res.json({ message: 'Logout realizado com sucesso' });
});



router.get('/verificar-token', authMiddleware, (req, res) => {
    res.json({ 
        valid: true, 
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

router.post('/logout', (req, res) => {
 
    res.json({ message: 'Logout realizado com sucesso' });
});

function checkTokenValidity(token) {
    return !invalidTokens.has(token);
}

module.exports = router;