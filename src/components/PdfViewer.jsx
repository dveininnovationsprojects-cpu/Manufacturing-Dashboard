import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Copy, Check, FileCode, CheckCircle, Loader2 } from 'lucide-react';
import { getPdfFromDB } from '../utils/db';

export default function PdfViewer({ dashboardId, dashboardName, pdfType, fileName, fileSize }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

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

  const codeSnippet = `import React from 'react';

function DashboardStaticPdfViewer({ dashboardId }) {
  // Save your exported Power BI PDF in the public folder matching this structure:
  // e.g. public/dashboard.pdf (for ID 2), public/dashboard_1.pdf (for ID 1)
  const pdfPath = dashboardId === 2 
    ? "/dashboard.pdf" 
    : \`/dashboard_\${dashboardId}.pdf\`;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <iframe 
        src={pdfPath} 
        width="100%" 
        height="100%" 
        style={{ border: 'none' }}
        title="Power BI Embedded Dashboard"
      />
    </div>
  );
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Information & Technical Details Panel */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* Attachment Details */}
        <div className="glass-panel p-5 space-y-4 border-l-4 border-emerald-500">
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Dashboard Metadata
          </h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
            This dashboard was configured and pushed by the Administrator. 
          </p>
          
          <div className="space-y-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Push File Name</span>
              <span className="text-xs text-zinc-800 dark:text-zinc-200 font-bold block truncate" title={fileName}>
                {fileName || 'Static Folder Fallback'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Source Connection</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block uppercase tracking-wider">
                {pdfType === 'custom' ? 'IndexedDB Blob Store' : 'Public Directory File'}
              </span>
            </div>

            {fileSize && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">File Payload Size</span>
                <span className="text-xs text-zinc-800 dark:text-zinc-200 font-bold block">
                  {fileSize}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Technical Code Template */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Developer React Code</span>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200/50 dark:border-zinc-700/50 transition-all cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-[10px] font-mono p-2.5 bg-zinc-950 text-zinc-350 rounded-lg overflow-x-auto max-h-[180px]">
            {codeSnippet}
          </pre>
        </div>
      </div>

      {/* PDF View Container */}
      <div className="lg:col-span-3 glass-panel overflow-hidden flex flex-col h-[750px] min-h-[500px]">
        
        {/* PDF Viewer Header */}
        <div className="px-6 py-4 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/10 flex items-center justify-between shrink-0">
          <div>
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-md">
              {dashboardName}
            </h4>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-bold font-mono">
              PREVIEW SOURCE: {pdfType === 'custom' ? `indexeddb://dashboard_${dashboardId}.pdf` : `public/dashboard_${dashboardId}.pdf`}
            </p>
          </div>
          
          <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Live Connected
          </span>
        </div>

        {/* PDF Rendering Body */}
        <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-950/30 flex items-center justify-center p-4">
          {loading ? (
            <div className="text-center p-6 space-y-2">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Loading dashboard report from browser database...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 border border-dashed border-rose-250 dark:border-rose-900/40 rounded-xl bg-white dark:bg-zinc-900 max-w-md space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-550 mx-auto" />
              <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{error}</p>
              <p className="text-xs text-zinc-450 dark:text-zinc-550">
                Please switch to the Admin Control Panel to re-upload the PDF file.
              </p>
            </div>
          ) : pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white"
              title={`${dashboardName} Report Viewer`}
              key={`${dashboardId}-${pdfUrl}`} // Force reload on dashboard swap
            />
          ) : (
            <div className="text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 max-w-sm">
              <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No PDF File Linked</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-[250px] mx-auto leading-relaxed">
                The administrator pushed this dashboard metadata but did not upload the PDF file yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
