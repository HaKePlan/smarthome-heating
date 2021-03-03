const express = require('express');

const router = express.Router();

router.route('/').get((req, res) => {
  res.status(200).json({
    status: 'sucess',
    message: 'this is the getAllModbus route',
  });
});

module.exports = router;
