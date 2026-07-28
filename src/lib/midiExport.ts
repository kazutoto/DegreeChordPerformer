import { RecordedChord } from '../types';

// Helper to encode variable-length quantity for MIDI format
function writeVarInt(value: number): number[] {
  let buffer = value & 0x7f;
  let bytes: number[] = [];

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

// Generate Standard MIDI File Type 0 binary blob for recorded chords
export function exportChordsToMidiFile(
  chords: RecordedChord[],
  bpm: number = 120,
  filename: string = 'chord_progression.mid'
) {
  if (chords.length === 0) return;

  const ticksPerQuarter = 480;
  // Microseconds per quarter note at specified BPM
  const usPerQuarter = Math.round(60000000 / bpm);

  let trackEvents: number[] = [];

  // Set Tempo Meta Event
  trackEvents.push(0x00); // Delta time 0
  trackEvents.push(0xff, 0x51, 0x03); // Meta: Set Tempo
  trackEvents.push((usPerQuarter >> 16) & 0xff);
  trackEvents.push((usPerQuarter >> 8) & 0xff);
  trackEvents.push(usPerQuarter & 0xff);

  let currentTicks = 0;
  const quarterNoteMs = (60 / bpm) * 1000;

  chords.forEach((recorded) => {
    const durationMs = recorded.durationMs || 1000;
    const durationTicks = Math.round((durationMs / quarterNoteMs) * ticksPerQuarter);

    // Note On for all notes in chord
    recorded.midiNotes.forEach((note, index) => {
      const deltaTime = index === 0 ? 0 : 0; // Simultaneous notes
      const deltaBytes = writeVarInt(deltaTime);
      trackEvents.push(...deltaBytes);
      trackEvents.push(0x90, note, 100); // Channel 1, Note On, Velocity 100
    });

    // Note Off for all notes after chord duration
    recorded.midiNotes.forEach((note, index) => {
      const deltaTime = index === 0 ? durationTicks : 0;
      const deltaBytes = writeVarInt(deltaTime);
      trackEvents.push(...deltaBytes);
      trackEvents.push(0x80, note, 0); // Channel 1, Note Off
    });

    currentTicks += durationTicks;
  });

  // End of Track Meta Event
  trackEvents.push(0x00, 0xff, 0x2f, 0x00);

  // Header Chunk (MThd)
  const headerChunk = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Chunk length 6
    0x00, 0x00,             // Format 0
    0x00, 0x01,             // 1 Track
    (ticksPerQuarter >> 8) & 0xff, ticksPerQuarter & 0xff, // Division
  ];

  // Track Chunk (MTrk)
  const trackLength = trackEvents.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
  ];

  const fullMidi = new Uint8Array([
    ...headerChunk,
    ...trackHeader,
    ...trackEvents,
  ]);

  const blob = new Blob([fullMidi], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
