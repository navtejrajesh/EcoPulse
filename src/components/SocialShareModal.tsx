import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { Badge, MotivationalQuote, UserProfile } from '../types';
import { generateSocialCardBlob, buildShareUrls, CardRenderOptions } from '../utils/canvasCard';
import { soundManager } from '../utils/audio';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  badges: Badge[];
  initialBadge?: Badge | null;
  initialQuote?: MotivationalQuote | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  user,
  badges,
  initialBadge = null,
  initialQuote = null,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(initialBadge);
  const [theme, setTheme] = useState<'emerald' | 'midnight' | 'solar'>('emerald');
  const [format, setFormat] = useState<'landscape' | 'square'>('landscape');
  const [customCaption, setCustomCaption] = useState<string>(
    initialQuote
      ? `"${initialQuote.quote}" — ${initialQuote.author}`
      : `Proud to take climate action with EcoPulse! Over ${user.totalCo2Kg.toFixed(1)}kg CO₂ prevented and a ${user.streak}-day streak.`
  );
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial badge if opened with a specific one
  useEffect(() => {
    if (initialBadge) {
      setSelectedBadge(initialBadge);
    }
  }, [initialBadge]);

  useEffect(() => {
    if (initialQuote) {
      setCustomCaption(`"${initialQuote.quote}" — ${initialQuote.author}`);
    }
  }, [initialQuote]);

  // Re-render canvas preview whenever options change
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGenerating(true);
    generateSocialCardBlob(canvas, {
      theme,
      badge: selectedBadge,
      user,
      customQuote: customCaption,
      format,
    })
      .then((url) => {
        setPreviewDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate social card', err);
      })
      .finally(() => {
        setGenerating(false);
      });
  }, [isOpen, theme, format, selectedBadge, customCaption, user]);

  if (!isOpen) return null;

  const unlockedBadges = badges.filter((b) => b.unlockedAt);

  const shareText = selectedBadge
    ? `I just unlocked the "${selectedBadge.name}" badge on EcoPulse! 🌿 ${user.streak}-day green habit streak and ${user.totalCo2Kg.toFixed(1)}kg CO₂ prevented.`
    : `Tracking my daily green habits on EcoPulse! 🌿 Reached a ${user.streak}-day streak with ${user.totalCo2Kg.toFixed(1)}kg CO₂ saved.`;

  const shareUrls = buildShareUrls({
    text: shareText,
    hashtags: ['EcoPulse', 'SustainableHabits', 'ClimateAction', 'GreenLiving'],
  });

  const handleDownload = () => {
    soundManager.playClick();
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `ecopulse-${selectedBadge ? selectedBadge.name.toLowerCase().replace(/\s+/g, '-') : 'achievement'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    soundManager.playClick();
    if (navigator.share) {
      try {
        // Attempt file share if supported
        if (canvasRef.current) {
          canvasRef.current.toBlob(async (blob) => {
            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'ecopulse-card.png', { type: 'image/png' })] })) {
              const file = new File([blob], 'ecopulse-achievement.png', { type: 'image/png' });
              await navigator.share({
                title: 'My EcoPulse Achievement',
                text: shareText,
                files: [file],
              });
              return;
            }
            // Fallback to text share
            await navigator.share({
              title: 'My EcoPulse Achievement',
              text: shareText,
              url: window.location.href,
            });
          });
        }
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(`${shareText} Join me: ${window.location.href}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-emerald-900 bg-[#0a1410] p-6 lg:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-emerald-400" />
          <h2 className="font-['Outfit'] text-2xl font-bold text-white">
            Share Studio & Social Media Integration
          </h2>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Generate verified achievement cards to inspire your followers on social channels.
        </p>

        {/* Hidden Canvas used for high-res generation */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Card Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full overflow-hidden rounded-xl border border-neutral-800 bg-black/40 shadow-2xl">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Social Achievement Card Preview"
                  className="w-full object-contain"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-xs text-neutral-500">
                  Generating card preview...
                </div>
              )}

              {generating && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="font-mono text-xs text-emerald-300">Updating card...</span>
                </div>
              )}
            </div>

            {/* Quick action bar beneath preview */}
            <div className="mt-4 flex w-full flex-wrap gap-2.5">
              <button
                onClick={handleDownload}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Instant Share</span>
              </button>

              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls & Social Buttons */}
          <div className="lg:col-span-5 space-y-5 text-xs">
            {/* Format toggle */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Card Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('landscape')}
                  className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                    format === 'landscape'
                      ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  Landscape (1200×630)
                </button>
                <button
                  onClick={() => setFormat('square')}
                  className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                    format === 'square'
                      ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  Square / Story (1080×1080)
                </button>
              </div>
            </div>

            {/* Badge Highlight Selector */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Highlight Badge
              </label>
              <select
                value={selectedBadge ? selectedBadge.id : 'none'}
                onChange={(e) => {
                  const b = badges.find((item) => item.id === e.target.value) || null;
                  setSelectedBadge(b);
                }}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="none">General Milestones & Carbon Avoided</option>
                {unlockedBadges.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.rarity.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Visual Aesthetic
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'emerald', label: '🌿 Emerald' },
                  { id: 'midnight', label: '🌌 Midnight' },
                  { id: 'solar', label: '☀️ Solar' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as any)}
                    className={`py-1.5 rounded-lg border text-center font-medium transition-colors ${
                      theme === th.id
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection / Quote Editor */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Quote or Reflection
              </label>
              <textarea
                rows={2}
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2.5 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="Share your personal commitment or inspiring quote..."
              />
            </div>

            {/* 1-Click Social Media Channels */}
            <div className="pt-2 border-t border-neutral-800/80">
              <label className="block font-semibold text-neutral-300 mb-2">
                1-Click Social Media Publish
              </label>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <Twitter className="h-3.5 w-3.5 text-sky-400" />
                  <span>X (Twitter)</span>
                </a>

                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={shareUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href={shareUrls.threads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Threads</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
