const React = require('react');
const { findDOMNode } = require('react-dom');

module.exports = formData;

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
 * The precedence order for naming is: `Manual > Name attribute > ID attribute`
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
  const extraList = toList(extra);
  const both = inputs.concat(extraList);
  const fromInputs = inputs
    .filter(includableInput)
    .filter(includeItemsNotInList(extraList))
    .reduce((acc, input) =>
      Object.assign({}, acc, {
        [input.name || input.id]: getTypedValue(input, both)
      }), {});

  const fromExtra = Object.keys(extra).reduce((acc, key) =>
    Object.assign({}, acc, {
      [key]: getTypedValue(extra[key], both)
    }), {});

  return Object.assign({}, fromInputs, fromExtra);
}

function includableInput ({ type, id, name }) {
  const hasNameOrId = !!id || !!name;
  return hasNameOrId && type !== 'submit' && type !== 'button';
}

function includeItemsNotInList (list) {
  return (item) => !isInList(list, item);
}

function isInList (list, {name, id}) {
  return list.some(({name: oName, id: oId}) =>
     name === oName || id === oId);
}

function noop () { }
function identity (i) { return i; }

function getTypedValue (input, list) {
  if (input.type === 'number') {
    return parseInt(input.value, 10);
  }
  if (input.type === 'checkbox') {
    return input.checked;
  }
  if (input.type === 'radio') {
    return getCheckedItemFromListWithName(list, input.name);
  }
  if (isTag(input, 'select')) {
    return getValueFromSelect(input);
  }
  return input.value;
}

function getValueFromSelect (select) {
  if (!select.multiple) return select.value;
  return [...select.querySelectorAll('option')]
    .filter(item => item.selected)
    .map(item => item.value);
}

function getCheckedItemFromListWithName (list, name) {
  var selected = list
    .filter(item => item.checked && item.name === name)
    .map(item => item.value);
  if (!selected || !selected.length) return void 0;
  return selected[0];
}

function isTag ({tagName}, expectedTagName) {
  return tagName &&
    tagName.toLowerCase() === expectedTagName.toLowerCase();
}

function toList (obj) {
  return Object.keys(obj).map(k => obj[k]);
}
