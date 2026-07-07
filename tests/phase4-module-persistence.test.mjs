import assert from 'node:assert/strict';
import { calculateInternalMarkSummary } from '../src/utils/internalMarks.js';

const summary = calculateInternalMarkSummary({ assignment1: 8, assignment2: 7, midTerm: 15, presentation: 9 });
assert.equal(summary.total, 39);
assert.equal(summary.percentage, '78%');
console.log('phase4 module persistence regression checks passed');
