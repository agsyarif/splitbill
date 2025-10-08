/**
 * Hitung pembagian harga setelah diskon secara proporsional.
 * Fungsi ini membagi total harga setelah diskon ke setiap orang secara proporsional
 * berdasarkan harga asli mereka, dengan mempertimbangkan pembulatan ke kelipatan tertentu.
 *
 * Proses:
 * 1. Hitung faktor proporsional berdasarkan total sebelum dan sesudah diskon
 * 2. Kalikan harga setiap orang dengan faktor tersebut
 * 3. Bulatkan hasil ke kelipatan terdekat (step)
 * 4. Distribusikan sisa pembayaran kepada peserta dengan proporsi sisa terbesar
 *
 * @param {number} jumlahPemesan - jumlah orang
 * @param {number[]} hargaPerOrang - daftar harga per orang (sebelum diskon)
 * @param {number} totalSebelum - total harga sebelum diskon (untuk validasi)
 * @param {number} totalSesudah - total harga setelah diskon (yang harus dibagi)
 * @param {number} stepPembulatan - kelipatan pembulatan (default 100 = pembulatan ke Rp100, gunakan 1 untuk akurasi satuan Rupiah)
 * @returns {{perOrang:number[], total:number}} daftar bayar per orang & total penjumlahan
 */
export function bagiDiskonProporsional(
  jumlahPemesan,
  hargaPerOrang,
  totalSebelum,
  totalSesudah,
  stepPembulatan = 100 // 100 untuk pembulatan ke Rp100, 1 untuk akurasi satuan Rupiah
) {
  if (!Number.isInteger(jumlahPemesan) || jumlahPemesan <= 0)
    throw new Error("jumlahPemesan harus integer > 0");
  if (!Array.isArray(hargaPerOrang) || hargaPerOrang.length !== jumlahPemesan)
    throw new Error("Panjang hargaPerOrang harus sama dengan jumlahPemesan");

  const sumHarga = hargaPerOrang.reduce((a, b) => a + b, 0);
  if (totalSebelum <= 0) throw new Error("totalSebelum harus > 0");
  // Peringatan ringan bila sumHarga != totalSebelum, tapi tetap lanjut pakai totalSebelum untuk skala
  if (Math.abs(sumHarga - totalSebelum) > 1) {
    console.warn(
      `Peringatan: Σ(hargaPerOrang) = ${sumHarga} ≠ totalSebelum = ${totalSebelum}. ` +
        `Skala tetap pakai totalSebelum.`
    );
  }

  const faktor = totalSesudah / totalSebelum;
  const raw = hargaPerOrang.map((h) => h * faktor);

  // Pembulatan ke kelipatan terdekat (step)
  // Contoh: jika step=100, maka nilai dibulatkan ke kelipatan 100 terdekat ke bawah
  // 12500 -> 12500 (sudah kelipatan 100)
  // 12550 -> 12500 (dibulatkan ke bawah ke kelipatan 100)
  // 12599 -> 12500 (dibulatkan ke bawah ke kelipatan 100)
  //
  // Jika step=1, maka tidak ada pembulatan (akurat sampai satuan Rupiah)
  // Jika step=100, maka dibulatkan ke kelipatan 100 terdekat (Rp 100, Rp 200, dst)
  const step = Math.max(1, Math.trunc(stepPembulatan));
  const floorToStep = (v) => Math.floor(v / step) * step;

  // Terapkan pembulatan ke bawah untuk semua nilai
  const roundedDown = raw.map(floorToStep);
  let hasil = [...roundedDown];

  // Hitung sisa pembayaran yang belum dialokasikan karena pembulatan
  let remainder = Math.round(totalSesudah - hasil.reduce((a, b) => a + b, 0));

  // Urutkan indeks berdasarkan sisa pembagian (pecahan) terbesar
  // Ini menentukan siapa yang akan mendapat alokasi tambahan ketika ada sisa
  // Orang dengan sisa terbesar akan mendapat prioritas untuk menerima tambahan pembayaran
  const fracs = raw
    .map((v, i) => ({ i, frac: v - roundedDown[i] }))
    .sort((a, b) => b.frac - a.frac);

  // Tambahkan kelipatan penuh (step) kepada peserta dengan sisa terbesar
  // Contoh: jika sisa 350 dan step 100, maka 3 orang pertama dengan sisa terbesar
  // akan masing-masing mendapat tambahan 100
  if (remainder >= step) {
    const increments = Math.floor(remainder / step);
    for (let k = 0; k < increments; k++) {
      hasil[fracs[k].i] += step;
    }
    remainder -= increments * step;
  }

  // Kalau masih ada sisa < step, distribusikan 1 per 1 ke peserta dengan sisa terbesar
  // Contoh: jika sisa 3, maka 3 orang pertama dengan sisa terbesar akan masing-masing
  // mendapat tambahan 1
  for (let k = 0; k < fracs.length && remainder > 0; k++) {
    hasil[fracs[k].i] += 1;
    remainder -= 1;
  }

  return { perOrang: hasil, total: hasil.reduce((a, b) => a + b, 0) };
}

// Format number as IDR
export const formatIDR = (n) => n.toLocaleString("id-ID");
