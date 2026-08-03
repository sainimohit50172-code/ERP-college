import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import { AuthContext } from '../services/AuthContext.jsx';

function renderWithAuth(authValue) {
  return render(
    <MemoryRouter initialEntries={['/secure']}>
      <AuthContext.Provider value={{ auth: authValue }}>
        <Routes>
          <Route element={<ProtectedRoute moduleKey="dashboard" action="view" />}>
            <Route path="/secure" element={<div>Protected content</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders a loading state while auth is pending', () => {
    renderWithAuth({
      isAuthenticated: true,
      permissions: {},
      loadingPermissions: true,
    });

    expect(screen.getByText(/checking access/i)).toBeInTheDocument();
  });

  it('renders protected content when authenticated and permissions are present', () => {
    renderWithAuth({
      isAuthenticated: true,
      permissions: { dashboard: ['view'] },
      loadingPermissions: false,
    });

    expect(screen.getByText(/Protected content/i)).toBeInTheDocument();
  });

  it('redirects to unauthorized when permissions are explicitly denied', () => {
    renderWithAuth({
      isAuthenticated: true,
      permissions: {},
      loadingPermissions: false,
      permissionsStatus: 'denied',
    });

    expect(screen.getByText(/Unauthorized page/i)).toBeInTheDocument();
  });
});
