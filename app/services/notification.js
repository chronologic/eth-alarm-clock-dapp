import $ from 'jquery';

export function showNotification(message, type = 'danger', position = 'top-right' ) {
  $('body').pgNotification({
    style: 'bar',
    message: message,
    type: type,
    timeout: type === 'success' ? 3000 : 0,
    position: position
  }).show();
}