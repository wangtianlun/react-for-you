const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const path = require('path');
const inputPath = path.join(__dirname, '../../packages/react/src/React.js');
const outputPath = path.join(__dirname, '../../dist');
const inputOptions = {
  input: inputPath,
  plugins: [ babel() ]
}
const outputOptions = {
  format: 'umd',
  file: path.join(outputPath, 'react.min.js'),
  name: 'React'
}

async function build() {
  const bundle = await rollup.rollup(inputOptions);
  
  bundle.write(outputOptions);
}

build();
