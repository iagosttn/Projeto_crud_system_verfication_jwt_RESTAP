// utils/logReporter.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); 
class LogReporter {
    constructor(logDir = path.join(__dirname, '../logs')) {
        this.logDir = logDir;
        this.pdfDir = path.join(this.logDir, 'pdfs');

        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }

        if (!fs.existsSync(this.pdfDir)) {
            fs.mkdirSync(this.pdfDir);
        }
    }

   
    gerarRelatorioPDF() {
        return new Promise((resolve, reject) => {
            try {
                const logs = this.getAllLogs();
                const relatorio = this.gerarRelatorioResumo(logs);
                const nomeArquivo = `relatorio_logs_${new Date().toISOString().replace(/:/g, '-')}.pdf`;
                const caminhoCompleto = path.join(this.pdfDir, nomeArquivo);
                const doc = new PDFDocument();
                const stream = fs.createWriteStream(caminhoCompleto);

                doc.pipe(stream);
                doc.fontSize(20).text('Relatório de Logs', { align: 'center' }).moveDown();
                doc.fontSize(12).text(`Data do Relatório: ${new Date().toLocaleString()}`);
                doc.text(`Total de Logs: ${relatorio.totalLogs}`).moveDown();

              
                doc.fontSize(14).text('Ações por Tipo:', { underline: true });
                Object.entries(relatorio.acoesPorTipo).forEach(([acao, count]) => {
                    doc.fontSize(10).text(`${acao}: ${count}`);
                });
                doc.moveDown();

               
                doc.fontSize(14).text('Usuários Mais Ativos:', { underline: true });
                Object.entries(relatorio.usuariosMaisAtivos)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .forEach(([usuario, count]) => {
                        doc.fontSize(10).text(`${usuario}: ${count}`);
                    });
                doc.moveDown();

               
                doc.fontSize(14).text('Distribuição Temporal:', { underline: true });
                Object.entries(relatorio.distribuicaoTemportal)
                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    .forEach(([dia, count]) => {
                        doc.fontSize(10).text(`${dia}: ${count}`);
                    });

                doc.end();
                stream.on('finish', () => {
                    resolve(nomeArquivo);
                });

            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                reject(error);
            }
        });
    }

    
    getAllLogs() {
        const logs = [];
        const logFiles = fs.readdirSync(this.logDir).filter(file => file.endsWith('_log.json'));

        logFiles.forEach(file => {
            const filePath = path.join(this.logDir, file);
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            logs.push(...fileContent);
        });

        return logs;
    }

   
    gerarRelatorioResumo(logs) {
        const relatorio = {
            totalLogs: logs.length,
            acoesPorTipo: {},
            usuariosMaisAtivos: {},
            distribuicaoTemportal: {}
        };

        logs.forEach(log => {
            relatorio.acoesPorTipo[log.tipo] = (relatorio.acoesPorTipo[log.tipo] || 0) + 1;
            const usuario = log.detalhes?.nome || 'anônimo';
            relatorio.usuariosMaisAtivos[usuario] = (relatorio.usuariosMaisAtivos[usuario] || 0) + 1;
            const dia = new Date(log.timestamp).toISOString().split('T')[0];
            relatorio.distribuicaoTemportal[dia] = (relatorio.distribuicaoTemportal[dia] || 0) + 1;
        });

        return relatorio;
    }
}

module.exports = new LogReporter();