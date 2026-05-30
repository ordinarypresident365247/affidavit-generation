/**
 * Utility for ZKTeco Fingerprint Scanners (ZK4500, ZK9500, etc.)
 * Communicates with the local ZK Web Service (typically on port 2404)
 */
export default class ZKTecoScanner {
    constructor(port = 2404) {
        this.baseUrl = `http://127.0.0.1:${port}/fingerprint`;
        this.isCapturing = false;
    }

    /**
     * Checks if the ZKTeco service is running and a device is connected.
     */
    async getReaders() {
        try {
            const response = await fetch(`${this.baseUrl}/info`);
            const result = await response.json();
            // ret: 0 indicates success/service found
            if (result.ret === 0) {
                return ["ZKTeco USB Fingerprint Reader"];
            }
            return [];
        } catch (error) {
            console.warn("ZKTeco service not detected. Ensure ZK Web Agent is running.");
            return [];
        }
    }

    /**
     * Starts the capture process and polls for data.
     */
    async startCapture(readerId, format, onSampleCaptured, onQualityReported) {
        this.isCapturing = true;
        try {
            // Initialize capture (type 1 for Image)
            const begin = await fetch(`${this.baseUrl}/beginCapture?type=1`);
            const beginResult = await begin.json();
            
            if (beginResult.ret !== 0) {
                throw new Error(beginResult.msg || "Failed to start ZKTeco capture");
            }

            // Polling loop to detect when a finger is placed
            while (this.isCapturing) {
                const response = await fetch(`${this.baseUrl}/getCaptureData`);
                const result = await response.json();

                if (result.ret === 0) {
                    // Success: result.data.bmpBase64 contains the image
                    if (onSampleCaptured) {
                        onSampleCaptured(result.data.bmpBase64);
                    }
                    this.isCapturing = false;
                    break;
                } else if (result.ret === -1) {
                    // No finger detected yet, wait and poll again
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    // Error state
                    this.isCapturing = false;
                    throw new Error(result.msg || "Capture error occurred");
                }
            }
        } catch (error) {
            this.isCapturing = false;
            throw error;
        }
    }

    /**
     * Cancels the current capture session.
     */
    async stopCapture() {
        this.isCapturing = false;
        try {
            await fetch(`${this.baseUrl}/cancelCapture`);
        } catch (error) {
            console.error("Failed to cancel ZKTeco capture", error);
        }
    }
}