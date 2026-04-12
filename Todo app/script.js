// Handles task creation, deletion, filtering, and progress tracking
// ── Category config ──────────────────────────────────────────
const CATEGORIES = {
  work:     { color: '#a29bfe', label: 'Work' },
  study:    { color: '#00cec9', label: 'Study' },
  personal: { color: '#fd79a8', label: 'Personal' },
  other:    { color: '#fdcb6e', label: 'Other' }
};

// ── State ─────────────────────────────────────────────────────
let tasks      = JSON.parse(localStorage.getItem('taskboard') || '[]');
let filter     = 'all';
let selectedCat = 'work';

// ── DOM refs ──────────────────────────────────────────────────
const taskInput    = document.getElementById('taskInput');
const taskList     = document.getElementById('taskList');
const statText     = document.getElementById('statText');
const pctLabel     = document.getElementById('pctLabel');
const progressFill = document.getElementById('progressFill');
const dateLabel    = document.getElementById('dateLabel');
const addBtn       = document.getElementById('addBtn');
const clearBtn     = document.getElementById('clearBtn');

// ── Set today's date in header ────────────────────────────────
dateLabel.textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

// ── Save to localStorage ──────────────────────────────────────
function save() {
  localStorage.setItem('taskboard', JSON.stringify(tasks));
}

// ── Render task list ──────────────────────────────────────────
function render() {
  const shown = tasks.filter(t => {
    if (filter === 'all')    return true;
    if (filter === 'done')   return t.done;
    if (filter === 'active') return !t.done;
  });

  if (shown.length === 0) {
    taskList.innerHTML = '<p class="empty-msg">No tasks here — add one above!</p>';
  } else {
    taskList.innerHTML = shown.map(t => {
      const cat   = CATEGORIES[t.cat] || CATEGORIES.other;
      const check = t.done ? '&#10003;' : '';
      return `
        <div class="task-item ${t.done ? 'done' : ''}"
             style="--task-color: ${cat.color}">
          <div class="task-check ${t.done ? 'checked' : ''}"
               data-id="${t.id}">${check}</div>
          <div class="task-body">
            <span class="task-text">${t.text}</span>
            <span class="task-tag">${cat.label}</span>
          </div>
          <button class="task-del" data-id="${t.id}">&#x2715;</button>
        </div>
      `;
    }).join('');
  }

  // Update progress stats
  const doneCount = tasks.filter(t => t.done).length;
  const total     = tasks.length;
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  statText.textContent     = `${doneCount} of ${total} done`;
  pctLabel.textContent     = pct + '%';
  progressFill.style.width = pct + '%';
}

// ── Add a task ────────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id:   Date.now().toString(),
    text: text,
    done: false,
    cat:  selectedCat
  });

  taskInput.value = '';
  save();
  render();
}

// ── Toggle done / not done ────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  save();
  render();
}

// ── Remove a task ─────────────────────────────────────────────
function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ── Clear completed tasks ─────────────────────────────────────
function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

// ── Category selection ────────────────────────────────────────
function selectCategory(cat) {
  selectedCat = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('sel');
  });
  document.getElementById('cat-' + cat).classList.add('sel');
}

// ── Filter selection ──────────────────────────────────────────
function setFilter(f) {
  filter = f;
  document.querySelectorAll('.f-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.f-btn[data-filter="${f}"]`).classList.add('active');
  render();
}

// ── Event Listeners ───────────────────────────────────────────

// Add button
addBtn.addEventListener('click', addTask);

// Enter key in input
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Clear completed
clearBtn.addEventListener('click', clearCompleted);

// Category buttons
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => selectCategory(btn.dataset.cat));
});

// Filter buttons
document.querySelectorAll('.f-btn').forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Task list — toggle and delete (event delegation)
taskList.addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('task-check')) {
    toggleTask(id);
  }

  if (e.target.classList.contains('task-del')) {
    removeTask(id);
  }
});

// ── Initial render ────────────────────────────────────────────
render();
