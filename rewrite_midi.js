const fs = require('fs');
let code = fs.readFileSync('src/lib/midiEngine.ts', 'utf8');

// 1. imports
code = code.replace(
  "import { MidiOutputDevice, MidiState } from '../types';",
  "import { MidiOutputDevice, MidiInputDevice, MidiState } from '../types';"
);

// 2. state initialization
code = code.replace(
  /outputs: \[\]\,\n    selectedOutputId: null\,\n    channel: 1\,/,
  `outputs: [],\n    inputs: [],\n    selectedOutputId: null,\n    selectedInputId: 'all',\n    outputChannel: 1,\n    inputChannel: 'all',`
);

// 3. updateOutputList -> updateDeviceLists in initMidi and onstatechange
code = code.replace(/this\.updateOutputList\(\)\;/g, "this.updateDeviceLists();");

// 4. rename updateOutputList method to updateDeviceLists, and also populate inputs
code = code.replace(
  /private updateOutputList\(\) \{[\s\S]*?this\.notifyListeners\(\)\;\n  \}/,
  `private updateDeviceLists() {
    if (!this.midiAccess) return;

    // Output Devices
    const outDevices: MidiOutputDevice[] = [];
    const outputs = this.midiAccess.outputs.values();
    for (const output of outputs) {
      outDevices.push({
        id: output.id,
        name: output.name || \`MIDI Out (\${output.id})\`,
        manufacturer: output.manufacturer || '汎用',
        state: output.state || 'connected',
      });
    }
    this.state.outputs = outDevices;

    if (outDevices.length > 0) {
      if (!this.state.selectedOutputId || !outDevices.some((d) => d.id === this.state.selectedOutputId)) {
        this.selectOutput(outDevices[0].id);
      }
    } else {
      this.selectedOutput = null;
      this.state.selectedOutputId = null;
    }

    // Input Devices
    const inDevices: MidiInputDevice[] = [];
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      input.onmidimessage = this.handleMidiMessage;
      inDevices.push({
        id: input.id,
        name: input.name || \`MIDI In (\${input.id})\`,
        manufacturer: input.manufacturer || '汎用',
        state: input.state || 'connected',
      });
    }
    this.state.inputs = inDevices;

    this.notifyListeners();
  }`
);

// 5. Filter handleMidiMessage
code = code.replace(
  /private handleMidiMessage\(event: any\) \{\n    this\.midiMessageListeners\.forEach\(\(listener\) => listener\(event\)\)\;\n  \}/,
  `private handleMidiMessage(event: any) {
    // Filter by selected input device ID if not 'all'
    if (this.state.selectedInputId !== 'all') {
      const inputId = event.target?.id || event.srcElement?.id;
      if (inputId !== this.state.selectedInputId) {
        return;
      }
    }
    
    // Filter by selected input channel if not 'all'
    if (this.state.inputChannel !== 'all') {
      const status = event.data[0];
      // Only filter Channel Voice Messages (0x80 to 0xEF)
      if (status >= 0x80 && status <= 0xEF) {
        const channel = (status & 0x0F) + 1;
        if (channel !== this.state.inputChannel) {
          return;
        }
      }
    }

    this.midiMessageListeners.forEach((listener) => listener(event));
  }`
);

// 6. setChannel -> setOutputChannel and add setInputChannel and selectInput
code = code.replace(
  /public setChannel\(channel: number\) \{\n    this\.state\.channel = Math\.max\(1\, Math\.min\(16\, channel\)\)\;\n    this\.notifyListeners\(\)\;\n  \}/,
  `public setOutputChannel(channel: number) {
    this.state.outputChannel = Math.max(1, Math.min(16, channel));
    this.notifyListeners();
  }

  public setInputChannel(channel: number | 'all') {
    this.state.inputChannel = channel === 'all' ? 'all' : Math.max(1, Math.min(16, channel));
    this.notifyListeners();
  }
  
  public selectInput(inputId: string | 'all') {
    this.state.selectedInputId = inputId;
    this.notifyListeners();
  }`
);

// 7. Update usage of this.state.channel to this.state.outputChannel
code = code.replace(/this\.state\.channel/g, 'this.state.outputChannel');

fs.writeFileSync('src/lib/midiEngine.ts', code);
