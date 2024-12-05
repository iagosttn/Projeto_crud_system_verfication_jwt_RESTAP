const db = require('../models/db.js');
const fs = require('fs');
const path = require('path');


function logAction(action, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        details,
        user: global.currentUser || 'anonymous'
    };

    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}_participantes_log.json`);
    
    let logs = [];
    try {
        if (fs.existsSync(logFile)) {
            logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        }
    } catch (error) {
        console.error('Erro ao ler arquivo de log:', error);
    }

    logs.push(logEntry);

    try {
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Erro ao gravar log:', error);
    }

    return logEntry;
}

exports.cadastrarParticipante = (req, res) => {
    const { nome, evento_id } = req.body;

   
    logAction('cadastrar_participante_inicio', { 
        nome, 
        evento_id,
        user: req.user ? req.user.email : 'anonymous'
    });

    const checkEventSql = 'SELECT * FROM eventos WHERE id = ?';
    db.query(checkEventSql, [evento_id], (checkErr, checkResults) => {
        if (checkErr) {
           
            logAction('cadastrar_participante_erro', { 
                erro: 'Erro no banco de dados', 
                details: checkErr 
            });
            return res.status(500).json({ error: 'Erro no banco de dados', details: checkErr });
        }
        
        if (checkResults.length === 0) {
        
            logAction('cadastrar_participante_erro', { 
                erro: 'Evento não encontrado', 
                evento_id 
            });
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const sql = 'INSERT INTO participantes (nome, evento_id) VALUES (?, ?)';
        db.query(sql, [nome, evento_id], (err, result) => {
            if (err) {
                
                logAction('cadastrar_participante_erro', { 
                    erro: 'Erro interno do servidor', 
                    details: err 
                });
                return res.status(500).json({ error: 'Erro interno do servidor', details: err });
            }
            
           
            logAction('cadastrar_participante_sucesso', { 
                id: result.insertId, 
                nome, 
                evento_id 
            });
            
            res.status(201).json({ id: result.insertId, nome, evento_id });
        });
    });
};

exports.listarParticipantes = (req, res) => {
    const { evento_id } = req.query;

    
    logAction('listar_participantes_inicio', { 
        evento_id,
        user: req.user ? req.user.email : 'anonymous'
    });

    const sql = `
        SELECT p.id, p.nome, p.evento_id, e.nome as evento_nome 
        FROM participantes p
        LEFT JOIN eventos e ON p.evento_id = e.id
        ${evento_id ? 'WHERE p.evento_id = ?' : ''}
    `;
    
    const params = evento_id ? [evento_id] : [];
    
    db.query(sql, params, (err, results) => {
        if (err) {
           
            logAction('listar_participantes_erro', { 
                erro: 'Erro ao listar participantes', 
                details: err 
            });
            return res.status(500).send(err);
        }

        
        logAction('listar_participantes_sucesso', { 
            total_participantes: results.length 
        });
        
        res.json(results);
    });
};

exports.editarParticipante = (req, res) => {
    const { id } = req.params;
    const { nome, evento_id } = req.body;

   
    logAction('editar_participante_inicio', { 
        id, 
        nome, 
        evento_id,
        user: req.user ? req.user.email : 'anonymous'
    });

    if (!nome || !evento_id) {
      
        logAction('editar_participante_erro', { 
            erro: 'Dados incompletos', 
            details: { nome, evento_id } 
        });
        return res.status(400).json({ 
            error: 'Dados incompletos', 
            details: { nome, evento_id } 
        });
    }

    const sql = 'UPDATE participantes SET nome = ?, evento_id = ? WHERE id = ?';
    db.query(sql, [nome, evento_id, id], (err, result) => {
        if (err) {
          
            logAction('editar_participante_erro', { 
                erro: 'Erro interno do servidor', 
                details: err 
            });
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        if (result.affectedRows === 0) {
         
            logAction('editar_participante_erro', { 
                erro: 'Participante não encontrado', 
                id 
            });
            return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
        
        logAction('editar_participante_sucesso', { 
            id, 
            nome, 
            evento_id 
        });
        
        res.status(200).json({ id, nome, evento_id });
    });
};

exports.deletarParticipante = (req, res) => {
    const { id } = req.params;

    
    logAction('deletar_participante_inicio', { 
        id,
        user: req.user ? req.user.email : 'anonymous'
    });

    const sql = 'DELETE FROM participantes WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
           
            logAction('deletar_participante_erro', { 
                erro: 'Erro ao deletar participante', 
                details: err 
            });
            return res.status(500).send(err);
        }

        if (result.affectedRows === 0) {
          
            logAction('deletar_participante_erro', { 
                erro: 'Participante não encontrado', 
                id 
            });
            return res.status(404).send('Participante não encontrado.');
        }

        
        logAction('deletar_participante_sucesso', { 
            id 
        });
        
        res.status(204).send();
    });
};

exports.buscarParticipante = (req, res) => {
    const { id } = req.params;

    
    logAction('buscar_participante_inicio', { 
        id,
        user: req.user ? req.user.email : 'anonymous'
    });

    const sql = 'SELECT * FROM participantes WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            
            logAction('buscar_participante_erro', { 
                erro: 'Erro no banco de dados', 
                details: err 
            });
            return res.status(500).json({ error: 'Erro no banco de dados', details: err });
        }
        
        if (results.length === 0) {
          
            logAction('buscar_participante_erro', { 
                erro: 'Participante não encontrado', 
                id 
            });
            return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
       
        logAction('buscar_participante_sucesso', { 
            id, 
            participante: results[0] 
        });
        
        res.json(results[0]);
    });
};

function loadEventOptions() {
    $.get('/api/eventos', function(events) {
        const eventSelect = $('#eventoId');
        eventSelect.empty();
        events.forEach(event => {
            eventSelect.append(`<option value="${event.id}">${event.nome}</option>`);
        });
    });
}