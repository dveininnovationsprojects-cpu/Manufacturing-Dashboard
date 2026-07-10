import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import { getPdfFromDB } from '../utils/db';

export default function PdfViewer({ dashboardId, dashboardName, pdfType, isFullscreen, activeTheme }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Zoom & Pan States
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom on dashboard switch
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [dashboardId]);

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
          setPdfUrl(`/dashboard_${dashboardId}.pdf`);
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

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.25, 6));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.25, 0.4));
  };

  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    // Disable mouse scroll zoom in normal dashboard view to prevent interference with page scrolling
    if (!isFullscreen) return;

    e.preventDefault();
    const zoomFactor = 1.08;
    const nextScale = e.deltaY < 0 
      ? Math.min(scale * zoomFactor, 6) 
      : Math.max(scale / zoomFactor, 0.4);
    
    if (nextScale === scale) return;

    // Zoom centered on cursor
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - rect.width / 2;
    const dy = mouseY - rect.height / 2;

    setPosition(prev => ({
      x: prev.x - (dx / scale - dx / nextScale) * nextScale,
      y: prev.y - (dy / scale - dy / nextScale) * nextScale
    }));
    setScale(nextScale);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only drag with left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={`w-full overflow-hidden flex flex-col bg-transparent border-none shadow-none relative ${
      isFullscreen ? 'h-screen' : 'h-[calc(100vh-110px)] min-h-[650px]'
    }`}>
      
      {/* PDF Rendering Body */}
      <div className="flex-1 bg-transparent flex items-center justify-center p-0 relative">
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
          <div 
            className="w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The transform container */}
            <div 
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="absolute flex items-center justify-center shrink-0 pointer-events-none"
            >
              <iframe 
                src={`${pdfUrl}#toolbar=0&navpanes=0&view=Fit&zoom=page-fit`} 
                className="w-full h-full border-none bg-transparent pointer-events-none"
                title={`${dashboardName} Report Viewer`}
                key={`${dashboardId}-${pdfUrl}`} // Force reload on dashboard swap
              />
            </div>
            
            {/* Transparent overlay to capture all pointer events */}
            <div className="absolute inset-0 bg-transparent z-10" />
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 max-w-sm shadow-sm">
            <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No PDF File Linked</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-555 mt-1 max-w-[250px] mx-auto leading-relaxed">
              The administrator pushed this dashboard metadata but did not upload the PDF file yet.
            </p>
          </div>
        )}
      </div>

      {/* Floating Zoom Controls Toolbar */}
      {pdfUrl && !loading && !error && (
        <div className={`absolute bottom-6 right-6 z-20 flex items-center gap-2.5 backdrop-blur-md px-3.5 py-2 rounded-2xl border shadow-xl select-none transition-all duration-300 ${
          activeTheme ? activeTheme.card : 'bg-[#0c0c0f]/85 dark:bg-black/70 border-zinc-250 dark:border-zinc-800'
        }`}>
          <button 
            onClick={handleZoomOut}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer font-bold text-base select-none ${
              activeTheme ? activeTheme.sidebarInactive : 'hover:bg-zinc-800 dark:hover:bg-zinc-900 text-zinc-450 hover:text-white'
            }`}
            title="Zoom Out"
          >
            －
          </button>
          
          <span className={`text-[10px] font-extrabold tracking-wider w-12 text-center select-none ${
            activeTheme ? activeTheme.text : 'text-zinc-350'
          }`}>
            {Math.round(scale * 100)}%
          </span>
          
          <button 
            onClick={handleZoomIn}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer font-bold text-base select-none ${
              activeTheme ? activeTheme.sidebarInactive : 'hover:bg-zinc-800 dark:hover:bg-zinc-900 text-zinc-450 hover:text-white'
            }`}
            title="Zoom In"
          >
            ＋
          </button>
          
          <span className={`w-px h-4 ${activeTheme ? activeTheme.sidebarBorder : 'bg-zinc-850'}`} />
          
          <button 
            onClick={handleZoomReset}
            className={`px-2.5 py-1 rounded-lg flex items-center justify-center text-[8px] font-extrabold tracking-wider uppercase transition-all cursor-pointer border select-none ${
              activeTheme 
                ? `${activeTheme.sidebarInactive} ${activeTheme.sidebarBorder}`
                : 'hover:bg-zinc-850 dark:hover:bg-zinc-900 border-zinc-200/10 dark:border-zinc-800 text-zinc-450 hover:text-white'
            }`}
            title="Reset Zoom to Fit"
          >
            Fit
          </button>
        </div>
      )}
    </div>
  );
}
