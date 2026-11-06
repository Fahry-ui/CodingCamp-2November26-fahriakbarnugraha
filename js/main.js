/**
 * Life Dashboard — main.js
 *
 * Features (MVP):
 *   ✅ Greeting with current time & date
 *   ✅ Focus Timer (start / pause / reset)
 *   ✅ To-Do List (add, edit, complete, delete) + LocalStorage
 *   ✅ Quick Links (add, delete) + LocalStorage
 *
 * Challenges (3 chosen + 2 bonus):
 *   ✅ Light / Dark Mode       (Challenge 1)
 *   ✅ Custom Name in Greeting (Challenge 2)
 *   ✅ Prevent Duplicate Tasks (Challenge 3)
 *   ✅ Sort / Filter Tasks     (bonus)
 *   ✅ Change Pomodoro Time    (bonus)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     UTILITIES
  ========================================================= */

  /** Show a brief toast notification */
  const toastEl = (() => {
    const el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
    return el;
  })();

  let toastTimer = null;
  function showToast(message, type = 'info') {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = `show ${type}`;
    toastTimer = setTimeout(() => { toastEl.className = ''; }, 2800);
  }

  /* =========================================================
     1. CLOCK, DATE & GREETING
  ========================================================= */
  const clockEl    = document.getElementById('clock-display');
  const dateEl     = document.getElementById('date-display');
  const greetingEl = document.getElementById('greeting-text');
  const nameInput  = document.getElementById('user-name-input');

  // Load saved name
  nameInput.value = localStorage.getItem('dashboard_username') || '';

  // Save name on every keystroke
  nameInput.addEventListener('input', () => {
    localStorage.setItem('dashboard_username', nameInput.value.trim());
  });

  function updateClock() {
    const now = new Date();

    // Time — HH:MM:SS
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Date — e.g. "Friday, November 6, 2026"
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric'
    });

    // Greeting based on hour
    const h = now.getHours();
    let greeting;
    if (h >= 5 && h < 12)       greeting = 'Good Morning';
    else if (h >= 12 && h < 17) greeting = 'Good Afternoon';
    else if (h >= 17 && h < 21) greeting = 'Good Evening';
    else                         greeting = 'Good Night';

    greetingEl.textContent = greeting;
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* =========================================================
     2. LIGHT / DARK MODE  (Challenge 1)
  ========================================================= */
  const themeBtn = document.getElementById('theme-toggle');

  function applyTheme(mode) {
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      themeBtn.textContent = '☀️';
      themeBtn.setAttribute('title', 'Switch to light mode');
    } else {
      document.body.classList.remove('dark-mode');
      themeBtn.textContent = '🌙';
      themeBtn.setAttribute('title', 'Switch to dark mode');
    }
  }

  // Apply saved or system preference
  const savedTheme = localStorage.getItem('dashboard_theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  themeBtn.addEventListener('click', () => {
    const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('dashboard_theme', next);
  });

  /* =========================================================
     3. FOCUS TIMER  (with custom duration — bonus challenge)
  ========================================================= */
  const timerDisplay     = document.getElementById('timer-display');
  const timerProgressBar = document.getElementById('timer-progress-bar');
  const customMinInput   = document.getElementById('custom-timer-min');
  const applyBtn         = document.getElementById('timer-apply');

  let totalSeconds    = 25 * 60;  // configured duration
  let timeRemaining   = totalSeconds;
  let timerInterval   = null;
  let timerRunning    = false;

  function renderTimer() {
    const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const secs = String(timeRemaining % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;

    // Progress bar (full → empty)
    const pct = totalSeconds > 0 ? (timeRemaining / totalSeconds) * 100 : 100;
    timerProgressBar.style.width = `${pct}%`;

    // Colour states
    timerDisplay.classList.toggle('running', timerRunning && timeRemaining > 0);
    timerDisplay.classList.toggle('finished', timeRemaining === 0);

    // Update page title for at-a-glance reference
    document.title = (timerRunning && timeRemaining > 0)
      ? `▶ ${mins}:${secs} — Life Dashboard`
      : 'Life Dashboard';
  }

  function startTimer() {
    if (timerRunning || timeRemaining === 0) return;
    timerRunning = true;
    timerInterval = setInterval(() => {
      timeRemaining--;
      renderTimer();
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        renderTimer();
        showToast('⏰ Time is up! Great focus session.', 'success');
        document.title = 'Life Dashboard';
      }
    }, 1000);
    renderTimer();
  }

  function pauseTimer() {
    if (!timerRunning) return;
    clearInterval(timerInterval);
    timerRunning = false;
    renderTimer();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timeRemaining = totalSeconds;
    renderTimer();
    document.title = 'Life Dashboard';
  }

  function applyCustomDuration() {
    const val = parseInt(customMinInput.value, 10);
    if (!val || val < 1 || val > 180) {
      showToast('Enter a duration between 1 and 180 minutes.', 'error');
      customMinInput.value = totalSeconds / 60;
      return;
    }
    clearInterval(timerInterval);
    timerRunning  = false;
    totalSeconds  = val * 60;
    timeRemaining = totalSeconds;
    renderTimer();
    showToast(`⏱ Timer set to ${val} minute${val !== 1 ? 's' : ''}.`, 'info');
  }

  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click',  pauseTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);
  applyBtn.addEventListener('click', applyCustomDuration);

  // Allow pressing Enter in the number input
  customMinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyCustomDuration(); }
  });

  renderTimer();

  /* =========================================================
     4. TO-DO LIST
        Challenges: Prevent Duplicate Tasks (3), Sort/Filter (bonus)
  ========================================================= */
  const todoForm    = document.getElementById('todo-form');
  const todoInput   = document.getElementById('todo-input');
  const todoList    = document.getElementById('todo-list');
  const sortSelect  = document.getElementById('sort-tasks');
  const emptyMsg    = document.getElementById('todo-empty');

  // Duplicate warning element (injected below the input row)
  const dupWarn = document.createElement('p');
  dupWarn.className = 'duplicate-warn';
  dupWarn.textContent = '⚠️ That task already exists!';
  todoForm.insertAdjacentElement('afterend', dupWarn);

  // Load tasks from LocalStorage
  let tasks = (() => {
    try { return JSON.parse(localStorage.getItem('dashboard_tasks')) || []; }
    catch { return []; }
  })();

  function saveTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  }

  function getFilteredTasks() {
    const filter = sortSelect.value;
    if (filter === 'pending')   return tasks.filter(t => !t.completed);
    if (filter === 'completed') return tasks.filter(t =>  t.completed);
    return tasks; // 'all'
  }

  function renderTasks() {
    todoList.innerHTML = '';
    const visible = getFilteredTasks();

    if (visible.length === 0) {
      const msgs = {
        all:       'No tasks yet. Add one above!',
        pending:   'No pending tasks. Well done! 🎉',
        completed: 'No completed tasks yet.'
      };
      emptyMsg.textContent = msgs[sortSelect.value] || '';
    } else {
      emptyMsg.textContent = '';
    }

    visible.forEach((task) => {
      // `task.id` is the real index in `tasks` array
      const realIdx = tasks.indexOf(task);

      const li = document.createElement('li');
      if (task.completed) li.classList.add('completed');

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type      = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked   = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => {
        tasks[realIdx].completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      // Text
      const span = document.createElement('span');
      span.className   = 'task-text';
      span.textContent = task.text;

      // Action buttons
      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className   = 'btn-edit-icon';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
      editBtn.addEventListener('click', () => openEditModal(realIdx));

      const delBtn = document.createElement('button');
      delBtn.className   = 'btn-danger-icon';
      delBtn.textContent = '🗑';
      delBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      delBtn.addEventListener('click', () => {
        tasks.splice(realIdx, 1);
        saveTasks();
        renderTasks();
        showToast('Task deleted.', 'info');
      });

      actions.append(editBtn, delBtn);
      li.append(checkbox, span, actions);
      todoList.appendChild(li);
    });
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    // Challenge 3: Prevent Duplicate Tasks
    const isDuplicate = tasks.some(
      t => t.text.toLowerCase() === text.toLowerCase()
    );

    if (isDuplicate) {
      dupWarn.classList.add('visible');
      todoInput.focus();
      return;
    }

    dupWarn.classList.remove('visible');
    tasks.push({ text, completed: false });
    saveTasks();
    todoInput.value = '';
    renderTasks();
    showToast('Task added!', 'success');
  });

  // Hide duplicate warning as user types
  todoInput.addEventListener('input', () => {
    dupWarn.classList.remove('visible');
  });

  sortSelect.addEventListener('change', renderTasks);
  renderTasks();

  /* ── Edit Task Modal ── */
  const editModal      = document.getElementById('edit-modal');
  const editTaskInput  = document.getElementById('edit-task-input');
  const modalSaveBtn   = document.getElementById('modal-save');
  const modalCancelBtn = document.getElementById('modal-cancel');
  let editingIndex     = -1;

  function openEditModal(index) {
    editingIndex          = index;
    editTaskInput.value   = tasks[index].text;
    editModal.hidden      = false;
    editTaskInput.focus();
    editTaskInput.select();
  }

  function closeEditModal() {
    editModal.hidden = true;
    editingIndex     = -1;
  }

  modalSaveBtn.addEventListener('click', () => {
    const newText = editTaskInput.value.trim();
    if (!newText) return;

    // Prevent duplicate when editing
    const isDuplicate = tasks.some(
      (t, i) => i !== editingIndex && t.text.toLowerCase() === newText.toLowerCase()
    );

    if (isDuplicate) {
      showToast('⚠️ A task with that name already exists.', 'error');
      return;
    }

    tasks[editingIndex].text = newText;
    saveTasks();
    renderTasks();
    closeEditModal();
    showToast('Task updated.', 'success');
  });

  modalCancelBtn.addEventListener('click', closeEditModal);

  // Close modal on backdrop click
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // Save on Enter key in modal input
  editTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); modalSaveBtn.click(); }
    if (e.key === 'Escape') closeEditModal();
  });

  /* =========================================================
     5. QUICK LINKS
  ========================================================= */
  const linkForm       = document.getElementById('link-form');
  const linkNameInput  = document.getElementById('link-name');
  const linkUrlInput   = document.getElementById('link-url');
  const linksContainer = document.getElementById('links-container');
  const linksEmpty     = document.getElementById('links-empty');

  // Default links for first-time visitors
  const DEFAULT_LINKS = [
    { name: 'Google',   url: 'https://google.com' },
    { name: 'YouTube',  url: 'https://youtube.com' },
    { name: 'Gmail',    url: 'https://mail.google.com' },
    { name: 'GitHub',   url: 'https://github.com' }
  ];

  let links = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dashboard_links'));
      return Array.isArray(saved) ? saved : DEFAULT_LINKS;
    } catch { return DEFAULT_LINKS; }
  })();

  function saveLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(links));
  }

  function getFavicon(url) {
    try {
      const { origin } = new URL(url);
      return `https://www.google.com/s2/favicons?sz=32&domain_url=${origin}`;
    } catch { return null; }
  }

  function renderLinks() {
    linksContainer.innerHTML = '';

    if (links.length === 0) {
      linksEmpty.textContent = 'No links yet. Add your favourite sites!';
      return;
    }

    linksEmpty.textContent = '';

    links.forEach((link, idx) => {
      const a = document.createElement('a');
      a.className = 'link-chip';
      a.href      = link.url;
      a.target    = '_blank';
      a.rel       = 'noopener noreferrer';

      const favicon = getFavicon(link.url);
      if (favicon) {
        const img = document.createElement('img');
        img.src    = favicon;
        img.width  = 16;
        img.height = 16;
        img.alt    = '';
        img.style.borderRadius = '2px';
        img.onerror = () => img.remove(); // hide if favicon fails to load
        a.appendChild(img);
      }

      const label = document.createTextNode(link.name);
      a.appendChild(label);

      const delBtn = document.createElement('button');
      delBtn.className   = 'chip-delete';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Remove link: ${link.name}`);
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        links.splice(idx, 1);
        saveLinks();
        renderLinks();
        showToast(`Removed "${link.name}".`, 'info');
      });

      a.appendChild(delBtn);
      linksContainer.appendChild(a);
    });
  }

  linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    let   url  = linkUrlInput.value.trim();

    if (!name || !url) return;

    // Auto-prepend https:// if missing
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    // Basic URL validity check
    try { new URL(url); } catch {
      showToast('Please enter a valid URL.', 'error');
      return;
    }

    links.push({ name, url });
    saveLinks();
    linkNameInput.value = '';
    linkUrlInput.value  = '';
    renderLinks();
    showToast(`Added "${name}"!`, 'success');
  });

  renderLinks();

}); // end DOMContentLoaded
