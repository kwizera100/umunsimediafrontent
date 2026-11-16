import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Trash2, Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react";
import TagInput from "./TagInput";
import {
  addTagsToArticle,
  uploadArticleImages,
  updateArticle,
  getArticleById,
  deleteArticleImage,
} from "../services/articleService";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import toast from "react-hot-toast";

// Image URL helper function (same as in ArticleView)
const BASE_URL = import.meta.env.VITE_SOCKET_URL || "https://fggg.space";

const getImageUrl = (img, type = "articles") => {
  if (!img) return "";
  let url = typeof img === "string" ? img : img.url;
  if (!url) return "";

  console.log(`getImageUrl - Input: ${url}, Type: ${type}`);

  // If already a full URL, return as is
  if (url.startsWith("http")) {
    console.log(`getImageUrl - Already full URL: ${url}`);
    return url;
  }

  // Gallery images
  if (
    type === "gallery" ||
    /^gallery-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)
  ) {
    console.log(`getImageUrl - Processing gallery image: ${url}`);

    // Handle old URL format: /uploads/articles/gallery-filename.jpg
    if (
      url.includes("/uploads/articles/gallery-") &&
      !url.includes("/uploads/articles/gallery/gallery-")
    ) {
      console.log(
        `getImageUrl - Detected old gallery URL format, fixing: ${url}`
      );
      const filename = url.split("/").pop(); // Get just the filename
      const fixedUrl = `${BASE_URL}/uploads/articles/gallery/${filename}`;
      console.log(`getImageUrl - Fixed old gallery URL: ${fixedUrl}`);
      return fixedUrl;
    }

    // Remove any existing path prefixes
    url = url.replace(/^gallery\//, "").replace(/^articles\/gallery\//, "");

    // Check if the URL already contains the full path
    if (url.includes("/uploads/articles/gallery/")) {
      console.log(`getImageUrl - Already has full gallery path: ${url}`);
      return url;
    }

    // Construct the correct gallery path
    const finalUrl = `${BASE_URL}/uploads/articles/gallery/${url}`;
    console.log(`getImageUrl - Constructed gallery URL: ${finalUrl}`);
    return finalUrl;
  }

  // Main article image
  if (
    type === "articles" ||
    /^article-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)
  ) {
    url = url.replace(/^articles\//, "");
    return `${BASE_URL}/uploads/articles/${url}`;
  }

  // Cover image
  if (
    type === "covers" ||
    /^cover-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)
  ) {
    url = url.replace(/^covers\//, "");
    return `${BASE_URL}/uploads/covers/${url}`;
  }

  // Default fallback
  return `${BASE_URL}/uploads/${type}/${url}`;
};

