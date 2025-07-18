import { render, screen } from '@testing-library/react';
import RequireRole from './components/auth/RequireRole';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    MemoryRouter: ({ children }) => React.createElement('div', null, children),
  };
}, { virtual: true });

jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('./context/AuthContext');

const renderWithRouter = (ui) => render(ui);

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
