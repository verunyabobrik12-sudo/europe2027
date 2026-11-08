// Заявки идут в тот же Apps Script, что и у лендинга Стамбула (таблица «Заявки Стамбул» + письмо).
// Отличить заявку по полю plan = TOUR_NAME.
var LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzxC8fGP3TF_uN9N0MuApY_V9eGdWj0ggqY6sOOIbX8ifHBO2ATvuoP7etg2LO2Hb2LBQ/exec";
var TOUR_NAME = "Круиз Барселона — Киль, MSC Euribia, 14–24.04.2027";

// «Цена до даты»: заполнить обе строки — и плашка появится у цены. Пустые — плашки нет.
// После PRICE_UNTIL_ISO плашка скрывается сама.
var PRICE_UNTIL_TEXT = "";        // например: "1 декабря"
var PRICE_UNTIL_ISO = "";         // например: "2026-12-01T23:59:59+03:00"
var PRICE_AFTER = "";             // например: "1 690 €"

(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* шапка */
  var top = document.getElementById('top');
  var onScroll = function () { top.classList.toggle('solid', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* видео: первый экран и ролики туристов играют, только когда видны; при «меньше анимации» стоят */
  var hv = document.getElementById('heroVideo');
  if (hv && still) { hv.removeAttribute('autoplay'); hv.pause(); }
  var autos = document.querySelectorAll('video[data-auto]');
  if (!still && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else v.pause(); });
    }, { threshold: .25 });
    autos.forEach(function (v) { vio.observe(v); });
  }

  /* плавающая плашка брони: после первого экрана и до формы */
  var stick = document.getElementById('stick'), heroEl = document.getElementById('hero'), finalEl = document.getElementById('zayavka');
  if (stick && heroEl && finalEl && 'IntersectionObserver' in window) {
    var heroIn = true, finalIn = false;
    var upd = function () { var on = !heroIn && !finalIn; stick.classList.toggle('on', on); stick.setAttribute('aria-hidden', on ? 'false' : 'true'); stick.tabIndex = on ? 0 : -1; };
    new IntersectionObserver(function (en) { heroIn = en[0].isIntersecting; upd(); }, { threshold: .05 }).observe(heroEl);
    new IntersectionObserver(function (en) { finalIn = en[0].isIntersecting; upd(); }, { threshold: .05 }).observe(finalEl);
  }

  /* маршрут */
  var DAYS = [
    { d: '14 апреля', n: 'День 1', id: 'barcelona', name: 'Барселона', c: 'Испания', h: 'посадка, отплытие в 18:00',
      lead: 'Город Гауди. Утро свободно: успеете в парк Гуэль или к Саграда Фамилии, днём — посадка на лайнер.',
      todo: 'Саграда Фамилия снаружи, бульвар Рамбла и рынок Бокерия, затем в порт.', eat: 'Хлеб с помидором и оливковым маслом, крема каталана.', fact: 'Саграда Фамилию строят с 1882 года — и всё ещё достраивают.' },
    { d: '15 апреля', n: 'День 2', id: 'alicante', name: 'Аликанте', c: 'Испания', h: '08:00–17:00 · 9 часов',
      lead: 'Белый город у моря с пальмовой набережной и крепостью на скале. Всё рядом с портом.',
      todo: 'Подъём к замку Санта-Барбара, набережная Эксплонада, старый квартал Санта-Крус.', eat: 'Рис по-аликантийски и нуга туррон.', fact: 'С горы Бенакантиль высотой 166 м видно всю бухту.' },
    { d: '16 апреля', n: 'День 3', id: 'gibraltar', name: 'Гибралтар', c: 'Британская территория', h: '10:00–18:00 · 8 часов',
      lead: 'Скала на краю Европы, британские телефонные будки и вид на Африку через пролив.',
      todo: 'Канатная дорога на Скалу, встреча с макаками, Мейн-стрит.', eat: 'Кальентита — пирог из нутовой муки.', fact: 'Здесь живут единственные дикие обезьяны Европы.' },
    { d: '17 апреля', n: 'День 4', id: 'cadiz', name: 'Кадис', c: 'Испания', h: '08:00–18:00 · 10 часов',
      lead: 'Один из старейших городов Европы: золотой купол собора, белые улицы и океанские пляжи.',
      todo: 'Собор и набережная, башня Тавира с камерой-обскурой, пляж Ла-Калета.', eat: 'Рыба во фритюре «пескаито фрито» и херес.', fact: 'Кадису около трёх тысяч лет.' },
    { d: '18 апреля', n: 'День 5', id: 'sea1', name: 'День в море', c: 'Атлантика', h: 'весь день на борту', sea: true,
      lead: 'Выспаться, полежать у бассейна, сходить на шоу и в спа. Никуда не нужно спешить.',
      todo: 'Бассейны, шоу, рестораны, закат с верхней палубы.', eat: 'Ужин в ресторане — пробуйте новое каждый вечер.', fact: 'Лайнер идёт со скоростью около 40 км/ч.' },
    { d: '19 апреля', n: 'День 6', id: 'coruna', name: 'Ла-Корунья', c: 'Испания, Галисия', h: '08:00–17:00 · 9 часов',
      lead: 'Зелёная Галисия и самый старый действующий маяк мира. Город стеклянных балконов.',
      todo: 'Башня Геркулеса, набережная с застеклёнными балконами, площадь Марии Питы.', eat: 'Осьминог по-галисийски с паприкой.', fact: 'Римскому маяку около двух тысяч лет, он работает до сих пор.' },
    { d: '20 апреля', n: 'День 7', id: 'bilbao', name: 'Бильбао', c: 'Испания, Страна Басков', h: '08:00–18:00 · 10 часов',
      lead: 'Музей Гуггенхайма из титана, старый город и пинчос-бары на каждой улице.',
      todo: 'Гуггенхайм и набережная, старый город Каско-Вьехо, обед из пинчос.', eat: 'Пинчос — закуски на шпажке, их берут по одной.', fact: 'Музей открылся в 1997 году и изменил весь город.' },
    { d: '21 апреля', n: 'День 8', id: 'larochelle', name: 'Ла-Рошель', c: 'Франция', h: '08:00–15:00 · 7 часов',
      lead: 'Старый атлантический порт: две средневековые башни охраняют вход в гавань.',
      todo: 'Башни Старого порта, улицы с аркадами, рынок.', eat: 'Мидии в сливках и устрицы.', fact: 'В Средние века отсюда торговали вином и солью по всей Европе.' },
    { d: '22–23 апреля', n: 'Дни 9–10', id: 'sea2', name: 'Два дня в море', c: 'Бискайский залив и Северное море', h: 'два дня на борту', sea: true,
      lead: 'Лайнер идёт на север. Прохладнее, зато больше времени на спа, шоу и прощальные ужины.',
      todo: 'Крытый бассейн, спа, вечер в лаунже с видом на море.', eat: 'Прощальный ужин группы.', fact: 'Ла-Манш — один из самых оживлённых морских путей мира.' },
    { d: '24 апреля', n: 'День 11', id: 'kiel', name: 'Киль', c: 'Германия', h: 'прибытие в 09:00',
      lead: 'Высадка, трансфер в Гамбург и ночь в отеле. Домой — на следующий день.',
      todo: 'Трансфер в Гамбург, вечер в городе.', eat: 'Булочка с рыбой «фишбрётхен».', fact: 'Рядом проходит Кильский канал — самый загруженный искусственный водный путь в мире.' }
  ];
  var CITY_VIDEO = {"barcelona": "uOzwwZxjPRs", "alicante": "Zrp0cK0hXpA", "gibraltar": "bdk0KBe_JPE", "cadiz": "sR64PZC8xJc", "coruna": "yWX6eWgUSII", "bilbao": "GBpCynL--5s", "larochelle": "93cxc_abaLU", "kiel": "Sd9vwRpfLzU"};
  var tabs = document.getElementById('days'), card = document.getElementById('dayCard'), cur = 0;
  var SEA_VIDEO = { sea1: ['people/wakev.mp4', 'people/wakev.jpg'], sea2: ['people/nightwake.mp4', 'people/nightwake.jpg'] };
  var rp = document.getElementById('routePorthole'), glass = null;
  if (rp) {
    glass = rp;
    var first = document.createElement('img'); first.src = 'img/port-barcelona.jpg'; first.alt = ''; first.className = 'layer on';
    rp.appendChild(first);
  }
  function setGlass(d) {
    if (!glass) return;
    var el, sv = SEA_VIDEO[d.id];
    if (sv && !still) {
      el = document.createElement('video'); el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = true;
      el.poster = sv[1]; el.src = sv[0];
    } else {
      el = document.createElement('img'); el.alt = ''; el.src = sv ? sv[1] : 'img/port-' + d.id + '.jpg';
    }
    el.className = 'layer';
    glass.appendChild(el);
    var olds = glass.querySelectorAll('.layer.on');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on'); }); });
    setTimeout(function () { olds.forEach(function (o) { o.remove(); }); }, 800);
  }
  /* кораблик по линии маршрута */
  var map = document.getElementById('routeMap'), route = document.getElementById('route'), ship = document.getElementById('shipDot');
  var pinLen = {}, shipLen = 0, anim = null;
  if (map && route && ship) {
    var L = route.getTotalLength(), N = 600;
    map.querySelectorAll('.pin').forEach(function (pin) {
      var m = /translate\(([\d.]+),([\d.]+)\)/.exec(pin.getAttribute('transform')), px = +m[1], py = +m[2], best = 0, bd = 1e9;
      for (var k = 0; k <= N; k++) { var pt = route.getPointAtLength(L * k / N), dd = (pt.x - px) * (pt.x - px) + (pt.y - py) * (pt.y - py); if (dd < bd) { bd = dd; best = L * k / N; } }
      pinLen[pin.getAttribute('data-i')] = best;
      pin.addEventListener('click', function () { show(+pin.getAttribute('data-i'), true); });
      pin.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(+pin.getAttribute('data-i'), true); } });
    });
    var placeShip = function (len) { var pt = route.getPointAtLength(len); ship.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ')'); shipLen = len; };
    placeShip(pinLen[0] || 0);
  }
  function targetLen(i) {
    if (pinLen[i] !== undefined) return pinLen[i];
    var a = i - 1, b = i + 1;
    while (a > 0 && pinLen[a] === undefined) a--;
    while (b < DAYS.length - 1 && pinLen[b] === undefined) b++;
    return ((pinLen[a] || 0) + (pinLen[b] !== undefined ? pinLen[b] : (pinLen[a] || 0))) / 2;
  }
  function sailTo(i) {
    if (!route || !ship) return;
    var from = shipLen, to = targetLen(i);
    if (anim) cancelAnimationFrame(anim);
    if (still) { placeShip(to); return; }
    var t0 = null, dur = Math.min(2200, 500 + Math.abs(to - from) * 1.2);
    var step = function (ts) { if (t0 === null) t0 = ts; var k = Math.min(1, (ts - t0) / dur); k = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      placeShip(from + (to - from) * k); if (k < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  DAYS.forEach(function (d, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'tab-' + i; b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'dayCard');
    b.innerHTML = '<small>' + esc(d.d) + '</small><span>' + esc(d.name) + '</span>';
    b.addEventListener('click', function () { show(i, true); });
    tabs.appendChild(b);
  });
  function show(i, fromUser) {
    cur = (i + DAYS.length) % DAYS.length;
    var d = DAYS[cur];
    tabs.querySelectorAll('button').forEach(function (b, k) {
      b.setAttribute('aria-selected', k === cur ? 'true' : 'false');
      b.tabIndex = k === cur ? 0 : -1;
    });
    card.setAttribute('aria-labelledby', 'tab-' + cur);
    card.innerHTML = 
      '<div class="day-body"><p class="when">' + esc(d.n) + ' · ' + esc(d.d) + '</p><h3>' + esc(d.name) + '</h3>' +
      '<p class="meta">' + esc(d.c) + ' · ' + esc(d.h) + '</p><p class="lead2">' + esc(d.lead) + '</p>' +
      (CITY_VIDEO[d.id] ? '<button class="btn btn-ghost btn-sm vbtn" type="button" data-modal="youtube" data-id="' + CITY_VIDEO[d.id] + '" data-title="' + esc(d.name) + ': видео">▶ Смотреть видео: ' + esc(d.name) + '</button>' : '') + '<dl><div><dt>Что успеть</dt><dd>' + esc(d.todo) + '</dd></div><div><dt>Что попробовать</dt><dd>' + esc(d.eat) + '</dd></div><div><dt>Интересно</dt><dd>' + esc(d.fact) + '</dd></div></dl></div>';
    if (map) map.querySelectorAll('.pin').forEach(function (p) { p.classList.toggle('on', +p.getAttribute('data-i') === cur); });
    if (fromUser) { setGlass(d); sailTo(cur); }
    var tb = document.getElementById('tab-' + cur);
    if (fromUser && tb) tb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: still ? 'auto' : 'smooth' });
  }
  tabs.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); show(cur + (e.key === 'ArrowRight' ? 1 : -1), true);
      document.getElementById('tab-' + cur).focus();
    }
  });
  document.getElementById('prevDay').addEventListener('click', function () { show(cur - 1, true); });
  document.getElementById('nextDay').addEventListener('click', function () { show(cur + 1, true); });
  show(0, false);
  /* подгрузить фото портов заранее, чтобы переключение было мгновенным */
  window.addEventListener('load', function () { DAYS.forEach(function (d) { var im = new Image(); im.src = 'img/port-' + d.id + '.jpg'; }); });


  /* цена до даты */
  if (PRICE_UNTIL_TEXT && PRICE_AFTER && (!PRICE_UNTIL_ISO || Date.now() < new Date(PRICE_UNTIL_ISO).getTime())) {
    document.querySelectorAll('.deadline').forEach(function (el) {
      el.textContent = 'Цена 1 590 € — при брони до ' + PRICE_UNTIL_TEXT + ', потом ' + PRICE_AFTER;
      el.hidden = false;
    });
  }

  /* таймер до отплытия */
  var cnt = document.querySelectorAll('#count b');
  if (cnt.length) {
    var target = new Date('2027-04-14T18:00:00+02:00').getTime();
    var tick = function () {
      var sec = Math.max(0, Math.floor((target - Date.now()) / 1000));
      var v = [Math.floor(sec / 86400), Math.floor(sec % 86400 / 3600), Math.floor(sec % 3600 / 60), sec % 60];
      v.forEach(function (x, i) { cnt[i].textContent = i ? String(x).padStart(2, '0') : x; });
    };
    tick(); setInterval(tick, 1000);
  }

  /* «Знали ли вы?» */
  var factEl = document.getElementById('fact');
  if (factEl) {
    var facts = DAYS.filter(function (d) { return !d.sea; }).map(function (d) { return d.name + ': ' + d.fact; });
    var fi = Math.floor(Math.random() * facts.length);
    var showFact = function () { factEl.textContent = facts[fi]; fi = (fi + 1) % facts.length; };
    showFact();
    document.getElementById('nextFact').addEventListener('click', showFact);
  }

  /* кино: ролики подгружаются и играют, только когда видны */
  var clips = document.querySelectorAll('.clip video, .reel video');
  if (!still && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true }); }
          var q = v.play(); if (q && q.catch) q.catch(function () {});
        } else v.pause();
      });
    }, { threshold: .25 });
    clips.forEach(function (v) { cio.observe(v); });
  }

  /* карусель отзывов */
  var car = document.getElementById('rvCar');
  if (car) {
    var stepPx = function () { var f = car.querySelector('figure'); return f ? f.getBoundingClientRect().width + 14 : 300; };
    document.getElementById('rvNext').addEventListener('click', function () { if (car.scrollLeft + car.clientWidth >= car.scrollWidth - 8) car.scrollTo({ left: 0 }); else car.scrollBy({ left: stepPx() }); });
    document.getElementById('rvPrev').addEventListener('click', function () { if (car.scrollLeft <= 8) car.scrollTo({ left: car.scrollWidth }); else car.scrollBy({ left: -stepPx() }); });
    car.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') car.scrollBy({ left: stepPx() }); if (e.key === 'ArrowLeft') car.scrollBy({ left: -stepPx() }); });
  }

  /* окно с дипломом */
  var lb = document.getElementById('lb');
  if (lb) {
    var lbi = document.getElementById('lbImg');
    document.querySelectorAll('.dlink').forEach(function (b) { b.addEventListener('click', function () { lbi.src = b.dataset.full; lbi.alt = b.dataset.alt; lb.showModal(); }); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-x')) lb.close(); });
  }

  /* чек-лист «что взять» */
  var pl = document.getElementById('packlist');
  if (pl) {
    var boxes = pl.querySelectorAll('input'), key = 'pack-euribia-2027';
    var saved = []; try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
    boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; });
    var upd = function () {
      var n = 0, arr = []; boxes.forEach(function (b, i) { if (b.checked) { n++; arr.push(i); } });
      document.getElementById('packBar').style.width = (n / boxes.length * 100) + '%';
      document.getElementById('packTxt').textContent = 'Собрано ' + n + ' из ' + boxes.length;
      try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
    };
    pl.addEventListener('change', upd);
    document.getElementById('packReset').addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  /* кнопки с data-want выбирают пункт «что вам нужно» в форме */
  document.querySelectorAll('[data-want]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="want"][value="' + a.dataset.want + '"]'); if (r) r.checked = true;
    });
  });

  /* форма */
  var form = document.getElementById('leadForm'), msg = document.getElementById('formMsg');
  var phoneLink = ' Позвоните: <a href="tel:+375447884422">+375 44 788-44-22</a> или напишите в <a href="https://t.me/+375447884422" target="_blank" rel="noopener">Telegram</a>.';
  function say(type, html) { msg.className = 'form-msg ' + type; msg.innerHTML = html; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.website.value) return;
    var name = form.name.value.trim(), phone = form.phone.value.trim();
    if (!name || phone.replace(/\D/g, '').length < 7) { say('err', 'Укажите имя и телефон, чтобы менеджер смог перезвонить.'); (name ? form.phone : form.name).focus(); return; }
    if (!LEAD_ENDPOINT) { say('err', 'Форма пока не подключена.' + phoneLink); return; }
    var data = new URLSearchParams();
    data.append('name', name); data.append('phone', phone); data.append('plan', TOUR_NAME);
    data.append('channel', (form.querySelector('input[name="channel"]:checked') || {}).value || '');
    var want = (form.querySelector('input[name="want"]:checked') || {}).value || '';
    data.append('comment', (want ? '[' + want + '] ' : '') + form.comment.value.trim()); data.append('page', location.href);
    new URLSearchParams(location.search).forEach(function (v, k) { if (/^utm_|^gclid$|^yclid$|^fbclid$/.test(k)) data.append(k, v); });
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Отправляем…';
    fetch(LEAD_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () { form.reset(); say('ok', '<b>Заявка отправлена.</b> Менеджер перезвонит в рабочее время.'); })
      .catch(function () { say('err', 'Не получилось отправить заявку.' + phoneLink); })
      .then(function () { btn.disabled = false; btn.textContent = 'Отправить заявку'; });
  });
})();
