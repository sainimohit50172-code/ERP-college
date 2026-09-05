import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormField from './FormField.jsx';

describe('FormField', () => {
  it('adds an id and name to child form controls when missing', () => {
    render(
      React.createElement(
        FormField,
        { label: 'Email', name: 'email' },
        React.createElement('input', { type: 'email' }),
      ),
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id');
    expect(input.getAttribute('id')).toMatch(/^form-field-/);
    expect(input).toHaveAttribute('name', 'email');
  });
});
