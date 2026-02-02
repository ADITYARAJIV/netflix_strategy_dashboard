import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Distribution Charts
import BarChart from './charts/BarChart';
import CirclePacking from './charts/CirclePacking';
import TypeDistribution from './charts/TypeDistribution';
import RatingDistribution from './charts/RatingDistribution';
import ReleaseDistribution from './charts/ReleaseDistribution';
import DurationDistribution from './charts/DurationDistribution';

// Hypothesis Charts
import HypothesisChart from './charts/HypothesisChart';
import GlobalPivotChart from './charts/GlobalPivotChart';
import NicheDominanceChart from './charts/NicheDominanceChart';
import FreshnessLifecycleChart from './charts/FreshnessLifecycleChart';
import RatingVolumeChart from './charts/RatingVolumeChart';

import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [compareGenre, setCompareGenre] = useState('None');
  const [stats, setStats] = useState([]);
  const dashboardRef = useRef();
  const reportRef = useRef();

  // Slider 1: Distribution Analysis
  const [distSlide, setDistSlide] = useState(0);
  const distSlides = [
    { id: 'info', title: 'Catalog Distribution Analysis' },
    { id: 'genre', title: 'Genre Heatmap' },
    { id: 'type', title: 'Content Format Split' },
    { id: 'rating', title: 'Content Maturity (Ratings)' },
    { id: 'release', title: 'Legacy vs. Modern Content' },
    { id: 'duration', title: 'Watch-Time Distribution' }
  ];

  // Slider 2: Strategic Hypotheses
  const [hypoSlide, setHypoSlide] = useState(0);
  const hypoSlides = [
    { id: 'pivot', title: 'Hypothesis: The Great TV Pivot' },
    { id: 'global', title: 'Hypothesis: The Global Expansion' },
    { id: 'niche', title: 'Hypothesis: Niche vs. Tentpole' },
    { id: 'fresh', title: 'Hypothesis: The Freshness Moat' },
    { id: 'ratings', title: 'Hypothesis: The Maturity Mix' }
  ];

  const nextDist = () => setDistSlide((prev) => (prev + 1) % distSlides.length);
  const prevDist = () => setDistSlide((prev) => (prev - 1 + distSlides.length) % distSlides.length);

  const nextHypo = () => setHypoSlide((prev) => (prev + 1) % hypoSlides.length);
  const prevHypo = () => setHypoSlide((prev) => (prev - 1 + hypoSlides.length) % hypoSlides.length);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/data').then(res => {
      const rawData = res.data;
      setData(rawData);
      setFilteredData(rawData);
      
      const allGenres = new Set();
      rawData.forEach(item => {
        if (Array.isArray(item.listed_in)) {
          item.listed_in.forEach(g => allGenres.add(g));
        }
      });
      setGenres(['All', ...Array.from(allGenres).sort()]);
      calculateKPIs(rawData);
    });
  }, []);

  const calculateKPIs = (raw) => {
    const total = raw.length;
    const tv = raw.filter(d => d.type === 'TV Show').length;
    const multiCountry = raw.filter(d => d.country && d.country.includes(',')).length;

    setStats([
      { label: "Library Size", value: total, hint: "Total catalog volume available." },
      { label: "TV Stickiness", value: `${((tv/total)*100).toFixed(1)}%`, hint: "Retention potential." },
      { label: "Movie Weight", value: total - tv, hint: "Total feature films." },
      { label: "Global Reach", value: `${((multiCountry/total)*100).toFixed(1)}%`, hint: "Multi-country productions." },
      { label: "Legacy Titles", value: raw.filter(d => d.release_year < 2010).length, hint: "Pre-2010 depth." },
      { label: "New Wave", value: raw.filter(d => d.release_year > 2018).length, hint: "Post-2018 content." },
      { label: "Genre Depth", value: "42+", hint: "Unique categories." },
      { label: "Lead Country", value: "USA", hint: "Primary market." }
    ]);
  };

  useEffect(() => {
    let result = data;
    if (selectedGenre !== 'All') {
      result = result.filter(item => item.listed_in && item.listed_in.includes(selectedGenre));
    }
    setFilteredData(result);

    if (compareGenre !== 'None') {
      setCompareData(data.filter(item => item.listed_in && item.listed_in.includes(compareGenre)));
    } else {
      setCompareData([]);
    }
  }, [selectedGenre, compareGenre, data]);

  const exportPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const capture = async (element) => {
      const canvas = await html2canvas(element, { 
        backgroundColor: "#141414", 
        scale: 2,
        useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      const ratio = canvas.width / canvas.height;
      let displayWidth = pdfWidth - (margin * 2);
      let displayHeight = displayWidth / ratio;

      if (displayHeight > (pdfHeight - (margin * 2))) {
        displayHeight = pdfHeight - (margin * 2);
        displayWidth = displayHeight * ratio;
      }
      return { imgData, w: displayWidth, h: displayHeight };
    };

    const p1 = await capture(dashboardRef.current);
    pdf.addImage(p1.imgData, 'PNG', margin, margin, p1.w, p1.h);

    const distributionElements = reportRef.current.children;
    for (let i = 0; i < distributionElements.length; i++) {
      pdf.addPage();
      const chartCapture = await capture(distributionElements[i]);
      pdf.addImage(chartCapture.imgData, 'PNG', (pdfWidth - chartCapture.w) / 2, 15, chartCapture.w, chartCapture.h);
    }

    pdf.save("Netflix_Comprehensive_Report.pdf");
  };

  return (
    <div className="App">
      <div ref={dashboardRef} style={{ backgroundColor: '#141414', padding: '20px' }}>
        <header className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 className="main-title" style={{ color: '#E50914', margin: 0 }}>Netflix Strategy Dashboard</h1>
            <button onClick={exportPDF} className="export-btn" style={{ padding: '10px 20px', backgroundColor: '#E50914', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Download Report
            </button>
          </div>
          
          <div className="kpi-grid">
            {stats.map((stat, i) => (
              <motion.div key={i} className="kpi-card" whileHover={{ scale: 1.05, backgroundColor: "#E50914" }}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <div className="tooltip-text">{stat.hint}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', background: '#181818', padding: '20px', borderRadius: '10px', border: '1px solid #333', marginBottom: '30px' }}>
            <div>
              <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Primary Genre: </label>
              <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="genre-select">
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Compare With: </label>
              <select value={compareGenre} onChange={(e) => setCompareGenre(e.target.value)} className="genre-select compare">
                <option value="None">None</option>
                {genres.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="chart-card">
            <h2>Catalog Growth: {selectedGenre} {compareGenre !== 'None' && `vs ${compareGenre}`}</h2>
            <BarChart data={filteredData} compareData={compareData} primaryGenreName={selectedGenre} compareGenreName={compareGenre} />
          </section>

          {/* SLIDER 1: DISTRIBUTION ANALYSIS */}
          <section className="chart-card slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <button className="nav-arrow" onClick={prevDist}>&#10094;</button>
              <h2 style={{ margin: 0 }}>{distSlides[distSlide].title}</h2>
              <button className="nav-arrow" onClick={nextDist}>&#10095;</button>
            </div>

            <p style={{ color: '#E50914', fontSize: '0.8rem', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
              &larr; Explore Catalog Metrics &rarr;
            </p>

            <div className="slide-content" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {distSlide === 0 && (
                <div style={{ textAlign: 'left', maxWidth: '90%', color: '#ccc', lineHeight: '1.6' }}>
                   <h3 style={{ color: '#fff', marginBottom: '10px' }}>Strategic Content Overview</h3>
                   <p>Navigate to decode the platform's content acquisition and retention strategy:</p>
                   <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li><strong>Content Mix:</strong> Movies (Churn) vs TV Series (Retention).</li>
                    <li><strong>Maturity:</strong> Targeting specific household personas via Ratings.</li>
                    <li><strong>Age Depth:</strong> Balance of "Originals" vs. Licensed "Classics".</li>
                    <li><strong>Engagement:</strong> Viewer time-commitment required per title.</li>
                  </ul>
                </div>
              )}
              {distSlide === 1 && <CirclePacking data={filteredData} />}
              {distSlide === 2 && <TypeDistribution data={filteredData} />}
              {distSlide === 3 && <RatingDistribution data={filteredData} />}
              {distSlide === 4 && <ReleaseDistribution data={filteredData} />}
              {distSlide === 5 && <DurationDistribution data={filteredData} />}
            </div>
          </section>

          {/* SLIDER 2: STRATEGIC HYPOTHESES */}
          <section className="chart-card full-width" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <button className="nav-arrow" onClick={prevHypo}>&#10094;</button>
              <h2 style={{ margin: 0, color: '#E50914' }}>{hypoSlides[hypoSlide].title}</h2>
              <button className="nav-arrow" onClick={nextHypo}>&#10095;</button>
            </div>
            
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center', fontStyle: 'italic' }}>
              &larr; Switch between strategic business hypotheses &rarr;
            </p>

            <div className="slide-content" style={{ minHeight: '450px' }}>
              <AnimatePresence mode="wait">
                {hypoSlide === 0 && (
                  <motion.div key="h0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="hypothesis-statement" style={{ color: '#eee', marginBottom: '20px', textAlign: 'center' }}>
                      "Netflix transitioned to a TV-Show-centric library after 2016 to increase subscriber retention."
                    </p>
                    <HypothesisChart data={data} />
                  </motion.div>
                )}
                {hypoSlide === 1 && (
                  <motion.div key="h1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="hypothesis-statement" style={{ color: '#eee', marginBottom: '20px', textAlign: 'center' }}>
                      "Netflix pivoted to International production to offset domestic market saturation."
                    </p>
                    <GlobalPivotChart data={data} />
                  </motion.div>
                )}
                {hypoSlide === 2 && (
                  <motion.div key="h2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="hypothesis-statement" style={{ color: '#eee', marginBottom: '20px', textAlign: 'center' }}>
                      "Netflix uses niche genres to maintain volume while focusing high budgets on 'Tentpole' categories."
                    </p>
                    <NicheDominanceChart data={data} />
                  </motion.div>
                )}
                {hypoSlide === 3 && (
                  <motion.div key="h3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="hypothesis-statement" style={{ color: '#eee', marginBottom: '20px', textAlign: 'center' }}>
                      "Netflix prioritizes a high-frequency release cycle of Originals to maintain 'Catalog Freshness'."
                    </p>
                    <FreshnessLifecycleChart data={data} />
                  </motion.div>
                )}
                {hypoSlide === 4 && (
                  <motion.div key="h4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="hypothesis-statement" style={{ color: '#eee', marginBottom: '20px', textAlign: 'center' }}>
                      "Content maturity ratings are strategically distributed to capture both Adult and Family segments."
                    </p>
                    <RatingVolumeChart data={data} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>

      {/* Hidden Report Section for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={reportRef} style={{ width: '800px', backgroundColor: '#141414' }}>
          <div className="chart-card"><h2>Genre Heatmap</h2><CirclePacking data={filteredData} /></div>
          <div className="chart-card"><h2>Content Format</h2><TypeDistribution data={filteredData} /></div>
          <div className="chart-card"><h2>Ratings</h2><RatingDistribution data={filteredData} /></div>
          <div className="chart-card"><h2>Release Years</h2><ReleaseDistribution data={filteredData} /></div>
          <div className="chart-card"><h2>Duration</h2><DurationDistribution data={filteredData} /></div>
          <div className="chart-card"><h2>TV Pivot</h2><HypothesisChart data={data} /></div>
          <div className="chart-card"><h2>Global Pivot</h2><GlobalPivotChart data={data} /></div>
          <div className="chart-card"><h2>Niche Dominance</h2><NicheDominanceChart data={data} /></div>
          <div className="chart-card"><h2>Freshness Moat</h2><FreshnessLifecycleChart data={data} /></div>
          <div className="chart-card"><h2>Maturity Mix</h2><RatingVolumeChart data={data} /></div>
        </div>
      </div>
    </div>
  );
}

export default App;