import {
  createBookRecord as createLibraryBookRecord,
  listLibraryBooks,
  updateBookRecord as updateLibraryBookRecord,
  deleteBookRecord as deleteLibraryBookRecord,
} from './libraryService.js';
import {
  createReservation as createLibraryReservation,
  cancelReservation as cancelLibraryReservation,
  renewBook as renewLibraryBook,
  markBookLost as markLibraryBookLost,
  markBookDamaged as markLibraryBookDamaged,
} from './libraryService.js';

export async function createBook(payload) {
  return createLibraryBookRecord(payload);
}

export async function createBookRecord(payload) {
  return createLibraryBookRecord(payload);
}

export async function listBooks(params = {}) {
  return listLibraryBooks(params);
}

export async function updateBook(id, payload) {
  return updateLibraryBookRecord(id, payload);
}

export async function updateBookRecord(id, payload) {
  return updateLibraryBookRecord(id, payload);
}

export async function deleteBook(id) {
  return deleteLibraryBookRecord(id);
}

export async function deleteBookRecord(id) {
  return deleteLibraryBookRecord(id);
}

export async function createReservation(payload) {
  return createLibraryReservation(payload);
}

export async function cancelReservation(id) {
  return cancelLibraryReservation(id);
}

export async function renewBook(issueId, opts = {}) {
  return renewLibraryBook(issueId, opts);
}

export async function markLost(issueId, opts = {}) {
  return markLibraryBookLost(issueId, opts);
}

export async function markDamaged(bookId, opts = {}) {
  return markLibraryBookDamaged(bookId, opts);
}

export default {
  createBook,
  createBookRecord,
  listBooks,
  updateBook,
  updateBookRecord,
  deleteBook,
  deleteBookRecord,
};
