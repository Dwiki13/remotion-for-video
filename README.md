# remotion-reels

Bikin video animasi teks untuk Instagram Reels pakai React + Remotion. Tidak ada screen recording, tidak ada editor video — semua dikontrol lewat code.

Setiap video terdiri dari scene-scene yang masing-masing punya background, ikon SVG animasi, dan teks yang muncul sinkron dengan voiceover. Output-nya MP4 1080×1920, siap upload.

---

## Prasyarat

- Node.js v18+
- Python 3.9+
- FFmpeg — `brew install ffmpeg`

---

## Setup

```bash
npm install
pip3 install openai-whisper --break-system-packages
```

---

## Struktur proyek

```
remotion/
├── public/          # audio voiceover (harus ada di sini untuk preview & render)
├── content/         # script narasi + output Whisper JSON
├── src/
│   ├── index.ts     # entry point
│   ├── Root.tsx     # daftar semua komposisi
│   └── Reel1Video.tsx
├── out/             # hasil render MP4
└── remotion.config.ts
```

---

## Workflow

### 1. Siapkan audio

Taruh file MP3 di `public/`:

```bash
cp ~/Downloads/vo-reel-baru.mp3 public/vo-reel-baru.mp3
```

Cek durasi:

```bash
ffprobe -v quiet -print_format json -show_format public/vo-reel-baru.mp3 | grep duration
```

Catat durasinya — nanti dipakai untuk `totalFrames` (`detik × 30`).

---

### 2. Transkripsi dengan Whisper

```bash
python3 -c "
import whisper, json

model = whisper.load_model('base')
result = model.transcribe(
    'public/vo-reel-baru.mp3',
    language='id',
    word_timestamps=True,
    verbose=False
)

with open('content/whisper-reel-baru.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

for seg in result['segments']:
    sf = round(seg['start'] * 30)
    ef = round(seg['end'] * 30)
    print(f'[{sf}f - {ef}f] {seg[\"text\"].strip()}')
"
```

Proses ini butuh 1–5 menit tergantung panjang audio.

Kalau hasil transkripsi banyak yang meleset, ganti `'base'` ke `'small'`.

---

### 3. Lihat timestamp per kata

Untuk menentukan kapan setiap kata muncul di layar:

```bash
python3 -c "
import json
with open('content/whisper-reel-baru.json') as f:
    data = json.load(f)

for seg in data['segments']:
    print(f'\n{seg[\"text\"].strip()}')
    for w in seg.get('words', []):
        sf = round(w['start'] * 30)
        print(f'  [{sf}f] {w[\"word\"].strip()}')
"
```

---

### 4. Buat file video baru

Buat `src/ReelBaruVideo.tsx`. Lihat `Reel1Video.tsx` sebagai referensi struktur.

Bagian yang perlu diisi:

**Total frame:**
```ts
export const reelBaruTotalFrames = 1920; // durasi_detik × 30
```

**Tema warna per scene** — satu objek per scene di array `THEMES`:
```ts
{ bg1: "#warna", bg2: "#warna", accent: "#warna", glow: "rgba(...)", dim: "rgba(...)", blob1: "#warna", blob2: "#warna" }
```

**Data teks per scene** — `delay` dihitung dari timestamp Whisper dikurangi offset scene:
```ts
const S1: Word[] = [
  { word: "jangan",   delay: 10 },
  { word: "buru-buru", delay: 17, h: true }, // h: true = highlight
];
```

**Scene offsets** — frame global tempat setiap scene mulai, sesuai Whisper:
```ts
const OFFSETS = [0, 116, 229, ...];
```

**Root komposisi:**
```tsx
export const ReelBaruVideo: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("vo-reel-baru.mp3")} />
    <Series>
      {/* scene-scene */}
    </Series>
  </AbsoluteFill>
);
```

---

### 5. Daftarkan di Root.tsx

