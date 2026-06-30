import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import { getPdfFromDB } from '../utils/db';

export default function PdfViewer({ dashboardId, dashboardName, pdfType }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    async function loadPdf() {
      setLoading(true);
      setError('');
      
      try {
        if (pdfType === 'custom') {
          // Fetch custom uploaded PDF from IndexedDB
          const blob = await getPdfFromDB(dashboardId);
          if (!isMounted) return;

          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setPdfUrl(objectUrl);
          } else {
            setError('Could not locate the uploaded PDF in local storage database. Please re-upload in the Admin Panel.');
            setPdfUrl(null);
          }
        } else {
          // Standard static path fallback
          if (dashboardId === 2) {
            setPdfUrl('/dashboard.pdf');
          } else {
            setPdfUrl(`/dashboard_${dashboardId}.pdf`);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to load PDF from local database: ' + err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    // Cleanup: revoke Object URL to prevent browser memory leaks
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [dashboardId, pdfType]);

  return (
    <div className="w-full overflow-hidden flex flex-col h-[calc(100vh-110px)] min-h-[650px] bg-transparent border-none shadow-none">
      
      {/* PDF Rendering Body */}
      <div className="flex-1 bg-transparent flex items-center justify-center p-0">
        {loading ? (
          <div className="text-center p-6 space-y-2">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-zinc-555 dark:text-zinc-400">Loading dashboard report from browser database...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 border border-dashed border-rose-250 dark:border-rose-900/40 rounded-3xl bg-white dark:bg-zinc-900 max-w-md space-y-3 shadow-sm border-zinc-200/40 dark:border-zinc-800/40">
            <AlertCircle className="w-12 h-12 text-rose-555 mx-auto" />
            <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{error}</p>
            <p className="text-xs text-zinc-450 dark:text-zinc-555">
              Please switch to the Admin Control Panel to re-upload the PDF file.
            </p>
          </div>
        ) : pdfUrl ? (
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0&view=Fit&zoom=page-fit`} 
            className="w-full h-full border-none bg-transparent"
            title={`${dashboardName} Report Viewer`}
            key={`${dashboardId}-${pdfUrl}`} // Force reload on dashboard swap
          />
        ) : (
          <div className="text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 max-w-sm shadow-sm">
            <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No PDF File Linked</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-550 mt-1 max-w-[250px] mx-auto leading-relaxed">
              The administrator pushed this dashboard metadata but did not upload the PDF file yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
