# Constraint Visualization

This project provides an application for visualization the steps in using data constraints.

## Building

```bash
# installs all dependencies
yarn
# creates production build
yarn build
# run for development
yarn dev
```

## Documentation Generation

```bash
yarn docs
```

## Major Dependencies
  - [React](https://reactjs.org/)
  - [D3.js](https://d3js.org/)

## Example Usage

```typescript
// this example should produce the graph shown above in the screenshot
// just type this directly into your browser console to test
const test = new Var(55)
const test2 = new Var(2)
const test3 = new Var(() => { return test.get() * test2.get() }
test3.get()
const word = new Var("Testing123")
word_len = new Var(() => {return word.get().length})
word_len.get()
sum_stuff = new Var(() => {return word_len.get() + test3.get()})
```