```tsx
import { ReelBaruVideo, reelBaruTotalFrames } from "./ReelBaruVideo";

<Composition
  id="ReelBaruVideo"
  component={ReelBaruVideo}
  durationInFrames={reelBaruTotalFrames}
  fps={30}
  width={1080}
  height={1920}
/>
```

---

### 6. Preview

```bash
npm run start
```

Buka `http://localhost:3000`, pilih komposisi di sidebar kiri.

Shortcut di Studio:
- `Space` — play/pause
- `←` `→` — per frame
- `J` `K` `L` — rewind / pause / forward

Workflow yang efisien: scrub timeline dulu untuk cek timing, baru edit `delay` per kata kalau ada yang meleset.

---

### 7. Render

```bash
npx remotion render ReelBaruVideo out/reel-baru.mp4 --concurrency=4
```

Estimasi waktu render untuk video ~64 detik di MacBook tanpa GPU:
- Tanpa flag: ~20 menit
- Dengan `--concurrency=4`: ~5–8 menit

Kalau hanya ingin cek bagian tertentu:
```bash
npx remotion render ReelBaruVideo out/test.mp4 --frames=0-150
```

---

## Cara edit video yang sudah ada

### Ganti teks kata

Cari array scene yang ingin diubah (misal `S1`, `S2`), ubah `word`:

```ts
// sebelum
{ word: "marah.", delay: 74, h: true }

// sesudah
{ word: "frustrasi.", delay: 74, h: true }
```

### Ubah timing kata

Ubah nilai `delay`. Rumusnya: `delay = whisperFrame - sceneOffset`.

Contoh: kata diucapkan di frame 131, scene mulai di offset 116 → `delay = 15`.

### Ganti highlight

Tambah atau hapus `h: true` di kata yang diinginkan.

### Ganti warna scene

Edit array `THEMES` di indeks yang sesuai (indeks 0 = scene pertama, dst):

```ts
// sebelum
{ ..., accent: "#38bdf8", ... }

// sesudah — ganti ke violet
{ ..., accent: "#a78bfa", ... }
```

### Ganti ikon scene

Di bagian Root komposisi, ubah `Icon`:

```tsx
{ words: S1, Icon: IconNamaBaru, themeIdx: 0 }
```

Untuk buat ikon baru, ikuti struktur yang sudah ada — menerima prop `p`, `frame`, dan `accent`.

### Ganti transisi

Edit array `TRANSITIONS`. Pilihannya: `"fade"` `"slideUp"` `"slideDown"` `"flash"` `"zoom"`.

### Tambah atau hapus scene

1. Tambah data kata baru: `const S_BARU: Word[] = [...]`
2. Tambah tema di `THEMES`
3. Tambah transisi di `TRANSITIONS`
4. Update `OFFSETS` — tambah frame mulai scene baru
5. Tambah entry di Root

---

## Troubleshooting

**Teks tidak sinkron dengan voiceover**

Cek dua hal: apakah nilai `delay` per kata sudah dihitung dari `whisperFrame - sceneOffset`, dan apakah `OFFSETS` cocok dengan timestamp Whisper.

**Preview lambat atau patah-patah**

Normal untuk video panjang dengan banyak SVG filter. Pakai scrub manual daripada play real-time.

**Render sangat lama**

Tambah `--concurrency=4` atau `--concurrency=8`. Film grain adalah komponen paling berat — bisa dinonaktifkan sementara di Root kalau hanya ingin cek timing.

**Studio tidak mau start**

```bash
lsof -i :3000       # cek siapa yang pakai port 3000
kill -9 <PID>       # kill kalau ada
npm run start
```

---

## Komposisi yang tersedia

| ID | File | Deskripsi |
|---|---|---|
| `Reel1Video` | `Reel1Video.tsx` | Tantrum anak — ~67 detik |
| `Reel2VideoFix` | `Reel2VideoFix.tsx` | Kalimat saat lelah — ~64 detik |

---

## Referensi

- [Remotion docs](https://remotion.dev/docs)
- [Whisper](https://github.com/openai/whisper)
