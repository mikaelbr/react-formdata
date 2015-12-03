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

## Example

Complete example showing all features of `react-formdata`.

```jsx
// `ocHook` (on change hook) is injected, and used to trigger an aggregated
// change event for the decorated form.
function MyForm ({ title, ocHook }) {
  return (
    <ol>
      <li><input id="a" type="text" onChange={ocHook} value="Hello World" /></li>
      <li><textarea id="b" placeholder="Number" onChange={ocHook}>Hello World</textarea></li>
    </ol>
  );
}

const App = function () {
  return (
    <div>
      <DecoratedMyForm
        title="My Little Form"
        valueMapper={values => Object.assign({}, values, { b: 'Override' })}
        ref={e => console.log(e.getValues())}
        onChange={(values) => console.log(values)} />
    </div>
  );
};

render(<App />, document.querySelector('#app'));
```

The code above would print something like the following, both on mount, and when either
of the inputs change:

```json
{
  "a": "Hello World",
  "b": "Override"
}
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
