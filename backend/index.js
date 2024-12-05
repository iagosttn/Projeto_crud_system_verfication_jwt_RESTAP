const express = require('express');
const bodyParser = require('body-parser');
const eventosRoutes = require('./routes/eventos');
const participantesRoutes = require('./routes/participantes');
const path = require('path');
const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/logRoutes');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(logRoutes);

app.use('/api', eventosRoutes);
app.use('/api', participantesRoutes);
app.use('/api/auth', authRoutes);
app.use('/logs', logRoutes);
app.use('/api/logs', logRoutes)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/eventos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/eventos.html'));
});

app.get('/participantes', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/participantes.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registro.html'));
});

app.get('/escolhas', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/escolhas.html'));
});

app.get('/logs', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/logs.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
