import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';

/**
 * Universal Download Utility with Scoped Storage Logic
 */
export const universalDownload = async (data: Blob | string, filename: string) => {
  if (typeof window === 'undefined') return;

  try {
    const isNative = Capacitor.isNativePlatform();

    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    let blob: Blob;
    if (typeof data === 'string') {
      const response = await fetch(data);
      blob = await response.blob();
    } else {
      blob = data;
    }

    if (!blob || blob.size === 0) {
      throw new Error("Invalid file content");
    }

    // --- STRATEGY 1: Capacitor Native (Scoped Storage via Cache/Share) ---
    if (isNative) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        
        // Android 11+ Best Practice: Write to Cache and Share
        const base64Data = await blobToBase64(blob);
        const path = `RCM_${Date.now()}_${filename.replace(/\s+/g, '_')}`;
        
        const savedFile = await Filesystem.writeFile({
          path,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: filename,
          url: savedFile.uri,
          dialogTitle: 'Save Document'
        });
        
        return;
      } catch (nativeErr) {
        console.warn("Native storage/share flow failed", nativeErr);
      }
    }

    // --- STRATEGY 2: Web Share API ---
    if (navigator.share) {
      try {
        const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
            text: 'RCM Official Document'
          });
          return;
        }
      } catch (shareErr) {
        console.debug("Web Share API rejected", shareErr);
      }
    }

    // --- STRATEGY 3: Traditional Download Fallback ---
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 10000);

  } catch (e) {
    console.error("Download exception:", e);
    toast.error("Access interrupted. Please verify storage permissions.");
  }
};