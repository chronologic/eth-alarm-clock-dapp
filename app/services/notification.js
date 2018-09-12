import $ from 'jquery';
import removeXSS from 'xss';

const AVAILABLE_TYPES = ['danger', 'info', 'success', 'warning'];

export function showNotification(
  message,
  type = 'danger',
  timeout,
  position = 'top-right',
  showClose = true
) {
  if (!$) {
    return;
  }

  if (!AVAILABLE_TYPES.includes(type)) {
    throw `Notification type: "${type}" is not available.`;
  }

  if (typeof timeout === 'undefined') {
    timeout = type === 'success' ? 5000 : 0;
  }

  message = removeXSS(message);

  $('body')
    .pgNotification({
      style: 'bar',
      message,
      type,
      timeout,
      position,
      showClose
    })
    .show();
}
