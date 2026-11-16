import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Users, 
  Loader2, 
  Star, 
  Lock, 
  Globe, 
  Camera, 
  Sparkles,
  Check,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
             
import clubService from '../services/clubService';
import toast from 'react-hot-toast';

const CreateClubModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const categories = clubService.getClubCategories();

  useEffect(() => {
    // Prevent background scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = '🏷️ Club name is required';
        } else if (value.length < 3) {
          newErrors.name = '📏 Club name must be at least 3 characters';
        } else if (value.length > 50) {
          newErrors.name = '📏 Club name must be less than 50 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (!value.trim()) {
          newErrors.description = '📝 Description is required';
        } else if (value.length < 10) {
          newErrors.description = '📏 Description must be at least 10 characters';
        } else {
          delete newErrors.description;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = '🏷️ Please select a category';
        } else {
          delete newErrors.category;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field on change
    if (name !== 'isPrivate') {
      validateField(name, newValue);
    }
  };

  const handleImageChange = (file) => {
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('🚫 Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('🚫 Please select an image file');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const isNameValid = validateField('name', formData.name);
    const isDescValid = validateField('description', formData.description);
    const isCategoryValid = validateField('category', formData.category);
    
    return isNameValid && isDescValid && isCategoryValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('🚫 Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      const clubData = {
        ...formData,
        image
      };
      
      await clubService.createClub(clubData);
      toast.success('🎉 Club created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error(error.message || '❌ Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.emoji || '🏷️';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700/50 animate-in zoom-in-95 duration-300">
        {/* Enhanced Header */}
                <div className="relative p-6 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gradient-to-r dark:from-gray-800/80 dark:to-gray-700/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Create New Club
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Build your community</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (Object.keys(formData).filter(key => formData[key] !== '' && formData[key] !== false).length / 3) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {Math.min(100, Math.round((Object.keys(formData).filter(key => formData[key] !== '' && formData[key] !== false).length / 3) * 100))}%
            </span>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Club Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white">
                Club Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800/50 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm font-medium ${
                    errors.name 
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                      : 'border-gray-600/50 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                  placeholder="Enter your club name..."
                  maxLength={50}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {formData.name.length}/50
                </div>
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-white">
                Category *
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800/50 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm font-medium appearance-none cursor-pointer ${
                    errors.category 
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                      : 'border-gray-600/50 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {formData.category ? (
                    <span className="text-lg">{getCategoryEmoji(formData.category)}</span>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              {errors.category && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white">
                Description *
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800/50 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm font-medium resize-none ${
                    errors.description 
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                      : 'border-gray-600/50 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                  placeholder="Tell everyone about your club. What makes it special? What activities do you plan? Who should join?"
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {formData.description.length}/500
                </div>
              </div>
              {errors.description && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Enhanced Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                Club Image (Optional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600/50 hover:border-gray-500/70'
                } ${imagePreview ? 'p-2' : 'p-6'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      ✅ Ready
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full">
                        <ImageIcon className="h-12 w-12 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-white font-medium">Add a club image</p>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-blue-600 rounded-lg px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          <span>Choose File</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleImageChange(e.target.files[0])}
                          />
                        </label>
                        <span className="ml-2 self-center">or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB • Recommended: 1200x600px
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Privacy Setting */}
            <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl p-5 border border-gray-200 dark:border-gray-700/30">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <input
                    id="isPrivate"
                    name="isPrivate"
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 transition-all duration-200"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    {formData.isPrivate ? (
                      <Lock className="h-5 w-5 text-blue-400 opacity-0" />
                    ) : (
                      <Globe className="h-5 w-5 text-green-400 opacity-0" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="isPrivate" className="block text-gray-900 dark:text-white font-medium flex items-center gap-2 cursor-pointer">
                    {formData.isPrivate ? (
                      <>
                        <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        Private Club
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Public Club
                      </>
                    )}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.isPrivate ? (
                      <>
                        Members need approval to join. Perfect for exclusive communities or professional groups.
                      </>
                    ) : (
                      <>
                        Anyone can join instantly. Great for open communities and public interest groups.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700/30">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
                className="flex-1 px-6 py-3 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Create Club
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes zoomIn95 {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .zoom-in-95 {
          animation: zoomIn95 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateClubModal;