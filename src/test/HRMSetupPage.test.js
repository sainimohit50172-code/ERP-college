import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import HRMSetupPage from '../pages/HRMSetupPage.jsx';

describe('HRMSetupPage', () => {
  it('renders the Qualification Master card in the HRM setup dashboard', () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(HRMSetupPage)
      )
    );

    expect(screen.getByText(/Qualification Master/i)).toBeInTheDocument();
  });
});
