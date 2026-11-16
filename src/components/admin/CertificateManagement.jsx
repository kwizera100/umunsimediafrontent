import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import certificateService from '../../services/certificateService';

const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    description: '',
    template: 'default'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certificatesData, usersData] = await Promise.all([
        certificateService.getAllCertificates(),
        fetchUsers()
      ]);
      setCertificates(certificatesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    try {
      await certificateService.createCertificate(newCertificate);
      setShowCreateModal(false);
      setNewCertificate({ title: '', description: '', template: 'default' });
      fetchData();
    } catch (error) {
      console.error('Error creating certificate:', error);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    try {
      await certificateService.issueCertificate(selectedUser, selectedCertificate.id);
      setShowIssueModal(false);
      setSelectedUser('');
      setSelectedCertificate(null);
      fetchData();
    } catch (error) {
      console.error('Error issuing certificate:', error);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await certificateService.deleteCertificate(certificateId);
        fetchData();
      } catch (error) {
        console.error('Error deleting certificate:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-gray-600">Manage certificates and issue them to users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Certificate</span>
        </button>
      </div>

      {/* Certificates Grid */}
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
                    {certificate.title}
                  </h3>
                  <p className="text-blue-100 text-sm">Certificate Template</p>
                </div>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="p-4">
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {certificate.description}
              </p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Created {new Date(certificate.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span>{certificate.userCertificates?.length || 0} issued</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedCertificate(certificate);
                    setShowIssueModal(true);
                  }}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Issue</span>
                </button>
                <button
                  onClick={() => handleDeleteCertificate(certificate.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Certificate</h2>
            <form onSubmit={handleCreateCertificate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newCertificate.title}
                    onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCertificate.description}
                    onChange={(e) => setNewCertificate({ ...newCertificate, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <select
                    value={newCertificate.template}
                    onChange={(e) => setNewCertificate({ ...newCertificate, template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default Template</option>
                    <option value="academic">Academic Excellence</option>
                    <option value="creative">Creative Writing</option>
                    <option value="leadership">Leadership</option>
                  </select>
                </div>

                
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showIssueModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Issue Certificate</h2>
            <form onSubmit={handleIssueCertificate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold">{selectedCertificate.title}</h3>
                    <p className="text-sm text-gray-600">{selectedCertificate.description}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Issue Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;
