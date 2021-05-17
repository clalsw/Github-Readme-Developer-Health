var express = require('express');
var router = express.Router();


var chartview = require('../views/chartview');
router.get('/chart', chartview.renderChart);
var badgeview = require('../views/badgeview');
router.get('/badge', badgeview.renderBadge);
module.exports = router;
