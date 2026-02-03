import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // Simply test that the component renders without errors
  expect(true).toBe(true);
});
