# Game Cepe 🃏

Game kartu seru asal Indonesia di mana tujuan utamanya adalah mencapai angka **100** tanpa melebihinya! Sekarang hadir dengan antarmuka web modern, mode Bot, dan Online Multiplayer.

## 🚀 Fitur Utama
- **Web UI (Next.js)**: Tampilan visual kartu yang menarik dan interaktif dengan dukungan SSR.
- **Online Multiplayer**: Main bareng teman secara real-time menggunakan Socket.io.
- **Local Pass-and-Play**: Main berdua atau lebih dalam satu perangkat dengan layar transisi privasi.
- **Bot AI**: Tantang bot cerdas dalam mode lokal.
- **Terminal Version**: Masih bisa dimainkan langsung dari terminal kesayanganmu.

## 📜 Cara Bermain
1. **Awal Game**: Setiap pemain mendapatkan 2 kartu.
2. **Giliran**: Pemain bisa mengeluarkan satu kartu (**Play**) atau membuang kartu (**Discard**).
3. **Play**: Jika mengeluarkan kartu, pemain akan mengambil kartu baru dari deck. Angka kartu ditambahkan ke total akumulasi.
4. **Discard**: Jika tidak ada kartu yang bisa dimainkan (karena akan melebihi 100), pemain wajib membuang satu kartu **tanpa mengambil kartu baru**.
5. **Eliminasi**: Pemain yang kehabisan kartu di tangan dianggap keluar (Out).
6. **Pemenang**: Pemain terakhir yang masih memegang kartu adalah pemenangnya!

### ✨ Kartu Spesial
- **A**: Pilih untuk menambah atau mengurangi **1**.
- **J**: Pilih untuk menambah atau mengurangi **10**.
- **Q**: Pilih untuk menambah atau mengurangi **20**.
- **K**: Langsung menjadikan total akumulasi tepat **100**!
- **4**: Membalik arah giliran (Clockwise <-> Counter-Clockwise).
- **7**: Pilih pemain mana saja yang akan jalan berikutnya.

## 🛠️ Instalasi & Cara Menjalankan

### Persiapan
Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/).

1. **Clone repository ini** (atau download foldernya).
2. **Instal dependensi**:
   ```bash
   npm install
   ```

### Menjalankan Game (Rekomendasi)
Untuk menjalankan versi UI lengkap (Frontend & Backend tersambung), gunakan perintah:
```bash
npm run dev
```
Buka browser dan akses: `http://localhost:3000`

### Docker (Rekomendasi untuk Produksi)
Kamu bisa menjalankan game ini menggunakan Docker agar lebih praktis:
1. **Build image**:
   ```bash
   docker build -t game-cepe .
   ```
2. **Jalankan kontainer**:
   ```bash
   docker run -p 3000:3000 game-cepe
   ```
Akses game di `http://localhost:3000`.

### Perintah Lainnya
- **Mode Development**: `npm run dev` (di folder utama)
- **Mode Terminal**: `npm run terminal` (di folder utama)

## 🏗️ Teknologi yang Digunakan
- **Web Framework**: Next.js.
- **Backend Server**: Node.js, Express, Socket.io.
- **UI Components**: Lucide React.
- **Bahasa**: TypeScript.

---
Selamat bermain! Jangan sampai lewat 100 ya! 🚀😉
