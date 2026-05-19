import { useState, useRef, useCallback, useEffect } from 'react';

// ---- Note data ----
const WHITE_KEYS = [
  { id: 'C3',  freq: 130.81 },
  { id: 'D3',  freq: 146.83 },
  { id: 'E3',  freq: 164.81 },
  { id: 'F3',  freq: 174.61 },
  { id: 'G3',  freq: 196.00 },
  { id: 'A3',  freq: 220.00 },
  { id: 'B3',  freq: 246.94 },
  { id: 'C4',  freq: 261.63 },
  { id: 'D4',  freq: 293.66 },
  { id: 'E4',  freq: 329.63 },
  { id: 'F4',  freq: 349.23 },
  { id: 'G4',  freq: 392.00 },
  { id: 'A4',  freq: 440.00 },
  { id: 'B4',  freq: 493.88 },
];

// bx = black key center x, in white-key-width units from left edge
const BLACK_KEYS = [
  { id: 'Cs3', freq: 138.59, bx: 0.65  },
  { id: 'Ds3', freq: 155.56, bx: 1.67  },
  { id: 'Fs3', freq: 185.00, bx: 3.63  },
  { id: 'Gs3', freq: 207.65, bx: 4.57  },
  { id: 'As3', freq: 233.08, bx: 5.63  },
  { id: 'Cs4', freq: 277.18, bx: 7.65  },
  { id: 'Ds4', freq: 311.13, bx: 8.67  },
  { id: 'Fs4', freq: 369.99, bx: 10.63 },
  { id: 'Gs4', freq: 415.30, bx: 11.57 },
  { id: 'As4', freq: 466.16, bx: 12.63 },
];

const NOTE_MAP = new Map([
  ...WHITE_KEYS.map(n => [n.id, n]),
  ...BLACK_KEYS.map(n => [n.id, n]),
]);

const WKC = WHITE_KEYS.length; // 14 white keys

// ---- Parameter mapping ----
function mapExp(v, min, max) { return min * Math.pow(max / min, v); }
function mapLin(v, min, max) { return min + (max - min) * v; }

const RANGES = {
  cutoff:    [200,   8000, 'exp'],
  resonance: [0.5,   18,   'lin'],
  attack:    [0.003, 2.0,  'exp'],
  decay:     [0.01,  2.0,  'exp'],
  sustain:   [0.0,   1.0,  'lin'],
  release:   [0.01,  4.0,  'exp'],
  lfoRate:   [0.1,   12.0, 'exp'],
  lfoDepth:  [0,     1200, 'lin'],
  detune:    [0,     30,   'lin'],
  volume:    [0,     1,    'lin'],
};

function mapParam(name, v) {
  const [min, max, type] = RANGES[name];
  return type === 'exp' ? mapExp(v, min, max) : mapLin(v, min, max);
}

