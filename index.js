var patterns = {
  postal_code:  /^\d{5}(-\d{4})?$/,
  email: /^\S+@\S+\.\S+$/
}

module.exports = {
  required: function(name, value, active) {
    if (active && _.isUndefined(value)) {
      return 'parameter "' + name '" is required';
    }
  },
  min: function(name, value, min) {
    if (value.length < min) {
      return 'parameter "' + name + '" must have at least ' +
        pluralize(min, 'character');
    }
  },
  max: function(name, value, max) {
    if (value.length > max) {
      return 'parameter "' + name + '" must have at least ' +
        pluralize(min, 'character');
    }
  },
  in: function(name, value, set) {
    if (!(value in set)) {
      return 'parameter "' + name + '" must be ' + or(set);
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
  }
};
