import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundManager } from '../utils/audio';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, isIOS, isStandalone, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('ecopulse_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isStandalone || isInstalled || dismissed || !canInstall) {
    return null;
  }

  const handleInstallClick = async () => {
    soundManager.playClick();
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('ecopulse_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      <div className="relative border-b border-emerald-900/60 bg-gradient-to-r from-[#092015] via-[#0b271a] to-[#092015] px-4 py-2.5 text-xs text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-white">Install EcoPulse Mobile App</span>
              <span className="hidden sm:inline text-neutral-300 ml-1.5">
                — Add to your home screen for offline habit tracking & instant alerts.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-sm"
            >
              {installSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Installed!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Install App</span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-emerald-900 bg-[#0c1913] p-6 text-white shadow-2xl">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-lg">Install on iOS Safari</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              To install EcoPulse as a standalone mobile app on iPhone or iPad:
            </p>

            <ol className="mt-4 space-y-3 text-xs text-neutral-200">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top-right corner.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
