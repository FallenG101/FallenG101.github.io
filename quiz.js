// One point per question; checkbox answers must match exactly.
const questions = [
  { type: 'text', prompt: 'What does DNS stand for?', answers: ['domain name system'], answer: 'Domain Name System' },
  { type: 'text', prompt: 'What abbreviation describes how long a resolver may cache a DNS answer?', answers: ['ttl', 'time to live'], answer: 'TTL (time to live)' },
  { type: 'radio', prompt: 'Which DNS record holds an IPv4 address?', options: ['A', 'AAAA', 'MX', 'NS'], answers: ['A'], answer: 'A' },
  { type: 'radio', prompt: 'Which record identifies mail servers for a domain?', options: ['TXT', 'MX', 'A', 'AAAA'], answers: ['MX'], answer: 'MX' },
  { type: 'radio', prompt: 'What does a recursive resolver do?', options: ['Looks up DNS answers for a device', 'Creates a website’s content', 'Manufactures network hardware', 'Registers every domain itself'], answers: ['Looks up DNS answers for a device'], answer: 'Looks up DNS answers for a device' },
  { type: 'check', prompt: 'Which of these are DNS record types? Select all that apply.', options: ['A', 'AAAA', 'MX', 'JPEG'], answers: ['A', 'AAAA', 'MX'], answer: 'A, AAAA, and MX' },
  { type: 'radio', prompt: 'Which server holds the official records for a DNS zone?', options: ['Authoritative name server', 'Web browser', 'Mail client', 'Search engine'], answers: ['Authoritative name server'], answer: 'Authoritative name server' },
  { type: 'radio', prompt: 'What does DNS caching do?', options: ['Temporarily saves answers for reuse', 'Permanently prevents DNS updates', 'Encrypts every website', 'Creates IP addresses'], answers: ['Temporarily saves answers for reuse'], answer: 'Temporarily saves answers for reuse' },
  { type: 'radio', prompt: 'In www.example.com, which is the top-level domain?', options: ['www', 'example', '.com', 'www.example'], answers: ['.com'], answer: '.com' },
  { type: 'radio', prompt: 'What does DNSSEC help a validating resolver check?', options: ['The origin and integrity of signed DNS data', 'The visual layout of a website', 'The speed of a computer processor', 'Whether all DNS traffic is encrypted'], answers: ['The origin and integrity of signed DNS data'], answer: 'The origin and integrity of signed DNS data' }
];
const form = document.querySelector('#quiz');
const container = document.querySelector('#questions');
const results = document.querySelector('#results');
const startButton = document.querySelector('#start');
const resetButton = document.querySelector('#reset');
const timer = document.querySelector('#timer');
let startedAt, clock, submitted = false;
const limit = 600000;

// Add labels and fieldsets for accessibility.
questions.forEach((q, i) => {
  const field = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = `${i + 1}. ${q.prompt}`;
  field.append(legend);
  if (q.type === 'text') {
    const label = document.createElement('label');
    label.textContent = 'Your answer: ';
    const input = document.createElement('input');
    input.type = 'text'; input.name = `q${i}`; input.autocomplete = 'off';
    label.append(input); field.append(label);
  } else {
    q.options.forEach(option => {
      const label = document.createElement('label'); label.className = 'option';
      const input = document.createElement('input');
      input.type = q.type === 'check' ? 'checkbox' : 'radio'; input.name = `q${i}`; input.value = option;
      label.append(input, document.createTextNode(` ${option}`)); field.append(label);
    });
  }
  container.append(field);
});
function displayTime(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
function tick() {
  const remaining = Math.max(0, limit - (Date.now() - startedAt));
  timer.textContent = `Time remaining: ${displayTime(remaining)}`;
  if (!remaining) finish(true);
}
startButton.addEventListener('click', () => {
  startedAt = Date.now(); submitted = false; startButton.hidden = true; resetButton.hidden = true;
  results.hidden = true; form.hidden = false; form.querySelector('input').focus();
  tick(); clock = setInterval(tick, 250);
});
form.addEventListener('submit', event => { event.preventDefault(); finish(Date.now() - startedAt >= limit); });
// Unanswered questions are incorrect, including on timeout.
function finish(timedOut) {
  if (submitted) return;
  submitted = true; clearInterval(clock);
  const elapsed = Math.min(limit, Date.now() - startedAt);
  const data = new FormData(form); let score = 0;
  results.replaceChildren();
  const heading = document.createElement('h2'); heading.textContent = 'Your results'; results.append(heading);
  const summary = document.createElement('p'); results.append(summary);
  questions.forEach((q, i) => {
    const values = data.getAll(`q${i}`).map(value => value.trim().toLowerCase());
    const expected = q.answers.map(value => value.toLowerCase());
    const correct = q.type === 'text' ? values.length === 1 && expected.includes(values[0]) : values.length === expected.length && expected.every(value => values.includes(value));
    if (correct) score++;
    const item = document.createElement('p'); item.className = 'result-item';
    const status = document.createElement('strong'); status.className = correct ? 'correct' : 'incorrect';
    status.textContent = `${i + 1}. ${correct ? 'Correct' : 'Incorrect'} — ${correct ? 1 : 0}/1`;
    item.append(status, document.createElement('br'), document.createTextNode(`Your answer: ${data.getAll(`q${i}`).join(', ') || 'No answer'} | Correct answer: ${q.answer}`));
    results.append(item);
  });
  summary.textContent = `${timedOut ? 'Time is up. ' : ''}${score >= 7 ? 'Passed' : 'Not passed'} — ${score}/10 (${score * 10}%). Time spent: ${displayTime(elapsed)}.`;
  form.hidden = true; results.hidden = false; resetButton.hidden = false; results.focus();
}
resetButton.addEventListener('click', () => {
  clearInterval(clock); form.reset(); results.replaceChildren(); results.hidden = true; form.hidden = true;
  resetButton.hidden = true; startButton.hidden = false; timer.textContent = 'Time remaining: 10:00'; startButton.focus();
});
