'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');

describe('ReactDOMFiber', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('是否能将一个字符串作为子组件进行渲染？', () => {
    const Box = ({ value }) => <div>{ value }</div>;
    ReactDOM.render(<Box value="foo" />, container);
    expect(container.textContent).toEqual('foo');
  });
});