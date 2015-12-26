const { assert } = require('chai');
const { renderIntoDocument, Simulate } = require('react-addons-test-utils');
const { findDOMNode } = require('react-dom');

const formData = require('../src/formdata');

describe('formdata', function () {
  describe('on mount', function () {
    it('should include all inputs with name', function (done) {
      const MyForm = formData(() =>
        <p>
          <input name="a" type="text" readOnly="readOnly" value="Hello World"/>
          <input name="b" type="text" readOnly="readOnly" value="Bye World"/>
        </p>
      );
      renderAndExpect(MyForm, {
        a: 'Hello World',
        b: 'Bye World'
      }, done);
    });

    it('should include all inputs with id', function (done) {
      const MyForm = formData(() =>
        <p>
          <input id="a" type="text" readOnly="readOnly" value="Hello World"/>
          <input id="b" type="text" readOnly="readOnly" value="Bye World"/>
        </p>
      );
      renderAndExpect(MyForm, {
        a: 'Hello World',
        b: 'Bye World'
      }, done);
    });

    it('should be able to return values from text', function (done) {
      const MyForm = formData(() =>
        <p><input id="a" type="text" readOnly="readOnly" value="Hello World"/></p>
      );
      renderAndExpect(MyForm, { a: 'Hello World' }, done);
    });

    it('should be able to return values from select', function (done) {
      const MyForm = formData(() =>
        <div>
          <select value="a" id="a" readOnly="readOnly">
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
          </select>
        </div>
      );
      renderAndExpect(MyForm, { a: 'a' }, done);
    });

    it('should be able to return values from select with multiple values', function (done) {
      const MyForm = formData(() =>
        <div>
          <select id="input" value={['b', 'c']} readOnly="readOnly" multiple={true}>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
          </select>
        </div>
      );
      renderAndExpect(MyForm, {
        input: ['b', 'c']
      }, done);
    });

    it('should be able to return values from textarea', function (done) {
      const MyForm = formData(() =>
        <p><textarea id="a" readOnly="readOnly" value="Hello World"></textarea></p>
      );
      renderAndExpect(MyForm, { a: 'Hello World' }, done);
    });

    it('should be able to return values from number', function (done) {
      const MyForm = formData(() =>
        <p><input id="a" type="number" readOnly="readOnly" value="42"/></p>
      );
      renderAndExpect(MyForm, { a: 42 }, done);
    });

    it('should be able to return values from checkboxes', function (done) {
      const MyForm = formData(() =>
        <div>
          <p><input id="a" type="checkbox" readOnly="readOnly" checked="checked"/></p>
          <p><input id="b" type="checkbox" readOnly="readOnly" /></p>
          <p><input id="c" type="checkbox" readOnly="readOnly" checked="checked"/></p>
        </div>
      );
      renderAndExpect(MyForm, {
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
      renderAndExpect(MyForm, {
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
      renderAndExpect(MyForm, {
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
      renderAndExpect(MyForm, {
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
      renderAndExpect(MyForm, {
        z: 'b'
      }, done);
    });

    it('should allow name to take precedence over id', function (done) {
      const MyForm = formData(() =>
        <p><input id="a" name="z" type="text" readOnly="readOnly" value="Hello World"/></p>
      );
      renderAndExpect(MyForm, { z: 'Hello World' }, done);
    });
  });

  describe('onChange', function () {
    it('should be able to return values from text', function (done) {
      const expected = 'Foobar';
      const MyForm = formData(({ocHook}) =>
        <p><input id="a" onChange={ocHook} type="text" value="Hello World"/></p>
      );
      renderAndExpectWhenChangeTriggered(MyForm, { a: expected }, expected, done);
    });

    it('should be able to return values from select', function (done) {
      const expected = 'b';
      const MyForm = formData(({ocHook}) =>
        <div>
          <select value="a" id="a" onChange={ocHook}>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
          </select>
        </div>
      );
      renderAndExpectWhenChangeTriggered(MyForm, { a: expected }, expected, done, 'select');
    });

    it('should be able to return values from select with multiple values', function (done) {
      const MyForm = formData(({ocHook}) =>
        <div>
          <select id="input" value={['a']} onChange={ocHook} multiple={true}>
            <option onChange={ocHook} value="a">A</option>
            <option onChange={ocHook} value="b">B</option>
            <option onChange={ocHook} value="c">C</option>
          </select>
        </div>
      );

      const out = renderAndExpectOnChange(MyForm, {
        input: ['b', 'c']
      }, done);

      const select = findDOMNode(out).querySelector('select');
      const inputs = [...findDOMNode(out).querySelectorAll('option')];
      inputs.forEach(function (item, index) {
        item.selected = index !== 0;
      });
      Simulate.change(select);
    });

    it('should be able to return values from textarea', function (done) {
      const expected = 'Foobar';
      const MyForm = formData(({ocHook}) =>
        <p><textarea id="a" onChange={ocHook} value="Hello World"></textarea></p>
      );
      renderAndExpectWhenChangeTriggered(MyForm, { a: expected }, expected, done, 'textarea');
    });

    it('should be able to return values from number', function (done) {
      const expected = 50;
      const MyForm = formData(({ocHook}) =>
        <p><input id="a" onChange={ocHook} type="number" value="42"/></p>
      );
      renderAndExpectWhenChangeTriggered(MyForm, { a: expected }, expected, done);
    });

    it('should be able to return values from checkboxes', function (done) {
      const MyForm = formData(({ocHook}) =>
        <div>
          <p><input id="a" onChange={ocHook} type="checkbox" checked="checked"/></p>
          <p><input id="b" onChange={ocHook} type="checkbox" /></p>
          <p><input id="c" onChange={ocHook} type="checkbox" checked="checked"/></p>
        </div>
      );

      var out = renderAndExpectOnChange(MyForm, {
        a: true,
        b: true,
        c: true
      }, done);

      const node = findDOMNode(out).querySelector('#b');
      node.checked = true;
      Simulate.change(node);
    });

    it('should be able to return values from radios grouped by name', function (done) {
      const MyForm = formData(({ocHook}) =>
        <div>
          <p><input name="x" onChange={ocHook} type="radio" value="a" /></p>
          <p><input name="x" onChange={ocHook} id="b" type="radio" value="b" /></p>
          <p><input name="x" onChange={ocHook} type="radio" value="c" checked="checked"/></p>
        </div>
      );

      const out = renderAndExpectOnChange(MyForm, {
        x: 'b'
      }, done);

      const node = findDOMNode(out).querySelector('#b');
      node.checked = true;
      Simulate.change(node);
    });
  });

  describe('mapping', function () {
    it('should respect mapping on mount', function (done) {
      const expected = { a: 'HELLO WORLD' };
      const mapper = data => ({ a: data.a.toUpperCase() });
      const MyForm = formData(() =>
        <p><input id="a" type="text" readOnly="readOnly" value="Hello World"/></p>
      );

      const refListener = function (ref) {
        assert.deepEqual(ref.getValues(), expected);
        done();
      };
      renderIntoDocument(<MyForm ref={refListener} valueMapper={mapper} />);
    });

    it('should respect mapping on change', function (done) {
      const expected = { a: 'HELLO WORLD' };
      const mapper = data => ({ a: data.a.toUpperCase() });
      const MyForm = formData(({ocHook}) =>
        <p><input id="a" type="text" onChange={ocHook} value=""/></p>
      );

      const onChangeListener = function (data) {
        assert.deepEqual(data, expected);
        done();
      };

      const out = renderIntoDocument(<MyForm
          onChange={onChangeListener}
          valueMapper={mapper} />);
      const node = findDOMNode(out).querySelector('input');
      node.value = 'Hello World';
      Simulate.change(node);
    });
  });
});

function renderAndExpect (Component, expected, done) {
  const refListener = function (ref) {
    assert.deepEqual(ref.getValues(), expected);
    done();
  };
  renderIntoDocument(<Component ref={refListener} />);
}

function renderAndExpectWhenChangeTriggered (Comp, expected, change, done, type = 'input') {
  const onChangeListener = function (data) {
    assert.deepEqual(data, expected);
    done();
  };

  const out = renderIntoDocument(<Comp onChange={onChangeListener} />);
  const node = findDOMNode(out).querySelector(type);
  node.value = change;
  Simulate.change(node);
}

function renderAndExpectOnChange (Comp, expected, done) {
  const onChangeListener = function (data) {
    assert.deepEqual(data, expected);
    done();
  };

  return renderIntoDocument(<Comp onChange={onChangeListener} />);
}
