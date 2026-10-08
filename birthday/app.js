(() => {
  const c = window.BIRTHDAY;
  const key = 'dasha-birthday-v3';
  const stages = ['Старт', 'Чемпионка', 'Тайник №1', 'Танцор', 'Можно всё', 'Планы', 'Тайник №2', 'Любовь', 'От Вани', 'Подарок'];
  let state = { step: 0, unlocked: 0, answers: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && Number.isInteger(saved.step) && Number.isInteger(saved.unlocked) && saved.step >= 0 && saved.step <= saved.unlocked && saved.unlocked < stages.length) {
      const answers = {};
      c.questions.forEach((q, i) => { const a = saved.answers?.[i]; if (Number.isInteger(a) && a >= 0 && a < q.answers.length && (q.correctIndex === undefined || a === q.correctIndex)) answers[i] = a; });
      state = { step: saved.step, unlocked: saved.unlocked, answers };
    }
  } catch {}
  const content = document.querySelector('#content');
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  const add = (tag, text, cls) => content.appendChild(el(tag, text, cls));
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  function button(text, action, cls = 'primary') { const b = add('button', text, cls); b.onclick = action; return b; }
  function next() { state.step = Math.min(state.step + 1, stages.length - 1); state.unlocked = Math.max(state.unlocked, state.step); save(); render(true); }
  function question(index) {
    const q = c.questions[index];
    add('span', `ВОПРОС ${String(index + 1).padStart(2, '0')} / ${String(c.questions.length).padStart(2, '0')}`, 'badge'); add('h2', q.title); add('p', q.text, 'question-text');
    const choices = add('div', '', 'choices'); const feedback = add('div', '', 'feedback'); feedback.setAttribute('role', 'status');
    function result(i) {
      choices.querySelectorAll('button').forEach((b, n) => { b.disabled = true; b.classList.toggle('selected', i === n); });
      feedback.replaceChildren(el('span', '✦ ВЕРДИКТ', 'feedback-label'), el('p', q.responses?.[i] ?? q.response));
      if (q.aside) feedback.append(el('small', q.aside));
      feedback.classList.add('success');
      button('Забрать следующий этап →', next);
    }
    q.answers.forEach((answer, i) => {
      const b = el('button', '', 'choice'); b.append(el('span', ['А', 'Б', 'В', 'Г'][i], 'choice-letter'), el('span', answer)); choices.append(b);
      b.onclick = () => {
        if (q.correctIndex !== undefined && i !== q.correctIndex) { feedback.textContent = q.hints[i]; feedback.classList.add('nudge'); b.classList.add('wrong'); b.setAttribute('aria-describedby', 'answer-hint'); feedback.id = 'answer-hint'; return; }
        state.answers[index] = i; save(); result(i); content.querySelector('.primary').focus();
      };
    });
    if (Object.hasOwn(state.answers, index)) result(state.answers[index]);
  }
  function hunt(title, text, code, number) {
    add('span', `ПОБОЧНЫЙ КВЕСТ 0${number}`, 'badge'); add('h2', title); add('p', text);
    const mission = add('div', '', 'mission'); mission.append(el('span', '↗'), el('span', 'Отойди от компьютера. Найди записку. Вернись с кодом.'));
    const form = add('form'); const label = el('label', 'СЕКРЕТНОЕ СЛОВО ИЗ ЗАПИСКИ', 'label'); label.htmlFor = 'code';
    const input = el('input'); input.id = 'code'; input.autocomplete = 'off'; input.placeholder = 'Введи слово из найденной записки.'; input.required = true;
    const error = el('div', '', 'error'); error.id = 'code-error'; error.setAttribute('role', 'status'); input.setAttribute('aria-describedby', error.id);
    const submit = el('button', 'Я нашла. Открывай →', 'primary'); submit.type = 'submit'; form.append(label, input, error, submit);
    form.onsubmit = event => { event.preventDefault(); if (input.value.trim().toLocaleLowerCase('ru') === code.trim().toLocaleLowerCase('ru')) next(); else { error.textContent = 'Не тот код. Загляни в записку — там всё без шифра Цезаря.'; input.setAttribute('aria-invalid', 'true'); input.focus(); } };
    if (state.unlocked > state.step) button('Этот тайник уже найден →', next, 'secondary');
  }
  function render(focus = false) {
    document.querySelectorAll('.confetti').forEach(n => n.remove());
    content.replaceChildren(); content.style.animation = 'none'; void content.offsetWidth; content.style.animation = '';
    document.querySelector('#chapter').textContent = stages[state.step].toUpperCase();
    document.querySelector('#counter').textContent = `${String(state.step + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`;
    document.querySelector('#route-status').textContent = `${state.unlocked} / ${stages.length - 1} этапов открыто`;
    const progress = document.querySelector('#progress'); progress.style.setProperty('--progress', `${state.unlocked / (stages.length - 1) * 100}%`);
    progress.replaceChildren(...stages.map((name, i) => {
      const b = el('button', '', `route-step${i === state.step ? ' current' : ''}${i < state.unlocked ? ' done' : ''}`);
      b.append(el('span', i < state.unlocked ? '✓' : String(i + 1).padStart(2, '0'), 'route-number'), el('span', name, 'route-name'));
      b.disabled = i > state.unlocked; b.setAttribute('aria-label', `${name}${b.disabled ? ', пока закрыто' : ', открыть этап'}`);
      if (i === state.step) b.setAttribute('aria-current', 'step');
      b.onclick = () => { state.step = i; save(); render(true); }; return b;
    }));
    switch (state.step) {
      case 0: add('span', 'ДОСТУП: ТОЛЬКО ИМЕНИННИЦЕ', 'badge'); add('h2', 'Жiнка, у нас тут спецоперация.'); add('p', 'Пять вопросов. Два тайника. Один главный подарок. Проверим твою интуицию, устроим пару вылазок и отметим новый уровень как положено.'); const chips = add('div', '', 'chips'); ['05 вопросов', '02 тайника', '01 легенда'].forEach(t => chips.append(el('span', t))); button('Погнали. Мне уже 30 →', next); add('small', 'Правила простые: не торопиться, подозревать подвох и получать удовольствие.', 'fine-print'); break;
      case 1: question(0); break;
      case 2: hunt('Экспедиция в бельевой хаос', 'Первая зацепка — в шкафу с твоим бельём. Да, среди этого великолепного бардака. Что именно искать, поймёшь на месте. Я верю в тебя. И немного боюсь за поисковую группу.', c.firstCode, 1); break;
      case 3: question(1); break;
      case 4: question(2); break;
      case 5: question(3); break;
      case 6: hunt('Подними уровень. Буквально.', 'Следующая зацепка — на верхней полке шкафа. Содержимое засекречено: сначала доберись, потом разберёмся. Если понадобится помощь с высотой, рядом есть один доброволец.', c.secondCode, 2); break;
      case 7: question(4); break;
      case 8: add('span', 'ЛАДНО, МИНУТКА БЕЗ ПОДКОЛОВ', 'badge'); add('h2', 'Котик, а если серьёзно.'); add('p', c.letter, 'letter'); add('span', 'Твой Ваня ♡', 'signature'); button('Так, а где главный подарок? →', next); break;
      case 9: add('span', 'МИССИЯ ВЫПОЛНЕНА', 'badge'); add('h2', 'С днём рождения, крысочка!'); const gift = add('div', '', 'gift'); gift.append(el('small', 'WILDBERRIES / ПОДАРОЧНЫЙ СЕРТИФИКАТ'), el('h3', c.giftTitle), el('span', 'WB', 'gift-mark')); add('p', c.giftText); if (c.certificateFile) { const a = add('a', 'Забрать мой лут ↗', 'gift-link'); a.href = c.certificateFile; a.target = '_blank'; a.rel = 'noopener'; } else add('p', 'Посмотри на меня! Сейчас я должен торжественно вручить сертификат. Ваня, это твой выход.', 'handoff'); button('Ещё конфетти. Я заслужила ✦', celebrate, 'secondary'); celebrate(); break;
    }
    if (focus) { const h = content.querySelector('h2'); h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function celebrate() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 55; i++) { const p = el('span', ['✦', '●', '▪'][i % 3], 'confetti'); p.style.left = Math.random() * 100 + 'vw'; p.style.color = ['#d4ff62', '#ff7eb8', '#a78bff'][i % 3]; p.style.animationDelay = Math.random() + 's'; document.body.append(p); setTimeout(() => p.remove(), 5200); }
  }
  document.querySelector('#reset').onclick = () => { if (confirm('Сбросить весь прогресс и начать праздник заново?')) { state = { step: 0, unlocked: 0, answers: {} }; save(); render(true); } };
  document.querySelector('#home').onclick = event => { event.preventDefault(); state.step = 0; save(); render(true); };
  const sound = document.querySelector('#sound');
  if (c.musicFile) { const audio = new Audio(c.musicFile); audio.loop = true; sound.onclick = async () => { if (audio.paused) { try { await audio.play(); sound.setAttribute('aria-pressed', 'true'); sound.lastElementChild.textContent = 'Выключить музыку'; } catch { sound.lastElementChild.textContent = 'Не удалось открыть музыку'; } } else { audio.pause(); sound.setAttribute('aria-pressed', 'false'); sound.lastElementChild.textContent = 'Включить музыку'; } }; } else sound.hidden = true;
  render();
})();
