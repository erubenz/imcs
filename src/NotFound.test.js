import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

test('displays page not found message', () => {
  render(<NotFound />);
  expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
});
