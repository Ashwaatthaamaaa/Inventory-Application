const express = require('express');
const controller = require('../controllers/controller');
const router = express.Router();

router.get('/', controller.getList);
router.post('/add-watch', controller.addToWatch);

module.exports = router;

