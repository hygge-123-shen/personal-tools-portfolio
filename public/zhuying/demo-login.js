const demoDialog = document.querySelector('#demo-dialog');
const demoButton = document.querySelector('#demo-toggle');
const demoForm = document.querySelector('#demo-form');
const demoFeedback = document.querySelector('#demo-feedback');
const demoNotice = document.querySelector('#demo-notice');

function updateDemoButton() {
  const signedIn = Boolean(ZhuyingDemo.getSession());
  demoButton.textContent = signedIn ? '退出演示' : '课堂演示登录';
  demoNotice.hidden = !signedIn;
}

demoButton.addEventListener('click', () => {
  if (ZhuyingDemo.getSession()) {
    ZhuyingDemo.logout();
    updateDemoButton();
    return;
  }
  demoForm.reset();
  demoFeedback.textContent = '';
  demoForm.elements.account.value = ZhuyingDemo.USERNAME;
  demoDialog.showModal();
  demoForm.elements.password.focus();
});

demoForm.addEventListener('submit', event => {
  event.preventDefault();
  try {
    ZhuyingDemo.login(demoForm.elements.account.value, demoForm.elements.password.value);
    demoForm.reset();
    demoDialog.close();
    updateDemoButton();
  } catch (error) {
    demoFeedback.textContent = error.message;
  }
});

window.addEventListener('storage', updateDemoButton);
updateDemoButton();
