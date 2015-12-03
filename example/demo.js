var formData = require('../src/formData');
var { render, findDOMNode } = require('react-dom');
var React = require('react');

function MyForm ({ title, ocHook }) {
  return (
    <form>
      <fieldset>
        <legend>{title}</legend>
        <ol>
          <li><input id="a" type="text" placeholder="Text" onChange={ocHook} /></li>
          <li><input id="b" type="number" placeholder="Number" onChange={ocHook} /></li>
          <li><textarea id="c" placeholder="Number" onChange={ocHook}></textarea></li>
          <li>
            <select id="d" onChange={ocHook}>
              <option value="hello">Hello</option>
              <option value="bye">Bye</option>
            </select>
          </li>
        </ol>

        <input id="submit" type="submit" value="Send" />
        <input id="button" type="button" value="Should be ignored" />
        <input id="hidden" type="hidden" value="Should be included" />
      </fieldset>
    </form>
  );
}

const DecoratedMyForm = formData(MyForm);

const App = function () {
  return (
    <div>
      <h1>My App</h1>
      <DecoratedMyForm
        title="My Little Form"
        valueMapper={values => Object.assign({}, values, {
          hidden: 'Override'
        })}
        ref={e => console.log(e.getValues())}
        onChange={(values) => console.log(values)} />
    </div>
  );
};

render(<App />, document.querySelector('#app'))
