interface FingerprintData {
    userAgent: string;
    language: string;
    screenHeight: number;
    screenWidth: number;
    colorDepth: number;
    timezoneOffset: number;
    canvasFingerprint: string;
    audioFingerprint: string;
  }
  
  class Fingerprint {
    public static async generate(): Promise<FingerprintData> {
      if (!window || !navigator) {
        throw new Error('Fingerprint generation is only supported in a browser environment.');
      }

      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        colorDepth: window.screen.colorDepth,
        timezoneOffset: new Date().getTimezoneOffset(),
        canvasFingerprint: this.generateCanvasFingerprint(),
        audioFingerprint: await this.generateAudioFingerprint(),
      };
    }

    private static generateCanvasFingerprint(): string {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
        // Draw shapes and text to create a unique fingerprint
        ctx.fillStyle = 'rgb(60, 23, 130)';
        ctx.fillRect(20, 20, 150, 150);
        ctx.font = '18px Arial';

        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.fillText('Fingerprint', 40, 80);

        // Generate a base64 PNG image from the canvas content
        const dataUrl = canvas.toDataURL('image/png');
        return dataUrl;

    }

    private static async generateAudioFingerprint(): Promise<string> {
        return new Promise<string>(resolve => {
        try {
          const audioContext = new
          (window.OfflineAudioContext ||
          (window as any).webkitOfflineAudioContex)(1, 5000, 44100)
        const oscillator = audioContext.createOscillator();

        // Configure the oscillator
        oscillator.type = 'triangle';
        oscillator.frequency.value = 440;


        const compressor = audioContext.createDynamicsCompressor();

        // Configure the compressor
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        // compressor.reduction = -20;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        // Connect the nodes
        oscillator.connect(compressor);
        compressor.connect(audioContext.destination);

        // Start the oscillator
        oscillator.start();


        audioContext.oncomplete = event => {
          // We have only one channel, so we get it by index
          const samples = event.renderedBuffer.getChannelData(0)

          // Calculate the hash
          const hash =samples.reduce((acc, val) => acc + Math.abs(val), 0)
          resolve(hash.toString())
          
        };
        audioContext.startRendering()
          } catch (error) {
          resolve('Audio fingerprint not supported');
        }
      });
    }
  }
        



