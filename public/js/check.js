// The online OBX compatibility check (/<lang>/check/). Loaded on that page only.
// POST /api/check streams one JSON object per line (NDJSON): a "result" per finished test, then
// a "report" with the share id, or an "error". GET /api/check?id=<id> returns a stored report.
// All text comes from the page (data-config), in the page's language. Honesty rule: a pass is
// only ever "passes the online compatibility check", never "compatible".
(function () {
  'use strict';

  const form = document.querySelector('[data-check-form]');
  if (!form) return;
  const cfg = JSON.parse(form.getAttribute('data-config') || '{}');
  const t = cfg.t || {};
  const $ = (sel, root) => (root || document).querySelector(sel);

  const fields = {
    url: $('#check-url'),
    id: $('#check-client-id'),
    secret: $('#check-client-secret'),
  };
  const urlError = $('#check-url-error');
  const keyError = $('#check-key-error');
  const formError = $('[data-check-error]');
  const submit = $('[data-check-submit]');
  const results = $('[data-check-results]');
  const heading = $('#check-results-title');
  const status = $('[data-check-status]');
  const summary = $('[data-check-summary]');
  const meta = $('[data-check-meta]');
  const share = $('[data-check-share]');
  const shareLink = $('[data-check-share-link]');
  const shareNote = $('[data-check-share-note]');
  const copyButton = $('[data-check-copy]');
  const TOTAL = Object.keys(t.tests || {}).length || 26;

  /** "{name}" placeholders, as the site's format() does. */
  function format(text, vars) {
    return String(text || '').replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? String(vars[k]) : m));
  }
  /** A new element with a class and text. */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // ---------- Turnstile ----------

  let widget = null;
  let robotFailed = false;
  function renderTurnstile() {
    const box = $('[data-check-turnstile]');
    if (!window.turnstile || !box) return;
    try {
      widget = window.turnstile.render(box, {
        sitekey: form.getAttribute('data-sitekey'),
        theme: 'auto',
        size: 'flexible',
        action: 'check',
        'error-callback': () => {
          robotFailed = true;
        },
      });
    } catch (e) {
      robotFailed = true;
    }
  }
  function loadTurnstile() {
    if (window.turnstile) return renderTurnstile();
    const script = document.createElement('script');
    script.src = form.getAttribute('data-turnstile-src');
    script.async = true;
    script.onload = renderTurnstile;
    script.onerror = () => {
      robotFailed = true;
    };
    document.head.appendChild(script);
  }
  function robotToken() {
    if (!window.turnstile || widget == null) return '';
    try {
      return window.turnstile.getResponse(widget) || '';
    } catch (e) {
      return '';
    }
  }
  function resetRobot() {
    if (window.turnstile && widget != null) {
      try {
        window.turnstile.reset(widget);
      } catch (e) {
        /* a fresh token is fetched on the next attempt anyway */
      }
    }
  }

  // ---------- Messages next to the form ----------

  function showFieldError(input, box, text) {
    box.textContent = text;
    box.hidden = !text;
    if (input) {
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }
  function clearErrors() {
    showFieldError(fields.url, urlError, '');
    showFieldError(fields.id, keyError, '');
    fields.secret.removeAttribute('aria-invalid');
    showFormError('');
  }
  function showFormError(text, retryAfter) {
    formError.textContent = '';
    if (!text) {
      formError.hidden = true;
      return;
    }
    formError.appendChild(el('p', null, text));
    if (retryAfter > 0) formError.appendChild(el('p', null, format(t.retryAfter, { minutes: Math.max(1, Math.ceil(retryAfter / 60)) })));
    formError.hidden = false;
    formError.focus();
  }
  /** Plain text for an API error {code, message, retry_after}. */
  function errorText(error) {
    const code = error && error.code;
    return (t.errors && t.errors[code]) || (error && error.message) || t.errors.unavailable;
  }

  // ---------- Result rows ----------

  const ICON = { pass: '✓', fail: '✗', skip: '–' };
  const seen = new Set();
  let counts = { done: 0 };

  function groupOf(result) {
    if (result.status !== 'skip') return 'ran';
    return ['local', 'api_key', 'fixtures'].indexOf(result.online_tier) !== -1 ? result.online_tier : 'other';
  }

  function row(result) {
    const li = el('li', 'check-row is-' + result.status);
    const head = el('div', 'check-row-head');
    const label = el('span', 'check-status');
    const icon = el('span', 'check-icon', ICON[result.status] || '?');
    icon.setAttribute('aria-hidden', 'true');
    label.append(icon, ' ', (t.status && t.status[result.status]) || result.status);
    head.append(label, el('code', 'check-id', result.id));
    li.appendChild(head);

    li.appendChild(el('p', 'check-text', (t.tests && t.tests[result.id]) || result.title));
    if (result.status === 'pass' && result.online === 'partial') li.appendChild(el('p', 'check-partial', t.partial));

    const link = el('a', 'check-spec', t.specLink);
    link.href = cfg.spec + encodeURIComponent(result.id);
    link.appendChild(el('span', 'sr-only', ' (' + result.id + ')'));
    const links = el('p', 'check-links');
    links.appendChild(link);
    li.appendChild(links);

    const details = el('details', 'check-details');
    const sum = el('summary', null, t.details);
    sum.appendChild(el('span', 'sr-only', ' (' + result.id + ')'));
    details.appendChild(sum);
    details.appendChild(el('p', 'check-title', result.title));
    const messages = result.messages || [];
    if (messages.length) {
      const list = el('ul', 'check-messages');
      messages.forEach((m) => list.appendChild(el('li', null, m)));
      details.appendChild(list);
    } else {
      details.appendChild(el('p', 'small muted', t.noMessages));
    }
    if (typeof result.duration_ms === 'number') details.appendChild(el('p', 'small muted', result.duration_ms + ' ms'));
    li.appendChild(details);
    return li;
  }

  function addResult(result) {
    if (!result || !result.id || seen.has(result.id)) return;
    seen.add(result.id);
    const group = groupOf(result);
    const list = $('[data-list="' + group + '"]', results);
    list.appendChild(row(result));
    $('[data-group="' + group + '"]', results).hidden = false;
    if (group !== 'ran') $('[data-group="skipped"]', results).hidden = false;
    counts.done++;
    status.textContent = format(t.progress, { done: counts.done, total: TOTAL });
  }

  function resetResults() {
    seen.clear();
    counts = { done: 0 };
    results.querySelectorAll('[data-list]').forEach((list) => (list.textContent = ''));
    results.querySelectorAll('[data-group]').forEach((g) => (g.hidden = true));
    summary.hidden = true;
    summary.textContent = '';
    summary.className = 'check-summary';
    meta.hidden = true;
    meta.textContent = '';
    share.hidden = true;
    status.textContent = '';
  }

  // ---------- Summary ----------

  function idList(items) {
    const ul = el('ul', 'check-id-list');
    items.forEach((r) => {
      const li = el('li');
      const a = el('a', null, r.id);
      a.href = cfg.spec + encodeURIComponent(r.id);
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }

  function discoveryUrl(base) {
    try {
      return new URL('/.well-known/obx', base).toString();
    } catch (e) {
      return String(base || '') + '/.well-known/obx';
    }
  }

  function renderSummary(report) {
    const list = report.results || [];
    const failed = report.failed || 0;
    const passed = report.passed || 0;
    const ok = failed === 0 && !report.setup_error && passed > 0;
    summary.textContent = '';
    summary.className = 'check-summary ' + (ok ? 'is-pass' : 'is-fail');

    if (ok) {
      const h = el('h3', 'check-verdict');
      const icon = el('span', 'check-icon', ICON.pass);
      icon.setAttribute('aria-hidden', 'true');
      h.append(icon, ' ', t.summaryPass);
      summary.appendChild(h);
      summary.appendChild(el('p', null, format(t.summaryPassP, { passed, skipped: report.skipped || 0 })));
      const local = list.filter((r) => r.status === 'skip' && r.online_tier === 'local');
      const other = list.filter((r) => r.status === 'skip' && r.online_tier !== 'local');
      if (local.length) {
        summary.appendChild(el('p', 'check-list-title', t.summaryLocal));
        summary.appendChild(idList(local));
      }
      if (other.length) {
        summary.appendChild(el('p', 'check-list-title', t.summaryNotChecked));
        summary.appendChild(idList(other));
      }
      const confirm = el('a', null, t.confirmLink);
      confirm.href = cfg.confirm;
      const p = el('p', 'small');
      p.appendChild(confirm);
      summary.appendChild(p);
    } else {
      const h = el('h3', 'check-verdict');
      const icon = el('span', 'check-icon', ICON.fail);
      icon.setAttribute('aria-hidden', 'true');
      h.append(icon, ' ', failed ? format(t.summaryFail, { failed, ran: passed + failed }) : t.setupTitle);
      summary.appendChild(h);
      const disc = list.find((r) => r.id === 'P-DISC-1');
      if (report.setup_error) {
        const box = el('div', 'check-setup');
        if (failed) box.appendChild(el('p', 'check-setup-title', t.setupTitle));
        const keyProblem = /api key|token request|invalid_client/i.test(report.setup_error);
        box.appendChild(el('p', null, keyProblem ? t.setupKey : t.setupOther));
        box.appendChild(el('p', 'check-setup-raw', report.setup_error));
        summary.appendChild(box);
      } else if (disc && disc.status === 'fail') {
        summary.appendChild(el('p', 'check-setup-title', format(t.noDiscovery, { url: discoveryUrl(report.base_url) })));
      }
      if (failed) summary.appendChild(el('p', null, t.summaryFailP));
    }
    summary.hidden = false;

    meta.textContent = '';
    const add = (label, value) => {
      if (!value) return;
      meta.append(el('dt', null, label), el('dd', null, value));
    };
    add(t.reportPortal, report.base_url);
    add(t.reportSoftware, report.software);
    add(t.reportDate, formatDate(report.started_at));
    add(t.reportSpec, report.spec_commit ? String(report.spec_commit).slice(0, 7) : '');
    meta.hidden = !meta.childNodes.length;
  }

  function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    try {
      return d.toLocaleString(cfg.lang, { dateStyle: 'long', timeStyle: 'short' });
    } catch (e) {
      return d.toISOString();
    }
  }

  function renderReport(report, id, expiresAt) {
    const list = report.results || [];
    if (list.some((r) => !seen.has(r.id)) || seen.size !== list.length) {
      resetResults();
      list.forEach(addResult);
    }
    status.textContent = format(t.progress, { done: list.length, total: list.length || TOTAL });
    renderSummary(report);
    if (id) showShare(id, expiresAt);
  }

  // ---------- Share link ----------

  function shareUrl(id) {
    return location.origin + cfg.share + '?r=' + encodeURIComponent(id);
  }
  function showShare(id, expiresAt) {
    shareLink.value = shareUrl(id);
    shareNote.textContent = expiresAt ? format(t.storedP, { date: formatDate(expiresAt) }) : t.shareP;
    share.hidden = false;
  }
  copyButton.addEventListener('click', () => {
    shareLink.select();
    const done = () => {
      copyButton.textContent = cfg.copied;
      setTimeout(() => (copyButton.textContent = cfg.copy), 2000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(shareLink.value).then(done, () => {});
    else {
      try {
        document.execCommand('copy');
        done();
      } catch (e) {
        /* the link is selected; the visitor can copy it by hand */
      }
    }
  });

  // ---------- Running a check ----------

  let running = false;
  function setRunning(on) {
    running = on;
    submit.disabled = on;
    submit.textContent = on ? t.running : t.submit;
    form.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  function validate() {
    clearErrors();
    const value = fields.url.value.trim();
    let parsed = null;
    try {
      parsed = new URL(value);
    } catch (e) {
      parsed = null;
    }
    if (!parsed || parsed.protocol !== 'https:' || !parsed.hostname) {
      showFieldError(fields.url, urlError, t.urlInvalid);
      fields.url.focus();
      return null;
    }
    const id = fields.id.value.trim();
    const secret = fields.secret.value;
    if (!!id !== !!secret) {
      showFieldError(id ? fields.secret : fields.id, keyError, t.keyIncomplete);
      (id ? fields.secret : fields.id).focus();
      return null;
    }
    const token = robotToken();
    if (!token) {
      showFormError(robotFailed ? t.robotFailed : t.robotMissing);
      return null;
    }
    const body = { url: value, turnstile: token };
    if (id) {
      body.client_id = id;
      body.client_secret = secret;
    }
    return body;
  }

  async function readStream(response, onLine) {
    if (!response.body || !response.body.getReader) {
      (await response.text()).split('\n').forEach(onLine);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        onLine(buffer.slice(0, nl));
        buffer = buffer.slice(nl + 1);
      }
      if (done) break;
    }
    if (buffer.trim()) onLine(buffer);
  }

  async function run(body) {
    setRunning(true);
    resetResults();
    results.hidden = false;
    status.textContent = format(t.progressTitle, { url: body.url });
    heading.focus();
    let finished = false;
    try {
      const response = await fetch(cfg.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        let error = null;
        try {
          error = (await response.json()).error;
        } catch (e) {
          error = { code: 'unavailable' };
        }
        results.hidden = true;
        showFormError(errorText(error), error && error.retry_after);
        return;
      }
      await readStream(response, (line) => {
        if (!line.trim()) return;
        let msg;
        try {
          msg = JSON.parse(line);
        } catch (e) {
          return;
        }
        if (msg.type === 'result') addResult(msg.result);
        else if (msg.type === 'report') {
          finished = true;
          renderReport(msg.report || {}, msg.id);
          if (msg.id) {
            try {
              history.replaceState(null, '', cfg.share + '?r=' + encodeURIComponent(msg.id));
            } catch (e) {
              /* the share link is shown anyway */
            }
          }
          summary.focus();
        } else if (msg.type === 'error') {
          finished = true;
          status.textContent = errorText(msg.error);
          showFormError(errorText(msg.error));
        }
      });
      if (!finished) showFormError(t.errors.internal);
    } catch (e) {
      if (!seen.size) results.hidden = true;
      showFormError(t.errors.network);
    } finally {
      setRunning(false);
      resetRobot();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (running) return;
    const body = validate();
    if (body) run(body);
  });

  // ---------- A stored result: ?r=<id> ----------

  async function loadStored(id) {
    results.hidden = false;
    status.textContent = t.loading;
    try {
      const response = await fetch(cfg.api + '?id=' + encodeURIComponent(id), { headers: { Accept: 'application/json' } });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || !data.report) {
        results.hidden = true;
        showFormError(errorText((data && data.error) || { code: response.status === 404 ? 'not_found' : 'unavailable' }));
        return;
      }
      renderReport(data.report, data.id || id, data.expires_at);
      if (data.report.base_url && !fields.url.value) fields.url.value = data.report.base_url;
    } catch (e) {
      results.hidden = true;
      showFormError(t.errors.network);
    }
  }

  submit.disabled = false;
  loadTurnstile();
  const stored = new URLSearchParams(location.search).get('r');
  if (stored) loadStored(stored);
})();
