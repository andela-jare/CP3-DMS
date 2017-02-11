import { Document } from '../../models';

module.exports = {
  create(req, res) {
    return Document.create({
      title: req.body.title,
      content: req.body.content,
      access: req.body.access,
      ownerId: req.decoded.userId
    })
    .then(document => res.status(200).send({ document }))
    .catch(error => res.status(400).send({ error }));
  }
};
