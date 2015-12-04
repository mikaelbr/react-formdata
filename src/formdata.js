const React = require('react');
const { findDOMNode } = require('react-dom');

module.exports = formComponent;

/**
 * Creates a higher order component for easier form data handling using React. Especially handy
 * when using global application state and a functional style approach to UI development.
 *
 * By default, `formData` will generate values from every input fields **with ID-attribute**
 * (textarea, input, select) except submit and general buttons. To ignore a input, you can
 * either add a mapper removing it, or simply not add ID. If you want the input to have
 * a different name, you can map it or use the injected `addInput` to explicitly add the
 * form input with a name. This is also useful in cases where you don't want an ID on
 * your input data.
 *
 * Injects the following properties to the decorated component.
 * * `addInput(inputName)` - Manually add input, with data name specified as argument
 * * `ocHook(synteticEvent)` - onChange hook. Use this when you want onChange to be triggered. Most cases every input in your decoratee should have a `onChange={ocHook}`. Is composable
 *
 * @example
 * Using onChange hook to aggregate and create a common onChange listener with data
 * ```jsx
 * // `ocHook` is injected from `formData`:
 * var MyForm = formData(function ({ addInput, ocHook }) {
 *   return (
 *     <ol>
 *       <li><input id="a" type="text" onChange={ocHook} value="Hello World" /></li>
 *       <li><textarea ref={addInput('b')} onChange={ocHook}>Hello World</textarea></li>
 *     </ol>
 *   );
 * });
 * const App = function () {
 *   return <DecoratedMyForm onChange={(values) => console.log(values)} />;
 * };
 * ```
 * Outputs something like
 * ```json
 * {
 *   "a": "Hello World",
 *   "b": "Hello World"
 * }
 * ```
 *
 *
 * Returned formData decorated `Component`: A React Component with the added behaviour of form data handling.
 * All properties passed to decorated component, is transitive. This means it will be passed to the
 * decoratee. In addition, two properties are injected to the decoratee; `addInput` and `ocHook`. @see formData
 *
 * Decorated component has two props callbacks you can use:
 * * `valueMapper(Object) -> Object` - Takes values and returns new mapped values. If you want to transform some of the data before triggering `onChange` or `getData`.
 * * `onChange(Object)` - callback triggered when some of the decoratee triggers the on change hook. Is called with data values as argument.
 *
 * In addition to props, you can use React refs to get the initial value when component is mounted:
 * @example
 * ```jsx
 * <DecoratedForm ref={function (inputRef) {
 *   // Now the node is mounted, and we have a ref to it. We can access data and inputs:
 *   var myFormInputs = inputRef.getInputs();
 *   var myFormData   = inputRef.getValues(); // Will respect value mapper
 *
 *   // You also have access to `addInput`:
 *   addInput('customInput')(ReactDOM.findDOMNode(this).querySelector('.custom'));
 * }} />
 * ```
 *
 * @param {Component} Decoratee - component you'd like to decorate with form data behaviour.
 * @returns {Component} Decorated Component - The newly derived component with additional behaviour.
 **/
function formData (ChildComponent) {

  /**
   * formData decorated `Component`. A React Component with the added behaviour of form data handling.
   * All properties passed to decorated component, is transitive. This means it will be passed to the
   * decoratee. In addition, two properties are injected to the decoratee; `addInput` and `ocHook`. @see formData
   *
   * Decorated component has two props callbacks you can use:
   * * `valueMapper(Object) -> Object` - Takes values and returns new mapped values. If you want to transform some of the data before triggering `onChange` or `getData`.
   * * `onChange(Object)` - callback triggered when some of the decoratee triggers the on change hook. Is called with data values as argument.
   *
   * In addition to props, you can use React refs to get the initial value when component is mounted:
   * @example
   * ```jsx
   * <DecoratedForm ref={function (inputRef) {
   *   // Now the node is mounted, and we have a ref to it. We can access data and inputs:
   *   var myFormInputs = inputRef.getInputs();
   *   var myFormData   = inputRef.getValues(); // Will respect value mapper
   *
   *   // You also have access to `addInput`:
   *   addInput('customInput')(ReactDOM.findDOMNode(this).querySelector('.custom'));
   * }} />
   * ```
   * @param Properties - Properties to react component
   **/
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
        ocHook: (e) => {
          onChange(this.getValues());
          return e;
        }
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
