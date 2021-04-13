const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);

router
  .route('/')
  .post(userController.createUser)
  .get(userController.getAllUser);

router.route('/id/:id').get(userController.getUser);

module.exports = router;
