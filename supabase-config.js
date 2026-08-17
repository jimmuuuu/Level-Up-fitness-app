window.LEVEL_UP_SUPABASE = {
  url: 'https://wxeptxfijwrwmdzxvsuh.supabase.co',
  publishableKey: 'sb_publishable_iptY9q73dl1gKeM18zcwZA_Vz8d-Lu0'
};

// Load the Level Up visual theme as a separate override so app.css stays untouched.
(() => {
  if (!document.querySelector('link[data-level-up-theme]')) {
    const theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = 'theme.css?v=2';
    theme.dataset.levelUpTheme = 'lime';
    document.head.appendChild(theme);
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', '#080a0c');
})();
