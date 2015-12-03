const { assert } = require('chai');
const { renderIntoDocument } = require('react-addons-test-utils');
const jsdom = require('jsdom');

const formData = require('../src/formdata');

describe('formdata', function () {
  it('should be able to return values on mount', function (done) {
    const MyForm = formData(() =>
      <p><input id="a" type="text" readOnly="readOnly" value="Hello World"/></p>
    );

    const refListener = function (ref) {
      assert.deepEqual(ref.getValues(), { a: 'Hello World' });
      done();
    };
    renderIntoDocument(<MyForm ref={refListener} />);
  });
});
