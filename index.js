var _ = require('lodash');
var _s = require('underscore.string');

function pluralize(amount, word) {
  if (amount != 1) {
    word = word + 's';
  }
  return amount + ' ' + word;
}

var patterns = {
  postal_code: /^\d{5}(-\d{4})?$/,
  email: /^\S+@\S+\.\S+$/,
  username: /^[a-zA-Z0-9-_\.]+$/
}

module.exports = {
  required: function(name, value, active) {
    if (active && !value) {
      return 'parameter "' + name + '" is required';
    }
  },
  min: function(name, value, min) {
    if (value.length < min) {
      return 'parameter "' + name + '" must have a minimum of ' +
        pluralize(min, 'character');
    }
  },
  max: function(name, value, max) {
    if (value.length > max) {
      return 'parameter "' + name + '" must have a maximum of ' +
        pluralize(max, 'character');
    }
  },
  in: function(name, value, array) {
    if (!_.contains(array, value)) {
      var quoted = _.map(array, function(word) {
        return '"' + word + '"';
      });
      var sentence = _s.toSentenceSerial(quoted, ', ', ' or ');
      return 'parameter "' + name + '" must be ' + sentence;
    }
  },
  email: function(name, value, active) {
    if (active && !patterns.email.test(value)) {
      return 'parameter "' + name + '" must be a valid email address';
    }
  },
  postal_code: function(name, value, active) {
    if (active && !patterns.postal_code.test(value)) {
      return 'parameter "' + name + '" must be a valid postal code';
    }
  },
  username: function(name, value, active) {
    if (active && !patterns.username.test(value)) {
      return 'parameter "' + name + '" must only contain letters, numbers, ' +
        'periods, dashes, and underscores';
    }
  }
};
