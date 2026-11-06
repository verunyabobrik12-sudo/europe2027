/* Модальное окно: видео YouTube и крупное изображение (схема палуб). */
(function () {
  var dlg = document.getElementById('mdl'); if (!dlg) return;
  var body = document.getElementById('mdlBody'), cap = document.getElementById('mdlCap');
  function close() { dlg.close(); body.innerHTML = ''; }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-modal]');
    if (t) {
      var type = t.getAttribute('data-modal'); body.innerHTML = ''; dlg.className = 'mdl ' + type;
      if (type === 'youtube') {
        body.innerHTML = '<iframe src="https://www.youtube.com/embed/' + t.dataset.id + '?autoplay=1&rel=0&playsinline=1" title="' + t.dataset.title + '" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
        cap.innerHTML = '<a href="https://www.youtube.com/watch?v=' + t.dataset.id + '" target="_blank" rel="noopener">Не воспроизводится? Открыть на YouTube</a>';
      } else {
        body.innerHTML = '<img src="' + t.dataset.src + '" alt="' + t.dataset.title + '">';
        cap.textContent = 'Схема: cruisedeckplans.com. Нажмите на схему, чтобы увеличить.';
      }
      dlg.showModal(); return;
    }
    if (e.target === dlg || e.target.classList.contains('mdl-x')) { close(); return; }
    if (e.target.matches('.mdl.image img')) e.target.parentNode.classList.toggle('zoom');
  });
  dlg.addEventListener('cancel', function () { body.innerHTML = ''; });
})();
