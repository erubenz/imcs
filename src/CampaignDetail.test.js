import { render, screen, waitFor } from '@testing-library/react';
import CampaignDetail from './CampaignDetail';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
}));

const mockDoc = jest.fn(() => ({}));
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockCollection = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  collection: (...args) => mockCollection(...args),
}));

jest.mock('./firebase', () => ({
  db: {},
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders without crashing when createdAt is missing', async () => {
  const campaignData = {
    campaignName: 'No Date',
    status: 'active',
    clientId: 'client1',
    managerId: 'manager1',
    chains: [],
  };

  mockGetDoc
    .mockResolvedValueOnce({ exists: () => true, data: () => campaignData })
    .mockResolvedValueOnce({ exists: () => true, data: () => ({ name: 'C1' }) })
    .mockResolvedValueOnce({ exists: () => true, data: () => ({ name: 'M1' }) });

  mockGetDocs.mockResolvedValueOnce({ forEach: () => {} });

  render(<CampaignDetail />);

  await waitFor(() => {
    expect(screen.getByText(/No Date/)).toBeInTheDocument();
  });
});

test('displays Updated field when updatedAt is provided', async () => {
  const campaignData = {
    campaignName: 'With Update',
    status: 'active',
    clientId: 'client1',
    managerId: 'manager1',
    createdAt: { toDate: () => new Date('2020-01-01') },
    updatedAt: { toDate: () => new Date('2020-01-02') },
    chains: [],
  };

  mockGetDoc
    .mockResolvedValueOnce({ exists: () => true, data: () => campaignData })
    .mockResolvedValueOnce({ exists: () => true, data: () => ({ name: 'C1' }) })
    .mockResolvedValueOnce({ exists: () => true, data: () => ({ name: 'M1' }) });

  mockGetDocs.mockResolvedValueOnce({ forEach: () => {} });

  render(<CampaignDetail />);

  await waitFor(() => {
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });
});
