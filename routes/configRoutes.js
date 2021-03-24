const express = require('express');

const configController = require('../controllers/configController');

const router = express.Router();

router.route('/').post(configController.createEntry);

router
  .route('/address/:reg/:adr')
  .get(configController.getEntryByAdr)
  .patch(configController.updateEntyByAdr)
  .delete(configController.deleteEntryByAdr);

module.exports = router;
