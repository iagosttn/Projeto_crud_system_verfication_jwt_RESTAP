const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');


router.post('/login', authController.login);
router.post('/registrar', authController.registrar);


router.get('/perfil', authMiddleware, (req, res) => {
    
    res.json({ message: 'Perfil acessado com sucesso' });
});

module.exports = router;