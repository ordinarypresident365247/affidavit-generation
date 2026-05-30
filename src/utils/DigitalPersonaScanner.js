// src/utils/FingerprintScanner.js

/* global Fingerprint */
export default class DigitalPersonaScanner {
    constructor() {
        this.sdk = new Fingerprint.WebApi();
        
        // Default Event Handlers
        this.sdk.onDeviceConnected = (e) => console.log("Scanner Connected", e);
        this.sdk.onDeviceDisconnected = (e) => console.log("Scanner Disconnected", e);
        this.sdk.onCommunicationFailed = (e) => console.error("Communication Failed", e);
    }

    // Extracted from readersDropDownPopulate
    async getReaders() {
        try {
            return await this.sdk.enumerateDevices();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Extracted from onStart/sampleAcquired logic
    startCapture(readerId, format, onSampleCaptured, onQualityReported) {
        this.sdk.onSamplesAcquired = (s) => {
            const samples = JSON.parse(s.samples);
            // Result is usually base64 encoded image or raw data
            onSampleCaptured(samples[0]); 
        };

        this.sdk.onQualityReported = (e) => {
            if (onQualityReported) {
                const qualityText = Fingerprint.QualityCode[e.quality];
                onQualityReported(qualityText);
            }
        };

        const sampleFormat = format || Fingerprint.SampleFormat.PngImage;
        return this.sdk.startAcquisition(sampleFormat, readerId);
    }

    stopCapture(readerId) {
        return this.sdk.stopAcquisition(readerId);
    }
}