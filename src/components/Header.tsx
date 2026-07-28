import React from 'react';
import { Volume2, VolumeX, Sliders, Music, HelpCircle, Activity } from 'lucide-react';
import { MidiState, SoundPreset } from '../types';

interface HeaderProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
  preset: SoundPreset;
  onPresetChange: (preset: SoundPreset) => void;
  isStrumEnabled: boolean;
  onToggleStrum: () => void;
  midiState: MidiState;
  onOpenMidiModal: () => void;
  onOpenHelpModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  volume,
  onVolumeChange,
  preset,
  onPresetChange,
  isStrumEnabled,
  onToggleStrum,
  midiState,
  onOpenMidiModal,
  onOpenHelpModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
              Degree Chord Performer
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              テンキー &amp; 左手Z/X修飾キーでコード演奏 ｜ Web Audio &amp; Web MIDI DAW連携
            </p>
          </div>
        </div>

        {/* Quick Controls & Status */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          {/* Sound Preset Quick Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">音色:</span>
            <select
              value={preset}
              onChange={(e) => onPresetChange(e.target.value as SoundPreset)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="piano" className="bg-slate-800 text-slate-200">グランドピアノ (Piano)</option>
              <option value="epiano" className="bg-slate-800 text-slate-200">エレピ (E.Piano)</option>
              <option value="synth" className="bg-slate-800 text-slate-200">シンセパッド (Poly Synth)</option>
              <option value="organ" className="bg-slate-800 text-slate-200">オルガン (Hammond Organ)</option>
              <option value="pad" className="bg-slate-800 text-slate-200">アンビエント (Ethereal Pad)</option>
            </select>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title={volume === 0 ? 'ミュート解除' : 'ミュート'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Strum (Arpeggio) Option */}
          <button
            onClick={onToggleStrum}
            className={`w-[135px] shrink-0 whitespace-nowrap flex items-center justify-start gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isStrumEnabled
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="PCキーボードの[W]キーでもストロークOn/Off切り替え可能"
          >
            <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-slate-700/80 text-slate-300 shrink-0">W</span>
            <span className="font-mono shrink-0 text-left">{isStrumEnabled ? 'Strum ON 🎸' : 'Strum OFF'}</span>
          </button>

          {/* Web MIDI Output Button */}
          <button
            onClick={onOpenMidiModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              midiState.isEnabled && midiState.selectedOutputId
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : midiState.isEnabled
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>
              MIDI: {midiState.isEnabled ? (midiState.selectedOutputId ? '接続中' : '未選択') : '設定'}
            </span>
            <Sliders className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelpModal}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors"
            title="使い方・キー割り当て"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
