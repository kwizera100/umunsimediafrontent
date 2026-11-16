import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Menu,
  Info,
  Image,
  Loader2,
  Heart,
  Check,
  CheckCheck,
  Clock,
  X,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';
import useLastSeen from '../hooks/useLastSeen';
import ChatList from './ChatList';
import StoryViewer from './StoryViewer';

// Common emojis for quick access
const quickEmojis = ['😀', '😂', '🥰', '😍', '🤩', '😊', '👍', '❤️', '🔥', '✨', '🎉', '💯'];

const ChatWindow = ({ 
  chat, 
  onToggleChatList, 
  showChatList, 
  onMobileBack, 
  onShowUserInfo,
  onSelectChat,
  selectedChat
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';

  // Use last seen hook to update timestamps
  useLastSeen(!!chat);

  const getAvatarUrl = (user) => {
    if (!user) {
      return `https://ui-avatars.com/api/?name=Unknown&background=4f46e5&color=ffffff&size=64`;
    }
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      if (user.avatar.startsWith('uploads/')) {
        return `${BASE_URL}/${user.avatar}`;
      }
      if (user.avatar.startsWith('avatars/')) {
        return `${BASE_URL}/uploads/${user.avatar}`;
      }
      return `${BASE_URL}/uploads/avatars/${user.avatar}`;
    }
    const name = user.firstName || user.username || 'Unknown';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&size=64`;
  };

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: 'end' });
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images and convert to base64 for transmission
      if (file.type.startsWith('image/')) {
        try {
          // Compress image before converting to base64
          const compressedPreview = await compressImage(file);
          setFilePreview(compressedPreview);
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fallback to original method
          const reader = new FileReader();
          reader.onload = (e) => {
            setFilePreview(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Close emoji picker and sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (chat?.user?.id) {
      fetchMessages();
      // Join the chat room
      if (socketService?.joinRoom) {
        socketService.joinRoom(chat.user.id);
      }
    }
  }, [chat?.user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Enhanced real-time messaging with live updates
  useEffect(() => {
    const handleNewMessage = (messageData) => {
      console.log('📨 Real-time message received:', messageData);
      if (messageData.file) {
        console.log('📎 File data received:', messageData.file);
      }
      
      // Check if message is for current chat
      const isRelevantMessage = 
        (messageData.senderId === chat?.user?.id && messageData.receiverId === user.id) ||
        (messageData.senderId === user.id && messageData.receiverId === chat?.user?.id) ||
        (messageData.from === chat?.user?.id && messageData.to === user.id) ||
        (messageData.from === user.id && messageData.to === chat?.user?.id);
      
      if (isRelevantMessage) {
        const newMessage = {
          id: messageData.id || messageData.messageId || `msg-${Date.now()}`,
          text: messageData.content || messageData.text || messageData.message,
          content: messageData.content || messageData.text || messageData.message,
          isOwn: (messageData.senderId === user.id) || (messageData.from === user.id),
          senderId: messageData.senderId || messageData.from,
          receiverId: messageData.receiverId || messageData.to,
          timestamp: messageData.createdAt || messageData.timestamp || new Date().toISOString(),
          status: messageData.status || (messageData.senderId === user.id ? 'sent' : 'delivered'),
          messageType: messageData.messageType || 'text',
          storyId: messageData.storyId || null,
          story: messageData.story || null,
          file: messageData.file ? {
            name: messageData.file.name,
            size: messageData.file.size,
            type: messageData.file.type,
            preview: messageData.file.data || messageData.file.preview || null,
            data: messageData.file.data || messageData.file.preview || null
          } : null
        };
        
        setMessages(prev => {
          // Check for duplicates more thoroughly
          const exists = prev.some(msg => 
            msg.id === newMessage.id || 
            (msg.text === newMessage.text && 
             msg.senderId === newMessage.senderId &&
             Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 2000)
          );
          
          if (!exists) {
            console.log('📨 Adding new message to chat:', newMessage);
            return [...prev, newMessage];
          }
          return prev;
        });
        
        // Auto-mark as read if not own message and chat is active
        if (!newMessage.isOwn && socketService?.emitMessageRead) {
          setTimeout(() => {
            socketService.emitMessageRead({
              messageId: newMessage.id,
              from: user.id,
              to: messageData.senderId || messageData.from
            });
          }, 500);
        }
      }
    };

    const handleTyping = (typingData) => {
      if ((typingData.from === chat?.user?.id && typingData.to === user.id) ||
          (typingData.senderId === chat?.user?.id && typingData.receiverId === user.id)) {
        setIsTyping(typingData.isTyping);
        
        // Auto-hide typing indicator after 3 seconds
        if (typingData.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    const handleUserOnline = (userData) => {
      if (userData.userId === chat?.user?.id || userData.id === chat?.user?.id) {
        setOnlineStatus(true);
        setLastSeen(null);
      }
    };

    const handleUserOffline = (userData) => {
      if (userData.userId === chat?.user?.id || userData.id === chat?.user?.id) {
        setOnlineStatus(false);
        setLastSeen(userData.lastSeen || new Date().toISOString());
      }
    };

    const handleMessageDelivered = (data) => {
      console.log('📨 Message delivered:', data);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    };

    const handleMessageRead = (data) => {
      console.log('📨 Message read:', data);
      setMessages(prev => prev.map(msg => 
        msg.senderId === user.id && (msg.receiverId === data.from || msg.receiverId === data.userId)
          ? { ...msg, status: 'read' }
          : msg
      ));
    };

    // Register socket listeners with comprehensive event handling
    if (socketService?.on && socketService?.getConnectionStatus?.()) {
      // Real-time message events
      socketService.on('chat-message', handleNewMessage);
      socketService.on('message-received', handleNewMessage);
      socketService.on('new-message', handleNewMessage);
      socketService.on('message', handleNewMessage);
      
      // Typing events
      socketService.on('typing', handleTyping);
      socketService.on('user-typing', handleTyping);
      
      // Status events
      socketService.on('user-online', handleUserOnline);
      socketService.on('user-offline', handleUserOffline);
      socketService.on('message-delivered', handleMessageDelivered);
      socketService.on('message-read', handleMessageRead);
    }

    return () => {
      if (socketService?.off) {
        socketService.off('chat-message', handleNewMessage);
        socketService.off('message-received', handleNewMessage);
        socketService.off('new-message', handleNewMessage);
        socketService.off('message', handleNewMessage);
        socketService.off('typing', handleTyping);
        socketService.off('user-typing', handleTyping);
        socketService.off('user-online', handleUserOnline);
        socketService.off('user-offline', handleUserOffline);
        socketService.off('message-delivered', handleMessageDelivered);
        socketService.off('message-read', handleMessageRead);
      }
    };
  }, [chat?.user?.id, user.id]);

  const fetchMessages = async () => {
    if (!chat?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await chatService.getMessages(chat.user.id);
      let fetchedMessages = [];
      
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          fetchedMessages = response;
        } else if (Array.isArray(response.messages)) {
          fetchedMessages = response.messages;
        } else if (response.data && Array.isArray(response.data)) {
          fetchedMessages = response.data;
        } else if (response.data && Array.isArray(response.data.messages)) {
          fetchedMessages = response.data.messages;
        }
      }
      
      const transformedMessages = fetchedMessages.map(msg => ({
        ...msg,
        isOwn: msg.senderId === user.id,
        text: msg.content || msg.text || msg.message,
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        messageType: msg.messageType || 'text',
        storyId: msg.storyId || null,
        story: msg.story || null,
        file: msg.file || null
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !chat?.user?.id || sending) return;
    
    const messageText = message.trim();
    const hasFile = !!selectedFile;
    setMessage('');
    setSending(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
    
    // Stop typing indicator
    if (socketService?.emitTyping) {
      socketService.emitTyping({
        from: user.id,
        to: chat.user.id,
        isTyping: false
      });
    }
    
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newMessage = {
      id: tempId,
      text: messageText || (hasFile ? `📎 ${selectedFile.name}` : ''),
      content: messageText || (hasFile ? `📎 ${selectedFile.name}` : ''),
      isOwn: true,
      timestamp: timestamp,
      senderId: user.id,
      receiverId: chat.user.id,
      status: 'sending',
      messageType: hasFile ? 'file' : 'text',
      file: hasFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        preview: filePreview,
        data: filePreview // Include base64 data for transmission
      } : null
    };
    
    // Add message immediately to UI
    setMessages(prev => [...prev, newMessage]);
    
    try {
      // Send via socket for real-time delivery
      if (socketService?.emitChatMessage && socketService?.getConnectionStatus?.()) {
        socketService.emitChatMessage({
          from: user.id,
          to: chat.user.id,
          senderId: user.id,
          receiverId: chat.user.id,
          text: messageText || (hasFile ? `📎 ${selectedFile.name}` : ''),
          content: messageText || (hasFile ? `📎 ${selectedFile.name}` : ''),
          message: messageText || (hasFile ? `📎 ${selectedFile.name}` : ''),
          tempId: tempId,
          timestamp: timestamp,
          messageType: hasFile ? 'file' : 'text',
          file: hasFile ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: filePreview // Include base64 data for real-time transmission
          } : null
        });
      }
      
      // Send via API for persistence
      const response = await chatService.sendMessage(
        chat.user.id, 
        messageText || (hasFile ? `📎 ${selectedFile.name}` : ''),
        hasFile ? 'file' : 'text',
        hasFile ? {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: filePreview
        } : null
      );
      
      if (response && response.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                id: response.data.id, 
                ...response.data, 
                status: 'sent',
                timestamp: response.data.createdAt || msg.timestamp
              }
            : msg
        ));
      } else {
        // If API call succeeds but no data, mark as sent
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'sent' }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    } finally {
      setSending(false);
      // Clear file after sending
      if (selectedFile) {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    adjustTextareaHeight();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim() && chat?.user?.id && socketService?.emitTyping) {
      socketService.emitTyping({
        from: user.id,
        to: chat.user.id,
        isTyping: true
      });
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (chat?.user?.id && socketService?.emitTyping) {
        socketService.emitTyping({
          from: user.id,
          to: chat.user.id,
          isTyping: false
        });
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-blue-300 animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-blue-300" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-green-400" />;
      case 'failed':
        return <span className="text-xs text-red-400">❌</span>;
      default:
        return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const handleStoryPreviewClick = (story) => {
    if (story) {
      // Format story for StoryViewer (it expects an array of stories)
      const formattedStory = {
        ...story,
        author: story.author || story.user,
        user: story.author || story.user
      };
      setViewingStory([formattedStory]);
      setShowStoryViewer(true);
    }
  };

  const getStoryImageUrl = (story) => {
    if (!story) return null;
    if (story.image) {
      if (story.image.startsWith('http')) {
        return story.image;
      }
      return `${BASE_URL}/uploads/stories/${story.image}`;
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-8">
          <div className="text-8xl mb-8">💬</div>
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-4">
            Select a conversation
          </h3>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            ✨ Choose from your existing conversations or start a new one to begin your amazing chat journey!
          </p>
        </div>
      </div>
    );
  }

  const displayName = chat.user?.firstName || chat.user?.username || 'User';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Messages
          </h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-73px)] overflow-hidden">
          {onSelectChat ? (
            <ChatList
              onSelectChat={(chat) => {
                onSelectChat(chat);
                setShowSidebar(false);
              }}
              selectedChat={selectedChat}
            />
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>Chat list will be rendered here</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-white dark:bg-gray-900 relative">
        {/* Chat Header - Enhanced theming with mobile fixes - Fixed on mobile, positioned below navbar on desktop */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700/50 px-4 py-3 shadow-sm dark:shadow-lg relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Mobile Back Button */}
              {onMobileBack && (
                <button
                  onClick={onMobileBack}
                  className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Desktop Toggle */}
              <button
                onClick={onToggleChatList}
                className="hidden lg:block p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* User Info - Enhanced for mobile */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <img
                    src={getAvatarUrl(chat.user)}
                    alt={displayName}
                    className="w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 shadow-lg"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=ffffff&size=64`;
                    }}
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                    onlineStatus ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base lg:text-lg truncate">{displayName}</h3>
                  <p className="text-xs lg:text-sm flex items-center gap-1.5">
                    {onlineStatus ? (
                      <span className="text-green-500 dark:text-green-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
                        <span>Active now</span>
                      </span>
                    ) : lastSeen ? (
                      <span className="text-gray-500 dark:text-gray-400 truncate">
                        Last seen {formatLastSeen(lastSeen)}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Offline
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button 
                onClick={onShowUserInfo}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area - Properly scrollable with mobile fixes */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 messages-container"
          style={{
            paddingTop: '16px',
            paddingBottom: '16px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="relative">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-blue-500/30"></div>
                </div>
                <span className="font-medium">✨ Loading messages...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-6xl lg:text-8xl mb-4 lg:mb-6">🚀</div>
              <h3 className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-2 lg:mb-3">
                Start the conversation
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                💫 Send a message to begin your amazing chat with <span className="text-white font-semibold">{displayName}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`min-w-0 max-w-[85%] sm:max-w-sm lg:max-w-md ${msg.isOwn ? '' : 'flex items-end space-x-2'}`}>
                    {!msg.isOwn && (
                      <img
                        src={getAvatarUrl(chat.user)}
                        alt={displayName}
                        className="w-6 h-6 lg:w-7 lg:h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-600"
                      />
                    )}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                        msg.isOwn
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-blue-500/25'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-gray-200 dark:shadow-gray-700 border border-gray-200 dark:border-gray-600'
                      } ${msg.status === 'failed' ? 'opacity-50' : ''} transition-all duration-200 hover:shadow-xl`}
                    >
                      {/* Story Preview - Show when message is a story reply */}
                      {msg.storyId && msg.story && (
                        <div 
                          className="mb-2 cursor-pointer group"
                          onClick={() => handleStoryPreviewClick(msg.story)}
                        >
                          <div className={`relative rounded-lg overflow-hidden border-2 ${
                            msg.isOwn 
                              ? 'border-blue-300/50' 
                              : 'border-gray-300 dark:border-gray-600'
                          } transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg`}>
                            {msg.story.type === 'image' && getStoryImageUrl(msg.story) ? (
                              <img 
                                src={getStoryImageUrl(msg.story)}
                                alt="Story preview"
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div 
                                className="w-full h-32 flex items-center justify-center"
                                style={{
                                  backgroundColor: msg.story.backgroundColor || '#6366f1',
                                  color: msg.story.textColor || '#ffffff'
                                }}
                              >
                                <p className="text-sm font-medium px-4 text-center line-clamp-2">
                                  {msg.story.content || 'Story'}
                                </p>
                              </div>
                            )}
                            <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t ${
                              msg.isOwn 
                                ? 'from-blue-600/80 to-transparent' 
                                : 'from-gray-800/80 to-transparent'
                            }`}>
                              <p className={`text-xs font-medium ${
                                msg.isOwn ? 'text-white' : 'text-white'
                              }`}>
                                📸 Story
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {msg.file ? (
                        <div className="mb-2">
                          {(msg.file.preview || msg.file.data) && msg.file.type && msg.file.type.startsWith('image/') ? (
                            <img 
                              src={msg.file.preview || msg.file.data} 
                              alt={msg.file.name}
                              className="max-w-full max-h-80 w-auto h-auto object-contain rounded-lg cursor-zoom-in"
                              onClick={() => window.open(msg.file.preview || msg.file.data, "_blank")}
                              onLoad={scrollToBottom}
                              onError={(e) => {
                                // Fallback to file info if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg" style={{ display: (msg.file.preview || msg.file.data) && msg.file.type && msg.file.type.startsWith('image/') ? 'none' : 'flex' }}>
                            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{msg.file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(msg.file.size)}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {msg.text && <p className="text-sm leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{msg.text}</p>}
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <p className={`text-xs flex-shrink-0 ${
                          msg.isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                        {msg.isOwn && (
                          <div className="flex items-center flex-shrink-0">
                            {getMessageStatusIcon(msg.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <img
                      src={getAvatarUrl(chat.user)}
                      alt={displayName}
                      className="w-6 h-6 lg:w-7 lg:h-7 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                    />
                    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">✍️</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center space-x-3">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Paperclip className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input - Enhanced theming and file upload with mobile fixes */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800">
          <div className="flex items-end space-x-3 relative max-w-4xl mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 group"
            >
              <Paperclip className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${displayName}...`}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200 font-medium text-sm"
                style={{ 
                  minHeight: '44px', 
                  maxHeight: '120px',
                  lineHeight: '1.5'
                }}
                rows="1"
              />
            </div>
            
            {/* Emoji Picker */}
            <div className="relative" ref={emojiPickerRef}>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105"
              >
                <Smile className="h-5 w-5" />
              </button>
              
              {/* Quick Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl p-3 grid grid-cols-6 gap-2 min-w-max z-50">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-all duration-200 hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !selectedFile) || sending}
              className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 hover:shadow-lg shadow-blue-500/25 disabled:hover:scale-100 disabled:shadow-none group"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              )}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.mp3,.zip"
          />
        </div>
      </div>

      {/* Story Viewer Modal */}
      {showStoryViewer && viewingStory && viewingStory.length > 0 && (
        <StoryViewer
          stories={viewingStory}
          currentStoryIndex={0}
          onClose={() => {
            setShowStoryViewer(false);
            setViewingStory(null);
          }}
          onNext={() => {
            // Single story, so just close
            setShowStoryViewer(false);
            setViewingStory(null);
          }}
          onPrevious={() => {
            // Single story, so just close
            setShowStoryViewer(false);
            setViewingStory(null);
          }}
        />
      )}

      {/* Custom styles for mobile and desktop scrolling */}
      <style jsx="true">{`
        .messages-container {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          overflow-y: scroll !important;
          overscroll-behavior: contain;
          margin-top: 73px !important;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }
        
        .messages-container::-webkit-scrollbar {
          width: 4px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 2px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }

        /* Desktop styles - Account for navbar (64px) + header (73px) = 137px */
        @media (min-width: 1024px) {
          .messages-container {
            margin-top: 137px !important; /* Navbar (64px) + Header (73px) */
            padding-top: 16px !important;
            height: calc(100vh - 137px) !important;
            max-height: calc(100vh - 137px) !important;
            padding-bottom: 16px !important;
          }
        }

        /* Tablet and mobile styles */
        @media (max-width: 1023px) {
          .messages-container {
            margin-top: 73px !important;
            padding-top: 16px !important;
            height: calc(100vh - 73px) !important;
            max-height: calc(100vh - 73px) !important;
            padding-bottom: 20px !important;
          }
        }

        @media (max-width: 640px) {
          .messages-container {
            margin-top: 73px !important;
            padding-top: 16px !important;
            height: calc(100vh - 73px) !important;
            max-height: calc(100vh - 73px) !important;
            padding-bottom: 30px !important;
          }
        }

        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .messages-container {
            -webkit-overflow-scrolling: touch;
            margin-top: 73px !important;
            padding-top: 16px !important;
            height: calc(100vh - 73px) !important;
            max-height: calc(100vh - 73px) !important;
          }
        }
      `}</style>
    </>
  );
};

export default ChatWindow;