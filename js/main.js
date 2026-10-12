
(function () {
  'use strict';

  const C = window.CONFIG || {};
  const CH = window.CONTENT || [];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const mk = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cover = $('#cover');
  const book = $('#book');

  // Pastikan elemen HTML utama tersedia
  if (!cover || !book || !$('#openBtn')) {
    console.error('Elemen cover, book, atau openBtn tidak ditemukan.');
    return;
  }

  /* ---------- BASIC SETTINGS ---------- */

  const today = new Date();
  const pad = n => String(n).padStart(2, '0');

  const madeOn = C.madeOn ||
    `${pad(today.getDate())} . ${pad(today.getMonth() + 1)} . ${today.getFullYear()}`;

  if (C.birthday && $('#bday')) {
    $('#bday').textContent = C.birthday;
  } else if ($('#bday')) {
    $('#bday').hidden = true;
  }

  if (C.nickname) {
    document.title = `happy belated birthday, ${C.nickname}.`;
  }

  const photo = (el, src) => {
    if (!el || !src) return;

    const img = new Image();

    img.onload = () => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add('on');
    };

    img.src = src;
  };

  photo($('#coverPhoto'), (C.photos || {}).cover);

  /* ---------- AUDIO: DECLARE BEFORE BUILDING CHAPTERS ---------- */

  const S = C.song || {};
  const audio = S.src ? new Audio(S.src) : null;

  let state = audio ? 'paused' : 'none';

  if (audio) {
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.7;
  }

  const ui = {
    btns: [],
    status: [],
    fill: [],
    time: [],
    root: []
  };

  /* ---------- ART AND TEXT HELPERS ---------- */

  const artBlock = key => {
    const a = mk('div', 'art');
    a.setAttribute('aria-hidden', 'true');

    const bg = mk('div', 'bgphoto');

    a.append(bg, mk('div', 'beam'));

    photo(bg, (C.photos || {})[key]);

    return a;
  };

  const paras = (list, cls) => {
    const w = mk('div', cls || 'prose');

    (list || []).forEach(t => {
      w.append(mk('p', 'rv', t));
    });

    return w;
  };

  /* ---------- GALLERY AND LIGHTBOX ---------- */

  const lb = $('#lightbox');

  function frame(g, big) {
    const f = mk('div', big ? '' : 'frame');

    const placeholder = () => {
      f.replaceChildren();
      f.append(mk('div', 'ph', 'a photo goes here'));
    };

    if (g.src) {
      const img = new Image();

      img.alt = g.caption || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = placeholder;
      img.src = g.src;

      f.append(img);
    } else {
      placeholder();
    }

    return f;
  }

  function buildGallery() {
    const w = mk('div', 'collage');

    (C.gallery || []).slice(0, 8).forEach(g => {
      const b = mk('button', 'pol rv');

      b.type = 'button';
      b.setAttribute(
        'aria-label',
        'open photo: ' + (g.caption || 'photo')
      );

      b.append(frame(g), mk('span', 'cap', g.caption || ''));

      if (g.date) {
        b.append(mk('span', 'dt', g.date));
      }

      b.addEventListener('click', () => {
        if (!lb) return;

        const box = $('#lbImg');

        if (box) {
          box.replaceChildren(frame(g, true));
        }

        if ($('#lbCap')) {
          $('#lbCap').textContent = g.caption || '';
        }

        if ($('#lbDate')) {
          $('#lbDate').textContent = g.date || '';
        }

        if (!lb.open) lb.showModal();
      });

      w.append(b);
    });

    return w;
  }

  if ($('#lbClose') && lb) {
    $('#lbClose').addEventListener('click', () => lb.close());

    lb.addEventListener('click', e => {
      if (e.target === lb) lb.close();
    });
  }

  /* ---------- MUSIC PLAYER ---------- */

  function buildPlayer() {
    const p = mk('div', 'player rv');

    const disc = mk('div', 'disc');
    disc.setAttribute('aria-hidden', 'true');

    const info = mk('div');

    info.append(
      mk('p', 'pt', S.title || 'Membasuh'),
      mk('p', 'pa', S.artist || 'Hindia')
    );

    const ctl = mk('div', 'ctl');

    const btn = mk('button', 'pbtn');

    btn.type = 'button';
    btn.setAttribute('aria-label', 'play');

    btn.innerHTML =
      '<svg viewBox="0 0 24 24" class="play"><path d="M7 4.5v15l12-7.5z"/></svg>' +
      '<svg viewBox="0 0 24 24" class="pause"><path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z"/></svg>';

    const bar = mk('div', 'bar');

    bar.tabIndex = 0;
    bar.setAttribute('role', 'slider');
    bar.setAttribute('aria-label', 'song progress');

    const fill = mk('span');
    bar.append(fill);

    const time = mk('time', 'mono', '0:00');

    ctl.append(btn, bar, time);

    const vol = mk('label', 'vol mono');
    vol.append('vol');

    const range = mk('input');

    range.type = 'range';
    range.min = 0;
    range.max = 100;
    range.value = 70;
    range.setAttribute('aria-label', 'volume');

    vol.append(range);

    const status = mk('p', 'status');
    status.setAttribute('aria-live', 'polite');

    p.append(disc, info, ctl, vol, status);

    ui.btns.push(btn);
    ui.status.push(status);
    ui.fill.push(fill);
    ui.time.push(time);
    ui.root.push(p);

    btn.addEventListener('click', toggle);

    range.addEventListener('input', () => {
      if (audio) audio.volume = range.value / 100;
    });

    if (audio) {
      const seek = x => {
        const r = bar.getBoundingClientRect();

        if (audio.duration && r.width > 0) {
          const pct = Math.min(
            1,
            Math.max(0, (x - r.left) / r.width)
          );

          audio.currentTime = pct * audio.duration;
        }
      };

      bar.addEventListener('pointerdown', e => {
        seek(e.clientX);

        const mv = ev => seek(ev.clientX);

        const up = () => {
          removeEventListener('pointermove', mv);
          removeEventListener('pointerup', up);
        };

        addEventListener('pointermove', mv);
        addEventListener('pointerup', up);
      });

      bar.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
          audio.currentTime = Math.min(
            audio.duration || 0,
            audio.currentTime + 5
          );
        }

        if (e.key === 'ArrowLeft') {
          audio.currentTime = Math.max(
            0,
            audio.currentTime - 5
          );
        }
      });
    }

    return p;
  }

  const fmt = s =>
    Number.isFinite(s)
      ? Math.floor(s / 60) + ':' + pad(Math.floor(s % 60))
      : '0:00';

  const labels = {
    none: 'no audio file is set yet.',
    paused: 'paused.',
    playing: 'now playing.',
    blocked: 'your browser blocked autoplay. press play to start.',
    error: 'the audio file could not be loaded. check the path in js/config.js.'
  };

  function sync() {
    const playing = state === 'playing';

    document.body.classList.toggle('playing', playing);

    ui.root.forEach(r => {
      r.classList.toggle('playing', playing);
    });

    ui.btns.forEach(b => {
      b.classList.toggle('on', playing);
      b.setAttribute('aria-label', playing ? 'pause' : 'play');
    });

    if ($('#blockedBtn')) {
      $('#blockedBtn').hidden = state !== 'blocked';
    }

    ui.status.forEach(s => {
      s.replaceChildren();

      if (state === 'none') {
        s.append(labels.none + ' ');

        if (S.externalUrl) {
          const a = mk(
            'a',
            '',
            `listen to ${S.title || 'the song'} on the official service`
          );

          a.href = S.externalUrl;
          a.target = '_blank';
          a.rel = 'noopener';

          s.append(a, '.');
        }
      } else {
        s.textContent =
          `${S.title || 'Membasuh'} — ${S.artist || 'Hindia'}: ${labels[state]}`;
      }
    });

    if ($('#miniText')) {
      $('#miniText').textContent =
        state === 'playing'
          ? `${S.title || 'music'} · pause`
          : state === 'none'
            ? 'music'
            : `${S.title || 'music'} · play`;
    }
  }

  function tryPlay() {
    if (!audio) {
      sync();
      return Promise.resolve();
    }

    return audio.play()
      .then(() => {
        state = 'playing';
        sync();
      })
      .catch(err => {
        state =
          err && err.name === 'NotAllowedError'
            ? 'blocked'
            : audio.error
              ? 'error'
              : 'blocked';

        sync();
      });
  }

  function toggle() {
    if (!audio) {
      const musicChapter = $('#c5');

      if (musicChapter) {
        musicChapter.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth'
        });
      }

      return;
    }

    if (audio.paused) {
      tryPlay();
    } else {
      audio.pause();
      state = 'paused';
      sync();
    }
  }

  if (audio) {
    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration
        ? (audio.currentTime / audio.duration) * 100
        : 0;

      ui.fill.forEach(f => {
        f.style.width = pct + '%';
      });

      ui.time.forEach(t => {
        t.textContent = fmt(audio.currentTime);
      });
    });

    audio.addEventListener('error', () => {
      state = 'error';
      sync();
    });

    audio.addEventListener('ended', () => {
      if (!audio.loop) {
        state = 'paused';
        sync();
      }
    });
  }

  if ($('#mini')) {
    $('#mini').addEventListener('click', toggle);
  }

  if ($('#blockedBtn')) {
    $('#blockedBtn').addEventListener('click', tryPlay);
  }

  /* ---------- BUILD CHAPTERS ---------- */

  CH.forEach(ch => {
    const kind = (ch.kind || '').split(' ')[0];

    const sec = mk(
      'section',
      `chap ${ch.kind || ''} ${kind}`
    );

    sec.id = ch.id;
    sec.setAttribute('aria-labelledby', ch.id + 't');

    const inn = mk('div', 'in');
    const head = mk('header', 'chead');
    const meta = mk('div', 'mono');

    meta.append(
      mk('span', '', `chapter ${ch.n}`),
      mk('span', '', madeOn)
    );

    const h = mk('h2', 'rv', ch.title);
    h.id = ch.id + 't';

    head.append(meta, h);

    if (ch.note) {
      head.append(mk('p', 'note', ch.note));
    }

    inn.append(head);

    if (kind === 'wishes') {
      const w = mk('div', 'wishes-list');

      (ch.paras || []).forEach(t => {
        w.append(mk('p', 'wish rv', t));
      });

      inn.append(w);

    } else if (kind === 'gallery') {
      inn.append(buildGallery());

    } else if (kind === 'music') {
      inn.append(
        mk('p', 'lead rv', ch.lead || ''),
        buildPlayer(),
        paras(ch.paras)
      );

    } else if (kind === 'card') {
      inn.append(
        mk('p', 'opener rv', ch.opener || ''),
        paras(ch.paras)
      );

      const btn = mk('button', 'btn rv', ch.lightBtn || 'open');
      btn.type = 'button';

      const lit = mk('p', 'lit', ch.lightText || '');
      const light = mk('div', 'light');

      lit.setAttribute('aria-live', 'polite');

      btn.addEventListener('click', () => {
        light.classList.remove('on');
        void light.offsetWidth;
        light.classList.add('on');
        lit.classList.add('on');
      });

      sec.append(light);
      inn.append(btn, lit);

    } else if (kind === 'last') {
      sec.prepend(artBlock('last'));

      inn.append(
        paras(ch.paras),
        mk('p', 'closing rv', ch.closing || '')
      );

      const d = mk('time', 'mono madeon rv', madeOn);
      const row = mk('div', 'row rv');

      const again = mk('button', 'btn', 'read it again');
      const back = mk('button', 'btn ghost', 'back to the beginning');

      again.type = 'button';
      back.type = 'button';

      again.addEventListener('click', () => {
        const first = $('#c1');

        if (first) {
          first.scrollIntoView({
            behavior: reduce ? 'auto' : 'smooth'
          });
        }
      });

      back.addEventListener('click', closeBook);

      row.append(again, back);
      inn.append(d, row);

    } else {
      if (kind === 'remains') {
        sec.prepend(artBlock('remains'));
      }

      inn.append(paras(ch.paras));
    }

    if (ch.big) {
      inn.append(mk('p', 'big rv', ch.big));
    }

    sec.append(inn, mk('span', 'pg', `p. ${ch.n}`));
    book.append(sec);
  });

  /* ---------- PLAYER INITIALIZATION ---------- */

  sync();

  if (audio && S.autoplay !== false) {
    tryPlay();
  }

  /* ---------- OPEN AND CLOSE BOOK ---------- */

  const chrome = on => {
    ['#progress', '#tracksBtn', '#mini'].forEach(s => {
      const el = $(s);
      if (el) el.classList.toggle('on', on);
    });
  };

  function openBook() {
    // Try to start music from the user's click
    tryPlay();

    cover.classList.add('turned');
    book.classList.add('on');
    book.removeAttribute('aria-hidden');

    chrome(true);

    setTimeout(() => {
      document.body.classList.remove('locked');
    }, 800);
  }

  function closeBook() {
    window.scrollTo(0, 0);

    document.body.classList.add('locked');

    cover.classList.remove('turned');
    book.classList.remove('on');
    book.setAttribute('aria-hidden', 'true');

    chrome(false);
    closeTracks();
  }

  $('#openBtn').addEventListener('click', openBook);

  /* ---------- TRACK LIST NAVIGATION ---------- */

  const list = $('#trackList');
  const tb = $('#tracksBtn');
  const panel = $('#tracks');

  CH.forEach(ch => {
    if (!list) return;

    const li = mk('li');
    const a = mk('a');

    a.href = '#' + ch.id;
    a.dataset.id = ch.id;

    a.append(
      mk('span', '', ch.n + ' —'),
      mk('span', '', ch.nav || ch.title || '')
    );

    a.addEventListener('click', closeTracks);

    li.append(a);
    list.append(li);
  });

  function closeTracks() {
    if (!panel || !tb) return;

    panel.classList.remove('open');
    tb.setAttribute('aria-expanded', 'false');
    tb.textContent = 'tracks';
  }

  if (tb && panel) {
    tb.addEventListener('click', () => {
      const opened = panel.classList.toggle('open');

      tb.setAttribute('aria-expanded', String(opened));
      tb.textContent = opened ? 'close' : 'tracks';
    });
  }

  addEventListener('keydown', e => {
    if (e.key === 'Escape') closeTracks();
  });

  /* ---------- REVEALS, PROGRESS, PARALLAX ---------- */

  if ('IntersectionObserver' in window) {
    const rio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;

        const el = e.target;

        const sib = el.parentElement
          ? [...el.parentElement.children].indexOf(el)
          : 0;

        el.style.transitionDelay = reduce
          ? '0s'
          : Math.min(sib * 0.08, 0.5) + 's';

        el.classList.add('in');
        rio.unobserve(el);
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -8% 0px'
    });

    $$('.rv').forEach(el => rio.observe(el));

    const aio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || !list) return;

        $$('#trackList a').forEach(a => {
          a.classList.toggle(
            'act',
            a.dataset.id === e.target.id
          );
        });
      });
    }, {
      rootMargin: '-50% 0px -50% 0px'
    });

    $$('.chap').forEach(s => aio.observe(s));

  } else {
    $$('.rv').forEach(el => el.classList.add('in'));
  }

  const prog = $('#progress');
  const bgs = $$('.remains .bgphoto, .last .bgphoto');

  let tick = false;

  function onScroll() {
    tick = false;

    const max =
      document.documentElement.scrollHeight - innerHeight;

    if (prog) {
      prog.style.width =
        (max > 0 ? scrollY / max * 100 : 0) + '%';
    }

    if (reduce) return;

    bgs.forEach(b => {
      const parent = b.parentElement?.parentElement;
      if (!parent) return;

      const r = parent.getBoundingClientRect();

      if (r.bottom < 0 || r.top > innerHeight) return;

      b.style.transform =
        `translateY(${((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1)}px)`;
    });
  }

  addEventListener('scroll', () => {
    if (!tick) {
      tick = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

})();
