import { toast } from 'react-toastify';

function getResponsePayload(result) {
  if (!result) return {};
  if (result?.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
    return result.data;
  }
  if (result?.error && typeof result.error === 'object') {
    return result.error;
  }
  return result;
}

export function showAuthFlowToast(result, fallbackMessage = 'Action completed successfully.') {
  const payload = getResponsePayload(result);
  const devMode = Boolean(payload?.dev_mode);
  const message = payload?.message || payload?.detail || fallbackMessage;

  if (devMode) {
    toast.warning(message, { autoClose: 6000 });
    return;
  }

  toast.success(message);
}

export function showAuthFlowErrorToast(result, fallbackMessage = 'Action failed.') {
  const payload = getResponsePayload(result);
  const message = payload?.message || payload?.detail || fallbackMessage;
  toast.error(message);
}
