const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Si on trouve l'input email, on est sur la page Login, sinon Dashboard
    const isLoginPage = document.getElementById('email') !== null;
    
    if (isLoginPage) {
        initLoginPage();
    } else {
        initDashboardPage();
    }
});

function initLoginPage() {
    const loginForm = document.querySelector('form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                alert("Erreur : " + data.message);
            }
        } catch (err) {
            alert("Vérifie que ton serveur Node tourne sur Ubuntu !");
        }
    });
}

function initDashboardPage() {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    // Sécurité : Rediriger si pas de token
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Afficher l'email de l'utilisateur
    const welcomeSubtitle = document.querySelector('header p');
    if (welcomeSubtitle) welcomeSubtitle.textContent = `Espace de travail : ${userEmail}`;

    const taskList = document.getElementById('task-list');
    const taskTemplate = document.getElementById('task-template');
    const taskCount = document.getElementById('task-count');

    // --- FONCTION DE RENDU ---
    async function fetchAndRenderTasks() {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erreur lors de la récupération");

            const tasks = await res.json();
            
            // On vide la liste actuelle
            taskList.innerHTML = '';

            // Mise à jour du compteur
            if (taskCount) taskCount.textContent = `${tasks.length} Tâche${tasks.length > 1 ? 's' : ''}`;

            tasks.forEach(task => {
                // On clone le template HTML
                const clone = taskTemplate.content.cloneNode(true);
                
                // On remplit les données
                clone.querySelector('.task-title').textContent = task.title;
                const descEl = clone.querySelector('.task-desc');
                if (descEl) descEl.textContent = task.description || 'Pas de description';

                // Gestion de la checkbox (statut)
                const checkbox = clone.querySelector('.task-status');
                if (checkbox) {
                    checkbox.checked = task.completed;
                    if (task.completed) {
                        clone.querySelector('.task-title').classList.add('line-through', 'text-slate-400');
                    }
                }

                // Bouton Supprimer (Test rapide)
                const deleteBtn = clone.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async () => {
                        if (confirm("Supprimer cette tâche ?")) {
                            await fetch(`${API_URL}/tasks/${task.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            fetchAndRenderTasks(); // Recharger la liste
                        }
                    });
                }

                // Ajout au DOM
                taskList.appendChild(clone);
            });
        } catch (err) {
            console.error("Erreur de rendu :", err);
        }
    }

    // Charger les tâches au démarrage
    fetchAndRenderTasks();

    // Logout
    const logoutBtn = document.querySelector('header button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}