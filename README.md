# Game Cepe 🃏

Game kartu seru asal Indonesia di mana tujuan utamanya adalah mencapai angka **100** tanpa melebihinya! Sekarang hadir dengan antarmuka web modern, mode Bot, dan Online Multiplayer.

## 🚀 Fitur Utama
- **Web UI (React + Vite)**: Tampilan visual kartu yang menarik dan interaktif.
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
2. **Instal dependensi** di folder utama:
   ```bash
   npm install
   ```
3. **Instal dependensi server**:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Menjalankan Game (Rekomendasi)
Untuk menjalankan versi UI lengkap (Frontend & Backend tersambung), gunakan perintah:
```bash
npm run full-start
```
Buka browser dan akses: `http://localhost:3001`

### Perintah Lainnya
- **Mode Development (Frontend)**: `npm run dev` (di folder utama)
- **Mode Development (Server)**: `npm run server-dev` (di folder utama)
- **Mode Terminal**: `npm start` (di folder utama)

## 🏗️ Teknologi yang Digunakan
- **Frontend**: React, Vite, Lucide React, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io.
- **Bahasa**: TypeScript.

---
Selamat bermain! Jangan sampai lewat 100 ya! 🚀😉
