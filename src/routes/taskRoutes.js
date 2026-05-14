const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


// READ : Voir toutes les tâches
router.get('/', taskController.getAllTasks);

module.exports = router;