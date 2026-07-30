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
import { X, HelpCircle, Keyboard, Music, Activity } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Degree Chord Performer 使い方ガイド</h2>
              <p className="text-xs text-slate-400">キーボード操作方法・コード理論・DAW連携</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              1. 基本操作 (キーボード・テンキー)
            </h3>
            <ul className="list-disc list-inside space-y-1 bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
              <li>
                <strong className="text-white">右手操作 (テンキー / 数字キー 1〜7):</strong> 指定されたキーのディグリーコード (1度〜7度) を発音します。
              </li>
              <li>
                <strong className="text-white">左手修飾キー Z (9thコード):</strong> <code className="text-purple-300 font-mono">Z</code> キーを押しながらテンキーを押すと、9thコード (maj9, m9, 9など) に拡張されます。
              </li>
              <li>
                <strong className="text-white">左手修飾キー X (7thコード):</strong> <code className="text-indigo-300 font-mono">X</code> キーを押しながらテンキーを押すと、7thコード (maj7, m7, dom7, m7♭5など) に拡張されます。
              </li>
              <li>
                <strong className="text-white">左手修飾キー C (M7コード):</strong> <code className="text-sky-300 font-mono">C</code> キーを押しながらテンキーを押すと、7度がメジャーセブンス(長7度)に固定された M7 コードに変化します。
              </li>
              <li>
                <strong className="text-white">左手修飾キー V (6thコード):</strong> <code className="text-blue-300 font-mono">V</code> キーを押しながらテンキーを押すと、メジャーまたはマイナーの三和音に長6度上の音を加えた 6th コードに変化します。
              </li>
              <li>
                <strong className="text-white">修飾キー Ctrl / テンキー 0 (スワップ機能):</strong> <code className="text-emerald-300 font-mono">Ctrl</code> またはテンキーの <code className="text-emerald-300 font-mono">0</code> キーを押しながらテンキー(1〜7)を押すと、メジャーコードとマイナーコードを反転します (例: F ⇄ Fm, Dm ⇄ D)。
              </li>
              <li>
                <strong className="text-white">左手修飾キー D (ディミニッシュコード):</strong> <code className="text-rose-300 font-mono">D</code> キーを押しながらテンキーを押すと、短3度重ねのディミニッシュコード (dim / dim7) に変化します。
              </li>
              <li>
                <strong className="text-white">左手修飾キー A (オーギュメントコード):</strong> <code className="text-orange-300 font-mono">A</code> キーを押しながらテンキーを押すと、第5音が半音高くなったオーギュメントコード (aug) に変化します。
              </li>
              <li>
                <strong className="text-white">左手修飾キー S (sus4コード):</strong> <code className="text-amber-300 font-mono">S</code> キーを押しながらテンキーを押すと、第3音が完全4度（sus4）に置き換わったコード (sus4 / 7sus4) に変化します。
              </li>
              <li>
                <strong className="text-white">左手修飾キー Alt/Option (フラット):</strong> <code className="text-pink-300 font-mono">Alt</code> (Macは <code className="text-pink-300 font-mono">Option</code>) キーを押しながらテンキーを押すと、和音全体が半音下がったフラットコードとして演奏されます。
              </li>
              <li>
                <strong className="text-white">W キー (Strum / ストローク):</strong> <code className="text-cyan-300 font-mono">W</code> キーでギターのように和音を1音ずつ時間差でジャカジャーンと鳴らす Strum オプションの On/Off を切り替えます。
              </li>
              <li>
                <strong className="text-white">Q キー (進行クリア):</strong> 直近のコード進行（履歴）を即座にクリアします。ゴミ箱ボタンと同じ機能です。
              </li>
              <li>
                <strong className="text-white">E キー (展開形):</strong> コードの転回形 (Root, 1st Inv, 2nd Inv, 3rd Inv) を切り替えます。
              </li>
              <li>
                <strong className="text-white">テンキー + / - キー (キー移調):</strong> テンキーなどの <code className="text-amber-300 font-mono">+</code> で主音キーを半音上げ、<code className="text-amber-300 font-mono">-</code> で半音下げます。
              </li>
              <li>
                <strong className="text-white">Space キー (サステイン):</strong> 音を伸ばすサステインペダルとして機能します。
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Music className="w-4 h-4" />
              2. ディグリーネーム理論とは？
            </h3>
            <p className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
              ディグリーネームはキー (調) の主音を基準とした相対的な音階度数表記です。
              たとえば Key C Major において <code className="text-indigo-300 font-mono">I - IV - V - vi</code> は <code className="text-indigo-300 font-mono">C - F - G - Am</code> に対応し、
              Key G Major に変更すれば即座に <code className="text-indigo-300 font-mono">G - C - D - Em</code> として同一感覚で演奏できます。
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              3. 外部DAWとのWeb MIDI連携
            </h3>
            <p className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
              右上「MIDI: 設定」ボタンから、<code className="text-emerald-400 font-mono">loopMIDI</code> (Windows) や <code className="text-emerald-400 font-mono">IAC Driver</code> (Mac) などの仮想MIDIポートを選択することで、
              Cubase / Ableton Live / Logic Pro / Studio One などのDAWのMIDIトラックへ直接コードを入力・演奏可能です。
              また、演奏したコード進行は <code className="text-emerald-400 font-mono">.MID</code> ファイルとして書き出してDAWへドラッグ＆ドロップできます。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
