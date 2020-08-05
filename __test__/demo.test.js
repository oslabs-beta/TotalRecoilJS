import React from 'react';
import GraphPanel from '../extension/frontend/view/Components/GraphPanel';
import { tree } from '../mock/snapshot.js';
import {
  render,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import '@babel/polyfill';

afterEach(cleanup);

it('renders & matches snapshot - no props', () => {
  const {asFragment} = render(<GraphPanel />);
  expect(asFragment()).toMatchSnapshot();
});

it('renders & matches snapshot - Tree props', () => {
  const {asFragment} = render(
    <GraphPanel
      tree={ tree }
    />,
  );
  expect(asFragment()).toMatchSnapshot();
});