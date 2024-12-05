$(document).ready(function() {

    function carregarParticipantes() {
        $.get('/api/participantes', function(data) {
            $('#tabelaParticipantes').empty();
            data.forEach(participante => {
                $('#tabelaParticipantes').append(`
                    <tr>
                        <td>${participante.id}</td>
                        <td>${participante.nome}</td>
                        <td>${participante.evento_id}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editarParticipante(${participante.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deletarParticipante(${participante.id})">Deletar</button>
                        </td>
                    </tr>
                `);
            });
        });
    }

   
    $('#formCadastrarParticipante').on('submit', function(e) {
        e.preventDefault();
        const nome = $('#nomeParticipante').val();
        const eventoId = $('#eventoId').val();

        $.post('/api/participantes', { nome, evento_id: eventoId }, function() {
            $('#modalCadastrarParticipante').modal('hide');
            carregarParticipantes();
        });
    });

   
    carregarParticipantes();
});