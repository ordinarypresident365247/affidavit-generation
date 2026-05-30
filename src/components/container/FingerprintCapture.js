// src/components/FingerprintCapture.js
import React, { useState, useEffect, useRef } from 'react';
import FingerprintScanner from '../utils/FingerprintScanner';

const FingerprintCapture = ({ onCaptured }) => {
    const [readers, setReaders] = useState([]);
    const [selectedReader, setSelectedReader] = useState("");
    const [status, setStatus] = useState("Initializing...");
    const scanner = useRef(null);

    useEffect(() => {
        scanner.current = new FingerprintScanner();
        loadReaders();
        
        return () => {
            if (selectedReader) scanner.current.stopCapture(selectedReader);
        };
    }, []);

    const loadReaders = async () => {
        try {
            const list = await scanner.current.getReaders();
            setReaders(list);
            if (list.length > 0) setSelectedReader(list[0]);
            setStatus(list.length > 0 ? "Ready to scan" : "No scanner detected");
        } catch (err) {
            setStatus("Error loading scanner: " + err.message);
        }
    };

    const handleStartScan = async () => {
        setStatus("Scan your finger...");
        try {
            await scanner.current.startCapture(
                selectedReader, 
                window.Fingerprint.SampleFormat.PngImage,
                (sample) => {
                    // Extracting the image data as used in your original project
                    const base64Image = "data:image/png;base64," + sample.replace(/_/g, '/').replace(/-/g, '+');
                    onCaptured(base64Image);
                    setStatus("Capture Successful!");
                },
                (quality) => setStatus(`Quality: ${quality}`)
            );
        } catch (err) {
            setStatus("Scan failed: " + err.message);
        }
    };

    return (
        <div className="scanner-container">
            <select value={selectedReader} onChange={(e) => setSelectedReader(e.target.value)}>
                {readers.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={handleStartScan} disabled={!selectedReader}>
                Start Fingerprint Scan
            </button>
            <p>Status: {status}</p>
        </div>
    );
};

export default FingerprintCapture;