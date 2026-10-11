const { resetAll } = require('../services/resetService');
const { handle } = require('../services/httpError');

exports.reset = handle((req, res) => res.json(resetAll()));
