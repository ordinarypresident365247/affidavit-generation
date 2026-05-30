/**
 * Utility for Futronic Fingerprint Scanners (FS80H, FS88H, etc.)
 * Communicates with the local Futronic Web Service (typically on port 15270)
 */
export default class FutronicScanner {
    constructor(port = 15270) {
        this.baseUrl = `http://127.0.0.1:${port}/Futronic`;
        this.isCapturing = false;
    }

    /**
     * Checks if the Futronic service is running and a device is connected.
     */
    async getReaders() {
        try {
            // Some services use /GetReaders, others return a simple array from /Info
            const response = await fetch(`${this.baseUrl}/GetReaders`);
            const result = await response.json();
            
            if (result.success && result.readers) {
                return result.readers;
            } else if (Array.isArray(result)) {
                return result;
            }
            return ["Futronic USB Fingerprint Scanner"];
        } catch (error) {
            console.warn("Futronic service not detected. Ensure Futronic Web Agent is running.");
            return [];
        }
    }

    /**
     * Starts the capture process.
     */
    async startCapture(readerId, format, onSampleCaptured, onQualityReported) {
        this.isCapturing = true;
        try {
            // Futronic services typically trigger a single-shot scan
            const response = await fetch(`${this.baseUrl}/Scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readerId })
            });
            const result = await response.json();

            if (result.success && result.image) {
                // Returns the base64 image string
                onSampleCaptured(result.image);
            } else {
                throw new Error(result.error || "Capture failed or timed out");
            }
        } catch (error) {
            this.isCapturing = false;
            throw error;
        } finally {
            this.isCapturing = false;
        }
    }

    /**
     * Cancels the current capture session.
     */
    async stopCapture() {
        this.isCapturing = false;
        try {
            await fetch(`${this.baseUrl}/Cancel`);
        } catch (error) {
            console.error("Failed to cancel Futronic capture", error);
        }
    }
}