import { issueBook as issueLibraryBook, returnBook as returnLibraryBook, listIssues } from './libraryService.js';
import { renewBook as renewLibraryBook, getIssue as getLibraryIssue } from './libraryService.js';

export async function issueBook(payload) {
  return issueLibraryBook(payload);
}

export async function returnBook(id, payload = {}) {
  return returnLibraryBook(id, payload);
}

export async function listIssueRecords(params = {}) {
  return listIssues(params);
}

export async function renewIssue(issueId, opts = {}) {
  return renewLibraryBook(issueId, opts);
}

export async function getIssueRecord(id) {
  return getLibraryIssue(id);
}

// Backwards-compatible alias used by UI components
export { renewIssue as renewBook };

export default {
  issueBook,
  returnBook,
  listIssueRecords,
  renewBook: renewIssue,
};
