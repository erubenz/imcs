import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequireRole from './components/auth/RequireRole';

jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('./context/AuthContext');

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
});

test('redirects when not authenticated', () => {
  useAuth.mockReturnValue({ user: null, loading: false, role: null });
  renderWithRouter(
    <RequireRole role="Admin">
      <div>Secret</div>
    </RequireRole>
  );
  expect(screen.queryByText('Secret')).toBeNull();
});

test('blocks when role mismatch', () => {
  useAuth.mockReturnValue({ user: {}, loading: false, role: 'Viewer' });
  renderWithRouter(
    <RequireRole role="Admin">
      <div>Secret</div>
    </RequireRole>
  );
  expect(screen.queryByText('Secret')).toBeNull();
});

test('renders when role matches', () => {
  useAuth.mockReturnValue({ user: {}, loading: false, role: 'Admin' });
  renderWithRouter(
    <RequireRole role="Admin">
      <div>Secret</div>
    </RequireRole>
  );
  expect(screen.getByText('Secret')).toBeInTheDocument();
});
