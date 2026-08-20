(() => {
  const EMBLEM = 'assets/level-up-emblem.svg';
  const APP_ICON = 'assets/level-up-app-icon.svg';
  let openingSplashStarted = false;

  function ensureOpeningSplash() {
    if (openingSplashStarted || document.getElementById('levelUpOpeningSplash')) return;
    openingSplashStarted = true;

    if (!document.getElementById('levelUpOpeningSplashStyles')) {
      const style = document.createElement('style');
      style.id = 'levelUpOpeningSplashStyles';
      style.textContent = `
        #levelUpOpeningSplash {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 42%, rgba(255, 51, 70, .10), transparent 31%),
            linear-gradient(180deg, #070809 0%, #030404 72%, #020202 100%);
          opacity: 1;
          transition: opacity .42s ease, transform .42s cubic-bezier(.22,.8,.32,1);
          transform: scale(1);
          isolation: isolate;
        }

        #levelUpOpeningSplash::before,
        #levelUpOpeningSplash::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }

        #levelUpOpeningSplash::before {
          width: min(78vw, 430px);
          height: 1px;
          top: 51%;
          left: 50%;
          transform: translate(-50%, -50%) scaleX(.05);
          transform-origin: center;
          background: linear-gradient(90deg, transparent, rgba(255, 56, 75, .35), #ff3447, rgba(255, 56, 75, .35), transparent);
          box-shadow: 0 0 18px rgba(255, 52, 71, .28);
          opacity: 0;
          animation: levelUpSplashLine 1.15s .28s cubic-bezier(.22,.8,.32,1) forwards;
        }

        #levelUpOpeningSplash::after {
          inset: 0;
          background: linear-gradient(112deg, transparent 34%, rgba(255,255,255,.026) 48%, transparent 61%);
          transform: translateX(-70%);
          animation: levelUpSplashSheen 1.45s .18s ease-out forwards;
        }

        .level-up-splash-inner {
          position: relative;
          z-index: 1;
          display: flex;
          width: min(86vw, 360px);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transform: translateY(-2vh);
        }

        .level-up-splash-mark {
          width: 92px;
          height: 92px;
          object-fit: contain;
          opacity: 0;
          filter: drop-shadow(0 10px 24px rgba(0,0,0,.42));
          animation: levelUpSplashMark .72s .08s cubic-bezier(.16,1,.3,1) forwards;
        }

        .level-up-splash-wordmark {
          display: flex;
          margin-top: 20px;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          opacity: 0;
          transform: translateY(12px);
          animation: levelUpSplashWords .55s .42s cubic-bezier(.16,1,.3,1) forwards;
        }

        .level-up-splash-wordmark strong {
          color: #f5f6f7;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
          font-size: clamp(28px, 8vw, 36px);
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .level-up-splash-wordmark span {
          margin-top: 7px;
          color: #777d84;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .38em;
          text-indent: .38em;
        }

        .level-up-splash-loader {
          position: relative;
          width: 108px;
          height: 3px;
          margin-top: 27px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255,255,255,.07);
          opacity: 0;
          animation: levelUpSplashLoaderShow .25s .62s ease forwards;
        }

        .level-up-splash-loader::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #ff263e, #ff5c69);
          transform: translateX(-102%);
          animation: levelUpSplashLoad 1.05s .66s cubic-bezier(.25,.75,.3,1) forwards;
          box-shadow: 0 0 12px rgba(255,52,71,.4);
        }

        #levelUpOpeningSplash.is-leaving {
          opacity: 0;
          transform: scale(1.018);
          pointer-events: none;
        }

        @keyframes levelUpSplashMark {
          0% { opacity: 0; transform: translateY(14px) scale(.82); filter: blur(4px) drop-shadow(0 10px 24px rgba(0,0,0,.42)); }
          62% { opacity: 1; transform: translateY(-2px) scale(1.035); filter: blur(0) drop-shadow(0 10px 24px rgba(0,0,0,.42)); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0) drop-shadow(0 10px 24px rgba(0,0,0,.42)); }
        }

        @keyframes levelUpSplashWords {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes levelUpSplashLine {
          0% { opacity: 0; transform: translate(-50%, -50%) scaleX(.05); }
          32% { opacity: .85; }
          75% { opacity: .45; transform: translate(-50%, -50%) scaleX(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scaleX(1); }
        }

        @keyframes levelUpSplashSheen {
          0% { transform: translateX(-70%); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: translateX(70%); opacity: 0; }
        }

        @keyframes levelUpSplashLoaderShow {
          to { opacity: 1; }
        }

        @keyframes levelUpSplashLoad {
          0% { transform: translateX(-102%); }
          68% { transform: translateX(-18%); }
          100% { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          #levelUpOpeningSplash::before,
          #levelUpOpeningSplash::after,
          .level-up-splash-mark,
          .level-up-splash-wordmark,
          .level-up-splash-loader,
          .level-up-splash-loader::after {
            animation: none !important;
          }
          .level-up-splash-mark,
          .level-up-splash-wordmark,
          .level-up-splash-loader { opacity: 1; transform: none; }
          .level-up-splash-loader::after { transform: none; }
        }
      `;
      document.head.appendChild(style);
    }

    const splash = document.createElement('div');
    splash.id = 'levelUpOpeningSplash';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = `
      <div class="level-up-splash-inner">
        <img class="level-up-splash-mark" src="${EMBLEM}" alt="">
        <div class="level-up-splash-wordmark">
          <strong>LEVEL UP</strong>
          <span>FITNESS</span>
        </div>
        <div class="level-up-splash-loader"></div>
      </div>
    `;
    document.body.prepend(splash);

    const startedAt = performance.now();
    const minimumVisibleMs = 1250;
    const maximumVisibleMs = 2800;
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add('is-leaving');
      window.setTimeout(() => splash.remove(), 460);
    };

    const dismissAfterMinimum = () => {
      const elapsed = performance.now() - startedAt;
      window.setTimeout(dismiss, Math.max(0, minimumVisibleMs - elapsed));
    };

    if (document.readyState === 'complete') dismissAfterMinimum();
    else window.addEventListener('load', dismissAfterMinimum, { once: true });

    window.setTimeout(dismiss, maximumVisibleMs);
  }

  function ensureExerciseCatalogExpansion() {
    if (document.querySelector('script[data-level-up-exercise-catalog-expansion]')) return;
    const script = document.createElement('script');
    script.async = false;
    script.src = 'exercise-catalog-expansion.js?v=1';
    script.setAttribute('data-level-up-exercise-catalog-expansion', 'true');
    document.body.appendChild(script);
  }

  function ensureSimpleWorkoutNames() {
    if (document.querySelector('script[data-level-up-simple-workout-names]')) return;
    const script = document.createElement('script');
    script.async = false;
    script.src = 'simple-workout-names.js?v=4';
    script.setAttribute('data-level-up-simple-workout-names', 'true');
    document.body.appendChild(script);
  }

  function ensureHeadBranding() {
    document.title = 'Level Up Fitness';

    let favicon = document.querySelector('link[rel="icon"][data-level-up-brand]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      favicon.dataset.levelUpBrand = 'true';
      document.head.appendChild(favicon);
    }
    favicon.href = APP_ICON;

    let touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!touchIcon) {
      touchIcon = document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(touchIcon);
    }
    touchIcon.href = APP_ICON;

    const titleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (titleMeta) titleMeta.setAttribute('content', 'Level Up Fitness');
  }

  function makeBrandImage() {
    const image = document.createElement('img');
    image.src = EMBLEM;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    return image;
  }

  function brandAuthGate() {
    const panel = document.querySelector('#authGate .auth-panel');
    const title = document.getElementById('authTitle');
    if (!panel || !title || panel.querySelector('.level-up-auth-brand')) return;

    const brand = document.createElement('div');
    brand.className = 'level-up-auth-brand';
    brand.setAttribute('aria-label', 'Level Up Fitness');
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.className = 'level-up-auth-brand-copy';
    copy.innerHTML = '<strong>LEVEL UP</strong><span>FITNESS</span>';
    brand.appendChild(copy);
    title.insertAdjacentElement('beforebegin', brand);
  }

  function brandWorkoutPage() {
    const page = document.getElementById('workout');
    const over = page?.querySelector(':scope > .over');
    if (!page || !over || page.querySelector('.level-up-workout-brand')) return;

    const brand = document.createElement('div');
    brand.className = 'level-up-workout-brand';
    brand.setAttribute('aria-label', 'Level Up Fitness');
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.className = 'level-up-workout-brand-copy';
    copy.innerHTML = '<strong>LEVEL UP</strong><span>FITNESS</span>';
    brand.appendChild(copy);
    over.insertAdjacentElement('beforebegin', brand);
  }

  function brandProfileSettings() {
    const panel = document.getElementById('profileSettingsPanel');
    if (!panel || panel.querySelector('.level-up-profile-brand')) return;

    const heading = panel.querySelector('.over');
    const brand = document.createElement('div');
    brand.className = 'level-up-profile-brand';
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.innerHTML = '<strong>Level Up Fitness</strong><span>Training, progress, and your gym profile in one place.</span>';
    brand.appendChild(copy);

    if (heading) heading.insertAdjacentElement('beforebegin', brand);
    else panel.prepend(brand);
  }

  function applyBranding() {
    ensureExerciseCatalogExpansion();
    ensureSimpleWorkoutNames();
    ensureHeadBranding();
    brandAuthGate();
    brandWorkoutPage();
    brandProfileSettings();
  }

  const observer = new MutationObserver(applyBranding);

  function start() {
    ensureOpeningSplash();
    applyBranding();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pageshow', applyBranding);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
