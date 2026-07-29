/*
 * Copyright 2026 kazutoto
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { MidiState } from '../types';
import { midiEngine } from '../lib/midiEngine';
import { Sliders, RefreshCw, Terminal, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';

interface MidiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  midiState: MidiState;
}

export const MidiSettingsModal: React.FC<MidiSettingsModalProps> = ({
  isOpen,
  onClose,
  midiState,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Web MIDI DAW 連携設定</h2>
              <p className="text-xs text-slate-400">外部DAWやシンセサイザーへリアルタイムMIDI信号を出力</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Status Banner */}
          {!midiState.isSupported ? (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Web MIDI API 非対応ブラウザです</p>
                <p className="mt-1">
                  Google Chrome、Microsoft Edge、Brave などのWeb MIDI API対応ブラウザをご利用ください。
                </p>
              </div>
            </div>
          ) : !midiState.isEnabled ? (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Web MIDI アクセス許可がまだ有効になっていません。</span>
              </div>
              <button
                onClick={() => midiEngine.initMidi()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors shadow shrink-0"
              >
                MIDI接続を許可
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Web MIDI 有効: 検出済みポート数 [Out: {midiState.outputs.length} / In: {midiState.inputs.length}]
              </span>
              <button
                onClick={() => midiEngine.initMidi()}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 transition-colors"
                title="ポート再検索"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>再検出</span>
              </button>
            </div>
          )}

          {/* MIDI Input Port Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">MIDI 入力デバイス (Input)</label>
            <select
              disabled={!midiState.isEnabled}
              value={midiState.selectedInputId || 'none'}
              onChange={(e) => midiEngine.selectInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="none">入力デバイスなし (None)</option>
              <option value="all">すべての入力デバイス (All Inputs)</option>
              {midiState.inputs.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.manufacturer})
                </option>
              ))}
            </select>
          </div>

          {/* MIDI Output Port Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">MIDI 出力デバイス / 仮想MIDIポート (Output)</label>
            <select
              disabled={!midiState.isEnabled || midiState.outputs.length === 0}
              value={midiState.selectedOutputId || ''}
              onChange={(e) => midiEngine.selectOutput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {midiState.outputs.length === 0 ? (
                <option value="">(利用可能なMIDI出力ポートが見つかりません)</option>
              ) : (
                midiState.outputs.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} ({dev.manufacturer})
                  </option>
                ))
              )}
            </select>
            <p className="text-[11px] text-slate-400">
              ※ Cubase, Ableton Live, Studio One, Logic Pro などのDAWと連携する場合は、<code className="text-emerald-400 font-mono">loopMIDI</code> (Windows) や <code className="text-emerald-400 font-mono">IAC Driver</code> (Mac) などの仮想MIDIドライバーを選択してください。
            </p>
          </div>

          {/* Channels Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                入力チャンネル (Input Ch: {midiState.inputChannel})
              </label>
              <select
                disabled={!midiState.isEnabled}
                value={midiState.inputChannel}
                onChange={(e) => midiEngine.setInputChannel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="all">すべてのチャンネル</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                  <option key={ch} value={ch}>
                    チャンネル {ch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                出力チャンネル (Output Ch: {midiState.outputChannel})
              </label>
              <select
                disabled={!midiState.isEnabled}
                value={midiState.outputChannel}
                onChange={(e) => midiEngine.setOutputChannel(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                  <option key={ch} value={ch}>
                    チャンネル {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Velocity Settings */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              ベロシティ (Velocity: {midiState.velocity})
            </label>
            <input
              type="range"
              min="1"
              max="127"
              value={midiState.velocity}
              onChange={(e) => midiEngine.setVelocity(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>

          {/* Live MIDI Log Console */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                リアルタイム MIDI ログモニター
              </span>
              <button
                onClick={() => midiEngine.clearLog()}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
              >
                ログ消去
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1">
              {midiState.log.length === 0 ? (
                <div className="text-slate-600 italic">MIDI信号はまだ送信されていません...</div>
              ) : (
                midiState.log.map((entry, idx) => <div key={idx}>{entry}</div>)
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={() => midiEngine.sendAllNotesOff()}
            className="px-3 py-2 bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl transition-colors"
          >
            All Notes Off (消音)
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            完了 (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
