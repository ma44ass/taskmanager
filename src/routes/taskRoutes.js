const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


// READ : Voir toutes les tâches
router.get('/', taskController.getAllTasks);

// CREATE : Ajouter une tâche
router.post('/', taskController.createTask);

 // UPDATE : Modifier une tache
router.put('/:id', taskController.updateTask); 

 // DELETE : Supprimer une tache
router.delete('/:id', taskController.deleteTask)


module.exports = router;

