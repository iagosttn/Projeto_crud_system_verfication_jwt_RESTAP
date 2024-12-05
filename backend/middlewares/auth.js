const jwt = require('jsonwebtoken');
const { invalidTokens } = require('../routes/auth');
const tokenManager = require('../tokenManager');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no token' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado' });
    }

   
    if (invalidTokens.has(token)) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });

        req.userId = decoded.id;
        return next();
    });
};

module.exports = (req, res, next) => {
    console.log('Verificando autenticação');
    console.log('Headers:', req.headers);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token recebido:', token);

    if (!token) {
        console.log('Token não fornecido');
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Erro na verificação do token:', err);
        return res.status(403).json({ error: 'Token inválido' });
    }
};