const EditArticleModal = ({ article, onClose, onSave, isOpen = true }) => {
  // Debug: Log the article data to see its structure
  console.log("EditArticleModal - Article data:", article);
  console.log("EditArticleModal - Article gallery:", article?.gallery);
  console.log("EditArticleModal - Article coverImage:", article?.coverImage);
  console.log("EditArticleModal - Article image:", article?.image);

  // Debug gallery URLs
  if (article?.gallery) {
    console.log("Gallery URLs in database:");
    article.gallery.forEach((img, index) => {
      console.log(`Gallery ${index}:`, img);
      console.log(
        `Gallery ${index} URL:`,
        typeof img === "string" ? img : img.url
      );
    });
  }

  const [title, setTitle] = useState(article?.title || "");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    article?.image ? getImageUrl(article.image, "articles") : null
  );
  const [tags, setTags] = useState(
    article?.tags ? article.tags.map((t) => t.tag.name) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(
    article?.coverImage ? getImageUrl(article.coverImage, "covers") : null
  );
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
    content: article?.content || "",
    editorProps: {
      attributes: {
        class: 'prose prose-gray dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[300px] p-4 sm:p-6 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4 [&_img]:mx-auto [&_img]:block',
      },
    },
  });

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

  const toolbarButtons = [
    { 
      action: () => editor?.chain().focus().toggleBold().run(), 
      isActive: () => editor?.isActive('bold'),
      icon: Bold,
      label: 'Bold',
      shortcut: 'Ctrl+B'
    },
    { 
      action: () => editor?.chain().focus().toggleItalic().run(), 
      isActive: () => editor?.isActive('italic'),
      icon: Italic,
      label: 'Italic',
      shortcut: 'Ctrl+I'
    },
    { 
      action: () => editor?.chain().focus().toggleUnderline().run(), 
      isActive: () => editor?.isActive('underline'),
      icon: UnderlineIcon,
      label: 'Underline',
      shortcut: 'Ctrl+U'
    },
    { 
      action: () => {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor?.chain().focus().setLink({ href: url }).run();
        }
      }, 
      isActive: () => editor?.isActive('link'),
      icon: LinkIcon,
      label: 'Link',
      shortcut: 'Ctrl+K'
    },
    { 
      action: () => editor?.chain().focus().toggleBulletList().run(), 
      isActive: () => editor?.isActive('bulletList'),
      icon: List,
      label: 'Bullet List'
    },
    { 
      action: () => editor?.chain().focus().toggleOrderedList().run(), 
      isActive: () => editor?.isActive('orderedList'),
      icon: ListOrdered,
      label: 'Numbered List'
    },
    { 
      action: () => editor?.chain().focus().setTextAlign('left').run(), 
      isActive: () => editor?.isActive({ textAlign: 'left' }),
      icon: AlignLeft,
      label: 'Align Left'
    },
    { 
      action: () => editor?.chain().focus().setTextAlign('center').run(), 
      isActive: () => editor?.isActive({ textAlign: 'center' }),
      icon: AlignCenter,
      label: 'Align Center'
    },
    { 
      action: () => editor?.chain().focus().setTextAlign('right').run(), 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", editor.getHTML());

      // Add images only if they are new
      if (image) {
        console.log("Adding new main image:", image.name);
        formData.append("article", image);
      }
      if (coverImage) {
        console.log("Adding new cover image:", coverImage.name);
        formData.append("coverImage", coverImage);
      }

      // Handle image deletions
      if (imagesToDelete.includes("main")) {
        console.log("Main image marked for deletion - will be set to null");
        formData.append("deleteMainImage", "true");
      }
      if (imagesToDelete.includes("cover")) {
        console.log("Cover image marked for deletion - will be set to null");
        formData.append("deleteCoverImage", "true");
      }

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Update the article
      console.log("Updating article with ID:", article.id);
      const updateResult = await updateArticle(article.id, formData);
      console.log("Article update result:", updateResult);

      // Update tags
      if (tags.length > 0) {
        console.log("Updating tags:", tags);
        await addTagsToArticle(article.id, tags);
      }

      // Upload new gallery images
      if (gallery.length > 0) {
        console.log("Uploading gallery images:", gallery.length, "files");
        console.log("Gallery files:", gallery);
        const uploadResult = await uploadArticleImages(article.id, gallery);
        console.log("Gallery upload result:", uploadResult);
      }

      // Delete marked images
      if (imagesToDelete.length > 0) {
        console.log("Deleting images:", imagesToDelete);
        for (const imageId of imagesToDelete) {
          if (imageId === "main") {
            // Main image deletion is handled by setting image to null in the update
            console.log("Main image marked for deletion");
          } else if (imageId === "cover") {
            // Cover image deletion is handled by setting coverImage to null in the update
            console.log("Cover image marked for deletion");
          } else {
            // Delete gallery image
            try {
              await deleteArticleImage(imageId);
              console.log("Deleted gallery image:", imageId);
            } catch (error) {
              console.error("Error deleting gallery image:", error);
            }
          }
        }
      }

      console.log("Article updated successfully");

      // Fetch the updated article to get the latest data including images
      try {
        const updatedArticle = await getArticleById(article.id);
        console.log("Updated article data:", updatedArticle);

        if (onSave) {
          onSave(updatedArticle);
        } else {
          onClose(true);
        }
      } catch (fetchError) {
        console.error("Error fetching updated article:", fetchError);
        // Even if fetch fails, we should still call onSave to close the modal
        if (onSave) {
          // Create a mock updated article with the new images
          const mockUpdatedArticle = {
            ...article,
            image: image ? URL.createObjectURL(image) : article.image,
            coverImage: coverImage
              ? URL.createObjectURL(coverImage)
              : article.coverImage,
            gallery: [
              ...(article.gallery || []),
              ...galleryPreviews.map((url, index) => ({
                url,
                id: `new-${index}`,
              })),
            ],
          };
          onSave(mockUpdatedArticle);
        } else {
          onClose(true);
        }
      }
    } catch (err) {
      console.error("Error updating article:", err);
      setError(err.response?.data?.message || "Failed to update article.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTitle(article?.title || "");
      setImage(null);
      setImagePreview(
        article?.image ? getImageUrl(article.image, "articles") : null
      );
      setCoverImage(null);
      setCoverPreview(
        article?.coverImage ? getImageUrl(article.coverImage, "covers") : null
      );
      setGallery([]);
      setGalleryPreviews([]);
      setTags(article?.tags ? article.tags.map((t) => t.tag.name) : []);
      setError(null);
      setLoading(false);
      editor && editor.commands.setContent(article?.content || "");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen, article, editor]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(article.coverImage || null);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(files);
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(article?.image || null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(article?.image || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(article?.coverImage || null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleRemoveGallery = (index) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGallery(newGallery);
    setGalleryPreviews(newPreviews);
  };

  const handleDeleteMainImage = () => {
    setImage(null);
    setImagePreview(null);
    setImagesToDelete((prev) => [...prev, "main"]);
  };

  const handleDeleteCoverImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
    setImagesToDelete((prev) => [...prev, "cover"]);
  };

  const handleDeleteGalleryImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Article
            </h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-medium text-base sm:text-lg"
                  placeholder="Enter article title"
                  required
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Content *
                </label>
                
                {/* Toolbar */}
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
                </div>
                
                {/* Editor */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-b-md bg-white dark:bg-gray-700 min-h-[300px] sm:min-h-[350px] max-h-[400px] sm:max-h-[450px] overflow-y-auto">
                  {editor && (
                    <EditorContent 
                      editor={editor} 
                      className="prose prose-gray dark:prose-invert prose-lg max-w-none [&>div]:min-h-[300px] sm:[&>div]:min-h-[330px] [&>div]:p-4 sm:[&>div]:p-6 [&_p]:text-gray-900 dark:[&_p]:text-gray-200 [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h2]:text-gray-800 dark:[&_h2]:text-gray-100 [&_h3]:text-gray-800 dark:[&_h3]:text-gray-200 [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_em]:text-gray-800 dark:[&_em]:text-gray-200 [&_ul]:text-gray-900 dark:[&_ul]:text-gray-200 [&_ol]:text-gray-900 dark:[&_ol]:text-gray-200 [&_li]:text-gray-900 dark:[&_li]:text-gray-200 [&_blockquote]:text-gray-700 dark:[&_blockquote]:text-gray-300 [&_code]:text-purple-700 dark:[&_code]:text-purple-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4 [&_img]:mx-auto [&_img]:block"
                    />
                  )}
                </div>
              </div>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                Featured Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              {/* Show new image preview */}
              {imagePreview && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-md max-h-48 sm:max-h-56 w-auto shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              {/* Show existing main image */}
              {!imagePreview && article?.image && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={getImageUrl(article.image, "articles")}
                    alt="Current Main Image"
                    className="rounded-md max-h-48 sm:max-h-56 w-auto shadow-sm"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                    Current
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteMainImage}
                    className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                    title="Delete main image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                Cover Image (optional)
              </label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {/* Show new cover preview */}
              {coverPreview && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="rounded-md max-h-48 sm:max-h-56 w-auto shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              {/* Show existing cover image */}
              {!coverPreview && article?.coverImage && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={getImageUrl(article.coverImage, "covers")}
                    alt="Current Cover"
                    className="rounded-md max-h-48 sm:max-h-56 w-auto shadow-sm"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                    Current
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteCoverImage}
                    className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                    title="Delete cover image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                Gallery Images (optional, multiple)
              </label>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />

              {/* Show new gallery previews */}
              {galleryPreviews.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    New images:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {galleryPreviews.map((src, i) => (
                      <div key={`new-${i}`} className="relative aspect-square">
                        <img
                          src={src}
                          alt={`New Gallery ${i + 1}`}
                          className="w-full h-full object-cover rounded-md shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGallery(i)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show existing gallery images */}
              {article?.gallery && article.gallery.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Current images:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {article.gallery.map((img, index) => (
                      <div
                        key={`existing-${img.id || index}`}
                        className="relative aspect-square"
                      >
                        <img
                          src={getImageUrl(img, "gallery")}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover rounded-md shadow-sm"
                        />
                        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
                          Current
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(img.id)}
                          className="absolute top-1 left-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-colors"
                          title="Delete gallery image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                Tags
              </label>
              <TagInput value={tags} onChange={setTags} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            </div>

            {/* Submit Button */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky bottom-0">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
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
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Article"}
                </button>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
};

export default EditArticleModal;
