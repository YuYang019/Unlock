import path from 'path'

export default {
  input: path.resolve(__dirname, '../src/index.js'),
  output: {
    file: './dist/unlock.js',
    format: 'umd',
    name: 'Unlock'
  }
}
