const fs = require('fs');
let code = fs.readFileSync('src/components/MidiSettingsModal.tsx', 'utf8');

// Update output length message
code = code.replace(
  /検出済みポート数 \[\{midiState\.outputs\.length\}\]/g,
  `検出済みポート数 [Out: {midiState.outputs.length} / In: {midiState.inputs.length}]`
);

// Add input port selector
const inputSelector = `          {/* MIDI Input Port Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">MIDI 入力デバイス</label>
            <select
              disabled={!midiState.isEnabled}
              value={midiState.selectedInputId || 'all'}
              onChange={(e) => midiEngine.selectInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="all">すべての入力デバイス (All Inputs)</option>
              {midiState.inputs.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.manufacturer})
                </option>
              ))}
            </select>
          </div>

          {/* MIDI Output Port Selector */}`;

code = code.replace(/          \{\/\* MIDI Port Selector \*\/\}/g, inputSelector);

// Update Channels (Input and Output)
const channelsSection = `          {/* Channel Settings */}
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

          {/* Velocity Settings */}`;

code = code.replace(
  /          \{\/\* Channel \& Velocity \*\/\}\n          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n            <div className="space-y-1\.5">\n              <label className="text-xs font-bold text-slate-300">\n                MIDI チャンネル \(Channel: \{midiState\.channel\}\)\n              <\/label>\n              <select\n                disabled=\{\!midiState\.isEnabled\}\n                value=\{midiState\.channel\}\n                onChange=\{\(e\) => midiEngine\.setChannel\(parseInt\(e\.target\.value\)\)\}\n                className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50"\n              >\n                \{Array\.from\(\{ length: 16 \}, \(\_, i\) => i \+ 1\)\.map\(\(ch\) => \(\n                  <option key=\{ch\} value=\{ch\}>\n                    チャンネル \{ch\}\n                  <\/option>\n                \)\)\}\n              <\/select>\n            <\/div>/g,
  channelsSection
);

fs.writeFileSync('src/components/MidiSettingsModal.tsx', code);
