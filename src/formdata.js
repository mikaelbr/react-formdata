const React = require('react');
const { findDOMNode } = require('react-dom');

module.exports = formComponent;

function formComponent (ChildComponent) {
  return React.createClass({

    addInput: function (name) {
      return (ref) => {
        if (!this.customInputs) { this.customInputs = {}; }
        this.customInputs[name] = ref;
      };
    },

    getInputs: function () {
      const root = findDOMNode(this);
      return [...root.querySelectorAll('input, select, textarea')];
    },

    getValues: function () {
      const { valueMapper = identity } = this.props;
      return valueMapper(getValuesFromInputs(this.getInputs(), this.customInputs));
    },

    render: function () {
      const { onChange = noop } = this.props;
      return React.createElement(ChildComponent, Object.assign({}, this.props, {
        addInput: this.addInput,
        ocHook: () => onChange(this.getValues())
      }));
    }
  });
}

function getValuesFromInputs (inputs, extra = {}) {
  const fromInputs = inputs.filter(includableInput).reduce((acc, input) =>
    Object.assign({}, acc, { [input.id]: getTypedValue(input) }), {});

  return Object.assign({}, fromInputs, Object.keys(extra).reduce((acc, key) =>
    Object.assign({}, acc, { [key]: getTypedValue(extra[key]) }), {}));
}

function includableInput ({ type, id }) {
  return !(!id || type === 'submit' || type === 'button');
}

function noop () { }
function identity (i) { return i; }

function getTypedValue (input) {
  if (input.type && input.type === 'number') {
    return parseInt(input.value, 10);
  }
  return input.value;
}
