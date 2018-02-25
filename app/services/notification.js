import $ from 'jquery';

// Avaialble types: danger,info,success,warning
export function showNotification(message, type = 'danger', position = 'top-right', showClose = true ) {
  $('body').pgNotification({
    style: 'bar',
    message: message,
    type: type,
    timeout: type === 'success' ? 5000 : 0,
    position: position,
    showClose: showClose
  }).show();
}