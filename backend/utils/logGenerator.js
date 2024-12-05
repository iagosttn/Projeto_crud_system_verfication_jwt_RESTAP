// utils/logGenerator.js
const fs = require('fs');
const path = require('path');

class LogGenerator {
    constructor() {
        
        this.logDir = path.join(process.cwd(), 'logs');
        
        
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    
    logCriacaoUsuario(usuario) {
        const logEntry = {
            tipo: 'USUARIO_CRIADO',
            timestamp: new Date().toISOString(),
            detalhes: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                metodoCriacao: 'registro_manual'
            }
        };
        
        this.salvarLog(logEntry);
    }

    logExclusaoUsuario(usuario, motivoExclusao = 'Exclusão padrão') {
        const logEntry = {
            tipo: 'USUARIO_EXCLUIDO',
            timestamp: new Date().toISOString(),
            detalhes: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                motivo: motivoExclusao
            }
        };
        
        this.salvarLog(logEntry);
    }

    logLogin(usuario, sucesso = true) {
        const logEntry = {
            tipo: 'LOGIN',
            timestamp: new Date().toISOString(),
            sucesso: sucesso,
            detalhes: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                ip: usuario.ip || 'N/A'
            }
        };
        
        this.salvarLog(logEntry);
    }

   
    logEventoCriado(evento) {
        const logEntry = {
            tipo: 'EVENTO_CRIADO',
            timestamp: new Date().toISOString(),
            detalhes: {
                id: evento.id,
                nome: evento.nome,
                data: evento.data,
                local: evento.local
            }
        };
        
        this.salvarLog(logEntry);
    }

 
    logEventoExcluido(evento) {
        const logEntry = {
            tipo: 'EVENTO_EXCLUIDO',
            timestamp: new Date().toISOString(),
            detalhes: {
                id: evento.id,
                nome: evento.nome,
                data: evento.data
            }
        };
        
        this.salvarLog(logEntry);
    }

    
    logParticipanteCriado(participante) {
        const logEntry = {
            tipo: 'PARTICIPANTE_CRIADO',
            timestamp: new Date().toISOString(),
            detalhes: {
                id: participante.id,
                nome: participante.nome,
                eventoId: participante.evento_id
            }
        };
        
        this.salvarLog(logEntry);
    }

   
    logParticipanteExcluido(participante) {
        const logEntry = {
            tipo: 'PARTICIPANTE_EXCLUIDO',
            timestamp: new Date().toISOString(),
            detalhes: {
                id: participante.id,
                nome: participante.nome,
                eventoId: participante.evento_id
            }
        };
        
        this.salvarLog(logEntry);
    }

  
    salvarLog(logEntry) {
        try {
       
            const dataHoje = new Date().toISOString().split('T')[0];
            const nomeArquivo = `${dataHoje}_log.json`;
            const caminhoArquivo = path.join(this.logDir, nomeArquivo);

          
            let logs = [];
            if (fs.existsSync(caminhoArquivo)) {
                logs = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
            }

            logs.push(logEntry);

           
            fs.writeFileSync(caminhoArquivo, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Erro ao salvar log:', error);
        }
    }

   
    obterTodosLogs(filtros = {}) {
        const logs = [];
        const logDir = path.join(process.cwd(), 'logs');
        
      
        const arquivosLog = fs.readdirSync(logDir)
            .filter(arquivo => arquivo.endsWith('_log.json'));

        arquivosLog.forEach(arquivo => {
            const caminhoArquivo = path.join(logDir, arquivo);
            const logsArquivo = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
            logs.push(...logsArquivo);
        });

       
        return logs.filter(log => {
            const logData = new Date(log.timestamp);
            
         
            const tipoValido = !filtros.tipo || log.tipo === filtros.tipo;
            
            
            const dataInicioValida = !filtros.dataInicio || 
                logData >= new Date(filtros.dataInicio);
            
            
            const dataFimValida = !filtros.dataFim || 
                logData <= new Date(filtros.dataFim + 'T23:59:59.999Z');

            return tipoValido && dataInicioValida && dataFimValida;
        });
    }
}

module.exports = new LogGenerator();
