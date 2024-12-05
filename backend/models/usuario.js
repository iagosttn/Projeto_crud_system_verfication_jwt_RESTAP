const db = require('./db.js');
const bcrypt = require('bcryptjs');

class Usuario {
    static criar(nome, email, senha, callback) {
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) return callback(err);

            const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
            db.query(sql, [nome, email, hash], (err, result) => {
                if (err) return callback(err);
                callback(null, result);
            });
        });
    }

    static findByEmail(email, callback) {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(sql, [email], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    }

    static verificarSenha(senhaPlana, senhaHash, callback) {
        bcrypt.compare(senhaPlana, senhaHash, callback);
    }
}

module.exports = Usuario;
