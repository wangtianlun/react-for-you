'use strict';

import { isTSAnyKeyword } from "@babel/types";

let React;
let ReactDOM;
let ReactTestUtils;

describe('ReactDOM', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    ReactTestUtils = require('react-dom/test-utils');
  });
  it('是否允许使用字符串来定义DOM元素', () => {
    const element = React.createElement('div', { className: 'foo' });
    const node = ReactTestUtils.renderIntoDocument(element);
    expect(node.tagName).toBe('DIV');
  });
});

