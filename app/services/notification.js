import $ from 'jquery';

export function showNotification(
  message, type = 'danger', position = 'top-right', showClose = true ) {
  $('body').pgNotification({
    style: 'bar',
    message: message,
    type: type,
    timeout: type === 'success' ? 3000 : 0,
    position: position,
    showClose: showClose
  }).show();
}