const { assert } = require('chai');
const { renderIntoDocument } = require('react-addons-test-utils');

const formData = require('../src/formdata');

describe('formdata', function () {
  describe('on mount', function () {
    it('should be able to return values from text', function (done) {
      const MyForm = formData(() =>
        <p><input id="a" type="text" readOnly="readOnly" value="Hello World"/></p>
      );
      renderComponentWithExpectedData(MyForm, { a: 'Hello World' }, done);
    });

    it('should be able to return values from textarea', function (done) {
      const MyForm = formData(() =>
        <p><textarea id="a" readOnly="readOnly" value="Hello World"></textarea></p>
      );
      renderComponentWithExpectedData(MyForm, { a: 'Hello World' }, done);
    });

    it('should be able to return values from number', function (done) {
      const MyForm = formData(() =>
        <p><input id="a" type="number" readOnly="readOnly" value="42"/></p>
      );
      renderComponentWithExpectedData(MyForm, { a: 42 }, done);
    });

    it('should be able to return values from checkboxes', function (done) {
      const MyForm = formData(() =>
        <div>
          <p><input id="a" type="checkbox" readOnly="readOnly" checked="checked"/></p>
          <p><input id="b" type="checkbox" readOnly="readOnly" /></p>
          <p><input id="c" type="checkbox" readOnly="readOnly" checked="checked"/></p>
        </div>
      );
      renderComponentWithExpectedData(MyForm, {
        a: true,
        b: false,
        c: true
      }, done);
    });

    it('should be able to return values from radios grouped by name', function (done) {
      const MyForm = formData(() =>
        <div>
          <p><input name="x" type="radio" value="a" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="b" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="c" readOnly="readOnly" checked="checked"/></p>
        </div>
      );
      renderComponentWithExpectedData(MyForm, {
        x: 'c'
      }, done);
    });

    it('should be able to return values from radios grouped by name overriden by addInput', function (done) {
      const MyForm = formData(({addInput}) =>
        <div>
          <p><input name="x" ref={addInput('z')} type="radio" value="a" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="b" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="c" readOnly="readOnly" checked="checked"/></p>
        </div>
      );
      renderComponentWithExpectedData(MyForm, {
        z: 'c'
      }, done);
    });

    it('should be able to return values from radios grouped by name even if id is present', function (done) {
      const MyForm = formData(() =>
        <div>
          <p><input name="x" id='z' type="radio" value="a" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="b" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="c" readOnly="readOnly" checked="checked"/></p>
        </div>
      );
      renderComponentWithExpectedData(MyForm, {
        x: 'c'
      }, done);
    });

    it('should be able to return values from radios grouped by name overriden by addInput not dependent on order', function (done) {
      const MyForm = formData(({addInput}) =>
        <div>
          <p><input name="x" type="radio" value="a" readOnly="readOnly" /></p>
          <p><input name="x" ref={addInput('z')} type="radio" value="b" checked="checked" readOnly="readOnly" /></p>
          <p><input name="x" type="radio" value="c" readOnly="readOnly"/></p>
        </div>
      );
      renderComponentWithExpectedData(MyForm, {
        z: 'b'
      }, done);
    });
  });
});

function renderComponentWithExpectedData (Component, data, done) {
  const refListener = function (ref) {
    assert.deepEqual(ref.getValues(), data);
    done();
  };
  renderIntoDocument(<Component ref={refListener} />);
}
