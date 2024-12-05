const express = require('express');
const router = express.Router();
const participantesController = require('../controllers/participantesController.js');

router.post('/participantes', participantesController.cadastrarParticipante);
router.get('/participantes', participantesController.listarParticipantes);
router.put('/participantes/:id', participantesController.editarParticipante); 
router.delete('/participantes/:id', participantesController.deletarParticipante);
router.get('/participantes/:id', participantesController.buscarParticipante);

module.exports = router;