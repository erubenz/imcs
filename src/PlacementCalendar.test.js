import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@fullcalendar/react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ events }, ref) => {
      React.useImperativeHandle(ref, () => ({ getApi: () => ({ changeView: () => {} }) }));
      return React.createElement('div', null, events.map(e => React.createElement('div', { key: e.id }, e.title)));
    })
  };
});

import PlacementCalendar from './PlacementCalendar';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    MemoryRouter: ({ children }) => React.createElement('div', null, children),
  };
}, { virtual: true });

const mockGetDocs = jest.fn();
const mockCollection = jest.fn();

jest.mock('firebase/firestore', () => ({
  getDocs: (...args) => mockGetDocs(...args),
  collection: (...args) => mockCollection(...args),
}));

jest.mock('./firebase', () => ({
  db: {},
}));

afterEach(() => {
  jest.clearAllMocks();
});

const makeSnap = (items) => ({
  forEach: (cb) => items.forEach(([id, data]) => cb({ id, data: () => data })),
});

test('renders events from firestore', async () => {
  mockGetDocs
    .mockResolvedValueOnce(makeSnap([['cl1', { name: 'Client1' }]]))
    .mockResolvedValueOnce(
      makeSnap([
        ['c1', { campaignName: 'Camp1', clientId: 'cl1', managerId: 'm1', status: 'active', chains: [{ chainId: 'ch1', startDate: '2020-01-01', endDate: '2020-01-02' }] }],
      ])
    )
    .mockResolvedValueOnce(makeSnap([['m1', { name: 'M' }]]))
    .mockResolvedValueOnce(makeSnap([['ch1', { chainName: 'Chain1' }]]));

  render(<PlacementCalendar />);

  await waitFor(() => {
    expect(screen.getByText(/Camp1/)).toBeInTheDocument();
  });
});

test('filters events by status', async () => {
  mockGetDocs
    .mockResolvedValueOnce(makeSnap([['cl1', { name: 'Client1' }]]))
    .mockResolvedValueOnce(
      makeSnap([
        ['c1', { campaignName: 'Camp1', clientId: 'cl1', managerId: 'm1', status: 'active', chains: [{ chainId: 'ch1', startDate: '2020-01-01', endDate: '2020-01-02' }] }],
        ['c2', { campaignName: 'Camp2', clientId: 'cl1', managerId: 'm1', status: 'paused', chains: [{ chainId: 'ch1', startDate: '2020-01-03', endDate: '2020-01-04' }] }],
      ])
    )
    .mockResolvedValueOnce(makeSnap([['m1', { name: 'M' }]]))
    .mockResolvedValueOnce(makeSnap([['ch1', { chainName: 'Chain1' }]]));

  render(<PlacementCalendar />);

  await waitFor(() => {
    expect(screen.getByText(/Camp1/)).toBeInTheDocument();
    expect(screen.getByText(/Camp2/)).toBeInTheDocument();
  });

  const select = screen.getByLabelText('Status');
  fireEvent.mouseDown(select);
  userEvent.click(screen.getByRole('option', { name: 'active' }));

  expect(screen.getByText(/Camp1/)).toBeInTheDocument();
  expect(screen.queryByText(/Camp2/)).toBeNull();
});
