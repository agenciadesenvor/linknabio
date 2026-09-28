// Desenvor Digital — interações da página

(function () {
  var semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palavra rotativa da headline: troca a cada 2,5s, entrando de baixo para cima
  var palavras = document.querySelectorAll('.rotativo .palavra');
  if (palavras.length > 1) {
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      var atual = palavras[i];
      i = (i + 1) % palavras.length;
      var proxima = palavras[i];
      atual.classList.remove('ativa');
      atual.classList.add('saindo');
      // volta para baixo sem animar, pronta para a próxima rodada
      setTimeout(function () {
        atual.style.transition = 'none';
        atual.classList.remove('saindo');
        void atual.offsetWidth;
        atual.style.transition = '';
      }, 600);
      proxima.classList.add('ativa');
    }, 2500);
  }

  // Luz que segue o cursor nos botões (só em telas com mouse)
  if (!semMovimento && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--x', (e.clientX - r.left) + 'px');
        btn.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });
  }

  // Faixa da logo (LogoLoop do React Bits, versão sem React):
  // move sem parar, desacelera suave no hover e só anima quando está visível
  var loop = document.querySelector('.logoloop');
  if (loop) {
    var trilho = loop.querySelector('.logoloop__track');
    var lista = trilho.querySelector('.logoloop__list');
    var VELOCIDADE = 45, VELOCIDADE_HOVER = 12, SUAVIZACAO = 0.25;
    var larguraSeq = 0, deslocamento = 0, velocidade = VELOCIDADE;
    var emHover = false, visivel = true, ultimo = null, quadro = null;

    // Repete o item e as cópias até cobrir a tela com folga
    function montarLoop() {
      var item = lista.querySelector('.logoloop__item');
      while (lista.children.length > 1) lista.removeChild(lista.lastChild);
      var larguraItem = item.getBoundingClientRect().width +
        parseFloat(getComputedStyle(item).marginRight);
      if (!larguraItem) return;
      var porLista = Math.max(1, Math.ceil(loop.clientWidth / larguraItem));
      for (var n = 1; n < porLista; n++) {
        var c = item.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        lista.appendChild(c);
      }
      trilho.querySelectorAll('.logoloop__list[data-copia]').forEach(function (l) { l.remove(); });
      var copia = lista.cloneNode(true);
      copia.setAttribute('data-copia', '');
      copia.setAttribute('aria-hidden', 'true');
      trilho.appendChild(copia);
      larguraSeq = lista.getBoundingClientRect().width;
    }

    function animar(t) {
      if (ultimo === null) ultimo = t;
      var dt = Math.min(0.1, Math.max(0, t - ultimo) / 1000);
      ultimo = t;
      var alvo = emHover ? VELOCIDADE_HOVER : VELOCIDADE;
      velocidade += (alvo - velocidade) * (1 - Math.exp(-dt / SUAVIZACAO));
      if (larguraSeq > 0) {
        deslocamento = (deslocamento + velocidade * dt) % larguraSeq;
        trilho.style.transform = 'translate3d(' + (-deslocamento) + 'px,0,0)';
      }
      quadro = requestAnimationFrame(animar);
    }
    function iniciar() { if (quadro === null && visivel && !document.hidden) quadro = requestAnimationFrame(animar); }
    function parar() { if (quadro !== null) cancelAnimationFrame(quadro); quadro = null; ultimo = null; }

    var img = lista.querySelector('img');
    function preparar() { montarLoop(); if (!semMovimento) iniciar(); }
    if (img.complete) preparar(); else img.addEventListener('load', preparar, { once: true });
    if (document.fonts) document.fonts.ready.then(montarLoop);

    var redimensionar;
    addEventListener('resize', function () {
      clearTimeout(redimensionar);
      redimensionar = setTimeout(montarLoop, 150);
    });

    if (!semMovimento) {
      trilho.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') emHover = true; });
      trilho.addEventListener('pointerleave', function () { emHover = false; });
      document.addEventListener('visibilitychange', function () { document.hidden ? parar() : iniciar(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entradas) {
          visivel = entradas[0].isIntersecting;
          visivel ? iniciar() : parar();
        }).observe(loop);
      }
    }
  }

  // Registro de cliques: dispara para o Pixel da Meta / Google, se estiverem instalados
  document.querySelectorAll('[data-evento]').forEach(function (el) {
    el.addEventListener('click', function () {
      var nome = el.getAttribute('data-evento');
      if (typeof window.fbq === 'function') window.fbq('trackCustom', nome);
      if (typeof window.gtag === 'function') window.gtag('event', nome);
    });
  });
})();
