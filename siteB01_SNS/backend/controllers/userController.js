const users = require('../services/userService');
const { ME_ID } = require('../services/constants');
const { parseId, handle } = require('../services/httpError');

exports.me = handle((req, res) => res.json(users.getUser(ME_ID)));
exports.stories = handle((req, res) => res.json(users.listStories()));
exports.list = handle((req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  res.json(
    users.listUsers({
      recommend: req.query.recommend === '1' || req.query.recommend === 'true',
      q: typeof req.query.q === 'string' ? req.query.q.trim() : '',
      limit,
    })
  );
});
exports.get = handle((req, res) => res.json(users.getUser(parseId(req.params.id))));
exports.following = handle((req, res) => res.json(users.listFollowing(parseId(req.params.id))));
exports.follow = handle((req, res) => res.json(users.follow(parseId(req.params.id))));
exports.unfollow = handle((req, res) => res.json(users.unfollow(parseId(req.params.id))));
