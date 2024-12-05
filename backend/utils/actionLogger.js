// utils/actionLogger.js
function logAction(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
        const req = args[0];
        const res = args[1];

        try {
            // Log antes da ação
            console.log(`Iniciando ação: ${key}`, {
                timestamp: new Date().toISOString(),
                user: req.user ? req.user.email : 'anonymous',
                body: req.body,
                params: req.params
            });

            // Executar método original
            const result = await originalMethod.apply(this, args);

            // Log após ação bem-sucedida
            console.log(`Ação concluída: ${key}`, {
                timestamp: new Date().toISOString(),
                status: 'success'
            });

            return result;
        } catch (error) {
            // Log de erro
            console.error(`Erro na ação: ${key}`, {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    };

    return descriptor;
}

module.exports = logAction;