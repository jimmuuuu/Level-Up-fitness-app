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
            radial-gradient(circle at 50% 43%, rgba(255, 45, 67, .12), transparent 30%),
            linear-gradient(180deg, #070809 0%, #030404 74%, #020202 100%);
          opacity: 1;
          transform: scale(1);
          transition: opacity .4s ease, transform .4s cubic-bezier(.22,.8,.32,1);
          isolation: isolate;
        }

        #levelUpOpeningSplash::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(76vw, 420px);
          height: 1px;
          transform: translate(-50%, -50%) scaleX(.05);
          transform-origin: center;
          background: linear-gradient(90deg, transparent, rgba(255, 52, 71, .32), #ff3447, rgba(255, 52, 71, .32), transparent);
          box-shadow: 0 0 18px rgba(255, 52, 71, .28);
          opacity: 0;
          animation: levelUpSplashLine 1.05s .36s cubic-bezier(.22,.8,.32,1) forwards;
          pointer-events: none;
        }

        #levelUpOpeningSplash::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(112deg, transparent 34%, rgba(255,255,255,.025) 49%, transparent 62%);
          transform: translateX(-80%);
          animation: levelUpSplashSheen 1.25s .22s ease-out forwards;
          pointer-events: none;
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
          transform: translateY(-1vh);
        }

        .level-up-splash-mark-wrap {
          position: relative;
          width: 112px;
          height: 112px;
          display: grid;
          place-items: center;
          perspective: 700px;
        }

        .level-up-splash-mark-wrap::after {
          content: '';
          position: absolute;
          width: 78px;
          height: 16px;
          bottom: 4px;
          border-radius: 50%;
          background: rgba(255, 52, 71, .13);
          filter: blur(10px);
          opacity: 0;
          animation: levelUpLogoShadow 1.05s .08s ease-out forwards;
        }

        .level-up-splash-mark {
          width: 96px;
          height: 96px;
          object-fit: contain;
          opacity: 0;
          transform-origin: center;
          filter: drop-shadow(0 12px 28px rgba(0,0,0,.48));
          animation: levelUpLogoMove 1.12s .02s cubic-bezier(.16,1,.3,1) forwards;
          will-change: transform, opacity, filter;
        }

        .level-up-splash-wordmark {
          display: flex;
          margin-top: 14px;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          opacity: 0;
          transform: translateY(12px);
          animation: levelUpSplashWords .5s .58s cubic-bezier(.16,1,.3,1) forwards;
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
          margin-top: 26px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255,255,255,.07);
          opacity: 0;
          animation: levelUpSplashLoaderShow .2s .74s ease forwards;
        }

        .level-up-splash-loader::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #ff263e, #ff5c69);
          transform: translateX(-102%);
          animation: levelUpSplashLoad .92s .76s cubic-bezier(.25,.75,.3,1) forwards;
          box-shadow: 0 0 12px rgba(255,52,71,.4);
        }

        #levelUpOpeningSplash.is-leaving {
          opacity: 0;
          transform: scale(1.018);
          pointer-events: none;
        }

        #levelUpOpeningSplash.is-leaving .level-up-splash-mark {
          animation: none;
          opacity: 1;
          transform: translateY(-8px) scale(1.06);
          transition: transform .36s cubic-bezier(.22,.8,.32,1);
        }

        @keyframes levelUpLogoMove {
          0% {
            opacity: 0;
            transform: translate3d(-42px, 70px, 0) rotate(-16deg) scale(.64);
            filter: blur(7px) drop-shadow(0 12px 28px rgba(0,0,0,.48));
          }
          42% {
            opacity: 1;
            transform: translate3d(10px, -10px, 0) rotate(5deg) scale(1.12);
            filter: blur(0) drop-shadow(0 12px 28px rgba(0,0,0,.48));
          }
          68% {
            opacity: 1;
            transform: translate3d(-4px, 4px, 0) rotate(-2deg) scale(.97);
          }
          84% {
            opacity: 1;
            transform: translate3d(2px, -2px, 0) rotate(.7deg) scale(1.025);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0) scale(1);
            filter: blur(0) drop-shadow(0 12px 28px rgba(0,0,0,.48));
          }
        }

        @keyframes levelUpLogoShadow {
          0% { opacity: 0; transform: scale(.45); }
          46% { opacity: .7; transform: scale(1.2); }
          100% { opacity: .3; transform: scale(1); }
        }

        @keyframes levelUpSplashWords {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes levelUpSplashLine {
          0% { opacity: 0; transform: translate(-50%, -50%) scaleX(.05); }
          30% { opacity: .85; }
          72% { opacity: .45; transform: translate(-50%, -50%) scaleX(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scaleX(1); }
        }

        @keyframes levelUpSplashSheen {
          0% { transform: translateX(-80%); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: translateX(80%); opacity: 0; }
        }

        @keyframes levelUpSplashLoaderShow { to { opacity: 1; } }
        @keyframes levelUpSplashLoad {
          0% { transform: translateX(-102%); }
          68% { transform: translateX(-18%); }
          100% { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          #levelUpOpeningSplash::before,
          #levelUpOpeningSplash::after,
          .level-up-splash-mark,
          .level-up-splash-mark-wrap::after,
          .level-up-splash-wordmark,
          .level-up-splash-loader,
          .level-up-splash-loader::after { animation: none !important; }
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
        <div class="level-up-splash-mark-wrap">
          <img class="level-up-splash-mark" src="${EMBLEM}" alt="">
        </div>
        <div class="level-up-splash-wordmark">
          <strong>LEVEL UP</strong>
          <span>FITNESS</span>
        </div>
        <div class="level-up-splash-loader"></div>
      </div>
    `;
    document.body.prepend(splash);

    const startedAt = performance.now();
    const minimumVisibleMs = 1350;
    const maximumVisibleMs = 2850;
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add('is-leaving');
      window.setTimeout(() => splash.remove(), 440);
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
    script.src = 'simple-workout-names.js?v=6';
    script.setAttribute('data-level-up-simple-workout-names', 'true');
    document.body.appendChild(script);
  }

  function ensureWorkoutCardArtFix() {
    if (document.querySelector('script[data-level-up-workout-card-art-fix]')) return;
    const script = document.createElement('script');
    script.async = false;
    script.src = 'workout-card-art-fix.js?v=1';
    script.setAttribute('data-level-up-workout-card-art-fix', 'true');
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
    ensureWorkoutCardArtFix();
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