const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// AUTHROUTES
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// USERROUTES
// protect all routes after this line
// router.use(authController.protect);
router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe);
router.patch('/updateMyPassword', authController.updatePassword);

// ADMINROUTES
// restrict to admin, all routes after
// router.use(authController.restrictTo('admin', 'sudoer'));
router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);
router
  .route('/id/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
