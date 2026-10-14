/* =============================================================================
   /apply — step-by-step application (one question per screen)
   Step 1 goes to /api/apply when the phone number is submitted; the video
   uploads straight to Cloudinary (signed by /api/apply/upload) and step 2 goes
   to /api/apply once it's done. Both server routes are in netlify/functions/.
   Answers are kept in sessionStorage so a refresh doesn't wipe them.
   ============================================================================= */
(function () {
  var flow = document.getElementById('flow');
  if (!flow) return;

  var STORE = 'iota-apply-v1';
  var MAX_BYTES = 300 * 1024 * 1024;
  var CHUNK = 20 * 1024 * 1024;              // Cloudinary chunks must be ≥ 5 MB
  var ORDER = ['first_name', 'last_name', 'age_range', 'city', 'phone', 'start_date',
               'full_time_travel', 'competed', 'hardest_commitment', 'video'];
  // Bar fill on arrival at each screen: front-loaded so it always feels close.
  var PROGRESS = [5, 40, 55, 66, 74, 80, 85, 89, 93, 96];
  // Shown above the next question after each answer, in order.
  var CHEERS = ['Nice to meet you, {first}.', 'Quick one.', 'Perfect.', 'Almost there.',
                'Just a couple more.', 'Perfect.', 'Almost there.', 'Just a couple more.',
                'Final question.'];

  var screens = {};
  [].forEach.call(flow.querySelectorAll('[data-step]'), function (el) { screens[el.getAttribute('data-step')] = el; });
  var bar = document.getElementById('flow-bar');
  var back = document.getElementById('flow-back');
  var cheer = document.getElementById('flow-cheer');

  // ── State ──────────────────────────────────────────────────────────────────
  var s = load() || { a: {}, at: 0, end: null, sent1: '' };
  var params = new URLSearchParams(location.search);
  // Tracking from the page URL; a refresh keeps what the first load saw.
  s.client = params.has('client') ? (params.get('client') || '').trim() : (s.client || '');
  s.source = params.has('utm_source') ? (params.get('utm_source') || '').trim() : (s.source || '');

  function load() { try { return JSON.parse(sessionStorage.getItem(STORE)); } catch (e) { return null; } }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {} }

  // ── Screens ────────────────────────────────────────────────────────────────
  var cheerTimer;
  function show(name, opts) {
    opts = opts || {};
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
    var i = ORDER.indexOf(name);
    if (i > -1) s.at = i;
    back.hidden = !(i > 0 || name === 'under18');
    bar.style.width = (name === 'done' ? 100 : i > -1 ? PROGRESS[i] : PROGRESS[2]) + '%';
    fill(name);
    save();

    clearTimeout(cheerTimer);
    cheer.classList.remove('is-on');
    if (opts.cheer) {
      cheer.textContent = opts.cheer;
      cheer.classList.add('is-on');
      cheerTimer = setTimeout(function () { cheer.classList.remove('is-on'); }, 1200);
    }
    if (opts.focus) {
      if (flow.getBoundingClientRect().top < 0) flow.scrollIntoView({ block: 'start' });
      var f = screens[name].querySelector('input:not([type=file]), select');
      if (f) f.focus({ preventScroll: true });
    }
  }

  // Put saved answers back into a screen (for Back and for refresh).
  function fill(name) {
    var el = screens[name];
    [].forEach.call(el.querySelectorAll('input:not([type=file]), select'), function (inp) {
      if (s.a[inp.name] != null) inp.value = inp.name === 'phone' ? formatPhone(s.a.phone) : s.a[inp.name];
    });
    [].forEach.call(el.querySelectorAll('[data-value]'), function (t) {
      t.setAttribute('aria-pressed', String(s.a[name] === t.getAttribute('data-value')));
    });
    [].forEach.call(el.querySelectorAll('[data-first]'), function (n) { n.textContent = s.a.first_name || ''; });
    var err = el.querySelector('.err');
    if (err) err.hidden = true;
  }

  function next(from) {
    var i = ORDER.indexOf(from);
    var line = CHEERS[i].replace('{first}', s.a.first_name || '');
    show(ORDER[i + 1], { cheer: line, focus: true });
  }

  back.addEventListener('click', function () {
    if (s.end === 'under18') { s.end = null; show('age_range', { focus: true }); return; }
    if (s.at > 0) show(ORDER[s.at - 1], { focus: true });
  });

  function fail(name, msg) {
    var err = screens[name].querySelector('.err');
    err.textContent = msg;
    err.hidden = false;
  }

  // ── Text and choice screens ────────────────────────────────────────────────
  var CHECK = {
    first_name: function (f) { return f.first_name.value.trim() ? '' : 'Add your first name.'; },
    last_name: function (f) { return f.last_name.value.trim() ? '' : 'Add your last name.'; },
    city: function (f) {
      if (!f.city.value.trim()) return 'Add the city you live in.';
      return f.state.value ? '' : 'Pick your state.';
    },
    phone: function (f) { return toE164(f.phone.value) ? '' : 'Enter a 10-digit US cell number.'; },
    start_date: function (f) { return /^\d{4}-\d{2}-\d{2}$/.test(f.start_date.value) ? '' : 'Pick a date.'; },
    competed: function (f) { return f.competed.value.trim() ? '' : 'Tell us one thing, even if it feels small.'; },
    hardest_commitment: function (f) { return f.hardest_commitment.value.trim() ? '' : 'Tell us what it was and how long.'; }
  };

  Object.keys(CHECK).forEach(function (name) {
    screens[name].addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.currentTarget;
      var msg = CHECK[name](f);
      if (msg) { fail(name, msg); return; }
      [].forEach.call(f.querySelectorAll('input, select'), function (inp) { s.a[inp.name] = inp.value.trim(); });
      if (name === 'phone') { s.a.phone = toE164(f.phone.value); sendStep1(); }
      next(name);
    });
  });

  [].forEach.call(flow.querySelectorAll('[data-value]'), function (tile) {
    tile.addEventListener('click', function () {
      var name = tile.closest('[data-step]').getAttribute('data-step');
      s.a[name] = tile.getAttribute('data-value');
      fill(name);
      setTimeout(function () {
        if (s.a.age_range === 'Under 18' && name === 'age_range') { s.end = 'under18'; show('under18'); return; }
        next(name);
      }, 160);
    });
  });

  // An error goes away as soon as they change the answer.
  flow.addEventListener('input', function (e) {
    var err = e.target.closest('[data-step]') && e.target.closest('[data-step]').querySelector('.err');
    if (err) err.hidden = true;
  });

  var phoneInput = screens.phone.querySelector('input[name=phone]');
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length > 10 && digits[0] === '1') digits = digits.slice(1);
    phoneInput.value = formatPhone(digits.slice(0, 10));
  });

  // Earliest start date is today, in the applicant's own time zone.
  var today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  screens.start_date.querySelector('input').min = today.toISOString().slice(0, 10);

  function toE164(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length === 11 && d[0] === '1') d = d.slice(1);
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? '+1' + d : '';
  }
  function formatPhone(v) {
    var d = String(v || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
    if (d.length < 4) return d;
    if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  // ── Sending ────────────────────────────────────────────────────────────────
  // Fire and forget: the server retries and logs; the applicant never waits.
  function send(body) {
    try {
      fetch('/api/apply', { method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(function () {});
    } catch (e) {}
  }

  function sendStep1() {
    var body = { step: 1, first_name: s.a.first_name, last_name: s.a.last_name, age_range: s.a.age_range,
      city: s.a.city, state: s.a.state, phone: s.a.phone, client: s.client, source: s.source };
    var key = JSON.stringify(body);
    if (key === s.sent1) return;          // going Back and Next again doesn't resend
    s.sent1 = key;
    send(body);
  }

  function sendStep2() {
    send({ step: 2, phone: s.a.phone, first_name: s.a.first_name, last_name: s.a.last_name,
      start_date: s.a.start_date, full_time_travel: s.a.full_time_travel, competed: s.a.competed,
      hardest_commitment: s.a.hardest_commitment, video_url: s.a.video_url, client: s.client, source: s.source });
  }

  // ── Video ──────────────────────────────────────────────────────────────────
  var vScreen = screens.video;
  var picker = vScreen.querySelector('.flow__pick');
  var upBox = vScreen.querySelector('.flow__upload');
  var upBar = vScreen.querySelector('.flow__ubar span');
  var upText = vScreen.querySelector('.flow__ustatus');

  [].forEach.call(vScreen.querySelectorAll('input[type=file]'), function (inp) {
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0];
      inp.value = '';
      if (!file) return;
      if (file.type && file.type.indexOf('video/') !== 0) return fail('video', 'That file isn’t a video. Try again.');
      if (file.size > MAX_BYTES) return fail('video', 'That video is over 300 MB. Record a shorter one, or at a lower quality.');
      startUpload(file);
    });
  });

  function uploading(on) {
    picker.hidden = on;
    upBox.hidden = !on;
    back.hidden = on;
    vScreen.querySelector('.err').hidden = true;
  }

  function progress(p) {
    var pct = Math.min(100, Math.round(p * 100));
    upBar.style.width = pct + '%';
    upText.textContent = pct < 100 ? 'Uploading your video… ' + pct + '%' : 'Finishing up…';
  }

  function startUpload(file) {
    uploading(true);
    progress(0);
    fetch('/api/apply/upload', { method: 'POST' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('sign ' + r.status)); })
      .then(function (sig) { return uploadChunks(file, sig); })
      .then(function (url) {
        s.a.video_url = url;
        sendStep2();
        s.end = 'done';
        show('done');
      })
      .catch(function (e) {
        if (window.console) console.error('[apply] video upload failed', e);
        uploading(false);
        fail('video', 'Your video didn’t upload. Check your connection and try again.');
      });
  }

  // Cloudinary chunked upload: same upload id, a Content-Range per chunk; the
  // last chunk's response carries the video URL. Each chunk gets one retry.
  function uploadChunks(file, sig) {
    var id = 'apply-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    var size = file.size;
    function chunk(start, tries) {
      var end = Math.min(start + CHUNK, size);
      return new Promise(function (resolve, reject) {
        var fd = new FormData();
        fd.append('file', file.slice(start, end), file.name || 'video');
        fd.append('api_key', sig.api_key);
        fd.append('timestamp', sig.timestamp);
        fd.append('folder', sig.folder);
        fd.append('signature', sig.signature);
        var x = new XMLHttpRequest();
        x.open('POST', sig.upload_url);
        x.setRequestHeader('X-Unique-Upload-Id', id);
        x.setRequestHeader('Content-Range', 'bytes ' + start + '-' + (end - 1) + '/' + size);
        x.upload.onprogress = function (e) {
          if (e.lengthComputable) progress((start + (end - start) * (e.loaded / e.total)) / size);
        };
        x.onload = function () {
          if (x.status >= 200 && x.status < 300) {
            var res = {};
            try { res = JSON.parse(x.responseText); } catch (err) {}
            resolve(res);
          } else reject(new Error('upload ' + x.status + ' ' + x.responseText.slice(0, 200)));
        };
        x.onerror = function () { reject(new Error('network')); };
        x.send(fd);
      }).then(function (res) {
        if (end >= size) {
          if (res.secure_url) return res.secure_url;
          throw new Error('no video url');
        }
        return chunk(end, 0);
      }, function (err) {
        if (tries < 1) return chunk(start, tries + 1);
        throw err;
      });
    }
    return chunk(0, 0);
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  if (s.end === 'done') show('done');
  else if (s.end === 'under18') show('under18');
  else show(ORDER[s.at] || ORDER[0]);
})();
