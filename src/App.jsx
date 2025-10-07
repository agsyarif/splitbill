import React, { useState } from "react";
import { bagiDiskonProporsional, formatIDR } from "./bagiDiskonProporsional";
import "./App.css";

function App() {
  // State for form inputs
  const [jumlahPemesan, setJumlahPemesan] = useState(4);
  const [totalSebelum, setTotalSebelum] = useState(76500);
  const [totalSesudah, setTotalSesudah] = useState(52500);
  const [stepPembulatan, setStepPembulatan] = useState(100);

  // State for person data
  const [pemesanList, setPemesanList] = useState([]);

  // State for results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle adding a new person
  const handleAddPemesan = () => {
    setPemesanList([...pemesanList, { nama: "", harga: 0 }]);
  };

  // Handle removing a person
  const handleRemovePemesan = (index) => {
    if (pemesanList.length <= 1) {
      alert("Minimal harus ada satu pemesan");
      return;
    }

    const newList = [...pemesanList];
    newList.splice(index, 1);
    setPemesanList(newList);
  };

  // Handle changing person data
  const handlePemesanChange = (index, field, value) => {
    const newList = [...pemesanList];
    newList[index][field] = value;
    setPemesanList(newList);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      // Extract hargaPerOrang array from pemesanList
      const hargaPerOrang = pemesanList.map((p) => parseFloat(p.harga) || 0);
      const namaPerOrang = pemesanList.map(
        (p) => p.nama || `Pemesan ${pemesanList.indexOf(p) + 1}`
      );

      // Validate prices
      for (let i = 0; i < hargaPerOrang.length; i++) {
        if (isNaN(hargaPerOrang[i])) {
          throw new Error(`Harga untuk ${namaPerOrang[i]} tidak valid`);
        }
      }

      // Calculate sum of current prices
      const sumHarga = hargaPerOrang.reduce((a, b) => a + b, 0);

      // Use sum of current prices as totalSebelum if it doesn't match the input
      const actualTotalSebelum = sumHarga > 0 ? sumHarga : totalSebelum;

      // Call the calculation function
      const calculationResult = bagiDiskonProporsional(
        pemesanList.length,
        hargaPerOrang,
        actualTotalSebelum,
        totalSesudah,
        stepPembulatan
      );

      setResult({
        ...calculationResult,
        namaPerOrang: namaPerOrang,
        originalPrices: hargaPerOrang,
        totalSebelum: actualTotalSebelum,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Pembagian Diskon Proporsional</h1>
      <p>Hitung pembagian harga setelah diskon secara proporsional</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="jumlahPemesan">Jumlah Pemesan:</label>
          <input
            type="number"
            id="jumlahPemesan"
            min="1"
            value={pemesanList.length}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Data Pemesan (Nama dan Harga):</label>
          <div id="pemesanContainer">
            {pemesanList.map((pemesan, index) => (
              <div className="pemesan-item" key={index}>
                <div className="pemesan-inputs">
                  <input
                    type="text"
                    placeholder={`Nama Pemesan ${index + 1}`}
                    value={pemesan.nama}
                    onChange={(e) =>
                      handlePemesanChange(index, "nama", e.target.value)
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    min="0"
                    value={pemesan.harga}
                    onChange={(e) =>
                      handlePemesanChange(index, "harga", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="hapus-pemesan"
                    onClick={() => handleRemovePemesan(index)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" id="tambahPemesan" onClick={handleAddPemesan}>
            Tambah Pemesan
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="totalSebelum">Total Sebelum Diskon:</label>
          <input
            type="number"
            id="totalSebelum"
            min="1"
            value={totalSebelum}
            onChange={(e) => setTotalSebelum(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalSesudah">Total Setelah Diskon:</label>
          <input
            type="number"
            id="totalSesudah"
            min="1"
            value={totalSesudah}
            onChange={(e) => setTotalSesudah(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stepPembulatan">Step Pembulatan (kelipatan):</label>
          <input
            type="number"
            id="stepPembulatan"
            min="1"
            value={stepPembulatan}
            onChange={(e) => setStepPembulatan(Number(e.target.value))}
            required
          />
        </div>

        <button type="submit">Hitung Pembagian</button>
      </form>

      {error && (
        <div className="result-container visible">
          <div className="error">Error: {error}</div>
        </div>
      )}

      {result && (
        <div className="result-container visible">
          <h2>Hasil Perhitungan</h2>
          <table className="result-table">
            <thead>
              <tr>
                <th>Pemesan</th>
                <th>Harga Awal</th>
                <th>Harga Setelah Diskon</th>
              </tr>
            </thead>
            <tbody>
              {result.perOrang.map((harga, index) => (
                <tr key={index}>
                  <td>{result.namaPerOrang[index]}</td>
                  <td>Rp{formatIDR(result.originalPrices[index])}</td>
                  <td>Rp{formatIDR(harga)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total</td>
                <td>
                  Rp
                  {formatIDR(result.originalPrices.reduce((a, b) => a + b, 0))}
                </td>
                <td>Rp{formatIDR(result.total)}</td>
              </tr>
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    padding: "10px",
                  }}
                >
                  Total sebelum diskon: Rp
                  {formatIDR(result.totalSebelum || totalSebelum)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="result-summary">
            Total pembayaran setelah diskon: Rp{formatIDR(result.total)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
