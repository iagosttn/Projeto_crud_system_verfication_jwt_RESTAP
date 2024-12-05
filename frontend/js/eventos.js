$(document).ready(function() {
  
    function carregarEventos() {
        $.get('/api/eventos', function(data) {
            $('#tabelaEventos').empty();
            data.forEach(evento => {
                $('#tabelaEventos').append(`
                    <tr>
                        <td>${evento.id}</td>
                        <td>${evento.nome}</td>
                        <td>${new Date(evento.data).toLocaleString()}</td>
                        <td>${evento.local}</td>
                        <td class="table-actions">
                            <button class="btn btn-warning btn-sm" onclick="abrirModalEditar(${evento.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deletarEvento(${evento.id})">Deletar</button>
                        </td>
                    </tr>
                `);
            });
        });
    }


    $('#formCadastrarEvento').on('submit', function(e) {
        e.preventDefault();
        const nome = $('#nome').val();
        const data = $('#data').val();
        const local = $('#local').val();

        $.post('/api/eventos', { nome, data, local }, function() {
            $('#modalCadastrarEvento').modal('hide');
            carregarEventos();
        });
    });


    window.abrirModalEditar = function(id) {
        $.get(`/api/eventos/${id}`, function(evento) {
            $('#nomeEdit').val(evento.nome);
            $('#dataEdit').val(evento.data);
            $('#localEdit').val(evento.local);
            $('#editEventoId').val(evento.id);
            $('#modalEditarEvento').modal('show');
        });
    };

   
    $('#formEditarEvento').on('submit', function(e) {
        e.preventDefault();
        const id = $('#editEventoId').val();
        const nome = $('#nomeEdit').val();
        const data = $('#dataEdit').val();
        const local = $('#localEdit').val();

        $.ajax({
            url: `/api/eventos/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ nome, data, local }),
            success: function() {
                $('#modalEditarEvento').modal('hide');
                carregarEventos();
            },
            error: function(xhr, status, error) {
                console.error('Erro ao editar evento:', error);
            }
        });
    });


    window.deletarEvento = function(id) {
        if (confirm('Tem certeza que deseja deletar este evento?')) {
            $.ajax({
                url: `/api/eventos/${id}`,
                method: 'DELETE',
                success: function() {
                    carregarEventos();
                },
                error: function(xhr, status, error) {
                    console.error('Erro ao deletar evento:', error);
                }
            });
        }
    };


    carregarEventos();
});