import React, { useState } from "react";
import { bagiDiskonProporsional, formatIDR } from "./bagiDiskonProporsional";
import "./App.css";

function App() {
  // State for form inputs
  const [totalSebelum, setTotalSebelum] = useState(0);
  const [totalSesudah, setTotalSesudah] = useState(0);
  const [stepPembulatan, setStepPembulatan] = useState(1);

  // State for person data
  const [pemesanList, setPemesanList] = useState([]);

  // State for results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Handle adding a new person
  const handleAddPemesan = () => {
    setPemesanList([...pemesanList, { nama: "", harga: "" }]);
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
      const hargaPerOrang = pemesanList.map((p) => {
        const parsed = parseFloat(p.harga);
        return isNaN(parsed) ? 0 : parsed;
      });
      const namaPerOrang = pemesanList.map(
        (p) => p.nama || `Pemesan ${pemesanList.indexOf(p) + 1}`
      );

      // Validate prices
      for (let i = 0; i < pemesanList.length; i++) {
        const harga = pemesanList[i].harga;
        // Check if harga is empty
        if (harga === "") {
          throw new Error(`Harga untuk ${namaPerOrang[i]} tidak boleh kosong`);
        }
        // Check if harga is a valid number
        if (isNaN(parseFloat(harga)) || parseFloat(harga) < 0) {
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

  // Handle sharing
  const handleShare = (platform) => {
    if (!result) return;

    // Create share text
    let shareText = "Hasil Pembagian Diskon Proporsional:\n\n";
    shareText += "Pemesan | Harga Awal | Harga Setelah Diskon\n";
    shareText += "----------------------------------------\n";

    for (let i = 0; i < result.perOrang.length; i++) {
      shareText += `${result.namaPerOrang[i]} | Rp${formatIDR(
        result.originalPrices[i]
      )} | Rp${formatIDR(result.perOrang[i])}\n`;
    }

    shareText += "----------------------------------------\n";
    shareText += `Total Sebelum Diskon: Rp${formatIDR(
      result.originalPrices.reduce((a, b) => a + b, 0)
    )}\n`;
    shareText += `Total Setelah Diskon: Rp${formatIDR(result.total)}\n`;

    switch (platform) {
      case "whatsapp":
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          shareText
        )}`;
        window.open(whatsappUrl, "_blank");
        break;
      case "instagram":
        // For Instagram, we can't directly share text, so we'll copy to clipboard and show a message
        navigator.clipboard.writeText(shareText);
        alert(
          "Teks telah disalin ke clipboard. Anda dapat membagikannya di Instagram Story atau Post."
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareText);
        alert("Teks hasil perhitungan telah disalin ke clipboard!");
        break;
      default:
        break;
    }

    setShowShareOptions(false);
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
                    type="text"
                    placeholder="Harga"
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
            type="text"
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
            type="text"
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
            type="text"
            id="stepPembulatan"
            min="1"
            value={stepPembulatan}
            onChange={(e) => setStepPembulatan(Number(e.target.value))}
            required
          />
          <small
            style={{
              display: "block",
              color: "#64748b",
              marginTop: "6px",
              fontSize: "14px",
            }}
          >
            Gunakan 1 untuk akurasi satuan Rupiah, 100 untuk pembulatan ke Rp100
          </small>
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
                  Total sebelum: Rp
                  {/* {formatIDR(result.totalSebelum || totalSebelum)} */}
                  {totalSebelum}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="result-summary">
            Total pembayaran setelah diskon: Rp{formatIDR(result.total)}
          </div>
          <button
            type="button"
            className="share-button"
            onClick={() => setShowShareOptions(true)}
          >
            Bagikan Hasil
          </button>
        </div>
      )}

      {/* Share Options Modal */}
      {showShareOptions && (
        <div className="share-modal">
          <div className="share-modal-content">
            <div className="share-modal-header">
              <h3>Bagikan Hasil Perhitungan</h3>
              <button
                className="close-button"
                onClick={() => setShowShareOptions(false)}
              >
                &times;
              </button>
            </div>
            <div className="share-options">
              <button
                className="share-option whatsapp"
                onClick={() => handleShare("whatsapp")}
              >
                <span className="share-icon">📱</span>
                WhatsApp
              </button>
              <button
                className="share-option instagram"
                onClick={() => handleShare("instagram")}
              >
                <span className="share-icon">📸</span>
                Instagram
              </button>
              <button
                className="share-option copy"
                onClick={() => handleShare("copy")}
              >
                <span className="share-icon">📋</span>
                Salin Teks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