// ---- Knob ----
function Knob({ value, onChange, label }) {
  const dragRef = useRef(null);
  const size = 48;
  const angle = -135 + value * 270;
  const rad = angle * (Math.PI / 180);
  const r = size / 2 - 5;
  const cx = size / 2, cy = size / 2;
  const ix = cx + r * 0.68 * Math.sin(rad);
  const iy = cy - r * 0.68 * Math.cos(rad);

  const moveDrag = useCallback((clientY) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - clientY;
    onChange(Math.max(0, Math.min(1, dragRef.current.startVal + dy / 130)));
  }, [onChange]);

  useEffect(() => {
    const onMove = (e) => moveDrag(e.clientY);
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [moveDrag]);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'ns-resize' }}
      onMouseDown={(e) => { e.preventDefault(); dragRef.current = { startY: e.clientY, startVal: value }; }}
      onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); dragRef.current = { startY: e.touches[0].clientY, startVal: value }; }}
      onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
      onTouchEnd={(e) => { e.preventDefault(); dragRef.current = null; }}
    >
      <svg width={size} height={size}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="#252010" strokeWidth={1} />
        {/* Knob body */}
        <circle cx={cx} cy={cy} r={r} fill="url(#kg)" stroke="#3a3218" strokeWidth={1} />
        <defs>
          <radialGradient id="kg" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#2e2a18" />
            <stop offset="100%" stopColor="#18150a" />
          </radialGradient>
        </defs>
        {/* Indicator line */}
        <line x1={cx} y1={cy} x2={ix} y2={iy} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={2.5} fill="#1a1710" />
      </svg>
      <span style={{ fontSize: 8, color: '#5a5038', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

// ---- Waveform selector ----
const WAVES = ['sawtooth', 'square', 'sine', 'triangle'];
const WAVE_GLYPHS = { sawtooth: '/\\', square: '⊓', sine: '∿', triangle: '/\\/' };

function WaveSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {WAVES.map(w => {
        const active = value === w;
        return (
          <button
            key={w}
            onTouchStart={(e) => { e.preventDefault(); onChange(w); }}
            onClick={() => onChange(w)}
            style={{
              width: 38, height: 30,
              background: active ? '#f59e0b18' : 'transparent',
              color: active ? '#f59e0b' : '#4a4030',
              border: `1px solid ${active ? '#f59e0b66' : '#2a2618'}`,
              borderRadius: 3,
              fontSize: w === 'sine' ? 14 : 10,
              cursor: 'pointer',
              fontFamily: 'monospace',
              padding: 0,
              touchAction: 'manipulation',
              letterSpacing: w === 'triangle' ? '-2px' : 0,
            }}
          >
            {WAVE_GLYPHS[w]}
          </button>
        );
      })}
    </div>
  );
}

// ---- Keyboard ----
function Keyboard({ onNoteOn, onNoteOff, activeNotes }) {
  const ref = useRef(null);
  const touchMap = useRef(new Map()); // touchId -> noteId

  const hitTest = useCallback((clientX, clientY) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const wkw = rect.width / WKC;
    const bkh = rect.height * 0.60;

    for (const bk of BLACK_KEYS) {
      const kcx = bk.bx * wkw;
      const hw = wkw * 0.33;
      if (y <= bkh && x >= kcx - hw && x <= kcx + hw) return bk.id;
    }
    const wi = Math.floor(x / wkw);
    if (wi >= 0 && wi < WKC) return WHITE_KEYS[wi].id;
    return null;
  }, []);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const id = hitTest(t.clientX, t.clientY);
      if (id && !touchMap.current.has(t.identifier)) {
        touchMap.current.set(t.identifier, id);
        onNoteOn(NOTE_MAP.get(id));
      }
    }
  }, [hitTest, onNoteOn]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const newId = hitTest(t.clientX, t.clientY);
      const prevId = touchMap.current.get(t.identifier);
      if (newId !== prevId) {
        if (prevId) onNoteOff(prevId);
        if (newId) {
          touchMap.current.set(t.identifier, newId);
          onNoteOn(NOTE_MAP.get(newId));
        } else {
          touchMap.current.delete(t.identifier);
        }
      }
    }
  }, [hitTest, onNoteOn, onNoteOff]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const id = touchMap.current.get(t.identifier);
      if (id) {
        onNoteOff(id);
        touchMap.current.delete(t.identifier);
      }
    }
  }, [onNoteOff]);

  const BKW = 0.66; // black key width as fraction of white key width

  return (
    <div
      ref={ref}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none', background: '#111' }}
    >
      {/* White keys */}
      {WHITE_KEYS.map((key, i) => {
        const pressed = activeNotes.has(key.id);
        return (
          <div key={key.id} style={{
            position: 'absolute',
            left: `${(i / WKC) * 100}%`,
            width: `${100 / WKC}%`,
            top: 0, bottom: 0,
            background: pressed
              ? 'linear-gradient(to bottom, #ffe08a, #ffd060)'
              : 'linear-gradient(to bottom, #f0e8d0, #e8dfc8)',
            border: '1px solid #9a9080',
            borderTop: '2px solid #6a6050',
            borderRadius: '0 0 5px 5px',
            boxSizing: 'border-box',
            transition: 'background 0.03s',
          }} />
        );
      })}
      {/* Black keys */}
      {BLACK_KEYS.map((key) => {
        const pressed = activeNotes.has(key.id);
        return (
          <div key={key.id} style={{
            position: 'absolute',
            left: `${((key.bx - BKW / 2) / WKC) * 100}%`,
            width: `${(BKW / WKC) * 100}%`,
            top: 0,
            height: '60%',
            background: pressed
              ? 'linear-gradient(to bottom, #884400, #662200)'
              : 'linear-gradient(to bottom, #282010, #0e0c08)',
            border: `1px solid ${pressed ? '#aa5500' : '#3a3020'}`,
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            zIndex: 2,
            boxSizing: 'border-box',
            boxShadow: pressed ? 'none' : '2px 3px 6px rgba(0,0,0,0.6)',
            transition: 'background 0.03s',
          }} />
        );
      })}
    </div>
  );
}

