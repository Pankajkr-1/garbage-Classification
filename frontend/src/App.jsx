import { useRef, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/classify";

const categoryInfo = {
  Bouteille_plastique: {
    icon: "🧴",
    color: "plastic",
    short: "Plastic",
    fact: "Clean plastic containers are often recyclable when accepted by your local recycling program.",
  },
  Brique_en_carton: {
    icon: "🧃",
    color: "carton",
    short: "Carton / Tetra Pak",
    fact: "Cartons are made from multiple materials and may require a specialized recycling stream.",
  },
  Emballage_metallique: {
    icon: "🥫",
    color: "metal",
    short: "Metal",
    fact: "Metal packaging can often be recycled repeatedly when collected through the proper stream.",
  },
  Ordure_menagere: {
    icon: "🗑️",
    color: "trash",
    short: "General Waste",
    fact: "Reducing and reusing items can help keep unnecessary waste out of landfills.",
  },
  Papier_Carton: {
    icon: "📦",
    color: "paper",
    short: "Paper / Cardboard",
    fact: "Keeping paper and cardboard dry and free from food contamination improves recyclability.",
  },
  Verre: {
    icon: "🍾",
    color: "glass",
    short: "Glass",
    fact: "Glass can be recycled repeatedly without losing its basic quality.",
  },
};

const wasteGuide = [
  ["Bouteille_plastique", "🧴", "Plastic"],
  ["Brique_en_carton", "🧃", "Carton"],
  ["Emballage_metallique", "🥫", "Metal"],
  ["Papier_Carton", "📦", "Paper"],
  ["Verre", "🍾", "Glass"],
  ["Ordure_menagere", "🗑️", "General Waste"],
];

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const selectImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleFileChange = (event) => {
    selectImage(event.target.files[0]);
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const classifyWaste = async () => {
    if (!image) {
      setError("Please upload or capture an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Classification failed.");
      }

      setResult(data);

      setHistory((previous) => [
        {
          category: data.category,
          display_name: data.display_name,
          confidence: data.confidence,
          recyclable: data.recyclable,
        },
        ...previous.slice(0, 4),
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the AI server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInfo = (category) =>
    categoryInfo[category] || {
      icon: "♻️",
      color: "default",
      short: "Waste",
      fact: "Try a clearer image for a more reliable result.",
    };

  const info = result ? getInfo(result.category) : null;

  const confidence = result ? result.confidence * 100 : 0;

  const confidenceLevel =
    confidence >= 70 ? "high" : confidence >= 45 ? "medium" : "low";

  const confidenceMessage =
    confidence >= 70
      ? "High confidence — the AI is fairly confident about this result."
      : confidence >= 45
        ? "Medium confidence — try a clearer photo for a more reliable result."
        : "Low confidence — please try another photo.";

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">♻️</span>
          <div>
            <strong>EcoSort</strong>
            <small>Smart Waste Assistant</small>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#guide">Waste Guide</a>
          <a href="#how">How It Works</a>
          <a href="#tips">Eco Tips</a>
        </div>
      </nav>

      <main>

        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-badge">
              🤖 AI-POWERED • 6 WASTE CATEGORIES
            </div>

            <h1>
              Give your waste
              <span> a second chance.</span>
            </h1>

            <p>
              Take a photo of any waste item and let AI identify its
              category and guide you toward better disposal.
            </p>

            <div className="hero-stats">
              <div>
                <strong>6</strong>
                <span>Categories</span>
              </div>

              <div>
                <strong>AI</strong>
                <span>Classification</span>
              </div>

              <div>
                <strong>⚡</strong>
                <span>Fast Results</span>
              </div>
            </div>
          </div>
        </section>

        <div className="page">

          {/* SCANNER */}
          <section className="scanner-card">

            <div className="section-heading">
              <div>
                <span className="eyebrow">AI WASTE SCANNER</span>
                <h2>What are you throwing away?</h2>
              </div>

              {image && (
                <button className="clear-button" onClick={clearImage}>
                  ✕ Clear
                </button>
              )}
            </div>

            <div className="scanner-layout">

              <div
                className={`drop-zone ${preview ? "has-image" : ""}`}
                onClick={() => !preview && fileInputRef.current.click()}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Selected waste"
                      className="scanner-preview"
                    />

                    <div className="image-overlay">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          fileInputRef.current.click();
                        }}
                      >
                        📁 Change Image
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="drop-content">
                    <div className="camera-circle">📷</div>

                    <h3>Drop your image here</h3>

                    <p>
                      Upload a photo of the waste item you want
                      to identify.
                    </p>

                    <span>JPG • PNG • WEBP</span>
                  </div>
                )}
              </div>

              <div className="scanner-actions">

                <button
                  className="primary-action"
                  onClick={() => fileInputRef.current.click()}
                >
                  📁 Upload Image
                </button>

                <button
                  className="secondary-action"
                  onClick={() => cameraInputRef.current.click()}
                >
                  📷 Take a Photo
                </button>

                {image && (
                  <button
                    className="classify-action"
                    onClick={classifyWaste}
                    disabled={loading}
                  >
                    {loading
                      ? "🤖 Analyzing..."
                      : "✨ Identify My Waste"}
                  </button>
                )}

                <div className="privacy-note">
                  🔒 Your image is processed locally through your
                  connected AI server.
                </div>

              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              hidden
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              hidden
            />

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

          </section>

          {/* RESULT */}
          {result && (
            <section className={`result-card ${info.color}`}>

              <div className="result-top">

                <div className="result-title">
                  <div className="result-icon">
                    {info.icon}
                  </div>

                  <div>
                    <span className="eyebrow">
                      AI IDENTIFICATION
                    </span>

                    <h2>{result.display_name}</h2>

                    <span
                      className={`recyclable-badge ${
                        result.recyclable ? "recyclable" : "trash"
                      }`}
                    >
                      {result.recyclable
                        ? "♻️ RECYCLABLE"
                        : "🗑️ GENERAL WASTE"}
                    </span>
                  </div>
                </div>

                <div className="confidence-score">
                  <strong>{confidence.toFixed(1)}%</strong>
                  <span>confidence</span>
                </div>

              </div>

              <div className="confidence-section">

                <div className="confidence-label">
                  <span>AI confidence</span>
                  <strong>{confidence.toFixed(1)}%</strong>
                </div>

                <div className="confidence-bar">
                  <div
                    className={`confidence-fill ${confidenceLevel}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>

                <div className={`confidence-note ${confidenceLevel}`}>
                  {confidenceLevel === "high" ? "✓" : "⚠️"}{" "}
                  {confidenceMessage}
                </div>

              </div>

              <div className="result-grid">

                <div className="result-info">
                  <div className="info-icon">📋</div>

                  <div>
                    <span className="info-label">
                      HOW TO DISPOSE
                    </span>

                    <p>{result.disposal_method}</p>
                  </div>
                </div>

                <div className="result-info">
                  <div className="info-icon">💡</div>

                  <div>
                    <span className="info-label">
                      DID YOU KNOW?
                    </span>

                    <p>{info.fact}</p>
                  </div>
                </div>

              </div>

              <div className="tips-box">
                <h3>🌱 Better disposal tips</h3>

                <ul>
                  {result.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="prediction-section">
                <h3>📊 What the AI considered</h3>

                {Object.entries(result.all_scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, score]) => (
                    <div className="prediction-row" key={label}>

                      <div className="prediction-label">
                        <span>
                          {getInfo(label).icon}{" "}
                          {getInfo(label).short}
                        </span>

                        <strong>
                          {(score * 100).toFixed(1)}%
                        </strong>
                      </div>

                      <div className="prediction-bar">
                        <div
                          style={{
                            width: `${score * 100}%`,
                          }}
                        />
                      </div>

                    </div>
                  ))}
              </div>

              <div className="processing-time">
                ⚡ Analyzed in {result.processing_time_ms} ms
              </div>

            </section>
          )}

          {/* RECENT SCANS */}
          {history.length > 0 && (
            <section className="recent-section">

              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR ACTIVITY</span>
                  <h2>Recent scans</h2>
                </div>
              </div>

              <div className="history-grid">

                {history.map((item, index) => {
                  const itemInfo = getInfo(item.category);

                  return (
                    <div className="history-card" key={index}>

                      <div className="history-icon">
                        {itemInfo.icon}
                      </div>

                      <div>
                        <strong>{item.display_name}</strong>

                        <span>
                          {item.recyclable
                            ? "♻️ Recyclable"
                            : "🗑️ General Waste"}
                        </span>
                      </div>

                      <strong className="history-confidence">
                        {(item.confidence * 100).toFixed(0)}%
                      </strong>

                    </div>
                  );
                })}

              </div>
            </section>
          )}

          {/* WASTE GUIDE */}
          <section className="guide-section" id="guide">

            <div className="section-heading centered">
              <span className="eyebrow">KNOW YOUR WASTE</span>

              <h2>Waste Guide</h2>

              <p>
                Learn how different materials should be handled.
              </p>
            </div>

            <div className="guide-grid">

              {wasteGuide.map(([category, icon, name]) => (
                <div
                  className="guide-card"
                  key={category}
                >
                  <span>{icon}</span>
                  <strong>{name}</strong>
                  <small>Learn about disposal →</small>
                </div>
              ))}

            </div>

          </section>

          {/* HOW IT WORKS */}
          <section className="how-section" id="how">

            <div className="section-heading centered">
              <span className="eyebrow">SIMPLE & SMART</span>

              <h2>How EcoSort works</h2>

              <p>
                From photo to responsible disposal in seconds.
              </p>
            </div>

            <div className="steps">

              <div className="step">
                <span>01</span>
                <div>📷</div>
                <h3>Take a photo</h3>
                <p>
                  Upload or capture an image of your waste.
                </p>
              </div>

              <div className="step">
                <span>02</span>
                <div>🧠</div>
                <h3>AI analyzes it</h3>
                <p>
                  Your trained computer vision model identifies
                  the waste category.
                </p>
              </div>

              <div className="step">
                <span>03</span>
                <div>♻️</div>
                <h3>Dispose responsibly</h3>
                <p>
                  Get practical disposal instructions and
                  environmental tips.
                </p>
              </div>

            </div>

          </section>

          {/* ECO TIPS */}
          <section className="tips-section" id="tips">

            <div className="section-heading centered">
              <span className="eyebrow">MAKE A DIFFERENCE</span>

              <h2>Small habits. Big impact. 🌍</h2>

              <p>
                Better waste management starts with simple daily
                choices.
              </p>
            </div>

            <div className="eco-grid">

              <div>
                <span>♻️</span>
                <h3>Recycle correctly</h3>
                <p>
                  Keep recyclable materials clean, dry and
                  separated.
                </p>
              </div>

              <div>
                <span>🔄</span>
                <h3>Reuse first</h3>
                <p>
                  Before throwing something away, consider
                  whether it can be reused.
                </p>
              </div>

              <div>
                <span>💧</span>
                <h3>Keep it clean</h3>
                <p>
                  Remove food and liquid residue when appropriate.
                </p>
              </div>

              <div>
                <span>🛍️</span>
                <h3>Reduce packaging</h3>
                <p>
                  Choose products with less unnecessary packaging.
                </p>
              </div>

            </div>

          </section>

        </div>
      </main>

      <footer>
        <div className="footer-brand">
          ♻️ EcoSort
        </div>

        <p>
          Smart technology for a cleaner planet.
        </p>

        <small>
          Smart Waste Segregation Assistant • AI Project
        </small>
      </footer>

    </div>
  );
}

export default App;