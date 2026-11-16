import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import CertificatePreview from '../components/CertificatePreview';
import certificateService from '../services/certificateService';

const UserCertificates = ({ userId }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchUserCertificates();
  }, [userId]);

  const fetchUserCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getUserCertificates(userId);
      setCertificates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownloadPDF = async (certificateId) => {
    try {
      await certificateService.downloadCertificatePDF(certificateId);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading certificates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Certificates</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
        <p className="text-gray-600">You haven't earned any certificates yet. Keep writing great articles!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
        <span className="text-sm text-gray-500">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-8 w-8" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {certificate.certificate.title}
                  </h3>
                  <p className="text-blue-100 text-sm">Certificate of Achievement</p>
                </div>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="p-4">
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {certificate.certificate.description}
              </p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Issued {format(new Date(certificate.issuedAt), 'MMM dd, yyyy')}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewCertificate(certificate)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(certificate.id)}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <CertificatePreview
          certificateId={selectedCertificate.id}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};

export default UserCertificates;
