import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  XMarkIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Logo from '../assets/Logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const CertificatePreview = ({ certificateId, onClose }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const certificateRef = useRef();

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rewards/certificates/preview/${certificateId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch certificate');
      const data = await res.json();
      setCertificate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rewards/certificates/${certificateId}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => certificateRef.current,
    documentTitle: `Certificate - ${certificate?.certificate?.title}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
        padding: 0;
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        body * { 
          visibility: hidden; 
        }
        
        .certificate-container, 
        .certificate-container * { 
          visibility: visible !important; 
        }
        
        .certificate-container { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 100% !important; 
          height: 100vh !important;
          margin: 0 !important;
          padding: 48px !important;
          background: linear-gradient(to bottom right, #fef3c7, #fed7aa) !important;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(255,215,0,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,165,0,0.1) 0%, transparent 50%) !important;
          border: 8px solid #f59e0b !important;
          border-radius: 8px !important;
          font-family: serif !important;
          box-shadow: none !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
        }
        
        /* Decorative borders */
        .certificate-container::before {
          content: '' !important;
          position: absolute !important;
          inset: 16px !important;
          border: 2px solid #f59e0b !important;
          border-radius: 8px !important;
          opacity: 0.3 !important;
          pointer-events: none !important;
        }
        
        .certificate-container::after {
          content: '' !important;
          position: absolute !important;
          inset: 24px !important;
          border: 1px solid #fbbf24 !important;
          border-radius: 8px !important;
          opacity: 0.2 !important;
          pointer-events: none !important;
        }
        
        .print-hidden { 
          display: none !important; 
        }
        
        /* Typography - exact match */
        .certificate-container h1 {
          font-family: serif !important;
          font-weight: bold !important;
          color: #1f2937 !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        
        .certificate-container h2 {
          font-family: serif !important;
          font-weight: bold !important;
          color: #111827 !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        
        .certificate-container h3 {
          font-family: serif !important;
          font-weight: 600 !important;
          color: #a16207 !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        
        .certificate-container p {
          font-family: serif !important;
          color: #4b5563 !important;
          margin: 0 !important;
          line-height: 1.5 !important;
        }
        
        /* Logo styling */
        .certificate-container img {
          width: 112px !important;
          height: 112px !important;
          max-width: none !important;
          object-fit: contain !important;
        }
        
        /* QR Code styling */
        .certificate-container svg {
          width: 90px !important;
          height: 90px !important;
          background: white !important;
        }
        
        /* Decorative elements */
        .absolute {
          position: absolute !important;
        }
        
        /* Gradient lines */
        .certificate-container div[class*="bg-gradient-to-r"] {
          background: linear-gradient(to right, #fbbf24, #f97316) !important;
          height: 4px !important;
          border-radius: 9999px !important;
        }
        
        /* Signature line */
        .certificate-container div[class*="bg-yellow-500"] {
          background: #f59e0b !important;
          height: 2px !important;
        }
        
        /* QR Code container */
        .certificate-container div[class*="bg-white"] {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 8px !important;
          display: inline-block !important;
        }
        
        /* Corner decorations */
        .certificate-container div[class*="border-yellow-600"] {
          border-color: #d97706 !important;
          border-width: 2px !important;
        }
        
        /* Spacing and layout */
        .certificate-container > div {
          width: 100% !important;
        }
        
        .certificate-container .flex {
          display: flex !important;
        }
        
        .certificate-container .justify-between {
          justify-content: space-between !important;
        }
        
        .certificate-container .items-center {
          align-items: center !important;
        }
        
        .certificate-container .text-center {
          text-align: center !important;
        }
        
        .certificate-container .mx-auto {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        .certificate-container .mb-3 { margin-bottom: 12px !important; }
        .certificate-container .mb-4 { margin-bottom: 16px !important; }
        .certificate-container .mb-6 { margin-bottom: 24px !important; }
        .certificate-container .mb-8 { margin-bottom: 32px !important; }
        .certificate-container .mb-10 { margin-bottom: 40px !important; }
        .certificate-container .mt-4 { margin-top: 16px !important; }
        .certificate-container .mt-10 { margin-top: 40px !important; }
        .certificate-container .px-10 { padding-left: 40px !important; padding-right: 40px !important; }
        
        /* Font sizes */
        .certificate-container .text-xs { font-size: 12px !important; }
        .certificate-container .text-sm { font-size: 14px !important; }
        .certificate-container .text-lg { font-size: 18px !important; }
        .certificate-container .text-3xl { font-size: 30px !important; }
        .certificate-container .text-4xl { font-size: 36px !important; }
        .certificate-container .text-5xl { font-size: 48px !important; }
        
        /* Font weights */
        .certificate-container .font-bold { font-weight: bold !important; }
        .certificate-container .font-semibold { font-weight: 600 !important; }
        .certificate-container .font-medium { font-weight: 500 !important; }
        
        /* Text colors */
        .certificate-container .text-gray-500 { color: #6b7280 !important; }
        .certificate-container .text-gray-600 { color: #4b5563 !important; }
        .certificate-container .text-gray-700 { color: #374151 !important; }
        .certificate-container .text-gray-800 { color: #1f2937 !important; }
        .certificate-container .text-gray-900 { color: #111827 !important; }
        .certificate-container .text-yellow-700 { color: #a16207 !important; }
        
        /* Tracking */
        .certificate-container .tracking-widest { letter-spacing: 0.1em !important; }
        .certificate-container .tracking-wider { letter-spacing: 0.05em !important; }
        
        /* Leading */
        .certificate-container .leading-relaxed { line-height: 1.625 !important; }
        
        /* Max width */
        .certificate-container .max-w-2xl { max-width: 672px !important; }
        
        /* Width and height utilities */
        .certificate-container .w-40 { width: 160px !important; }
        .certificate-container .h-0\\.5 { height: 2px !important; }
        .certificate-container .h-1 { height: 4px !important; }
        .certificate-container .w-8 { width: 32px !important; }
        .certificate-container .h-8 { height: 32px !important; }
      }
    `,
  });

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );

  if (error || !certificate)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 rounded-lg max-w-md text-center shadow-lg">
          <h3 className="text-lg font-bold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error || 'Certificate not found'}</p>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    );

  const issueDate = new Date(certificate.issuedAt);
  const formattedDate = format(issueDate, 'MMMM dd, yyyy');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full overflow-hidden">
        {/* Header Controls */}
        <div className="print-hidden flex justify-between items-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4">
          <h2 className="font-bold text-lg">Certificate Preview</h2>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-md transition"
            >
              <PrinterIcon className="h-5 w-5 mr-1" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-md transition"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-1" /> Download
            </button>
            <button
              onClick={onClose}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-md transition"
            >
              <XMarkIcon className="h-5 w-5 mr-1" /> Close
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="certificate-container relative bg-gradient-to-br from-yellow-50 to-orange-50 border-8 border-yellow-400 rounded-lg m-6 p-12 text-center shadow-2xl"
          style={{
            fontFamily: 'serif',
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,215,0,0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,165,0,0.1) 0%, transparent 50%)
            `,
          }}
        >
          {/* Header Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={Logo} alt="UMUNSI MEDIA" className="h-28 w-28 mb-3" />
            <h1 className="text-3xl font-bold text-gray-800 tracking-widest">
              UMUNSI MEDIA
            </h1>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-800 mt-4 mb-3 uppercase tracking-wider">
            Certificate of Achievement
          </h1>
          <div className="w-40 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full mb-6"></div>

          {/* Recipient */}
          <p className="text-lg text-gray-600 mb-3">This is to certify that</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {certificate.user
              ? `${certificate.user.firstName} ${certificate.user.lastName}`
              : '[Recipient Name]'}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            has demonstrated outstanding performance in
          </p>

          {/* Award Title */}
          <h3 className="text-3xl font-semibold text-yellow-700 mb-4">
            {certificate.certificate.title}
          </h3>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-10">
            {certificate.certificate.description}
          </p>

          {/* Footer Info */}
          <div className="flex justify-between items-center mt-10 px-10">
            <div className="text-center">
              <div className="w-40 h-0.5 bg-yellow-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-700 font-medium">Authorized Signature</p>
              <p className="text-xs text-gray-500 mt-1">UMUNSI MEDIA</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Issued on</p>
              <p className="text-lg font-semibold text-gray-800">{formattedDate}</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-2 inline-block">
                <QRCodeSVG
                  value={certificate.verificationUrl}
                  size={90}
                  level="H"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Scan to Verify</p>
            </div>
          </div>

          {/* Decorative Border Corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-yellow-600"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-yellow-600"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-yellow-600"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
