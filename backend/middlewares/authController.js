require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

function gerarToken(params = {}) {
    return jwt.sign(
        params, 
        process.env.JWT_SECRET, 
        { expiresIn: 86400 } // 24 horas
    );
}

exports.registrar = (req, res) => {
    console.log('Recebendo solicitação de registro');
    console.log('Corpo da requisição:', req.body);

    const { nome, email, senha } = req.body;

    // Validações
    if (!nome || !email || !senha) {
        console.log('Dados incompletos');
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Verificar se usuário já existe
    const checkUserSql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkUserSql, [email], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Erro ao verificar usuário:', checkErr);
            return res.status(500).json({ error: 'Erro no banco de dados' });
        }

        if (checkResults.length > 0) {
            console.log('Usuário já existe');
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        // Hash da senha
        bcrypt.hash(senha, 10, (hashErr, hashedSenha) => {
            if (hashErr) {
                console.error('Erro ao gerar hash da senha:', hashErr);
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }

            // Inserir usuário
            const insertSql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
            db.query(insertSql, [nome, email, hashedSenha], (insertErr, result) => {
                if (insertErr) {
                    console.error('Erro ao inserir usuário:', insertErr);
                    return res.status(500).json({ error: 'Erro ao criar usuário' });
                }

                try {
                    const token = gerarToken({ 
                        id: result.insertId, 
                        email: email 
                    });

                    console.log('Usuário registrado com sucesso');
                    res.status(201).json({ 
                        id: result.insertId, 
                        nome, 
                        email,
                        token 
                    });
                } catch (tokenErr) {
                    console.error('Erro ao gerar token:', tokenErr);
                    return res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
                }
            });
        });
    });
};

exports.login = (req, res) => {
    console.log('Recebendo solicitação de login');
    console.log('Corpo da requisição:', req.body);

    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
        console.log('Dados de login incompletos');
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Erro no banco de dados:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            console.log('Usuário não encontrado');
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const usuario = results[0];

        // Comparar senhas
        bcrypt.compare(senha, usuario.senha, (compareErr, senhaCorreta) => {
            if (compareErr) {
                console.error('Erro ao comparar senhas:', compareErr);
                return res.status(500).json({ error: 'Erro ao validar senha' });
            }

            if (!senhaCorreta) {
                console.log('Senha incorreta');
                return res.status(400).json({ error: 'Senha incorreta' });
            }

            try {
                const token = gerarToken({ 
                    id: usuario.id, 
                    email: usuario.email 
                });

                console.log('Login bem-sucedido');
                res.json({
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    token
                });
            } catch (tokenErr) {
                console.error('Erro ao gerar token:', tokenErr);
                return res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
            }
        });
    });
};
