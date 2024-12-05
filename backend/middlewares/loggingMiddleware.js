// middlewares/loggingMiddleware.js
const fs = require('fs');
const path = require('path');

function log(action, details) {
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

    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}_log.json`);
    
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

module.exports = (req, res, next) => {
   
    const logDetails = {
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip
    };

 
    if (req.user) {
        global.currentUser = {
            id: req.user.id,
            email: req.user.email
        };
    }

   
    log('request_received', logDetails);

  
    const originalJson = res.json;
    res.json = function(body) {
        log('response_sent', {
            statusCode: res.statusCode,
            body: body
        });
        return originalJson.call(this, body);
    };

    next();
};