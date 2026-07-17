/* =======================================================
   ZIPLOOT - COLAB BYPASS GATEWAY CONTROLLER
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Tab Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Copy Buttons
  const copyBtns = document.querySelectorAll('.copy-btn');

  // Tab Switcher Logic
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(content => {
        if (content.id === `${targetTab}-tab`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // Copy Buttons Logic
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetCode = document.getElementById(targetId);
      
      navigator.clipboard.writeText(targetCode.textContent).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check"></i> Copied!`;
        lucide.createIcons();
        setTimeout(() => {
          btn.innerHTML = originalText;
          lucide.createIcons();
        }, 1500);
      });
    });
  });
});
