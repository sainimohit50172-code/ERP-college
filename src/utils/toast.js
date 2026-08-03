import { toast as reactToast } from 'react-toastify';
import notificationsService from '../services/notificationsService.js';

const DEFAULT_TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

function normalizeMessage(message) {
  if (message === null || message === undefined) return '';
  if (typeof message === 'string') return message;
  if (message instanceof Error) return message.message || String(message);
  return String(message);
}

function createToastHandler(type) {
  return (message, options = {}) => {
    const text = normalizeMessage(message);
    const toastOptions = { ...DEFAULT_TOAST_OPTIONS, ...options };

    if (type === 'success') reactToast.success(text, toastOptions);
    else if (type === 'error') reactToast.error(text, toastOptions);
    else if (type === 'warning' || type === 'warn') reactToast.warning(text, toastOptions);
    else if (type === 'info') reactToast.info(text, toastOptions);
    else reactToast(text, toastOptions);

    if (options.persist === true) {
      try {
        notificationsService.addNotification({
          title: options.title || `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
          details: text,
          type: type === 'warn' ? 'warning' : type,
          meta: { source: 'toast' },
        });
      } catch (e) {
        console.warn('Unable to persist toast notification', e);
      }
    }

    return text;
  };
}

export const showSuccess = (message, options = {}) => createToastHandler('success')(message, options);
export const showError = (message, options = {}) => createToastHandler('error')(message, options);
export const showWarning = (message, options = {}) => createToastHandler('warning')(message, options);
export const showInfo = (message, options = {}) => createToastHandler('info')(message, options);

export const toast = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  warn: showWarning,
  dismiss: reactToast.dismiss,
  isActive: reactToast.isActive,
  update: reactToast.update,
};

export default toast;
