// Variável global para armazenar as habilidades
let habilidades = [];
let personagensDisponiveis = [];

// Carregar a lista de personagens disponíveis
async function carregarListaPersonagens() {
    try {
        const response = await fetch('personagens/personagens.json');
        const data = await response.json();
        personagensDisponiveis = data.personagens;
        
        const select = document.getElementById('personagem-select');
        select.innerHTML = '<option value="">Selecione um personagem</option>';
        
        personagensDisponiveis.forEach(personagem => {
            const option = document.createElement('option');
            option.value = personagem.arquivo;
            option.textContent = personagem.nome;
            select.appendChild(option);
        });
        
        // Adicionar event listener para quando selecionar um personagem
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                carregarHabilidades(e.target.value);
            } else {
                const container = document.getElementById('cards-container');
                container.innerHTML = '<div class="no-results">Selecione um personagem para ver suas habilidades</div>';
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar a lista de personagens:', error);
        const select = document.getElementById('personagem-select');
        select.innerHTML = '<option value="">Erro ao carregar personagens</option>';
    }
}

// Função para carregar as habilidades de um arquivo JSON
async function carregarHabilidades(arquivo) {
    try {
        const container = document.getElementById('cards-container');
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando habilidades...</p></div>';
        
        const response = await fetch(`personagens/${arquivo}`);
        habilidades = await response.json();
        
        aplicarFiltros();
        
    } catch (error) {
        console.error('Erro ao carregar o arquivo JSON:', error);
        const container = document.getElementById('cards-container');
        container.innerHTML = '<div class="no-results">Erro ao carregar as habilidades.</div>';
    }
}

// Função para aplicar os filtros e renderizar os cards
function aplicarFiltros() {
    const container = document.getElementById('cards-container');
    
    const tipoFiltro = document.getElementById('filter-type').value;
    const grauFiltro = document.getElementById('filter-grau').value;
    const busca = document.getElementById('search').value.toLowerCase();

    const habilidadesFiltradas = habilidades.filter(hab => {
        const tipoMatch = tipoFiltro === 'all' || hab.tipo === tipoFiltro;
        const grauMatch = grauFiltro === 'all' || hab.grau.toString() === grauFiltro;
        const buscaMatch = hab.nome.toLowerCase().includes(busca) || 
                          hab.descricao.toLowerCase().includes(busca) ||
                          hab.tags.some(tag => tag.toLowerCase().includes(busca));
        
        return tipoMatch && grauMatch && buscaMatch;
    });

    if (habilidadesFiltradas.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhuma habilidade encontrada com os filtros selecionados.</p>';
        return;
    }

    container.innerHTML = '';
    
    habilidadesFiltradas.forEach((hab, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${hab.imagem}" alt="${hab.nome}" class="card-img" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_17b8a1a4a2d%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A17pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_17b8a1a4a2d%22%3E%3Crect%20width%3D%22300%22%20height%3D%22180%22%20fill%3D%22%23F5F5DC%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22112%22%20y%3D%2296.6%22%3EImagem%20não%20encontrada%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'">
            <div class="card-content">
                <div class="card-title">
                    <span>${hab.nome}</span>
                    <span class="card-grau">${hab.grau}</span>
                </div>
                <p class="card-type">${hab.tipo}</p>
                <p class="card-desc">${hab.descricao}</p>
                <div class="tags">
                    ${hab.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        card.addEventListener('click', () => abrirModal(hab));
        container.appendChild(card);
    });
}

// Função para abrir o modal
function abrirModal(habilidade) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modal-img').src = habilidade.imagem;
    document.getElementById('modal-name').innerText = habilidade.nome;
    document.getElementById('modal-grau').innerText = habilidade.grau;
    document.getElementById('modal-type').innerText = habilidade.tipo;
    document.getElementById('modal-description').innerText = habilidade.descricao;
    
    const efeitosList = document.getElementById('modal-effects');
    efeitosList.innerHTML = '';
    if (habilidade.efeitos && Array.isArray(habilidade.efeitos)) {
        habilidade.efeitos.forEach(efeito => {
            const li = document.createElement('li');
            li.textContent = efeito;
            efeitosList.appendChild(li);
        });
    }
    
    document.getElementById('modal-tags').innerHTML = '';
    if (habilidade.tags && Array.isArray(habilidade.tags)) {
        document.getElementById('modal-tags').innerHTML = habilidade.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
}

// Fechar o modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        document.getElementById('modal').style.display = 'none';
    }
});

// Adicionar event listeners para os filtros
document.getElementById('filter-type').addEventListener('change', aplicarFiltros);
document.getElementById('filter-grau').addEventListener('change', aplicarFiltros);
document.getElementById('search').addEventListener('input', aplicarFiltros);

// Carregar a lista de personagens quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarListaPersonagens);