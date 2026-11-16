import React, { useState } from 'react';
import { Download, Eye, FileText, Award, Calendar, User, Trophy, Star } from 'lucide-react';
import badgeService from '../services/badgeService';
import toast from 'react-hot-toast';

const Certificate = ({ 
  certificate, 
  size = 'md', 
  showActions = true,
  onView = null,
  onDownload = null,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const sizeConfig = {
    sm: {
      container: 'w-64 h-40',
      title: 'text-sm',
      subtitle: 'text-xs',
      icon: 'w-8 h-8'
    },
    md: {
      container: 'w-80 h-48',
      title: 'text-base',
      subtitle: 'text-sm',
      icon: 'w-12 h-12'
    },
    lg: {
      container: 'w-96 h-60',
      title: 'text-lg',
      subtitle: 'text-base',
      icon: 'w-16 h-16'
    }
  };

  const currentSize = sizeConfig[size];

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(certificate);
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await badgeService.downloadCertificate(certificate.id, certificate.userId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.title.replace(/\s+/g, '_')}_${certificate.userName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(certificate);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Certificate Card */}
      <div className={`
        ${currentSize.container}
        bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50
        dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20
        border-2 border-amber-200 dark:border-amber-700/50
        rounded-xl shadow-lg hover:shadow-xl
        transition-all duration-300 hover:scale-105
        overflow-hidden
      `}>
        {/* Decorative Border */}
        <div className="absolute inset-2 border-2 border-amber-300 dark:border-amber-600/50 rounded-lg"></div>
        
        {/* Header */}
        <div className="relative p-4 text-center">
          {/* Certificate Icon */}
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
              <Award className={`${currentSize.icon} text-white`} />
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`${currentSize.title} font-bold text-amber-800 dark:text-amber-200 mb-1`}>
            {certificate.title}
          </h3>
          
          {/* Subtitle */}
          <p className={`${currentSize.subtitle} text-amber-600 dark:text-amber-300 mb-2`}>
            {certificate.description}
          </p>
          
          {/* User Name */}
          {certificate.userName && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className={`${currentSize.subtitle} font-medium text-amber-700 dark:text-amber-300`}>
                {certificate.userName}
              </span>
            </div>
          )}
          
          {/* Date */}
          {certificate.issuedAt && (
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {new Date(certificate.issuedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-amber-400 dark:border-amber-500 rounded-tl-lg"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-amber-400 dark:border-amber-500 rounded-tr-lg"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-amber-400 dark:border-amber-500 rounded-bl-lg"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-amber-400 dark:border-amber-500 rounded-br-lg"></div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center gap-2">
          <button
            onClick={handleView}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
            title="View Certificate"
          >
            <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Download Certificate"
          >
            <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Certificate;
