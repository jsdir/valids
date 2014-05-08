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

templates = {
  required: _.template('parameter "<%= name %>" is required'),
  min: _.template('parameter "<%= name %>" must have a minimum of <%= min %>'),
  max: _.template('parameter "<%= name %>" must have a maximum of <%= max %>'),
  in: _.template('parameter "<%= name %>" must be <%= choices %>'),
  email: _.template('parameter "<%= name %>" must be a valid email address'),
  postal_code: _.template('parameter "<%= name %>" must be a valid postal ' +
    'code'),
  username: _.template('parameter "<%= name %>" must only contain letters, ' +
    'numbers, periods, dashes, and underscores')
}

module.exports = {
  required: function(name, value, active, template) {
    if (active && !value) {
      return (template || templates.required)({name: name});
    }
  },
  min: function(name, value, min, template) {
    if (value.length < min) {
      return (template || templates.min)({
        name: name,
        min: pluralize(min, 'character')
      });
    }
  },
  max: function(name, value, max, template) {
    if (value.length > max) {
      return (template || templates.max)({
        name: name,
        max: pluralize(max, 'character')
      });
    }
  },
  in: function(name, value, array, template) {
    if (!_.contains(array, value)) {
      var quoted = _.map(array, function(word) {return '"' + word + '"';});
      var choices = _s.toSentenceSerial(quoted, ', ', ' or ');
      return (template || templates.in)({choices: choices, name: name});
    }
  },
  email: function(name, value, active, template) {
    if (active && !patterns.email.test(value)) {
      return (template || templates.email)({name: name});
    }
  },
  postal_code: function(name, value, active, template) {
    if (active && !patterns.postal_code.test(value)) {
      return (template || templates.postal_code)({name: name});
    }
  },
  username: function(name, value, active, template) {
    if (active && !patterns.username.test(value)) {
      return (template || templates.username)({name: name});
    }
  }
};
