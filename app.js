let tamanhoFonteAtual = 16; 
let devocionalAtivoAtual = null;
let telaOrigemLeitura = 'view-home'; 
let filtroAtivoAtual = 'todos'; 

let eventoInstalacaoPWA = null;

let favoritos = JSON.parse(localStorage.getItem('pd_favoritos')) || [];
let concluidos = JSON.parse(localStorage.getItem('pd_concluidos')) || [];
let temaEscuroAtivo = localStorage.getItem('pd_tema_escuro') === 'true';

function atualizarBarraProgresso() {
    const totalItens = listaDevocionais.length;
    const totalLidos = concluidos.length; 
    const porcentagem = totalItens > 0 ? Math.round((totalLidos / totalItens) * 100) : 0;
    const barra = document.getElementById('barra-progresso-dinamica');
    const texto = document.getElementById('txt-progresso-status');
    if (barra) barra.style.width = porcentagem + '%';
    if (texto) texto.innerText = porcentagem + '% CONCLUÍDO';
}

function gerarBackupProgresso() {
    const backup = localStorage.getItem('pd_concluidos');
    if (!backup) {
        exibirToast("Nada para exportar ainda.");
        return;
    }
    navigator.clipboard.writeText(backup);
    exibirToast("Código de backup copiado! Guarde em local seguro.");
}

function mudarTela(idTela) {
    if(idTela !== 'view-read') {
        const capa = document.getElementById('capa-leitura-dinamica');
        if(capa) capa.classList.remove('animar-capa');
    }
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none'; 
    });
    const telaAlvo = document.getElementById(idTela);
    if(telaAlvo) {
        telaAlvo.style.display = (idTela === 'view-read') ? 'block' : 'flex';
        setTimeout(() => { telaAlvo.classList.add('active'); }, 20);
    }
    atualizarAbasInferiores(idTela);
    fecharMenuLateral();
}

function atualizarAbasInferiores(idTela) {
    document.querySelectorAll('.tab-bar-fixa .tab-item').forEach(aba => {
        aba.classList.remove('active');
    });
    if (idTela === 'view-home') {
        const abaHome = document.querySelector('.tab-bar-fixa .tab-item:nth-child(1)');
        if(abaHome) abaHome.classList.add('active');
    } else if (idTela === 'view-list') {
        const abaList = document.querySelector('.tab-bar-fixa .tab-item:nth-child(2)');
        if(abaList) abaList.classList.add('active');
    }
}

function alternarTemaGlobal() {
    temaEscuroAtivo = !temaEscuroAtivo;
    localStorage.setItem('pd_tema_escuro', temaEscuroAtivo);
    aplicarTemaEstado();
}

function aplicarTemaEstado() {
    const btnHeader = document.querySelector('.btn-header-theme-toggle');
    const btnSidebar = document.querySelector('.btn-txt-theme-toggle');
    const btnLeitura = document.querySelector('.btn-theme-toggle');
    if (temaEscuroAtivo) {
        document.body.classList.add('tema-escuro');
        if(btnHeader) btnHeader.innerText = "☀️";
        if(btnSidebar) btnSidebar.innerText = "☀️ Modo Claro";
        if(btnLeitura) btnLeitura.innerText = "☀️ Claro";
    } else {
        document.body.classList.remove('tema-escuro');
        if(btnHeader) btnHeader.innerText = "🌙";
        if(btnSidebar) btnSidebar.innerText = "🌙 Modo Escuro";
        if(btnLeitura) btnLeitura.innerText = "🌙 Escuro";
    }
}

function carregarSaudacao() {
    const txt = document.getElementById('txt-saudacao-dinamica');
    if(!txt) return;
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) txt.innerText = "Bom dia";
    else if (hora >= 12 && hora < 18) txt.innerText = "Boa tarde";
    else txt.innerText = "Boa noite";
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalacaoPWA = e;
    const banner = document.getElementById('banner-instalar');
    if (banner) banner.style.display = 'flex';
});

