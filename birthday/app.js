(() => {
  const c = window.BIRTHDAY;
  const key = 'dasha-birthday-step';
  let step = 0;
  try { const saved = Number(localStorage.getItem(key)); if (Number.isInteger(saved) && saved >= 0 && saved <= 6) step = saved; } catch {}
  const content = document.querySelector('#content');
  const titles = ['ПРИГЛАШЕНИЕ', 'ГЛАВНАЯ ГЕРОИНЯ', 'ПЕРВЫЙ СЕКРЕТ', 'НЕМНОГО ПРО НАС', 'ВТОРОЙ СЕКРЕТ', 'ПИСЬМО ДЛЯ ТЕБЯ', 'ТВОЙ ПОДАРОК'];
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  const add = (tag, text, cls) => content.appendChild(el(tag, text, cls));
  const button = (text, action, cls = 'primary') => { const b = add('button', text, cls); b.addEventListener('click', action); return b; };
  function next() { if (step < 6) step++; try { localStorage.setItem(key, String(step)); } catch {} render(); }
  function question(q) {
    add('span', '♡', 'symbol'); add('h2', q.title); add('p', q.text);
    const choices = add('div', '', 'choices');
    q.answers.forEach((answer, i) => { const b = el('button', answer, 'choice'); choices.append(b); b.onclick = () => { choices.remove(); add('p', q.responses[i], 'hint'); button('Продолжить →', next).focus(); }; });
  }
  function hunt(title, text, code) {
    add('span', '✧', 'symbol'); add('h2', title); add('p', text);
    const form = add('form'); const label = el('label', 'Слово из твоей записки', 'label'); label.htmlFor = 'code';
    const input = el('input'); input.id = 'code'; input.autocomplete = 'off'; input.placeholder = 'Нашла? Введи секретное слово'; input.required = true;
    const error = el('div', '', 'error'); error.id = 'code-error'; error.setAttribute('role', 'status'); input.setAttribute('aria-describedby', error.id);
    const submit = el('button', 'Открыть следующий секрет →', 'primary'); submit.type = 'submit'; form.append(label, input, error, submit);
    form.onsubmit = event => { event.preventDefault(); if (input.value.trim().toLocaleLowerCase('ru') === code.trim().toLocaleLowerCase('ru')) next(); else { error.textContent = 'Попробуй ещё раз, котик. Слово ждёт в записке ♡'; input.setAttribute('aria-invalid', 'true'); input.focus(); } };
  }
  function render() {
    content.replaceChildren(); content.style.animation = 'none'; void content.offsetWidth; content.style.animation = '';
    document.querySelector('#chapter').textContent = titles[step]; document.querySelector('#counter').textContent = `0${step + 1} / 07`;
    document.querySelector('#progress').replaceChildren(...titles.map((_, i) => el('span', '', `dot${i <= step ? ' active' : ''}`)));
    if (step === 0) { add('span', '✉', 'symbol'); add('h2', 'Дашуля, это тебе.'); add('p', 'Сегодня можно быть самой счастливой, немного капризной и совершенно собой. Я приготовил для тебя маленькое приключение. Готова найти все сюрпризы?'); button('Открыть мой праздник →', next); }
    if (step === 1) question(c.questions[0]);
    if (step === 2) hunt('Первая остановка — маленький хаос', 'Загляни в шкаф, туда, где живёт твоё бельё. Среди этого творческого беспорядка спряталось кое-что от меня. Найди записку, прочитай её и возвращайся ♡', c.firstCode);
    if (step === 3) question(c.questions[1]);
    if (step === 4) hunt('А теперь — чуть выше', 'Есть вещи, которые хочется дарить просто потому, что ты есть. Загляни на верхнюю полку шкафа. Там тебя ждёт следующий сюрприз и ещё одно секретное слово.', c.secondCode);
    if (step === 5) { add('span', '♡', 'symbol'); add('h2', 'Самое важное — словами'); add('p', c.letter); button('И ещё кое-что для тебя →', next); }
    if (step === 6) { add('span', '✦', 'symbol'); add('h2', 'С днём рождения, котик!'); const gift = add('div', '', 'gift'); gift.append(el('small', 'ДЛЯ ДАШИ · С ЛЮБОВЬЮ'), el('h3', c.giftTitle)); add('p', c.giftText); if (c.certificateFile) { const a = add('a', 'Открыть сертификат ♡', 'gift-link'); a.href = c.certificateFile; a.target = '_blank'; a.rel = 'noopener'; } else add('p', 'А теперь посмотри на меня. Сертификат я вручу тебе лично ♡', 'hint'); celebrate(); }
  }
  function celebrate() { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; for (let i = 0; i < 35; i++) { const p = el('span', ['♡', '✦', '·'][i % 3], 'confetti'); p.style.left = Math.random() * 100 + 'vw'; p.style.color = ['#bb7788', '#cba56c', '#e1adba'][i % 3]; p.style.animationDelay = Math.random() + 's'; document.body.append(p); setTimeout(() => p.remove(), 5200); } }
  document.querySelector('#reset').onclick = () => { if (confirm('Начать праздник заново?')) { step = 0; try { localStorage.removeItem(key); } catch {} render(); } };
  document.querySelector('#home').onclick = event => event.preventDefault();
  const sound = document.querySelector('#sound');
  if (c.musicFile) { const audio = new Audio(c.musicFile); audio.loop = true; sound.onclick = async () => { if (audio.paused) { try { await audio.play(); sound.setAttribute('aria-pressed', 'true'); sound.lastElementChild.textContent = 'Выключить музыку'; } catch { sound.lastElementChild.textContent = 'Не удалось открыть музыку'; } } else { audio.pause(); sound.setAttribute('aria-pressed', 'false'); sound.lastElementChild.textContent = 'Добавить музыку'; } }; } else sound.hidden = true;
  render();
})();
