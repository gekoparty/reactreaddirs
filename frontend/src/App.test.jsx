import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the directory manager shell', () => {
  render(<App />);
  const linkElement = screen.getByText(/directory manager/i);
  expect(linkElement).toBeInTheDocument();
});