function executarInstalacaoPWA() {
    if (eventoInstalacaoPWA) {
        eventoInstalacaoPWA.prompt();
        eventoInstalacaoPWA.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                exibirToast("Obrigado por instalar nosso App! 📖✨");
                const banner = document.getElementById('banner-instalar');
                if (banner) banner.style.display = 'none';
            }
            eventoInstalacaoPWA = null;
        });
    } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) alert("Para instalar no seu iPhone: toque no ícone de 'Compartilhar' e selecione 'Adicionar à Tela de Início'. 📲");
        else exibirToast("Use o menu de 3 pontinhos do navegador para instalar! ⚙️");
    }
}

function abrirMenuLateral() { const sidebar = document.getElementById('sidebar-menu'); if(sidebar) sidebar.classList.add('open'); }
function fecharMenuLateral() { const sidebar = document.getElementById('sidebar-menu'); if(sidebar) sidebar.classList.remove('open'); }

function exibirToast(mensagem) {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = mensagem;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }
}

function alternarFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index === -1) { favoritos.push(id); exibirToast("Mensagem guardada! ❤️"); } 
    else { favoritos.splice(index, 1); exibirToast("Removido dos favoritos."); }
    localStorage.setItem('pd_favoritos', JSON.stringify(favoritos));
    atualizarBotoesReacao(id);
    if(filtroAtivoAtual === 'favoritos') carregarListaFeed();
}

function alternarConcluido(id) {
    const index = concluidos.indexOf(id);
    if (index === -1) { 
        concluidos.push(id); 
        exibirToast("Leitura concluída! Glória a Deus. 📖"); 
        dispararCelebracaoBotao(); 
    } else { concluidos.splice(index, 1); }
    localStorage.setItem('pd_concluidos', JSON.stringify(concluidos));
    atualizarBotoesReacao(id);
    atualizarBarraProgresso();
    carregarListaFeed(); 
}

function dispararCelebracaoBotao() {
    const btn = document.getElementById('btn-check-dinamico');
    if(!btn) return;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = 'scale(1.03)'; setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150); }, 100);
}

function atualizarBotoesReacao(id) {
    const btnFav = document.getElementById('btn-fav-dinamico');
    const btnCheck = document.getElementById('btn-check-dinamico');
    if(btnFav) { btnFav.className = favoritos.includes(id) ? 'btn-interagir ativo-favorito' : 'btn-interagir'; btnFav.innerHTML = favoritos.includes(id) ? '❤️ Favoritado' : '🤍 Favoritar'; }
    if(btnCheck) { btnCheck.className = concluidos.includes(id) ? 'btn-interagir ativo-concluido' : 'btn-interagir'; btnCheck.innerHTML = concluidos.includes(id) ? '✅ Concluído' : '✓ Marcar como Lido'; }
}

function filtrarFeed(tipoFiltro) { filtroAtivoAtual = tipoFiltro; carregarListaFeed(); }

function ajustarFonte(direcao) {
    tamanhoFonteAtual += direcao * 2;
    if (tamanhoFonteAtual < 12) tamanhoFonteAtual = 12;
    if (tamanhoFonteAtual > 26) tamanhoFonteAtual = 26;
    const texto = document.getElementById('texto-dinamico-leitura');
    if(texto) texto.style.fontSize = tamanhoFonteAtual + "px";
}

function carregarCapaHome() {
    const container = document.getElementById('container-capa-hoje');
    if (!container) return;
    
    const hoje = new Date().toISOString().split('T')[0];
    const devocionalHoje = listaDevocionais.find(d => d.data === hoje);

    if(devocionalHoje) {
        container.innerHTML = `
            <div class="card-capa-dia">
                <img src="${devocionalHoje.capa}" alt="Capa Devocional" onerror="this.style.display='none'">
                <div class="capa-content">
                    <span class="tag-data">${devocionalHoje.data}</span>
                    <h2 class="card-titulo" style="font-size: 1.35rem; font-weight: 700; margin-bottom: 16px; line-height: 1.3; color: var(--texto-reverso); text-align: left;">${devocionalHoje.titulo}</h2>
                    <button class="btn-premium" onclick="abrirLeituraPorId(${devocionalHoje.id}, 'view-home')">Ler</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<p style="padding:20px;">Nenhum devocional programado para hoje.</p>`;
    }
}

