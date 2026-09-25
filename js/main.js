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

  // Registro de cliques: dispara para o Pixel da Meta / Google, se estiverem instalados
  document.querySelectorAll('[data-evento]').forEach(function (el) {
    el.addEventListener('click', function () {
      var nome = el.getAttribute('data-evento');
      if (typeof window.fbq === 'function') window.fbq('trackCustom', nome);
      if (typeof window.gtag === 'function') window.gtag('event', nome);
    });
  });
})();
