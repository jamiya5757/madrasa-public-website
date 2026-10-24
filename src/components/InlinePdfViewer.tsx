/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Maximize2,
  Download,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface InlinePdfViewerProps {
  pdfUrl: string;
  filePath?: string;
  title: string;
  filename?: string;
  downloadUrl?: string;
}

const PDFJS_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const CMAP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/';

function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const existingScript = document.getElementById('pdfjs-lib-script');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if ((window as any).pdfjsLib) {
          clearInterval(checkInterval);
          resolve((window as any).pdfjsLib);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        if ((window as any).pdfjsLib) {
          resolve((window as any).pdfjsLib);
        } else {
          reject(new Error('PDF.js timeout'));
        }
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-lib-script';
    script.src = PDFJS_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(pdfjs);
      } else {
        reject(new Error('PDF.js library not found on window'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js CDN script'));
    document.body.appendChild(script);
  });
}

function toBengaliDigits(num: number | string): string {
  return String(num).replace(/\d/g, (w) => '০১২৩৪৫۶۷৮৯'[parseInt(w, 10)]);
}

export const InlinePdfViewer: React.FC<InlinePdfViewerProps> = ({
  pdfUrl,
  filePath,
  title,
  filename,
  downloadUrl,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderedPagesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Download target URL
  const actualDownloadUrl = downloadUrl || pdfUrl;

  // Programmatic direct PDF download handler
  const handleDownloadNotice = async () => {
    if (downloading) return;
    try {
      setDownloading(true);

      let blob: Blob | null = null;

      // Method 1: Download via Supabase Storage API if filePath exists
      if (filePath && filePath.trim() !== '') {
        try {
          const { data, error: storageErr } = await supabase.storage
            .from('exam_notices')
            .download(filePath.trim());

          if (!storageErr && data) {
            blob = data;
          }
        } catch (sErr) {
          console.warn('Supabase storage API download failed, trying fetch fallback:', sErr);
        }
      }

      // Method 2: Fallback fetch direct PDF blob
      if (!blob && actualDownloadUrl) {
        const response = await fetch(actualDownloadUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        blob = await response.blob();
      }

      if (!blob) {
        throw new Error('পিডিএফ ফাইলটি সংগ্রহ করা যায়নি।');
      }

      // Safe filename
      let targetFilename = filename && filename.trim() !== '' ? filename.trim() : 'notice.pdf';
      if (!targetFilename.toLowerCase().endsWith('.pdf')) {
        targetFilename += '.pdf';
      }

      // Same-origin blob URL download trigger
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = targetFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error('Failed to download PDF notice:', err);
      alert('পিডিএফ ফাইলটি ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setDownloading(false);
    }
  };

  // Render all pages sequentially into canvas elements filling full container width
  const renderAllPages = useCallback(async (pdfDoc: any) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous rendered pages
    renderedPagesRef.current.clear();

    const containerWidth = container.clientWidth || 600;
    // Minimize side margins to maximize PDF rendering width
    const availableWidth = Math.max(containerWidth - 8, 280);

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1 });

        // Fit page perfectly to container width
        const effectiveScale = availableWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale: effectiveScale });
        const outputScale = window.devicePixelRatio || 1;

        const isLastPage = pageNum === pdfDoc.numPages;

        // Page wrapper div
        const pageWrapper = document.createElement('div');
        pageWrapper.className = `pdf-page-wrapper flex flex-col items-center ${
          isLastPage ? 'mb-0' : 'mb-2 sm:mb-3'
        } bg-white rounded-md sm:rounded-lg shadow-sm border border-stone-200 overflow-hidden relative w-full`;

        // Page header badge
        const pageBadge = document.createElement('div');
        pageBadge.className =
          'text-[10px] sm:text-[11px] font-semibold text-stone-500 bg-stone-100/90 w-full text-center py-0.5 border-b border-stone-200 select-none';
        pageBadge.innerText = `পৃষ্ঠা ${toBengaliDigits(pageNum)} / ${toBengaliDigits(pdfDoc.numPages)}`;
        pageWrapper.appendChild(pageBadge);

        // Canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.className = 'w-full h-auto block';

        pageWrapper.appendChild(canvas);
        container.appendChild(pageWrapper);

        renderedPagesRef.current.set(pageNum, canvas);

        if (context) {
          const transform =
            outputScale !== 1
              ? [outputScale, 0, 0, outputScale, 0, 0]
              : null;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            transform: transform,
          };

          await page.render(renderContext).promise;
        }
      } catch (err) {
        console.warn(`Failed to render page ${pageNum}:`, err);
      }
    }
  }, []);

  // Main PDF loader effect
  useEffect(() => {
    let isMounted = true;

    async function initPdf() {
      if (!pdfUrl) {
        setError('পিডিএফ ফাইলের লিংক পাওয়া যায়নি।');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const pdfjs = await loadPdfJs();
        if (!isMounted) return;

        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          cMapUrl: CMAP_URL,
          cMapPacked: true,
        });

        const pdfDoc = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);

        await renderAllPages(pdfDoc);
        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.warn('PDF.js render failed, switching to iframe fallback:', err);
        if (isMounted) {
          setUseIframeFallback(true);
          setLoading(false);
        }
      }
    }

    initPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, renderAllPages]);

  // Fullscreen body scroll lock
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Handle Escape key press to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // ResizeObserver to re-fit canvas when window or card container width changes
  useEffect(() => {
    if (!containerRef.current || !pdfDocRef.current || useIframeFallback) return;

    let resizeTimer: any = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (pdfDocRef.current) {
          renderAllPages(pdfDocRef.current);
        }
      }, 150);
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [renderAllPages, useIframeFallback]);

  return (
    <div
      className={`bg-stone-900 rounded-2xl border border-stone-800 shadow-md transition-all flex flex-col overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-0 overflow-y-auto'
          : 'relative w-full'
      }`}
    >
      {/* Top Dark Header Toolbar (Sticky in fullscreen) */}
      <div className="bg-stone-800/95 border-b border-stone-700/80 px-3 py-2.5 sm:px-4 text-white flex items-center justify-between gap-3 shrink-0 select-none sticky top-0 z-20 backdrop-blur-md">
        {/* Left: Page count badge on desktop */}
        <div className="hidden sm:flex items-center gap-2 min-w-[70px] shrink-0">
          {numPages > 0 && !useIframeFallback && (
            <span className="text-[11px] bg-stone-700/90 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-stone-600">
              {toBengaliDigits(numPages)} পৃষ্ঠা
            </span>
          )}
        </div>

        {/* Center: Notice Title */}
        <div className="flex-1 text-center font-bold text-xs sm:text-sm truncate text-stone-100 px-2" title={title}>
          {title}
        </div>

        {/* Right: Fullscreen / Close & Download Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isFullscreen ? (
            /* Fullscreen Active: Prominent Close Button */
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg border border-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-md"
              title="বড় স্ক্রীন বন্ধ করুন (Esc)"
            >
              <X className="w-4 h-4 text-white" />
              <span>বন্ধ করুন</span>
            </button>
          ) : (
            /* Normal Mode: "বড় করে দেখুন" Button */
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-2.5 py-1.5 bg-stone-700/80 hover:bg-stone-600 border border-stone-600 rounded-lg text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
              title="বড় করে দেখুন"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">বড় করে দেখুন</span>
            </button>
          )}

          {/* Direct File Download Button */}
          <button
            type="button"
            onClick={handleDownloadNotice}
            disabled={downloading}
            className="px-3 py-1.5 bg-[#073D28] hover:bg-[#052c1d] border border-emerald-800 rounded-lg text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-2xs disabled:opacity-60"
            title="পিডিএফ ফাইলটি সরাসরি ড্রাইভে ডাউনলোড করুন"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
            ) : (
              <Download className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{downloading ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড'}</span>
          </button>
        </div>
      </div>

      {/* Viewer Canvas / Content */}
      <div
        className={`w-full bg-stone-950/90 relative p-1 sm:p-2 transition-all ${
          isFullscreen
            ? 'flex-1 h-full min-h-screen'
            : ''
        }`}
      >
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-200">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs sm:text-sm font-medium">পিডিএফ নোটিশটি লোড হচ্ছে...</p>
          </div>
        )}

        {error && !useIframeFallback && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 text-rose-300 min-h-[180px]">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-xs sm:text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => setUseIframeFallback(true)}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-600 cursor-pointer"
            >
              ব্রাউজার ভিউয়ারে চেষ্টা করুন
            </button>
          </div>
        )}

        {useIframeFallback ? (
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            title={title}
            className="w-full h-[600px] sm:h-[800px] rounded-xl border-0 bg-white"
          />
        ) : (
          <div
            ref={containerRef}
            className="flex flex-col items-center justify-start w-full mx-auto"
          />
        )}
      </div>
    </div>
  );
};
