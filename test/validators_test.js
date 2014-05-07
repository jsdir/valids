var assert = require('assert');

var valids = require('..');

function validatorAssert(validator, value, param, result) {
  assert.equal(valids[validator]('name', value, param), result);
}

describe('validators', function() {

  it('should validate "required"', function() {
    var message = 'parameter "name" is required'
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
      'parameter "name" must have a minimum of 6 characters');
    validatorAssert('min', '', 1,
      'parameter "name" must have a minimum of 1 character');
  });

  it('should validate "max"', function() {
    validatorAssert('max', 'value', 6, null);
    validatorAssert('max', 'value', 5, null);
    validatorAssert('max', 'value', 4,
      'parameter "name" must have a maximum of 4 characters');
    validatorAssert('max', 'va', 1,
      'parameter "name" must have a maximum of 1 character');
  });

  it('should validate "in"', function() {
    validatorAssert('in', 'value', ['foo', 'value'], null);
    validatorAssert('in', 'value', ['foo', 'bar'],
      'parameter "name" must be "foo" or "bar"');
    validatorAssert('in', 'value', ['foo', 'bar', 'baz'],
      'parameter "name" must be "foo", "bar", or "baz"');
  });

  it('should validate "email"', function() {
    var message = 'parameter "name" must be a valid email address';
    validatorAssert('email', 'fake-email', false, null);
    validatorAssert('email', 'fake-email', true, message);
    validatorAssert('email', 'johndoe@example', true, message);
    validatorAssert('email', 'johndoe@example.', true, message);
    validatorAssert('email', 'johndoe@example.com', true, null);
  });

  it('should validate "postal_code"', function() {
    var message = 'parameter "name" must be a valid postal code'
    validatorAssert('postal_code', '1234', false, null);
    validatorAssert('postal_code', '1234', true, message);
    validatorAssert('postal_code', '123456', true, message);
    validatorAssert('postal_code', '12345-12345', true, message);
    validatorAssert('postal_code', '12345', true, null);
    validatorAssert('postal_code', '12345-6789', true, null);
  });

  it('should validate "username"', function() {
    var message = 'parameter "name" must only contain letters, numbers, ' +
      'periods, dashes, and underscores';
    validatorAssert('username', 'validUsername', false, null);
    validatorAssert('username', 'validUsername', true, null);
    validatorAssert('username', 'a1.-_', true, null);
    validatorAssert('username', 'a1.-_!', true, message);
    validatorAssert('username', ' ', true, message);
  });
});
