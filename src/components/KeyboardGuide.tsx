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
import { Keyboard, Command, HelpCircle } from 'lucide-react';

export const KeyboardGuide: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2.5">
        <Keyboard className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          PCキーボード演奏操作ガイド (Keyboard Mapping)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Hand: Modifiers Ctrl / Alt / A / S / D / Z / X / C / V / W / Q */}
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            コード拡張 & 操作
          </div>
          <div className="space-y-2 text-xs font-mono">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <kbd className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-xs text-center">Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-xs text-center">0</kbd>
                </div>
                <div>
                  <div className="text-emerald-300 font-bold">Swap On/Off</div>
                  <div className="text-[10px] text-slate-400">Major ⇄ Minor</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                <kbd className="px-2 py-1 bg-pink-600 text-white rounded font-bold text-xs">Alt</kbd>
                <div>
                  <div className="text-pink-300 font-bold">♭ (Flat)</div>
                  <div className="text-[10px] text-slate-400">半音下げ</div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                <kbd className="px-2 py-1 bg-rose-600 text-white rounded font-bold text-xs">Q</kbd>
                <div>
                  <div className="text-rose-300 font-bold">進行クリア</div>
                  <div className="text-[10px] text-slate-400">コード進行消去</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                <kbd className="px-2 py-1 bg-cyan-600 text-white rounded font-bold text-xs">W</kbd>
                <div>
                  <div className="text-cyan-300 font-bold">Strum</div>
                  <div className="text-[10px] text-slate-400">和音ストローク切替</div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-orange-600 text-white rounded font-bold text-xs">A</kbd>
                <div>
                  <div className="text-orange-300 font-bold leading-tight">aug</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-amber-600 text-white rounded font-bold text-xs">S</kbd>
                <div>
                  <div className="text-amber-300 font-bold leading-tight">sus4</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-xs">D</kbd>
                <div>
                  <div className="text-rose-300 font-bold leading-tight">dim</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-yellow-500 text-white rounded font-bold text-[10px]">F</kbd>
                <div>
                  <div className="text-yellow-400 font-bold leading-tight whitespace-nowrap scale-90">m7(♭5)</div>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold text-xs">Z</kbd>
                <div>
                  <div className="text-purple-300 font-bold leading-tight">9th</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold text-xs">X</kbd>
                <div>
                  <div className="text-indigo-300 font-bold leading-tight">7th</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-sky-600 text-white rounded font-bold text-xs">C</kbd>
                <div>
                  <div className="text-sky-300 font-bold leading-tight">M7</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col items-center text-center gap-1">
                <kbd className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold text-xs">V</kbd>
                <div>
                  <div className="text-blue-300 font-bold leading-tight">6th</div>
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center justify-center gap-2">
              <kbd className="px-4 py-1 bg-slate-700 text-slate-200 rounded font-bold text-xs w-full max-w-[120px] text-center">Space</kbd>
              <div>
                <div className="text-slate-200 font-bold">サステイン (Sustain)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Numpad / Digit keys */}
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            和音 & ベース入力
          </div>
          <div className="mb-2 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-indigo-400">フルキー数字 (1〜7):</span>
              <span className="text-slate-300">分数コードベース音 指定</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-indigo-400">テンキー (1〜7):</span>
              <span className="text-slate-300">和音発音 (ON/OFF制御)</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs max-w-xs mx-auto">
            {/* Top Row: 7, 8, 9 */}
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">7</span>
              <span className="text-[10px] text-slate-300">7度 (VII)</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 flex flex-col items-center justify-center opacity-40">
              <span className="text-slate-600 font-bold text-sm">8</span>
              <span className="text-[10px] text-slate-600">-</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 flex flex-col items-center justify-center opacity-40">
              <span className="text-slate-600 font-bold text-sm">9</span>
              <span className="text-[10px] text-slate-600">-</span>
            </div>

            {/* Middle Row: 4, 5, 6 */}
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">4</span>
              <span className="text-[10px] text-slate-300">4度 (IV)</span>
            </div>
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">5</span>
              <span className="text-[10px] text-slate-300">5度 (V)</span>
            </div>
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">6</span>
              <span className="text-[10px] text-slate-300">6度 (VI)</span>
            </div>

            {/* Bottom Row: 1, 2, 3 */}
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">1</span>
              <span className="text-[10px] text-slate-300">1度 (I)</span>
            </div>
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">2</span>
              <span className="text-[10px] text-slate-300">2度 (II)</span>
            </div>
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-1.5 flex flex-col items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">3</span>
              <span className="text-[10px] text-slate-300">3度 (III)</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-3 items-center">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2 min-w-[140px] justify-center">
              <kbd className="px-1.5 py-1 bg-slate-700 text-slate-200 rounded font-bold text-xs">+ / -</kbd>
              <div>
                <div className="text-slate-200 font-bold">キー移調</div>
                <div className="text-[10px] text-slate-400">半音上げ / 下げ</div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2 min-w-[140px] justify-center">
              <kbd className="px-1.5 py-1 bg-slate-700 text-slate-200 rounded font-bold text-xs">* / /</kbd>
              <div>
                <div className="text-slate-200 font-bold">キー移調</div>
                <div className="text-[10px] text-slate-400">+5 / -5 半音</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            ※ テンキーの <code className="text-indigo-300 font-mono">1</code> 〜 <code className="text-indigo-300 font-mono">7</code> で和音を発音します。キーボード上部の数字キー <code className="text-indigo-300 font-mono">1</code> 〜 <code className="text-indigo-300 font-mono">7</code> を押しながらテンキーを弾くと分数コードになります。
          </p>
        </div>
      </div>
    </div>
  );
};
