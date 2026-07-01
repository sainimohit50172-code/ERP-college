import { collectFine as collectLibraryFine, listFines } from './libraryService.js';

export async function collectFine(payload) {
  return collectLibraryFine(payload);
}

export async function listFineRecords(params = {}) {
  return listFines(params);
}

export default {
  collectFine,
  listFineRecords,
};
