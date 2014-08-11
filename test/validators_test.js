var _ = require('lodash');
var async = require('async');
var assert = require('assert');

var valids = require('..');

function validatorAssert(validator, value, param, result) {
  assert.equal(valids.rules[validator]('name', value, param), result);
}

describe('validators', function() {

  it('should validate "required"', function() {
    var message = 'attribute "name" is required'
    validatorAssert('required', 'value', false, null);
    validatorAssert('required', 'value', true, null);
    validatorAssert('required', null, true, message);
    validatorAssert('required', undefined, true, message);
    validatorAssert('required', '', true, message);
  });

  it('should validate "min"', function() {
    validatorAssert('min', 'value', 4, null);
    validatorAssert('min', 'value', 5, null);
    validatorAssert('min', 'value', 6,
      'attribute "name" must have a minimum of 6 characters');
    validatorAssert('min', '', 1,
      'attribute "name" must have a minimum of 1 character');
  });

  it('should validate "max"', function() {
    validatorAssert('max', 'value', 6, null);
    validatorAssert('max', 'value', 5, null);
    validatorAssert('max', 'value', 4,
      'attribute "name" must have a maximum of 4 characters');
    validatorAssert('max', 'va', 1,
      'attribute "name" must have a maximum of 1 character');
  });

  it('should validate "choice"', function() {
    validatorAssert('choice', 'value', ['foo', 'value'], null);
    validatorAssert('choice', 'value', ['foo', 'bar'],
      'attribute "name" must be "foo" or "bar"');
    validatorAssert('choice', 'value', ['foo', 'bar', 'baz'],
      'attribute "name" must be "foo", "bar", or "baz"');
  });

  it('should validate "email"', function() {
    var message = 'attribute "name" must be a valid email address';
    validatorAssert('email', 'fake-email', false, null);
    validatorAssert('email', 'fake-email', true, message);
    validatorAssert('email', 'johndoe@example', true, message);
    validatorAssert('email', 'johndoe@example.', true, message);
    validatorAssert('email', 'johndoe@example.com', true, null);
  });

  it('should validate "postal_code"', function() {
    var message = 'attribute "name" must be a valid postal code'
    validatorAssert('postal_code', '1234', false, null);
    validatorAssert('postal_code', '1234', true, message);
    validatorAssert('postal_code', '123456', true, message);
    validatorAssert('postal_code', '12345-12345', true, message);
    validatorAssert('postal_code', '12345', true, null);
    validatorAssert('postal_code', '12345-6789', true, null);
  });

  it('should validate "username"', function() {
    var message = 'attribute "name" must only contain letters, numbers, ' +
      'periods, dashes, and underscores';
    validatorAssert('username', 'validUsername', false, null);
    validatorAssert('username', 'validUsername', true, null);
    validatorAssert('username', 'a1.-_', true, null);
    validatorAssert('username', 'a1.-_!', true, message);
    validatorAssert('username', ' ', true, message);
  });
});

describe('#validate()', function() {

  var schema = {
    name: {
      rules: {
        required: true
      }
    },
    email: {
      rules: {
        required: true,
        email: true
      }
    }
  };

  var options = {schema: schema};

  it('should validate nonexistent fields by default', function(done) {
    var testOptions = {schema: schema};
    valids.validate({}, options, function(messages) {
      assert.deepEqual(messages, {
        name: 'attribute "name" is required',
        email: 'attribute "email" is required'
      });
      done();
    });
  });

  it('should not validate nonexistent fields when validateAll is set ' +
    'to false', function(done) {
    var testOptions = {schema: schema, validateAll: false};
    valids.validate({}, testOptions, function(messages) {
      assert.equal(messages, null);
      done();
    });
  });

  it('should validate rules', function(done) {
    var values = {name: 'me', email: 'a@b.c', unspecified: true};
    valids.validate(values, options, function(messages) {
      assert.equal(messages, null);
      done();
    });
  });

  it('should validate with custom rule functions', function(done) {
    var testOptions = {
      schema: {
        custom: {
          rules: {
            customValidator: function(value, cb) {
              if (value === 'correct') {
                cb();
              } else {
                cb('customValidator message');
              }
            }
          }
        }
      }
    };

    async.parallel([
      function(cb) {
        valids.validate({custom: 'correct'}, testOptions, function(messages) {
          assert.equal(messages, null);
          cb();
        });
      },
      function(cb) {
        valids.validate({custom: 'fail'}, testOptions, function(messages) {
          assert.deepEqual(messages, {custom: 'customValidator message'});
          cb();
        });
      }
    ], done);
  });

  it('should use custom messages', function(done) {
    var testOptions = {
      schema: {
        email: {
          rules: {
            email: true
          }
        }
      },
      messages: {
        email: _.template('field "<%= name %>" failed')
      }
    };

    valids.validate({email: 'fake'}, testOptions, function(messages) {
      assert.deepEqual(messages, {email: 'field "email" failed'});
      done();
    });
  });
});
