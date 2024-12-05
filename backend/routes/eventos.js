const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');


router.post('/eventos', eventosController.cadastrarEvento);
router.get('/eventos', eventosController.listarEventos);
router.get('/eventos/:id', eventosController.buscarEvento);
router.put('/eventos/:id', eventosController.editarEvento);
router.delete('/eventos/:id', eventosController.deletarEvento);

module.exports = router;