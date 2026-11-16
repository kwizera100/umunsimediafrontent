import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Logo from '../assets/Logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const CertificateVerification = () => {
  const { id } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [id]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/rewards/certificates/verify/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Certificate not found or invalid');
        }
        throw new Error('Failed to verify certificate');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Unexpected response format from server');
      }

      const data = await response.json();
      setVerification(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Certificate</h2>
            <p className="text-gray-600">Please wait while we verify the certificate...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !verification?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error || 'This certificate is not valid or has been revoked.'}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                If you believe this is an error, please contact the issuing organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { certificate } = verification;
  const issueDate = new Date(certificate.issuedAt);
  const formattedDate = format(issueDate, 'MMMM dd, yyyy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Certificate Verified</h1>
          <p className="text-gray-600">This certificate has been successfully verified</p>

          {/* Awarded By - UMUNSI MEDIA */}
          <div className="mt-4 inline-flex items-center bg-white/70 backdrop-blur rounded-full px-4 py-2 border border-yellow-200">
            <img src={Logo} alt="UMUNSI MEDIA" className="h-7 w-7 mr-2" />
            <span className="text-sm font-semibold text-gray-800 tracking-wider">Awarded by UMUNSI MEDIA</span>
          </div>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{certificate.title}</h2>
                <p className="text-orange-100">Certificate of Achievement</p>
              </div>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Recipient Name
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {certificate.recipientName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Certificate Description
                  </label>
                  <p className="text-gray-700 leading-relaxed">
                    {certificate.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Issuing Organization
                  </label>
                  <div className="flex items-center space-x-3">
                    <img src={Logo} alt="UMUNSI MEDIA" className="h-7 w-7" />
                    <p className="text-lg font-semibold text-gray-800">UMUNSI MEDIA</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Issue Date
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {formattedDate}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Certificate ID
                  </label>
                  <p className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {certificate.id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Verification Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-700 font-semibold">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Certificate Verification Successful
                    </h3>
                    <p className="text-sm text-yellow-700">
                      This certificate has been verified and is authentic. Awarded by UMUNSI MEDIA. The information displayed above is accurate and has been confirmed by our verification system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This certificate was verified on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
