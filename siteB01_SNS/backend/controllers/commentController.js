const comments = require('../services/commentService');
const { parseId, handle } = require('../services/httpError');

exports.remove = handle((req, res) => res.json(comments.deleteComment(parseId(req.params.id))));
