import React, { useState, useEffect, useRef } from 'react';
import { createArticle } from '../services/articleService';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import TagInput from './TagInput';
import { 
  Sparkles, X, Upload, BookOpen, Eye, Bold, Italic, 
  Underline as UnderlineIcon, Link as LinkIcon, ImageIcon, 
  Trash2, Loader2, CheckCircle, AlertCircle, FileText,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Highlighter, Plus, AlertTriangle, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateArticleModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [pricingMode, setPricingMode] = useState('free'); // 'free' | 'single' | 'monthly' | 'both'
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const fileInputRef = useRef();
  const coverInputRef = useRef();
  const galleryInputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  
  const { user } = useAuth();

  // Fetch categories on component mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_URL}/rewards/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched categories:', data);
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length === 0) {
          console.warn('No categories found in database. Categories may need to be initialized by an admin.');
        }
      } else {
        console.warn('Categories data is not an array:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({ 
        openOnClick: false, 
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-4',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ListItem,
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-inside',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-inside',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-gray dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[300px] p-4 sm:p-6 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4 [&_img]:mx-auto [&_img]:block',
      },
    },
    onUpdate: ({ editor }) => {
      // Clear error when user starts typing
      if (error && editor.getText().length > 0) {
        setError(null);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setImage(null);
    setImagePreview(null);
    setCoverImage(null);
    setCoverPreview(null);
    setGallery([]);
    setGalleryPreviews([]);
    setTags([]);
    setError(null);
    setLoading(false);
    setPreviewMode(false);
    
    // Clean up gallery previews
    galleryPreviews.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    
    editor?.commands.clearContent();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'main') {
        setImage(file);
        setImagePreview(reader.result);
        toast.success('Featured image uploaded successfully');
      } else if (type === 'cover') {
        setCoverImage(file);
        setCoverPreview(reader.result);
        toast.success('Cover image uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const currentGalleryCount = gallery.length;
    
    // Check if adding new files would exceed the limit of 5
    if (currentGalleryCount + files.length > 5) {
      toast.error('Maximum 5 images allowed in gallery');
      setError('Gallery can contain a maximum of 5 images');
      return;
    }

    // Validate each file
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} is too large (max 5MB)`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} is not a valid image`);
        return;
      }
      validFiles.push(file);
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    // Add valid files to existing gallery
    const newGallery = [...gallery, ...validFiles];
    setGallery(newGallery);
    
    // Create previews for new files
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} image(s) added to gallery`);
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    if (galleryPreviews[index]?.preview) {
      URL.revokeObjectURL(galleryPreviews[index].preview);
    }
    
    setGallery(newGallery);
    setGalleryPreviews(newPreviews);
    toast.success('Image removed from gallery');
    
    // Clear error if we're now under the limit
    if (newGallery.length <= 5 && error?.includes('Maximum')) {
      setError(null);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (type === 'gallery') {
      setIsGalleryDragging(false);
      
      // Check gallery limit before processing
      if (gallery.length + files.length > 5) {
        toast.error('Maximum 5 images allowed in gallery');
        setError('Gallery can contain a maximum of 5 images');
        return;
      }
      
      // Simulate file input change
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      const event = { target: { files: dt.files } };
      handleGalleryChange(event);
    } else {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        const event = { target: { files: dt.files } };
        handleImageChange(event, type);
      }
      
      if (type === 'main') setIsDragging(false);
      if (type === 'cover') setIsCoverDragging(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!editor?.getHTML()?.trim() || editor.getHTML() === '<p></p>') {
      setError('Content is required');
      return false;
    }
    if (title.length < 10) {
      setError('Title must be at least 10 characters long');
      return false;
    }
    const isPremiumOrStudent = user?.plan === 'PREMIUM' || user?.isStudent;
    if (!isPremiumOrStudent && editor.getText().length < 100) {
      setError('Content must be at least 100 characters long');
      return false;
    }
    if (gallery.length > 5) {
      setError('Gallery can contain a maximum of 5 images');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', editor.getHTML());
      
      // Add category
      if (selectedCategory) {
        formData.append('categoryId', selectedCategory);
      }
      
      // Add tags as JSON string
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      
      // Add images with proper field names
      if (image) {
        formData.append('article', image);
      }
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      if (gallery.length > 0) {
        gallery.forEach((file, index) => {
          formData.append('gallery', file);
        });
      }

      // Pricing mode + price — 'free' means no charge
      formData.append('pricingMode', pricingMode);
      const articlePrice = pricingMode === 'free' ? 0 : (parseFloat(price) || 0);
      if (articlePrice > 0) {
        formData.append('price', String(articlePrice));
      }

      console.log('Submitting article with:', {
        title: title.trim(),
        contentLength: editor.getText().length,
        hasImage: !!image,
        hasCoverImage: !!coverImage,
        galleryCount: gallery.length,
        tagsCount: tags.length
      });

      const response = await createArticle(formData);
      
      if (response) {
        toast.success('Article published successfully!');
        onClose(true); // Pass true to indicate successful creation
      }
    } catch (err) {
      console.error('Error creating article:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create article';
      setError(errorMessage);
      toast.error('Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload in editor
  const handleEditorImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Convert to base64 for inline display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (editor) {
          editor.chain().focus().setImage({ src: base64String }).run();
          toast.success('Image added to content');
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const getUserDisplayName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Unknown User';
  };

  const getUserAvatar = (user) => {
    if (!user) {
      return 'https://ui-avatars.com/api/?name=Unknown&background=4f46e5&color=ffffff';
    }
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `https://fggg.space/uploads/avatars/${user.avatar.replace(/^avatars\//, '')}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=4f46e5&color=ffffff`;
  };

  const toolbarButtons = [
    { 
      action: () => editor.chain().focus().toggleBold().run(), 
      isActive: () => editor?.isActive('bold'),
      icon: Bold,
      label: 'Bold',
      shortcut: 'Ctrl+B'
    },
    { 
      action: () => editor.chain().focus().toggleItalic().run(), 
      isActive: () => editor?.isActive('italic'),
      icon: Italic,
      label: 'Italic',
      shortcut: 'Ctrl+I'
    },
    { 
      action: () => editor.chain().focus().toggleUnderline().run(), 
      isActive: () => editor?.isActive('underline'),
      icon: UnderlineIcon,
      label: 'Underline',
      shortcut: 'Ctrl+U'
    },
    { 
      action: () => {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }, 
      isActive: () => editor?.isActive('link'),
      icon: LinkIcon,
      label: 'Link',
      shortcut: 'Ctrl+K'
    },
    { 
      action: () => editor.chain().focus().toggleBulletList().run(), 
      isActive: () => editor?.isActive('bulletList'),
      icon: List,
      label: 'Bullet List'
    },
    { 
      action: () => editor.chain().focus().toggleOrderedList().run(), 
      isActive: () => editor?.isActive('orderedList'),
      icon: ListOrdered,
      label: 'Numbered List'
    },
    { 
      action: () => editor.chain().focus().setTextAlign('left').run(), 
      isActive: () => editor?.isActive({ textAlign: 'left' }),
      icon: AlignLeft,
      label: 'Align Left'
    },
    { 
      action: () => editor.chain().focus().setTextAlign('center').run(), 
      isActive: () => editor?.isActive({ textAlign: 'center' }),
      icon: AlignCenter,
      label: 'Align Center'
    },
    { 
      action: () => editor.chain().focus().setTextAlign('right').run(), 
      isActive: () => editor?.isActive({ textAlign: 'right' }),
      icon: AlignRight,
      label: 'Align Right'
    },
    { 
      action: handleEditorImageUpload, 
      isActive: () => false,
      icon: ImageIcon,
      label: 'Insert Image'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[95vh] shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden mx-auto">
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={getUserAvatar(user)}
              alt={getUserDisplayName(user)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=4f46e5&color=ffffff`;
              }}
            />
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Create Article
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Share your insights with the community</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Preview Toggle */}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
                previewMode 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
            
            <button 
              onClick={() => onClose(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              disabled={loading}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Title Input */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Article Title *
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-medium text-base sm:text-lg"
                value={title} 
                onChange={e => {
                  setTitle(e.target.value);
                  if (error && e.target.value.length >= 10) {
                    setError(null);
                  }
                }} 
                placeholder="Enter an engaging title for your article..."
                maxLength={200}
                required 
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Make it descriptive and engaging (minimum 10 characters)</p>
                <p className={`text-xs ${title.length > 180 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {title.length}/200
                </p>
              </div>
            </div>

            {/* Pricing — how readers access this article */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" />
                Who can read this article?
              </label>
              <select
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                value={pricingMode}
                onChange={e => setPricingMode(e.target.value)}
              >
                <option value="free">Free — everyone can read</option>
                <option value="monthly">Paid — monthly subscribers only (reads all your paid articles)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {pricingMode === 'free'
                  ? 'Anyone can read this article for free.'
                  : 'Readers subscribe to you monthly to unlock this and all your paid articles. You earn 70% of each subscription.'}
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                Category
              </label>
              {categories.length === 0 ? (
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 text-sm">
                  Loading categories...
                </div>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    console.log('Category selected:', e.target.value);
                    setSelectedCategory(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon || '📄'} {category.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Choose a category to help readers find your article and earn category-specific rewards
              </p>
            </div>

            {/* Content Editor */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Content *
              </label>
              
              {/* Enhanced Toolbar */}
              <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-t-md border border-gray-300 dark:border-gray-600 border-b-0">
                {toolbarButtons.map((button, index) => {
                  const Icon = button.icon;
                  return (
                    <button 
                      key={index}
                      type="button" 
                      onClick={button.action}
                      title={`${button.label} ${button.shortcut ? `(${button.shortcut})` : ''}`}
                      className={`p-2 sm:p-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        button.isActive?.() 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
                
                <div className="w-px bg-gray-600/50 mx-2 self-stretch"></div>
                
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    onChange={e => editor?.chain().focus().setColor(e.target.value).run()} 
                    title="Text color" 
                    className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600/50 bg-gray-100 dark:bg-gray-700 cursor-pointer hover:scale-105 transition-transform" 
                  />
                  <input 
                    type="color" 
                    onChange={e => editor?.chain().focus().toggleHighlight({ color: e.target.value }).run()} 
                    title="Highlight color" 
                    className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600/50 bg-gray-100 dark:bg-gray-700 cursor-pointer hover:scale-105 transition-transform" 
                  />
                </div>
                
                {/* Font Size Selector */}
                <select 
                  onChange={e => {
                    const size = e.target.value;
                    if (size === 'heading1') editor?.chain().focus().toggleHeading({ level: 1 }).run();
                    else if (size === 'heading2') editor?.chain().focus().toggleHeading({ level: 2 }).run();
                    else if (size === 'heading3') editor?.chain().focus().toggleHeading({ level: 3 }).run();
                    else editor?.chain().focus().setParagraph().run();
                  }}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white text-sm hover:bg-gray-300 dark:hover:bg-gray-600/60 transition-colors"
                  defaultValue="paragraph"
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="heading1">Heading 1</option>
                  <option value="heading2">Heading 2</option>
                  <option value="heading3">Heading 3</option>
                </select>
              </div>
              
              {/* Enhanced Editor */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-b-md bg-white dark:bg-gray-700 min-h-[300px] sm:min-h-[350px] max-h-[400px] sm:max-h-[450px] overflow-y-auto">
                <EditorContent 
                  editor={editor} 
                  className="prose prose-gray dark:prose-invert prose-lg max-w-none [&>div]:min-h-[330px] [&_p]:text-gray-900 dark:[&_p]:text-gray-200 [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h2]:text-gray-800 dark:[&_h2]:text-gray-100 [&_h3]:text-gray-800 dark:[&_h3]:text-gray-200 [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_em]:text-gray-800 dark:[&_em]:text-gray-200 [&_ul]:text-gray-900 dark:[&_ul]:text-gray-200 [&_ol]:text-gray-900 dark:[&_ol]:text-gray-200 [&_li]:text-gray-900 dark:[&_li]:text-gray-200 [&_blockquote]:text-gray-700 dark:[&_blockquote]:text-gray-300 [&_code]:text-purple-700 dark:[&_code]:text-purple-300"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.plan === 'PREMIUM' || user?.isStudent
                    ? 'Write your content — no character limits for Premium/Student members'
                    : 'Write detailed content with rich formatting (minimum 100 characters)'}
                </p>
                <p className={`text-xs ${editor?.getText().length > 5000 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {editor?.getText().length || 0} characters
                </p>
              </div>
            </div>

            {/* Image Uploads Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Main Image */}
              <div>
                <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-400" />
                  Featured Image
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-md p-4 sm:p-6 transition-colors cursor-pointer ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/40'
                  }`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={e => handleDrop(e, 'main')}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg shadow-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-gray-400 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
                      <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm font-medium">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max 5MB • JPG, PNG, WebP</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, 'main')}
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-purple-400" />
                  Cover Image
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-md p-4 sm:p-6 transition-colors cursor-pointer ${
                    isCoverDragging 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700/40'
                  }`}
                  onDragOver={e => { e.preventDefault(); setIsCoverDragging(true); }}
                  onDragLeave={e => { e.preventDefault(); setIsCoverDragging(false); }}
                  onDrop={e => handleDrop(e, 'cover')}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <div className="relative">
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-32 object-cover rounded-lg shadow-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverImage(null);
                          setCoverPreview(null);
                          if (coverInputRef.current) coverInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-gray-400 group-hover:text-purple-400 mx-auto mb-3 transition-colors" />
                      <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm font-medium">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max 5MB • JPG, PNG, WebP</p>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, 'cover')}
                  />
                </div>
              </div>
            </div>

            {/* Gallery Images - Enhanced with better limit handling */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-400" />
                Gallery Images 
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (Optional • {gallery.length}/5 images)
                </span>
                {gallery.length >= 5 && (
                  <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                    Limit reached
                  </span>
                )}
              </label>
              
              {/* Gallery limit warning */}
              {gallery.length >= 4 && gallery.length < 5 && (
                <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-400 text-sm">
                    You can add {5 - gallery.length} more image{5 - gallery.length !== 1 ? 's' : ''} to your gallery.
                  </p>
                </div>
              )}
              
              <div
                className={`border-2 border-dashed rounded-md p-4 sm:p-6 transition-colors cursor-pointer ${
                  gallery.length >= 5 
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/20 cursor-not-allowed opacity-50' 
                    : isGalleryDragging 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-green-400 hover:bg-gray-100 dark:hover:bg-gray-700/40'
                }`}
                onDragOver={e => { 
                  e.preventDefault(); 
                  if (gallery.length < 5) setIsGalleryDragging(true); 
                }}
                onDragLeave={e => { 
                  e.preventDefault(); 
                  setIsGalleryDragging(false); 
                }}
                onDrop={e => handleDrop(e, 'gallery')}
                onClick={() => {
                  if (gallery.length < 5) {
                    galleryInputRef.current?.click();
                  } else {
                    toast.error('Gallery is full (5 images maximum)');
                  }
                }}
              >
                {galleryPreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {galleryPreviews.map((item, index) => (
                        <div key={index} className="relative group/item">
                          <img 
                            src={item.preview} 
                            alt={`Gallery ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg shadow-lg border border-gray-600/30"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover/item:opacity-100 shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                      
                      {gallery.length < 5 && (
                        <div className="border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg h-24 flex items-center justify-center hover:border-green-400 transition-colors group">
                          <Plus className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-green-400 transition-colors" />
                        </div>
                      )}
                    </div>
                    
                    {gallery.length < 5 && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Click the + box or drag more images here to add up to {5 - gallery.length} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-gray-400 group-hover:text-green-400 mx-auto mb-3 transition-colors" />
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm font-medium">
                      Drag & drop multiple images or click to upload
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Maximum 5 images • 5MB each • JPG, PNG, WebP</p>
                  </div>
                )}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryChange}
                  disabled={gallery.length >= 5}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                Tags 
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Help others discover your article)</span>
              </label>
              <TagInput value={tags} onChange={setTags} />
            </div>
            
            {/* Enhanced Error Display */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">{error}</p>
                  {error.includes('Gallery') && (
                    <p className="text-red-300 text-sm mt-1">
                      Remove some images from the gallery to continue.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Progress Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-400" />
                <p className="text-blue-400 font-medium text-sm">Article Progress</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Title:</span>
                  <span className={title.length >= 10 ? 'text-green-400' : 'text-gray-600 dark:text-gray-300'}>
                    {title.length >= 10 ? '✓' : `${title.length}/10`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Content:</span>
                  <span className={editor?.getText().length >= 100 ? 'text-green-400' : 'text-gray-600 dark:text-gray-300'}>
                    {editor?.getText().length >= 100 ? '✓' : `${editor?.getText().length || 0}/100`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Featured Image:</span>
                  <span className={image ? 'text-green-400' : 'text-gray-600 dark:text-gray-300'}>
                    {image ? '✓' : 'Optional'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gallery:</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {gallery.length}/5 images
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Submit Button */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky bottom-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                disabled={loading || !title.trim() || !editor?.getText().trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Publish Article
                  </>
                )}
              </button>
            </div>
            
            {/* Submit Helper Text */}
            <div className="flex justify-between items-center mt-3 text-xs">
              <p className="text-gray-500 dark:text-gray-400">
                Your article will be published immediately
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {gallery.length > 0 && `${gallery.length} gallery image${gallery.length !== 1 ? 's' : ''} • `}
                {editor?.getText().length || 0} characters
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;