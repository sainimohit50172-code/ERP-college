import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import { normalizeAcademicContext, normalizeEntityPayload } from '../utils/domainModels.js';
import notificationsService from './notificationsService.js';

const libraryBooksService = createResourceService('libraryBooks');
const membersService = createResourceService('libraryMembers');
const issuesService = createResourceService('libraryIssues');
const finesService = createResourceService('libraryFines');
const reservationsService = createResourceService('libraryReservations');
const renewalsService = createResourceService('libraryRenewals');
const lossesService = createResourceService('libraryLosses');
const damagesService = createResourceService('libraryDamages');

const defaultLibraryContext = {
  academicYear: '2025-26',
  campus: 'Main Campus',
};

function buildLibraryContext(payload = {}) {
  return normalizeAcademicContext(payload, defaultLibraryContext);
}

export async function listLibraryBooks(params = {}) {
  return libraryBooksService.list(params);
}

function computeDueDate(fromDate = null, loanDays = 14) {
  const base = fromDate ? new Date(fromDate) : new Date();
  const d = new Date(base);
  d.setDate(d.getDate() + Number(loanDays));
  return d.toISOString().split('T')[0];
}

export async function createBookRecord(payload) {
  const book = normalizeEntityPayload(
    {
      ...payload,
      status: payload.status || 'Available',
      copies: Number(payload.copies || payload.availableCopies || 1),
      availableCopies: Number(payload.availableCopies || payload.copies || 1),
      lostCopies: Number(payload.lostCopies || 0),
      damagedCopies: Number(payload.damagedCopies || 0),
      metadata: payload.metadata || { source: 'library' },
    },
    { fallbackContext: buildLibraryContext(payload) },
  );

  const created = await libraryBooksService.create(book);
  recordAuditEvent({
    action: 'Create',
    moduleKey: 'library',
    description: `Book created: ${created.title}`,
    resourceId: created.id,
    metadata: { isbn: created.isbn, status: created.status },
  });
  return created;
}

// Renew an issued book (by issue record id)
export async function renewBook(issueId, { loanDays = 14, maxRenewals = 2, user = null } = {}) {
  const issue = await issuesService.get(issueId);
  if (!issue) throw new Error('Issue record not found');
  if (issue.status === 'Returned' || issue.status === 'Lost') throw new Error('Cannot renew returned or lost book');
  const renewCount = Number(issue.renewals || 0);
  if (renewCount >= maxRenewals) throw new Error('Renewal limit reached');
  // if reserved by others, not eligible
  const reservations = await reservationsService.list({ page: 1, pageSize: 200 });
  const queue = (reservations.items || []).filter((r) => r.bookId === issue.bookId && r.status === 'Queued');
  const firstInQueue = queue.length ? queue[0] : null;
  if (firstInQueue && String(firstInQueue.memberId) !== String(issue.memberId)) throw new Error('Book reserved by another member');

  const newDue = computeDueDate(issue.dueDate || null, loanDays);
  const updated = await issuesService.update(issueId, { ...issue, dueDate: newDue, renewals: renewCount + 1, status: 'Issued' });
  await renewalsService.create({ issueId, bookId: issue.bookId, memberId: issue.memberId, renewedAt: new Date().toISOString(), dueDate: newDue, user });
  recordAuditEvent({ action: 'Renew', moduleKey: 'library', description: `Book renewed: ${issue.bookId}`, resourceId: issueId, user, metadata: { dueDate: newDue, renewals: renewCount + 1 } });
  return updated;
}

export async function updateBookRecord(id, payload) {
  const book = normalizeEntityPayload(
    {
      ...payload,
      id,
      status: payload.status || 'Available',
      copies: Number(payload.copies || payload.availableCopies || 1),
      availableCopies: Number(payload.availableCopies || payload.copies || 1),
      lostCopies: Number(payload.lostCopies || 0),
      damagedCopies: Number(payload.damagedCopies || 0),
      metadata: payload.metadata || { source: 'library' },
    },
    { fallbackContext: buildLibraryContext(payload) },
  );

  const updated = await libraryBooksService.update(id, book);
  recordAuditEvent({ action: 'Update', moduleKey: 'library', description: `Book updated: ${id}`, resourceId: id, metadata: { status: updated.status } });
  return updated;
}

export async function deleteBookRecord(id) {
  const removed = await libraryBooksService.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'library', description: `Book deleted: ${id}`, resourceId: id });
  return removed;
}

export async function listMembers(params = {}) {
  return membersService.list(params);
}

export async function createMember(payload) {
  const member = normalizeEntityPayload(
    {
      ...payload,
      type: payload.type || 'Student',
      status: payload.status || 'Active',
      metadata: payload.metadata || { source: 'library' },
    },
    { fallbackContext: buildLibraryContext(payload) },
  );
  const created = await membersService.create(member);
  recordAuditEvent({ action: 'Create', moduleKey: 'library', description: `Library member created: ${created.name || created.memberName || created.id}`, resourceId: created.id, metadata: { type: created.type } });
  return created;
}

export async function listIssues(params = {}) {
  return issuesService.list(params);
}

export async function getIssue(id) {
  return issuesService.get(id);
}

export async function issueBook(payload) {
  const issue = normalizeEntityPayload(
    {
      ...payload,
      status: payload.status || 'Issued',
      metadata: payload.metadata || { source: 'library' },
    },
    { fallbackContext: buildLibraryContext(payload) },
  );
  const created = await issuesService.create(issue);
  recordAuditEvent({ action: 'Create', moduleKey: 'library', description: `Book issued: ${created.bookId}`, resourceId: created.id, metadata: { memberId: created.memberId } });
  return created;
}

