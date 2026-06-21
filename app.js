let tamanhoFonteAtual = 16; 
let devocionalAtivoAtual = null;
let telaOrigemLeitura = 'view-home'; 
let filtroAtivoAtual = 'todos'; 

// BANCO DE DADOS LOCAL (LocalStorage) PARA REAÇÕES
let favoritos = JSON.parse(localStorage.getItem('pd_favoritos')) || [];
let concluidos = JSON.parse(localStorage.getItem('pd_concluidos')) || [];

// GERENCIADOR DE TELAS
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
}

// ALERTA DE TOAST
function exibirToast(mensagem) {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = mensagem;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }
}

// SAUDAÇÃO INTELIGENTE
function carregarSaudacao() {
    const txt = document.getElementById('txt-saudacao-dinamica');
    if(!txt) return;
    
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
        txt.innerText = "Bom dia, Natanael";
    } else if (hora >= 12 && hora < 18) {
        txt.innerText = "Boa tarde, Natanael";
    } else {
        txt.innerText = "Boa noite, Natanael";
    }
}

// BARRA DE PROGRESSO SEMANAL
function atualizarBarraProgresso() {
    const barra = document.getElementById('barra-progresso-dinamica');
    const txtStatus = document.getElementById('txt-progresso-status');
    if(!barra || !txtStatus) return;

    const totalItens = listaDevocionais.length;
    if(totalItens === 0) return;

    const concluidosNaLista = listaDevocionais.filter(d => concluidos.includes(d.id)).length;
    const porcentagem = Math.round((concluidosNaLista / totalItens) * 100);

    barra.style.width = porcentagem + "%";
    txtStatus.innerText = `${porcentagem}% CONCLUÍDO`;
}

// MODO MEDITAÇÃO
function alternarModoMeditacao() {
    document.body.classList.toggle('modo-meditacao');
    const btn = document.querySelector('.btn-meditar');
    if(btn) {
        btn.innerText = document.body.classList.contains('modo-meditacao') ? "☀️ Modo Padrão" : "🌙 Modo Meditação";
    }
}

// FAVORITOS E CONCLUÍDOS
function alternarFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index === -1) {
        favoritos.push(id);
        exibirToast("Mensagem guardada nos favoritos! ❤️");
    } else {
        favoritos.splice(index, 1);
        exibirToast("Removido dos favoritos.");
    }
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
    } else {
        concluidos.splice(index, 1);
    }
    localStorage.setItem('pd_concluidos', JSON.stringify(concluidos));
    atualizarBotoesReacao(id);
    atualizarBarraProgresso();
    carregarListaFeed(); 
}

function dispararCelebracaoBotao() {
    const btn = document.getElementById('btn-check-dinamico');
    if(!btn) return;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1.03)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
    }, 100);
}

function atualizarBotoesReacao(id) {
    const btnFav = document.getElementById('btn-fav-dinamico');
    const btnCheck = document.getElementById('btn-check-dinamico');
    
    if(btnFav) {
        btnFav.className = favoritos.includes(id) ? 'btn-interagir ativo-favorito' : 'btn-interagir';
        btnFav.innerHTML = favoritos.includes(id) ? '❤️ Favoritado' : '🤍 Favoritar';
    }
    
    if(btnCheck) {
        btnCheck.className = concluidos.includes(id) ? 'btn-interagir ativo-concluido' : 'btn-interagir';
        btnCheck.innerHTML = concluidos.includes(id) ? '✅ Concluído' : '✓ Marcar como Lido';
    }
}

// FILTROS
function filtrarFeed(tipoFiltro) {
    filtroAtivoAtual = tipoFiltro;
    
    document.getElementById('filtro-todos').classList.remove('active');
    document.getElementById('filtro-favoritos').classList.remove('active');
    
    if(tipoFiltro === 'todos') {
        document.getElementById('filtro-todos').classList.add('active');
    } else {
        document.getElementById('filtro-favoritos').classList.add('active');
    }
    
    carregarListaFeed();
}

// AUXILIARES
function abrirModalApoio() { document.getElementById('modal-apoio').classList.add('show'); }
function fecharModalApoio() { document.getElementById('modal-apoio').classList.remove('show'); }
function copiarChavePix() {
    const textoPix = document.getElementById('pix-key-text').innerText;
    navigator.clipboard.writeText(textoPix).then(() => {
        exibirToast("Código Copia e Cola copiado! ☕");
        fecharModalApoio();
    });
}

function ajustarFonte(direcao) {
    tamanhoFonteAtual += direcao * 2;
    if (tamanhoFonteAtual < 12) tamanhoFonteAtual = 12;
    if (tamanhoFonteAtual > 26) tamanhoFonteAtual = 26;
    const texto = document.getElementById('texto-dinamico-leitura');
    if(texto) { texto.style.fontSize = tamanhoFonteAtual + "px"; }
}

// RENDERS
function carregarCapaHome() {
    const container = document.getElementById('container-capa-hoje');
    const hoje = listaDevocionais[0]; 
    
    if(hoje) {
        container.innerHTML = `
            <div class="card-capa-dia">
                <img src="${hoje.capa}" alt="Capa Devocional">
                <div class="capa-content">
                    <span class="tag-data">${hoje.data.substring(0,5)}</span>
                    <h2 class="capa-titulo">${hoje.titulo}</h2>
                    <button class="btn-premium" onclick="abrirLeituraPorId(${hoje.id}, 'view-home')">Ler</button>
                </div>
            </div>
        `;
    }
}

function carregarListaFeed() {
    const container = document.getElementById('container-lista');
    if (!container) return;
    container.innerHTML = '';
    
    const dadosFiltrados = listaDevocionais.filter(devocional => {
        if (filtroAtivoAtual === 'favoritos') return favoritos.includes(devocional.id);
        return true; 
    });

    if(dadosFiltrados.length === 0) {
        container.innerHTML = `<div class="aviso-vazio">Nenhuma mensagem salva nos favoritos. ❤️</div>`;
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

    const btnShare = document.getElementById('btn-share-devocional');
    if(btnShare) {
        btnShare.onclick = () => {
            const msg = `*Presença Diária - ${devocional.titulo}* (${devocional.data})\n\n${devocional.versiculo} (${devocional.referencia})`;
            navigator.clipboard.writeText(msg).then(() => { exibirToast("Copiado para compartilhar! ✨"); });
        };
    }
    
    mudarTela('view-read');
}

function configurarMenusExtras() {
    const menus = document.querySelectorAll('.btn-menu-extra');
    if(menus.length >= 1) {
        menus[0].onclick = () => {
            filtrarFeed('todos'); 
            mudarTela('view-list');
        };
    }
}

// INITIALIZER
document.addEventListener("DOMContentLoaded", () => {
    carregarSaudacao();
    atualizarBarraProgresso();
    carregarCapaHome();
    carregarListaFeed();
    configurarMenusExtras();
    
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => { 
                splash.style.display = 'none'; 
                mudarTela('view-home'); 
            }, 500);
        }
    }, 2000);
});