// ---- Main Synth ----
export default function Synth() {
  const [waveform, setWaveform] = useState('sawtooth');
  const [params, setParams] = useState({
    cutoff: 0.55, resonance: 0.2,  attack: 0.04,  decay: 0.3,
    sustain: 0.6, release: 0.35,   lfoRate: 0.3,  lfoDepth: 0.0,
    detune: 0.12, volume: 0.75,
  });
  const [activeNotes, setActiveNotes] = useState(new Set());

  const ctxRef      = useRef(null);
  const masterRef   = useRef(null);
  const filterRef   = useRef(null);
  const lfoRef      = useRef(null);
  const lfoGainRef  = useRef(null);
  const voicesRef   = useRef(new Map());
  const paramsRef   = useRef(params);
  const waveRef     = useRef(waveform);

  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { waveRef.current = waveform; }, [waveform]);

  const initAudio = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const p = paramsRef.current;

    const mg = ctx.createGain();
    mg.gain.value = mapParam('volume', p.volume);
    mg.connect(ctx.destination);

    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = mapParam('cutoff', p.cutoff);
    f.Q.value = mapParam('resonance', p.resonance);
    f.connect(mg);

    const lfOsc = ctx.createOscillator();
    lfOsc.type = 'sine';
    lfOsc.frequency.value = mapParam('lfoRate', p.lfoRate);
    lfOsc.start();

    const lfGain = ctx.createGain();
    lfGain.gain.value = mapParam('lfoDepth', p.lfoDepth);
    lfOsc.connect(lfGain);
    lfGain.connect(f.frequency);

    ctxRef.current    = ctx;
    masterRef.current = mg;
    filterRef.current = f;
    lfoRef.current    = lfOsc;
    lfoGainRef.current = lfGain;
    return ctx;
  }, []);

  const applyParams = useCallback((p) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    filterRef.current?.frequency.setTargetAtTime(mapParam('cutoff', p.cutoff), now, 0.015);
    filterRef.current?.Q.setTargetAtTime(mapParam('resonance', p.resonance), now, 0.015);
    lfoRef.current?.frequency.setTargetAtTime(mapParam('lfoRate', p.lfoRate), now, 0.015);
    lfoGainRef.current?.gain.setTargetAtTime(mapParam('lfoDepth', p.lfoDepth), now, 0.015);
    masterRef.current?.gain.setTargetAtTime(mapParam('volume', p.volume), now, 0.015);
  }, []);

  const setParam = useCallback((key, val) => {
    setParams(prev => {
      const next = { ...prev, [key]: val };
      paramsRef.current = next;
      applyParams(next);
      return next;
    });
  }, [applyParams]);

  const noteOn = useCallback((note) => {
    const ctx = initAudio();
    if (voicesRef.current.has(note.id)) return;
    const p = paramsRef.current;
    const now = ctx.currentTime;
    const atk = mapParam('attack', p.attack);
    const dec = mapParam('decay', p.decay);
    const sus = mapParam('sustain', p.sustain);
    const det = mapParam('detune', p.detune);

    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.001, now);
    gn.gain.linearRampToValueAtTime(1, now + atk);
    gn.gain.setTargetAtTime(sus, now + atk, dec / 3);
    gn.connect(filterRef.current);

    const o1 = ctx.createOscillator();
    o1.type = waveRef.current;
    o1.frequency.value = note.freq;
    o1.detune.value = det;
    o1.connect(gn);
    o1.start(now);

    // Second oscillator slightly detuned for thickness
    const o2 = ctx.createOscillator();
    o2.type = waveRef.current;
    o2.frequency.value = note.freq;
    o2.detune.value = -det;
    o2.connect(gn);
    o2.start(now);

    voicesRef.current.set(note.id, { o1, o2, gn });
    setActiveNotes(prev => new Set([...prev, note.id]));
  }, [initAudio]);

  const noteOff = useCallback((noteId) => {
    const voice = voicesRef.current.get(noteId);
    if (!voice) return;
    const ctx = ctxRef.current;
    const p = paramsRef.current;
    const now = ctx.currentTime;
    const rel = mapParam('release', p.release);
    const sus = mapParam('sustain', p.sustain);

    voice.gn.gain.cancelScheduledValues(now);
    voice.gn.gain.setValueAtTime(sus, now);
    voice.gn.gain.exponentialRampToValueAtTime(0.0001, now + rel);

    const { o1, o2, gn } = voice;
    setTimeout(() => {
      try { o1.stop(); o2.stop(); } catch (_) {}
      gn.disconnect();
    }, (rel + 0.15) * 1000);

    voicesRef.current.delete(noteId);
    setActiveNotes(prev => { const s = new Set(prev); s.delete(noteId); return s; });
  }, []);

  const changeWave = useCallback((w) => {
    setWaveform(w);
    waveRef.current = w;
    voicesRef.current.forEach(({ o1, o2 }) => {
      try { o1.type = w; o2.type = w; } catch (_) {}
    });
  }, []);

  const P = params;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      background: '#0e0c08',
      color: '#c8bb99',
      fontFamily: "'Courier New', Courier, monospace",
      overflow: 'hidden',
      WebkitUserSelect: 'none',
      userSelect: 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        background: '#100e08',
        borderBottom: '1px solid #2a2618',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: '0.22em', color: '#f59e0b' }}>FREQSYNTH</div>
          <div style={{ fontSize: 8, color: '#3a3020', letterSpacing: '0.18em', marginTop: 1 }}>ANALOG SYNTHESIZER</div>
        </div>
        <WaveSelector value={waveform} onChange={changeWave} />
      </div>

      {/* Controls panel */}
      <div style={{
        padding: '10px 14px 8px',
        background: '#0e0c08',
        borderBottom: '2px solid #1a1810',
        flexShrink: 0,
      }}>
        {/* Filter + LFO + Volume row */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: '#3a3020', letterSpacing: '0.22em', marginBottom: 7 }}>— FILTER / LFO —</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Knob value={P.cutoff}    onChange={v => setParam('cutoff', v)}    label="CUTOFF" />
            <Knob value={P.resonance} onChange={v => setParam('resonance', v)} label="RESO" />
            <Knob value={P.lfoRate}   onChange={v => setParam('lfoRate', v)}   label="LFO F" />
            <Knob value={P.lfoDepth}  onChange={v => setParam('lfoDepth', v)}  label="LFO D" />
            <Knob value={P.volume}    onChange={v => setParam('volume', v)}     label="VOL" />
          </div>
        </div>
        {/* Envelope row */}
        <div>
          <div style={{ fontSize: 8, color: '#3a3020', letterSpacing: '0.22em', marginBottom: 7 }}>— ENVELOPE —</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Knob value={P.attack}  onChange={v => setParam('attack', v)}  label="ATK" />
            <Knob value={P.decay}   onChange={v => setParam('decay', v)}   label="DEC" />
            <Knob value={P.sustain} onChange={v => setParam('sustain', v)} label="SUS" />
            <Knob value={P.release} onChange={v => setParam('release', v)} label="REL" />
            <Knob value={P.detune}  onChange={v => setParam('detune', v)}  label="DETUNE" />
          </div>
        </div>
      </div>

      {/* Keyboard — takes remaining vertical space */}
      <div style={{
        flex: 1,
        minHeight: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        overflow: 'hidden',
      }}>
        <Keyboard onNoteOn={noteOn} onNoteOff={noteOff} activeNotes={activeNotes} />
      </div>
    </div>
  );
}