export async function returnBook(id, payload = {}) {
  const updated = await issuesService.update(id, { ...payload, status: 'Returned', returnedAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Update', moduleKey: 'library', description: `Book returned: ${id}`, resourceId: id });
  // when a book is returned, process reservations for this book id
  try { await processReservations(updated.bookId); } catch (e) { console.warn('processReservations failed', e); }
  return updated;
}

// Reservations
export async function createReservation({ bookId, memberId, expiresInDays = 3, user = null } = {}) {
  const book = await libraryBooksService.get(bookId);
  if (!book) throw new Error('Book not found');
  const reservations = await reservationsService.list({ page: 1, pageSize: 200 });
  const existing = (reservations.items || []).filter((r) => r.bookId === bookId && r.memberId === memberId && r.status !== 'Cancelled');
  if (existing.length) return existing[0];
  const status = (book.availableCopies || 0) > 0 ? 'Available' : 'Queued';
  const expiresAt = computeDueDate(null, expiresInDays);
  const created = await reservationsService.create({ bookId, memberId, status, createdAt: new Date().toISOString(), expiresAt, user });
  recordAuditEvent({ action: 'Create', moduleKey: 'library', description: `Reservation created: ${bookId} for ${memberId}`, resourceId: created.id, user });
  return created;
}

export async function cancelReservation(reservationId, { user = null } = {}) {
  const resv = await reservationsService.get(reservationId);
  if (!resv) throw new Error('Reservation not found');
  const updated = await reservationsService.update(reservationId, { ...resv, status: 'Cancelled', cancelledAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Update', moduleKey: 'library', description: `Reservation cancelled: ${reservationId}`, resourceId: reservationId, user });
  return updated;
}

export async function processReservations(bookId) {
  const reservations = await reservationsService.list({ page: 1, pageSize: 200 });
  const queue = (reservations.items || []).filter((r) => r.bookId === bookId && r.status === 'Queued');
  if (!queue.length) return null;
  const nxt = queue[0];
  // mark as Available (notifying UI)
  const updated = await reservationsService.update(nxt.id, { ...nxt, status: 'Available', availableAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Update', moduleKey: 'library', description: `Reservation available: ${bookId} for ${nxt.memberId}`, resourceId: nxt.id });
  try {
    notificationsService.addNotification({ title: 'Reserved book available', details: `${nxt.bookId} is now available for you`, meta: { reservationId: nxt.id, bookId } });
  } catch (e) { console.warn('Failed to send reservation notification', e); }
  return updated;
}

// Lost book handling
export async function markBookLost(issueId, { replacementCharge = 500, user = null } = {}) {
  const issue = await issuesService.get(issueId);
  if (!issue) throw new Error('Issue not found');
  const book = await libraryBooksService.get(issue.bookId);
  if (!book) throw new Error('Book not found');
  // adjust inventory
  const updatedBook = await libraryBooksService.update(book.id, { ...book, lostCopies: Number(book.lostCopies || 0) + 1, availableCopies: Math.max(0, (book.availableCopies || 0) - 1), status: 'Lost' });
  const lossRecord = await lossesService.create({ issueId, bookId: book.id, memberId: issue.memberId, reportedAt: new Date().toISOString(), replacementCharge, user });
  // charge fine
  await finesService.create({ bookId: book.id, memberId: issue.memberId, amount: Number(replacementCharge), reason: 'Lost book replacement', status: 'Pending' });
  recordAuditEvent({ action: 'Create', moduleKey: 'library', description: `Book marked lost: ${book.id}`, resourceId: lossRecord.id, user, metadata: { replacementCharge } });
  return { lossRecord, updatedBook };
}

// Damaged book handling
export async function markBookDamaged(bookId, { severity = 'Minor', repairCharge = 100, user = null } = {}) {
  const book = await libraryBooksService.get(bookId);
  if (!book) throw new Error('Book not found');
  const damagedCount = Number(book.damagedCopies || 0) + 1;
  const status = severity === 'Unusable' ? 'Damaged' : book.status || 'Available';
  const updatedBook = await libraryBooksService.update(bookId, { ...book, damagedCopies: damagedCount, status });
  const damageRecord = await damagesService.create({ bookId, severity, repairCharge, reportedAt: new Date().toISOString(), user });
  await finesService.create({ bookId, amount: Number(repairCharge), memberId: null, reason: `Damage charge: ${severity}`, status: 'Pending' });
  recordAuditEvent({ action: 'Create', moduleKey: 'library', description: `Book marked damaged: ${bookId}`, resourceId: damageRecord.id, user, metadata: { severity, repairCharge } });
  return { damageRecord, updatedBook };
}

export async function collectFine(payload) {
  const fine = normalizeEntityPayload(
    {
      ...payload,
      status: payload.status || 'Collected',
      amount: Number(payload.amount || 0),
      metadata: payload.metadata || { source: 'library' },
    },
    { fallbackContext: buildLibraryContext(payload) },
  );
  const created = await finesService.create(fine);
  recordAuditEvent({ action: 'Create', moduleKey: 'library', description: `Fine collected: ${created.amount}`, resourceId: created.id });
  return created;
}

export async function listFines(params = {}) {
  return finesService.list(params);
}

export default {
  listLibraryBooks,
  createBookRecord,
  updateBookRecord,
  deleteBookRecord,
  listMembers,
  createMember,
  listIssues,
  issueBook,
  returnBook,
  collectFine,
  listFines,
};
