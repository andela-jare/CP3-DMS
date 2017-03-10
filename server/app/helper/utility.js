// Utility helper methods

const Utility = {
  limitHelper(query, min) {
    if (query < min || query > 10) {
      return false;
    }
    return true;
  },

  limitOffset(req, res) {
    const limitSuccess = this.limitHelper(req.query.limit, 1);
    if (!limitSuccess) {
      return res.status(400).send({
        message: this.limitOffsetMessage('limit', 1)
      });
    }

    if (req.query.offset < 0) {
      return res.status(400).send({
        message: 'Please enter a valid number starting from 0 for offset.'
      });
    }

    req.query.limit = req.query.limit ? +req.query.limit : 10;
    req.query.offset = req.query.offset ? +req.query.offset : 0;

    if (!/^\d+$/.test(req.query.offset) || !/^\d+$/.test(req.query.limit)) {
      return res.status(400).send({
        message: 'Please enter a valid number for both offset and limit.'
      });
    }
    return true;
  },

  limitOffsetMessage(name, min) {
    return `Enter a valid number for ${name} within the range ${min} - 10.`;
  },

};

export default Utility;
