document.addEventListener('DOMContentLoaded', () => {
  // Identify which page we are currently on
  const isLoginPage = document.getElementById('email') !== null;

  if (isLoginPage) {
    initLoginPage();
  } else {
    initDashboardPage();
  }
});

// ==========================================
// 1. LOGIN PAGE LOGIC
// ==========================================
function initLoginPage() {
  const loginForm = document.querySelector('form');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Basic simulation: Accept any valid structured input for demo purposes
    if (email && password.length >= 4) {
      // Save login state
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);

      // Redirect to dashboard (Assumes dashboard is named dashboard.html)
      window.location.href = 'dashboard.html';
    } else {
      alert('Please enter a valid email and a password (min 4 characters).');
    }
  });
}

// ==========================================
// 2. DASHBOARD PAGE LOGIC
// ==========================================
function initDashboardPage() {
  // --- Auth Guard ---
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
    return;
  }

  // --- DOM Elements ---
  const logoutBtn = document.querySelector('header button');
  const taskForm = document.getElementById('task-form');
  const taskTitleInput = document.getElementById('task-title');
  const taskDescInput = document.getElementById('task-desc');
  const taskList = document.getElementById('task-list');
  const taskCount = document.getElementById('task-count');
  const taskTemplate = document.getElementById('task-template');
  const submitBtn = taskForm.querySelector('button[type="submit"]');

  // --- State Tracking ---
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let editingTaskId = null; // Tracks if we are editing an existing task

  // Update user welcome subtitle with logged email
  const welcomeSubtitle = document.querySelector('header p');
  if (welcomeSubtitle && localStorage.getItem('userEmail')) {
    welcomeSubtitle.textContent = `Espace de travail : ${localStorage.getItem('userEmail')}`;
  }

  // --- Functions ---
  
  // Render all tasks to the DOM
  function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
      // Clone the template content
      const clone = taskTemplate.content.cloneNode(true);
      const li = clone.querySelector('li');
      
      // Select elements inside template
      const titleEl = clone.querySelector('.task-title');
      const descEl = clone.querySelector('.task-desc');
      const dateEl = clone.querySelector('.task-date');
      const checkbox = clone.querySelector('.task-status');
      const viewBtn = clone.querySelector('.view-btn');
      const editBtn = clone.querySelector('.edit-btn');
      const deleteBtn = clone.querySelector('.delete-btn');

      // Populate text
      titleEl.textContent = task.title;
      descEl.textContent = task.description || 'Pas de description';
      dateEl.textContent = `Créé le : ${task.date}`;

      // Checkbox state
      checkbox.checked = task.completed;
      if (task.completed) {
        titleEl.classList.add('line-through', 'text-slate-400');
        descEl.classList.add('text-slate-400');
      }

      // --- Event Listeners per Task Row ---

      // Toggle Complete Status
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        saveToLocalStorage();
        renderTasks();
      });

      // Consulter (View details via simple alert)
      viewBtn.addEventListener('click', () => {
        alert(`Détails de la tâche :\n\nTitre : ${task.title}\nDescription : ${task.description || 'Aucune'}\nStatut : ${task.completed ? 'Fait' : 'À faire'}\nDate : ${task.date}`);
      });

      // Modifier (Populate form for updates)
      editBtn.addEventListener('click', () => {
        taskTitleInput.value = task.title;
        taskDescInput.value = task.description;
        editingTaskId = task.id;
        submitBtn.textContent = 'Enregistrer';
        submitBtn.classList.replace('bg-blue-600', 'bg-amber-600');
        submitBtn.classList.replace('hover:bg-blue-700', 'hover:bg-amber-700');
        taskTitleInput.focus();
      });

      // Delete Task
      deleteBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
          tasks = tasks.filter(t => t.id !== task.id);
          saveToLocalStorage();
          renderTasks();
          
          // Cancel editing if the currently editing item gets deleted
          if (editingTaskId === task.id) resetForm();
        }
      });

      // Append row to the list
      taskList.appendChild(clone);
    });

    // Update global task count UI badge
    taskCount.textContent = `${tasks.length} Tâche${tasks.length > 1 ? 's' : ''}`;
  }

  // Synchronize state with LocalStorage
  function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Reset Form states back to normal adding mode
  function resetForm() {
    taskForm.reset();
    editingTaskId = null;
    submitBtn.textContent = 'Ajouter';
    submitBtn.classList.replace('bg-amber-600', 'bg-blue-600');
    submitBtn.classList.replace('hover:bg-amber-700', 'hover:bg-blue-700');
  }

  // --- Form & Action Listeners ---

  // Handle Form Submission (Add OR Edit)
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();

    if (!title) return;

    if (editingTaskId) {
      // Edit mode
      tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
          return { ...task, title, description };
        }
        return task;
      });
    } else {
      // Add mode
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        completed: false,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      tasks.push(newTask);
    }

    saveToLocalStorage();
    renderTasks();
    resetForm();
  });
  const API_URL = 'http://localhost:3000/api'; // or whatever your port is

  // Logout routine
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
  });

  // Initial dashboard load render
  renderTasks();
}