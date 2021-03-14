const express = require('express');

const modbusController = require('../controllers/modbusController');

const router = express.Router();

router
  .route('/')
  .get(modbusController.getAllEntrys)
  .post(modbusController.createEntry); // only for testing and dev

router
  .route('/address/:reg/:add')
  .get(modbusController.getEntryByAdr)
  .patch(modbusController.updateEntyByAdr);

router.route('/home').get(modbusController.getHomeEntrys);
router.route('/alarm').get(modbusController.getAllAlarm);

module.exports = router;