function carregarListaFeed() {
    const container = document.getElementById('container-lista');
    if (!container) return;
    container.innerHTML = '';

    const hoje = new Date().toISOString().split('T')[0];

    const dadosFiltrados = listaDevocionais.filter(devocional => {
        const dataDevocional = devocional.data;
        const dataPassadaOuHoje = dataDevocional <= hoje;
        
        if (filtroAtivoAtual === 'favoritos') {
            return favoritos.includes(devocional.id) && dataPassadaOuHoje;
        }
        return dataPassadaOuHoje;
    });

    dadosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));

    if(dadosFiltrados.length === 0) {
        container.innerHTML = `<div class="aviso-vazio" style="padding: 20px; text-align: center; color: var(--texto-mutado); font-size: 0.9rem;">Nenhuma mensagem disponível ainda. ❤️</div>`;
        return;
    }

    dadosFiltrados.forEach(devocional => {
        const jaLido = concluidos.includes(devocional.id) ? '<span class="badge-lido">Lido</span>' : '';
        const item = document.createElement('div');
        item.className = 'item-feed';
        item.onclick = () => abrirLeitura(devocional, 'view-list');
        item.innerHTML = `
            <img src="${devocional.capa}" alt="Miniatura">
            <div class="item-feed-body">
                <span class="item-feed-data">${devocional.data} ${jaLido}</span>
                <span class="item-feed-titulo">${devocional.titulo}</span>
            </div>
            <button class="btn-ler-fino">Ler</button>
        `;
        container.appendChild(item);
    });
}

function abrirLeituraPorId(id, origem) {
    const devocional = listaDevocionais.find(item => item.id === id);
    if(devocional) abrirLeitura(devocional, origem);
}

function abrirLeitura(devocional, origem) {
    devocionalAtivoAtual = devocional.id;
    telaOrigemLeitura = origem || 'view-home'; 
    const capaContainer = document.getElementById('capa-leitura-dinamica');
    if(capaContainer) {
        capaContainer.innerHTML = `<img src="${devocional.capa}" alt="${devocional.titulo}">`;
        setTimeout(() => { capaContainer.classList.add('animar-capa'); }, 100);
    }
    const container = document.getElementById('container-leitura');
    if(container) {
        container.innerHTML = `
            <div class="card-leitura">
                <div class="meta-leitura">${devocional.data} — ${devocional.titulo}</div>
                <div class="versiculo-texto">${devocional.versiculo}</div>
                <div class="versiculo-ref">— ${devocional.referencia}</div>
                <div class="separador"></div>
                <div class="texto-principal" id="texto-dinamico-leitura" style="font-size: ${tamanhoFonteAtual}px;">${devocional.texto}</div>
                <div class="autor-texto">${devocional.autor}</div>
                <div class="box-interacoes">
                    <button class="btn-interagir" id="btn-fav-dinamico" onclick="alternarFavorito(${devocional.id})">🤍 Favoritar</button>
                    <button class="btn-interagir" id="btn-check-dinamico" onclick="alternarConcluido(${devocional.id})">✓ Marcar como Lido</button>
                </div>
            </div>
        `;
    }
    atualizarBotoesReacao(devocional.id);
    const btnVoltar = document.getElementById('btn-voltar-dinamico');
    if(btnVoltar) { btnVoltar.onclick = () => mudarTela(telaOrigemLeitura); }
    mudarTela('view-read');
}

document.addEventListener("DOMContentLoaded", () => {
    carregarSaudacao();
    atualizarBarraProgresso();
    carregarCapaHome();
    carregarListaFeed();
    aplicarTemaEstado();
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => { splash.style.display = 'none'; mudarTela('view-home'); }, 600);
        }
    }, 2800);
});