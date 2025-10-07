/**
 * Hitung pembagian harga setelah diskon secara proporsional.
 * @param {number} jumlahPemesan - jumlah orang
 * @param {number[]} hargaPerOrang - daftar harga per orang (sebelum diskon)
 * @param {number} totalSebelum - total harga sebelum diskon (untuk validasi)
 * @param {number} totalSesudah - total harga setelah diskon (yang harus dibagi)
 * @param {number} stepPembulatan - kelipatan pembulatan (default 100 = pembulatan ke Rp100)
 * @returns {{perOrang:number[], total:number}} daftar bayar per orang & total penjumlahan
 */
export function bagiDiskonProporsional(
  jumlahPemesan,
  hargaPerOrang,
  totalSebelum,
  totalSesudah,
  stepPembulatan = 100
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

  // Pembulatan turun ke step
  const step = Math.max(1, Math.trunc(stepPembulatan));
  const floorToStep = (v) => Math.floor(v / step) * step;

  const roundedDown = raw.map(floorToStep);
  let hasil = [...roundedDown];
  let remainder = Math.round(totalSesudah - hasil.reduce((a, b) => a + b, 0));

  // Urutkan indeks berdasarkan pecahan terbesar
  const fracs = raw
    .map((v, i) => ({ i, frac: v - roundedDown[i] }))
    .sort((a, b) => b.frac - a.frac);

  // Tambahkan per step
  if (remainder >= step) {
    const increments = Math.floor(remainder / step);
    for (let k = 0; k < increments; k++) {
      hasil[fracs[k].i] += step;
    }
    remainder -= increments * step;
  }
  // Kalau masih sisa < step, bagi 1-an ke pecahan terbesar
  for (let k = 0; k < fracs.length && remainder > 0; k++) {
    hasil[fracs[k].i] += 1;
    remainder -= 1;
  }

  return { perOrang: hasil, total: hasil.reduce((a, b) => a + b, 0) };
}

// Format number as IDR
export const formatIDR = (n) => n.toLocaleString("id-ID");
