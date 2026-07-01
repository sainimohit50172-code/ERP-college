/*
  Repository provider pattern.
  Services call `getRepository('students')` to obtain either a Mock repo or a FastAPI-backed repo.
  Switch via `REPO_BACKEND` in localStorage or env var.
*/
import mockRepos from './repositories/mock/index.js';
import fastapiRepos from './repositories/fastapi/index.js';

const DEFAULT_BACKEND = (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.REACT_APP_REPO_BACKEND) || 'mock';

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
  if (backend === 'fastapi') {
    return fastapiRepos[name] || mockRepos[name];
  }
  return mockRepos[name] || fastapiRepos[name];
}

export default { getRepository, getBackend };
