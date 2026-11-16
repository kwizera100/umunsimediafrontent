import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  CameraIcon,
  EyeIcon,
  ClockIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const CreateStoryModal = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { user } = useAuth();
  const [storyType, setStoryType] = useState('text');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#4f46e5');
  const [fontSize, setFontSize] = useState('medium');
  const [textAlign, setTextAlign] = useState('center');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStoryType('text');
      setText('');
      setImage(null);
      setImagePreview('');
      setTextColor('#ffffff');
      setBackgroundColor('#4f46e5');
      setFontSize('medium');
      setTextAlign('center');
      setFontFamily('Inter');
      setCaption('');
    }
  }, [isOpen]);

  // Handle escape key and prevent scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Prevent background scroll on mobile
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please choose a file under 10MB.');
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

const handleSave = () => {
  if (storyType === 'text' && !text.trim()) {
    alert('Please enter some text for your story');
    return;
  }
  
  if (storyType === 'image' && !image) {
    alert('Please select an image for your story');
    return;
  }

  // Create FormData for proper file upload
  const formData = new FormData();
  
  // Add the story type
  formData.append('type', storyType);
  
  if (storyType === 'text') {
    formData.append('content', text.trim());
    formData.append('textColor', textColor);
    formData.append('backgroundColor', backgroundColor);
    formData.append('fontSize', fontSize);
    formData.append('textAlign', textAlign);
    formData.append('fontFamily', fontFamily);
  } else {
    // For image stories, use 'story' as the field name (matching backend expectation)
    formData.append('story', image);
    if (caption.trim()) {
      formData.append('caption', caption.trim());
    }
  }
  
  console.log('FormData created with type:', storyType);
  console.log('FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  onSave(formData);
};

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const colorOptions = [
    '#ffffff', '#000000', '#ef4444', '#22c55e', '#3b82f6', 
    '#eab308', '#a855f7', '#06b6d4', '#f97316', '#ec4899',
    '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#84cc16'
  ];

  const backgroundGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea4c89 100%)',
    'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)'
  ];

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Playfair', value: 'Playfair Display, serif' },
    { name: 'Dancing Script', value: 'Dancing Script, cursive' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[95vh] shadow-2xl transform transition-all duration-300 scale-100 flex flex-col"
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Create Story</h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Expires in 24 hours</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
              disabled={isLoading}
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Story type selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Story Type</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => setStoryType('text')}
                disabled={isLoading}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  storyType === 'text' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-md' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-medium text-sm sm:text-base">Text</span>
              </button>
              <button
                onClick={() => setStoryType('image')}
                disabled={isLoading}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  storyType === 'image' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-md' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-medium text-sm sm:text-base">Photo</span>
              </button>
            </div>
          </div>

          {/* Content input */}
          {storyType === 'text' ? (
            <div className="space-y-4">
              {/* Text input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Story Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind? Share your thoughts..."
                  className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none h-24 sm:h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                  maxLength={280}
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{text.length}/280 characters</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <EyeIcon className="h-3 w-3" />
                    <span className="hidden sm:inline">24h visible</span>
                  </div>
                </div>
              </div>

              {/* Font customization - Mobile optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.name} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>
              </div>

              {/* Text alignment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alignment</label>
                <div className="flex gap-1 sm:gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => setTextAlign(align)}
                      className={`flex-1 px-2 sm:px-4 py-2 rounded-lg border transition-all text-xs sm:text-sm ${
                        textAlign === align
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color customization */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Text Color</label>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${
                        textColor === color ? 'border-gray-800 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Background</label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {backgroundGradients.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => setBackgroundColor(gradient)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        backgroundColor === gradient ? 'border-gray-800 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              {text && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                  <div 
                    className="w-full h-32 sm:h-40 rounded-xl flex items-center justify-center p-4 text-center relative overflow-hidden"
                    style={{ 
                      background: backgroundColor,
                      color: textColor,
                      fontFamily: fontFamily,
                      textAlign: textAlign,
                      fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'medium' ? '1.125rem' : fontSize === 'large' ? '1.5rem' : '2rem'
                    }}
                  >
                    <span className="font-medium leading-relaxed break-words">{text}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Photo</label>
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <PhotoIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">Click to upload an image</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              
              {/* Optional caption for image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Caption (Optional)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption to your photo..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                  maxLength={100}
                  disabled={isLoading}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{caption.length}/100 characters</span>
              </div>
              
              {imagePreview && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full h-40 sm:h-48 object-cover rounded-xl" />
                    {caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4 rounded-b-xl">
                        <p className="text-white text-sm sm:text-base font-medium">{caption}</p>
                      </div>
                    )}
                    <button 
                      onClick={() => { setImage(null); setImagePreview(''); }}
                      disabled={isLoading}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 sm:p-2 hover:bg-black/70 transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || (storyType === 'text' ? !text.trim() : !image)}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Share Story
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx="true">{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CreateStoryModal;