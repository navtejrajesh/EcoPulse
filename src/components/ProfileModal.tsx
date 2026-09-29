import React, { useState } from 'react';
import { X, User, MapPin, Award, RotateCcw, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { REGIONS_LIST } from '../data/initialData';
import { soundManager } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

const AVATAR_OPTIONS = ['🌱', '🌲', '🌿', '🌊', '☀️', '🦊', '🎋', '🌺', '🐝', '🦅', '🦉', '🌾'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onResetData,
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [selectedRegion, setSelectedRegion] = useState(user.region);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    onUpdateProfile({
      name: name.trim() || user.name,
      username: username.trim().toLowerCase() || user.username,
      avatar: selectedAvatar,
      region: selectedRegion,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-900 bg-[#0c1611] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-['Outfit'] text-xl font-bold text-white">
          Custodian Identity & Bioregion
        </h3>
        <p className="mt-1 text-xs text-neutral-400">
          Personalize your EcoPulse profile for regional leaderboards and certificates.
        </p>

        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          {/* Avatar selector */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1.5">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl border transition-transform ${
                    selectedAvatar === emoji
                      ? 'border-emerald-500 bg-emerald-500/20 scale-110 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-300">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-300">Handle / Username</label>
            <div className="mt-1 flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
              <span className="text-neutral-500 mr-1">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-300">Home Bioregion</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              {REGIONS_LIST.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-neutral-800/80">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset your habits and progress to defaults?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-400"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Habit Progress</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
              >
                {savedNotice ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
