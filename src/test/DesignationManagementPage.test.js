import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import DesignationManagementPage from '../pages/DesignationManagementPage.jsx';

const createDesignationMock = vi.fn();

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../hooks/useResourceHooks', () => ({
  useResourceList: () => ({
    data: {
      items: [
        { id: 1, title: 'Chief Executive Officer', level: 1, description: 'Overall organization leadership', mobile_number: '+91 98765 43210', created_at: '2025-05-15T10:30:00Z' },
        { id: 2, title: 'Finance Manager', level: 2, description: 'Financial planning and reporting', mobile_number: '+91 98765 43211', created_at: '2025-05-13T09:45:00Z' },
      ],
    },
    isLoading: false,
  }),
  useCreateResource: () => ({ mutateAsync: createDesignationMock }),
  useUpdateResource: () => ({ mutateAsync: vi.fn() }),
  useDeleteResource: () => ({ mutate: vi.fn() }),
}));

describe('DesignationManagementPage', () => {
  it('renders the premium HRM designation layout and summary cards', () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(DesignationManagementPage)
      )
    );

    expect(screen.getByRole('heading', { name: /Designation \| HRM Master Designation Setting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Designation/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Total Designations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Active Designations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inactive Designations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Last Updated/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Designation List/i)).toBeInTheDocument();
  });

  it('creates a new designation from the modal form', async () => {
    createDesignationMock.mockResolvedValue({ id: 3, title: 'Project Manager', level: 3, description: 'Owns delivery projects', status: 'Active' });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(DesignationManagementPage)
      )
    );

    fireEvent.click(screen.getByRole('button', { name: /Add New Designation/i }));
    fireEvent.change(screen.getByLabelText(/Designation Name/i), { target: { value: 'Project Manager' } });
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => expect(createDesignationMock).toHaveBeenCalled());
  });
});
