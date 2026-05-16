const API_URL = 'http://localhost:3000/api';
let editingTaskId = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application démarrée...");
    fetchTasks();

    const taskForm = document.getElementById('task-form');
    const submitBtn = document.getElementById('submit-btn');

    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Soumission du formulaire...");

            const titleInput = document.getElementById('task-title');
            const descInput = document.getElementById('task-desc');

            const title = titleInput.value.trim();
            const description = descInput.value.trim();

            if (!title) {
                alert("Le titre est obligatoire !");
                return;
            }

            // Déterminer si c'est un ajout ou une modification
            const method = editingTaskId ? 'PUT' : 'POST';
            const url = editingTaskId ? `${API_URL}/tasks/${editingTaskId}` : `${API_URL}/tasks`;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description })
                });

                if (response.ok) {
                    console.log("Succès !");
                    // Reset de l'état
                    editingTaskId = null;
                    submitBtn.textContent = "Ajouter";
                    submitBtn.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm active:scale-95";
                    document.getElementById('form-title').textContent = "Ajouter une nouvelle tâche";
                    
                    taskForm.reset();
                    fetchTasks(); // Recharger la liste
                } else {
                    const errorData = await response.json();
                    alert("Erreur serveur : " + errorData.error);
                }
            } catch (err) {
                console.error("Erreur lors de la requête :", err);
                alert("Impossible de contacter le serveur. Est-il lancé ?");
            }
        });
    } else {
        console.error("ERREUR : Le formulaire 'task-form' est introuvable dans le HTML !");
    }
});

async function fetchTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`);
        const tasks = await res.json();
        
        const taskList = document.getElementById('task-list');
        const template = document.getElementById('task-template');
        const taskCount = document.getElementById('task-count');

        taskList.innerHTML = '';
        if (taskCount) taskCount.textContent = `${tasks.length} Tâche${tasks.length > 1 ? 's' : ''}`;

        tasks.forEach(task => {
            const clone = template.content.cloneNode(true);
            const titleElement = clone.querySelector('.task-title');
            const statusSelect = clone.querySelector('.task-status');
            
            titleElement.textContent = task.title;
            clone.querySelector('.task-desc').textContent = task.description || '';
            
            // --- GESTION DU STATUT (Le Select) ---
            statusSelect.value = task.status; 
            applyStatusStyle(statusSelect, task.status, titleElement);

            statusSelect.onchange = async () => {
                const newStatus = statusSelect.value;
                try {
                    await fetch(`${API_URL}/tasks/${task.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    applyStatusStyle(statusSelect, newStatus, titleElement);
                } catch (err) {
                    console.error("Erreur changement statut :", err);
                }
            };

            // --- BOUTON CONSULTER ---
            clone.querySelector('.view-btn').onclick = () => {
                alert(`Détails de la tâche :\n\nStatut : ${task.status.toUpperCase()}\nTitre : ${task.title}\nDescription : ${task.description || 'Aucune description'}`);
            };

            // --- BOUTON MODIFIER ---
            clone.querySelector('.edit-btn').onclick = () => {
                document.getElementById('task-title').value = task.title;
                document.getElementById('task-desc').value = task.description || '';
                
                editingTaskId = task.id;
                document.getElementById('form-title').textContent = "Modifier la tâche";
                const submitBtn = document.getElementById('submit-btn');
                submitBtn.textContent = "Enregistrer les modifications";
                submitBtn.className = "bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm";
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            // --- BOUTON SUPPRIMER ---
            clone.querySelector('.delete-btn').onclick = async () => {
                if(confirm("Supprimer cette tâche ?")) {
                    try {
                        await fetch(`${API_URL}/tasks/${task.id}`, { method: 'DELETE' });
                        fetchTasks();
                    } catch (err) {
                        console.error("Erreur suppression :", err);
                    }
                }
            };
            
            taskList.appendChild(clone);
        });
    } catch (err) {
        console.error("Erreur de récupération :", err);
    }
}

// Fonction pour gérer les couleurs des badges de statut
function applyStatusStyle(selectEl, status, titleEl) {
    // Reset des classes de couleur Tailwind
    selectEl.classList.remove('bg-yellow-100', 'text-yellow-700', 'bg-blue-100', 'text-blue-700', 'bg-green-100', 'text-green-700');
    titleEl.classList.remove('line-through', 'text-slate-400');

    if (status === 'pending') {
        selectEl.classList.add('bg-yellow-100', 'text-yellow-700');
    } else if (status === 'in_progress') {
        selectEl.classList.add('bg-blue-100', 'text-blue-700');
    } else if (status === 'completed') {
        selectEl.classList.add('bg-green-100', 'text-green-700');
        titleEl.classList.add('line-through', 'text-slate-400');
    }
}