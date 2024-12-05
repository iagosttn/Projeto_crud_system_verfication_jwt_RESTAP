// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');


function obterTodosLogs(filtros = {}) {
    const logs = [];
    const logDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        return logs;
    }
    
   
    const arquivosLog = fs.readdirSync(logDir)
        .filter(arquivo => arquivo.endsWith('_log.json'));

    arquivosLog.forEach(arquivo => {
        const caminhoArquivo = path.join(logDir, arquivo);
        try {
            const logsArquivo = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
            logs.push(...logsArquivo);
        } catch (error) {
            console.error(`Erro ao ler arquivo de log ${arquivo}:`, error);
        }
    });

   
    return logs.filter(log => {
        const logData = new Date(log.timestamp);
        
       
        const tipoValido = !filtros.tipo || log.action === filtros.tipo;
        
       
        const dataInicioValida = !filtros.dataInicio || 
            logData >= new Date(filtros.dataInicio);
        
       
        const dataFimValida = !filtros.dataFim || 
            logData <= new Date(filtros.dataFim + 'T23:59:59.999Z');

        return tipoValido && dataInicioValida && dataFimValida;
    });
}


router.get('/api/logs', (req, res) => {
    try {
        const { tipo, dataInicio, dataFim } = req.query;
        
       
        const filtros = {
            tipo: tipo || null,
            dataInicio: dataInicio || null,
            dataFim: dataFim || null
        };

       
        Object.keys(filtros).forEach(key => 
            filtros[key] === null && delete filtros[key]
        );

        
        const logsFiltrados = obterTodosLogs(filtros);

       
        logsFiltrados.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        
        res.json(logsFiltrados);
    } catch (error) {
        console.error('Erro ao obter logs:', error);
        res.status(500).json({ 
            error: 'Erro ao processar logs', 
            detalhes: error.message 
        });
    }
});


router.get('/api/logs/gerar-pdf', (req, res) => {
    try {
       
        const logs = obterTodosLogs();

        
        const pdfDir = path.join(process.cwd(), 'logs', 'pdfs');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

       
        const nomeArquivo = `relatorio_logs_${new Date().toISOString().replace(/:/g, '-')}.pdf`;
        const caminhoCompleto = path.join(pdfDir, nomeArquivo);

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(caminhoCompleto);

        doc.pipe(stream);

     
        doc.fontSize(20).text('Relatório de Logs', { align: 'center' });
        doc.moveDown();

       
        logs.forEach((log, index) => {
            doc.fontSize(10)
               .text(`Log ${index + 1}:`, { underline: true })
               .text(`Timestamp: ${new Date(log.timestamp).toLocaleString()}`)
               .text(`Ação: ${log.action}`)
               .text(`Detalhes: ${JSON.stringify(log.details)}`)
               .moveDown();
        });

        doc.end();

       
        stream.on('finish', () => {
            res.json({ 
                mensagem: 'PDF gerado com sucesso', 
                arquivo: nomeArquivo 
            });
        });

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ 
            error: 'Erro ao gerar PDF', 
            detalhes: error.message 
        });
    }
});


router.get('/api/logs/listar-pdfs', (req, res) => {
    try {
        const pdfDir = path.join(process.cwd(), 'logs', 'pdfs');
        
        
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const pdfs = fs.readdirSync(pdfDir)
            .filter(arquivo => arquivo.endsWith('.pdf'));

        res.json(pdfs);
    } catch (error) {
        console.error('Erro ao listar PDFs:', error);
        res.status(500).json({ 
            error: 'Erro ao listar PDFs', 
            detalhes: error.message 
        });
    }
});
router.get('/logs/pdfs/:filename', (req, res) => {
    const filename = req.params.filename;
    const pdfDir = path.join(process.cwd(), 'logs', 'pdfs');
    const filePath = path.join(pdfDir, filename);

   
    if (fs.existsSync(filePath)) {
       
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
       
        const fileStream = fs.createReadStream(filePath);
        
        
        fileStream.pipe(res);
    } else {
      
        res.status(404).send('PDF não encontrado');
    }
});


module.exports = router;