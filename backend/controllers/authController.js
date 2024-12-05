const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const logGenerator = require('../utils/logGenerator');

function gerarToken(params = {}) {
    return jwt.sign(params, process.env.JWT_SECRET, {
        expiresIn: 86400
    });
}

exports.registrar = (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    Usuario.findByEmail(email, (err, usuario) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (usuario) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        Usuario.criar(nome, email, senha, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }

            const token = gerarToken({ id: result.insertId });
            res.status(201).json({ 
                id: result.insertId, 
                nome, 
                email, 
                token 
            });
        });
    });
};

exports.login = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const usuario = results[0];

        bcrypt.compare(senha, usuario.senha, (compareErr, senhaCorreta) => {
            if (compareErr) {
                return res.status(500).json({ error: 'Erro ao validar senha' });
            }

            if (!senhaCorreta) {
                return res.status(400).json({ error: 'Senha incorreta' });
            }

            try {
                const token = gerarToken({ 
                    id: usuario.id, 
                    email: usuario.email 
                });

                res.json({
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    token
                });
            } catch (tokenErr) {
                return res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
            }
        });
    });
};
