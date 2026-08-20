import { beforeEach, describe, expect, it } from 'vitest';
import { createQualification, listQualifications } from '../services/qualificationService.js';

describe('HRMQualificationMasterPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists newly added qualifications in storage', async () => {
    const created = await createQualification({ name: 'B.Tech', level: 'UG', status: 'Active' });

    expect(created.name).toBe('B.Tech');

    const { items } = await listQualifications();
    expect(items.some((item) => item.name === 'B.Tech')).toBe(true);

    const stored = JSON.parse(window.localStorage.getItem('erp:qualifications') || '[]');
    expect(stored.some((item) => item.name === 'B.Tech')).toBe(true);
  });
});
