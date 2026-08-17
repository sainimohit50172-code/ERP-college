/*
  Repository provider pattern.
  Services call `getRepository('students')` to obtain either a Mock repo or a FastAPI-backed repo.
  Switch via `REPO_BACKEND` in localStorage or env var.
*/
import mockRepos from './repositories/mock/index.js';
import fastapiRepos from './repositories/fastapi/index.js';

const DEFAULT_BACKEND = (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.REACT_APP_REPO_BACKEND) || 'fastapi';

export function getBackend() {
  try {
    const t = localStorage.getItem('REPO_BACKEND');
    return t || DEFAULT_BACKEND;
  } catch (e) {
    return DEFAULT_BACKEND;
  }
}

export function getRepository(name) {
  const backend = getBackend();
  const mockRepo = mockRepos[name];
  const fastApiRepo = fastapiRepos[name];

  if (mockRepo) {
    return mockRepo;
  }

  if (backend === 'fastapi') {
    return fastApiRepo || mockRepo;
  }

  return fastApiRepo || mockRepo;
}

export default { getRepository, getBackend };
