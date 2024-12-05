// Exemplo de código de login
$.ajax({
    type: "POST",
    url: "http://localhost:3000/api/auth/login",
    data: { username: "seu_usuario", password: "sua_senha" },
    success: function(response) {
        
        localStorage.setItem("token", response.token);
       
        window.location.href = "/escolhas";
    },
    error: function(xhr) {
        console.error("Erro ao fazer login:", xhr.responseText);
    }
});