# react-formdata

> **Note:** Library not published to NPM yet, but will be soon. Still in concept phase. Feel free
> to test it out by installing the master (`npm i mikaelbr/react-formdata`) and let me know
> what you think by Github Issues.

A library for generating an object of values from a set of inputs in React. Either by auto detecting
all inputs with an ID, or manually adding inputs with specified name.

This is handy in cases where you want to dispatch an action to a global state and don't want the
boiler plate of extracting all values yourself. See example below for usage.

## Install

Install from NPM:

```shell
$ npm install --save react-formdata
```

## Usage

### formData(Decoratee) ⇒ <code>Component</code>

Creates a higher order component for easier form data handling using React. Especially handy
when using global application state and a functional style approach to UI development.

By default, `formData` will generate values from every input fields **with ID-attribute**
(textarea, input, select) except submit and general buttons. To ignore a input, you can
either add a mapper removing it, or simply not add ID. If you want the input to have
a different name, you can map it or use the injected `addInput` to explicitly add the
form input with a name. This is also useful in cases where you don't want an ID on
your input data.

Injects the following properties to the decorated component.
* `addInput(inputName)` - Manually add input, with data name specified as argument
* `ocHook(synteticEvent)` - onChange hook. Use this when you want onChange to be triggered. Most cases every input in your decoratee should have a `onChange={ocHook}`. Is composable

**Kind**: module
**Returns**: <code>Component</code> - Decorated Component - The newly derived component with additional behaviour.

| Param | Type | Description |
| --- | --- | --- |
| Decoratee | <code>Component</code> | component you'd like to decorate with form data behaviour. |

**Example**
Using onChange hook to aggregate and create a common onChange listener with data
```jsx
// `ocHook` is injected from `formData`:
var MyForm = formData(function ({ addInput, ocHook }) {
  return (
    <ol>
      <li><input id="a" type="text" onChange={ocHook} value="Hello World" /></li>
      <li><textarea ref={addInput('b')} onChange={ocHook}>Hello World</textarea></li>
    </ol>
  );
});
const App = function () {
  return <DecoratedMyForm onChange={(values) => console.log(values)} />;
};
```
Outputs something like
```json
{
  "a": "Hello World",
  "b": "Hello World"
}
```

Returned formData decorated `Component`: A React Component with the added behaviour of form data handling.
All properties passed to decorated component, is transitive. This means it will be passed to the
decoratee. In addition, two properties are injected to the decoratee; `addInput` and `ocHook`. @see formData

Decorated component has two props callbacks you can use:
* `valueMapper(Object) -> Object` - Takes values and returns new mapped values. If you want to transform some of the data before triggering `onChange` or `getData`.
* `onChange(Object)` - callback triggered when some of the decoratee triggers the on change hook. Is called with data values as argument.

In addition to props, you can use React refs to get the initial value when component is mounted:
**Example**
```jsx
<DecoratedForm ref={function (inputRef) {
  // Now the node is mounted, and we have a ref to it. We can access data and inputs:
  var myFormInputs = inputRef.getInputs();
  var myFormData   = inputRef.getValues(); // Will respect value mapper

  // You also have access to `addInput`:
  addInput('customInput')(ReactDOM.findDOMNode(this).querySelector('.custom'));
}} />
```

## Contribute

Contributions are very welcome. To get the project running locally, you have to do the following:

```shell
$ git clone https://github.com/mikaelbr/react-formdata
$ cd react-formdata
$ npm install
$ npm test
```

You can test out the example by doing:

```shell
$ cd example/
$ npm install
$ npm run build
$ open index.html
```
