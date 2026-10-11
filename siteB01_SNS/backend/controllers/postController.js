const posts = require('../services/postService');
const comments = require('../services/commentService');
const { parseId, parsePaging, handle } = require('../services/httpError');

const str = (v) => (typeof v === 'string' ? v.trim() : '');

exports.feed = handle((req, res) => {
  const { page, limit, offset } = parsePaging(req.query, 8, 60);
  const userId = req.query.user_id ? parseId(req.query.user_id) : null;
  res.json(
    posts.listFeed({
      page,
      limit,
      offset,
      sort: str(req.query.sort),
      filter: str(req.query.filter),
      q: str(req.query.q),
      userId,
    })
  );
});

exports.saved = handle((req, res) => res.json(posts.listSaved()));
exports.get = handle((req, res) => res.json(posts.getPost(parseId(req.params.id))));
exports.create = handle((req, res) => res.status(201).json(posts.createPost(req.body || {})));
exports.update = handle((req, res) => res.json(posts.updatePost(parseId(req.params.id), req.body || {})));
exports.remove = handle((req, res) => res.json(posts.deletePost(parseId(req.params.id))));
exports.like = handle((req, res) => res.json(posts.setLike(parseId(req.params.id), true)));
exports.unlike = handle((req, res) => res.json(posts.setLike(parseId(req.params.id), false)));
exports.save = handle((req, res) => res.json(posts.setSave(parseId(req.params.id), true)));
exports.unsave = handle((req, res) => res.json(posts.setSave(parseId(req.params.id), false)));
exports.listComments = handle((req, res) => res.json(comments.listComments(parseId(req.params.id))));
exports.addComment = handle((req, res) =>
  res.status(201).json(comments.addComment(parseId(req.params.id), (req.body || {}).content))
);
