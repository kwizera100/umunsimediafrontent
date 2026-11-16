import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare } from 'lucide-react';
import appLogo from '../assets/Logo.png';

const isIOSDevice = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: window-controls-overlay)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  window.navigator.standalone === true ||
  // Android: launched from the installed app / TWA
  document.referrer.startsWith('android-app://');

const INSTALLED_KEY = 'umunsi-pwa-installed';

const markInstalled = () => {
  try {
    localStorage.setItem(INSTALLED_KEY, '1');
  } catch (_) {}
};

const wasInstalled = () => {
  try {
    return localStorage.getItem(INSTALLED_KEY) === '1';
  } catch (_) {
    return false;
  }
};

const API_BASE = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Tell the backend this device installed the app (for admin stats)
const reportInstall = () => {
  try {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/pwa/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ platform: navigator.platform || 'unknown' }),
    }).catch(() => {});
  } catch (_) {}
};

const InstallAppCard = () => {
  const [installed, setInstalled] = useState(
    () => isInStandaloneMode() || wasInstalled()
  );
  const [deferredPrompt, setDeferredPrompt] = useState(
    () => window.deferredPrompt || null
  );
  const [installing, setInstalling] = useState(false);
  const ios = isIOSDevice();

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      window.deferredPrompt = null;
      setDeferredPrompt(null);
      markInstalled();
      reportInstall();
      setInstalled(true);
    };

    // Detect an already-installed app even when browsing in a normal tab
    if (navigator.getInstalledRelatedApps) {
      navigator
        .getInstalledRelatedApps()
        .then((apps) => {
          if (apps && apps.length > 0) {
            markInstalled();
            setInstalled(true);
          }
        })
        .catch(() => {});
    }

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = (e) => {
      if (e.matches) setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    if (standaloneMedia.addEventListener) {
      standaloneMedia.addEventListener('change', onDisplayModeChange);
    } else if (standaloneMedia.addListener) {
      standaloneMedia.addListener(onDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      if (standaloneMedia.removeEventListener) {
        standaloneMedia.removeEventListener('change', onDisplayModeChange);
      } else if (standaloneMedia.removeListener) {
        standaloneMedia.removeListener(onDisplayModeChange);
      }
    };
  }, []);

  // Once installed, the card never renders again.
  if (installed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        markInstalled();
        reportInstall();
        setInstalled(true);
      }
    } catch (error) {
      console.error('InstallAppCard: install prompt failed', error);
    } finally {
      // The prompt can only be consumed once; the card stays visible
      // until the app is actually installed.
      window.deferredPrompt = null;
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-3 sm:inset-x-0 sm:bottom-6 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-5 animate-slideUp">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={appLogo}
            alt="Umunsi Media"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gray-100 dark:bg-gray-700 p-2 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Install Umunsi Media
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Get the full app experience — faster loading, offline access, and notifications.
            </p>
          </div>
        </div>

        {ios && !deferredPrompt ? (
          <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 p-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <p className="flex items-center gap-2">
              <Share className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <span>
                Tap <strong>Share</strong> in Safari, then choose
              </span>
            </p>
            <p className="flex items-center gap-2 mt-2">
              <PlusSquare className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <span>
                <strong>Add to Home Screen</strong> to install the app.
              </span>
            </p>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            disabled={installing || !deferredPrompt}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors duration-200"
          >
            <Download className="h-5 w-5" />
            <span>{installing ? 'Installing…' : 'Install App'}</span>
          </button>
        )}

        {!ios && !deferredPrompt && (
          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            If the button is unavailable, open your browser menu and choose
            <strong> “Install app”</strong> or <strong>“Add to Home screen”</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default InstallAppCard;
