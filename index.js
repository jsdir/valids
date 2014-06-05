var _ = require('lodash');
var _s = require('underscore.string');
var async = require('async');

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

var templates = {
  required: _.template('parameter "<%= name %>" is required'),
  min: _.template('parameter "<%= name %>" must have a minimum of <%= min %>'),
  max: _.template('parameter "<%= name %>" must have a maximum of <%= max %>'),
  choice: _.template('parameter "<%= name %>" must be <%= choices %>'),
  email: _.template('parameter "<%= name %>" must be a valid email address'),
  postal_code: _.template('parameter "<%= name %>" must be a valid postal ' +
    'code'),
  username: _.template('parameter "<%= name %>" must only contain letters, ' +
    'numbers, periods, dashes, and underscores')
}

var rules = {
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
  choice: function(name, value, array, template) {
    if (!_.contains(array, value)) {
      var quoted = _.map(array, function(text) {return _s.quote(text);});
      var choices = _s.toSentenceSerial(quoted, ', ', ' or ');
      return (template || templates.choice)({choices: choices, name: name});
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

/**
 * Validates rules within a rule group asynchronously. This will stop
 * validating on first validation failure or error and will pass the message
 * as the error to the callback.
 */
function validateRuleGroup(group, options, value, cb) {
  var displayName = options.displayName;
  var messages = options.messages;

  async.each(_.keys(group), function(ruleName, cb) {
    var param = group[ruleName];
    if (_.isFunction(param)) {
      param(value, cb);
    } else {
      var message = null;
      var messageTemplate = null;

      if (options.messages) {
        messageTemplate = options.messages[ruleName];
      }

      message = rules[ruleName](displayName, value, param, messageTemplate);
      cb(message);
    }
  }, cb);
}

/**
 * Validates a field and stops validating on first validation failure or error.
 */
function validateField(field, options, cb) {
  // Get a user-friendly display name for the field.
  var displayName = field.displayName || field.name;

  // Get an array of rules grouped by priority with first and last in the
  // array corresponding to first and last in validation order.
  var rules = [];
  if (_.isArray(field.schema.rules)) {
    rules = field.schema.rules;
  } else if (field.schema.rules) {
    rules = [field.schema.rules];
  }

  // Validate individual rule groups synchronously.
  async.eachSeries(rules, function(group, cb) {
    validateRuleGroup(group, {
      displayName: displayName,
      messages: options.messages
    }, field.value, cb);
  }, cb);
}

/**
 * Validates all values in the data against the fields given in the schema.
 *
 * This function can be used to validate single fields by letting `data` be a
 * single key-value pair.
 */
function validate(data, options, cb) {
  var valid = true;
  var messages = {};

  if (options.validateAll !== false) {
    data = _.extend(_.object(_.map(_.keys(options.schema), function(name) {
      return [name, null];
    })), data);
  }

  // Validate fields asynchronously. Do not stop on any field-level validation
  // failures.
  async.each(_.keys(data), function(name, cb) {
    if (name in options.schema) {
      validateField({
        schema: options.schema[name],
        name: name,
        value: data[name]
      }, options, function(message) {
        if (message) {
          valid = false;
          messages[name] = message;
        }
        cb();
      });
    } else {
      cb();
    }
  }, function() {
    if (valid) {
      cb(null, data);
    } else {
      cb(messages);
    }
  });
}

module.exports = {
  validate: validate,
  rules: rules
};
