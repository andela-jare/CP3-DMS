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
  },
  getDocument(req, res) {
    return Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).send({ error: 'Document Not found.' });
        }
        if (document.access === 'public' ||
        document.ownerId === req.decoded.userId
        || req.decoded.roleId === 1) {
          return res.status(200).send({ document });
        }

        res.status(403).send({ message: 'You are unauthorized.' });
      })
      .catch(error => res.status(400).send({ error }));
  },
  getDocuments(req, res) {
    return Document.findAll({
      where: {
        $or: [
          {
            ownerId: { $eq: req.decoded.userId },
          },
          {
            access: { $eq: 'public' }
          }
        ]
      },
    })
    .then((document) => {
      res.status(200).send({ document, id: req.decoded.userId });
    })
    .catch(error => res.status(400).send({ error }));
  },
  update(req, res) {
    return Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).send({ error: 'Document Not found' });
        }
        if (document.ownerId !== req.decoded.userId) {
          return res.status(403).send({
            message: 'You are not allowed to view this document.'
          });
        }
        document.update(req.body)
        .then(doc => res.status(200).send(doc));
      })
      .catch(error => res.status(400).send({ error }));
  },
  destroy(req, res) {
    return Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).send({ error: 'Document Not found' });
        }
        if (document.ownerId !== req.decoded.userId &&
        req.decoded.roleId !== 1
        ) {
          return res.status(403).send({
            message: 'This document does not belong to you.'
          });
        }
        document.destroy()
        .then(() => res.status(200).send({
          message: 'Document successfully deleted!'
        }));
      })
      .catch(error => res.status(400).send({ error }));
  },
  usersDocument(req, res) {
    return Document.findAll({
      where: {
        ownerId: req.params.id
      }
    })
    .then((documents) => {
      res.status(200).send({ documents });
    })
    .catch(error => res.status(400).send({ error }));
  }
};
