import React, { useEffect, useState } from 'react';
import { Search, Users, MessageCircle, Loader2, Plus, Sparkles } from 'lucide-react';
import friendService from '../services/friendService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import chatService from '../services/chatService';

const ChatList = ({ onSelectChat, selectedChat }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const res = await friendService.getFriends();
        const friendsArr = res.data?.friends || res.data || [];
        setFriends(friendsArr);
        if (!friendsArr.length) {
          const usersRes = await userService.getAllUsers();
          setAllUsers((usersRes.data?.users || usersRes.data || []).filter(u => u.id !== user.id));
          setShowAllUsers(true);
        } else {
          setShowAllUsers(false);
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
        setFriends([]);
        setShowAllUsers(false);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [user.id]);

  useEffect(() => {
    const handleUserOnline = ({ userId, isOnline }) => {
      setFriends(friends => friends.map(f => f.id === userId ? { ...f, isOnline } : f));
      setAllUsers(users => users.map(u => u.id === userId ? { ...u, isOnline } : u));
    };
    
    if (socketService?.on) {
      socketService.on('user-online', handleUserOnline);
      socketService.on('user-offline', (data) => handleUserOnline({ ...data, isOnline: false }));
      return () => {
        socketService.off('user-online', handleUserOnline);
        socketService.off('user-offline', handleUserOnline);
      };
    }
  }, []);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      console.log('📨 ChatList received message:', msg);
      
      setLastMessages(prev => {
        const userId = msg.from === user.id ? msg.to : msg.from || 
                      msg.senderId === user.id ? msg.receiverId : msg.senderId;
        const isCurrentChat = selectedChat?.user?.id === userId;
        const messageText = msg.text || msg.content || msg.message || '';
        const messageTime = new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        return {
          ...prev,
          [userId]: {
            text: messageText,
            time: messageTime,
            timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
            unreadCount: isCurrentChat ? 0 : ((prev[userId]?.unreadCount || 0) + 1),
          }
        };
      });
    };
    
    if (socketService?.on) {
      // Listen to multiple message events for better compatibility
      socketService.on('chat-message', handleNewMessage);
      socketService.on('message-received', handleNewMessage);
      socketService.on('new-message', handleNewMessage);
      
      return () => {
        socketService.off('chat-message', handleNewMessage);
        socketService.off('message-received', handleNewMessage);
        socketService.off('new-message', handleNewMessage);
      };
    }
  }, [user.id, selectedChat]);

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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const now = new Date();
    const messageTime = new Date(timeString);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatSelect = (person) => {
    onSelectChat({ user: person });
    setLastMessages(prev => ({ 
      ...prev, 
      [person.id]: { 
        ...prev[person.id], 
        unreadCount: 0 
      } 
    }));
    
    try {
      chatService.markMessagesAsRead(person.id);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const filteredFriends = friends.filter(friend => {
    const name = (friend.firstName || friend.username || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const filteredUsers = allUsers.filter(person => {
    const name = (person.firstName || person.username || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-blue-500/30"></div>
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium">✨ Loading conversations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header - Enhanced with better theming */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Messages
          </h2>
          <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-105 group">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        
        {/* Search Bar - Enhanced styling */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 font-medium text-sm"
          />
        </div>
      </div>

      {/* Chat List - Responsive design */}
      <div className="flex-1 overflow-y-auto">
        {!friends.length && showAllUsers ? (
          <div className="p-3 lg:p-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3 lg:mb-4 text-sm font-semibold px-2">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-500 dark:text-yellow-400" />
              🌟 People you may know
            </div>
            <div className="space-y-1 lg:space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(person => (
                  <ChatListItem
                    key={person.id}
                    person={person}
                    lastMessage={lastMessages[person.id]}
                    isSelected={selectedChat?.user?.id === person.id}
                    onSelect={() => handleChatSelect(person)}
                    getAvatarUrl={getAvatarUrl}
                    formatTime={formatTime}
                    isDiscovery={true}
                  />
                ))
              ) : (
                <div className="text-center py-8 lg:py-12">
                  <div className="text-4xl lg:text-6xl mb-4">🔍</div>
                  <h3 className="text-base lg:text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">No users found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        ) : !friends.length ? (
          <div className="flex flex-col items-center justify-center h-full p-6 lg:p-8 text-center">
            <div className="text-4xl lg:text-6xl mb-4 lg:mb-6">💬</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-600 dark:text-gray-300 mb-2 lg:mb-3">
              No conversations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
              🚀 Connect with friends to start chatting and sharing amazing moments together!
            </p>
          </div>
        ) : (
          <div className="p-1 lg:p-2">
            {filteredFriends.length > 0 ? (
              <div className="space-y-0.5 lg:space-y-1">
                {filteredFriends.map(friend => (
                  <ChatListItem
                    key={friend.id}
                    person={friend}
                    lastMessage={lastMessages[friend.id]}
                    isSelected={selectedChat?.user?.id === friend.id}
                    onSelect={() => handleChatSelect(friend)}
                    getAvatarUrl={getAvatarUrl}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 lg:py-12">
                <div className="text-4xl lg:text-6xl mb-4">🔍</div>
                <h3 className="text-base lg:text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">No conversations found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">✨ Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Chat List Item Component - Enhanced with better theming and last seen
const ChatListItem = ({ person, lastMessage, isSelected, onSelect, getAvatarUrl, formatTime, isDiscovery = false }) => {
  const displayName = person.firstName || person.username || 'User';
  const hasUnread = lastMessage?.unreadCount > 0;
  
  // Enhanced last message display
  const getLastMessageText = () => {
    if (lastMessage?.text) {
      return lastMessage.text;
    }
    if (person.isOnline) {
      return 'Online';
    }
    if (person.lastSeen) {
      const lastSeenTime = new Date(person.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
      return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
    }
    return 'Tap to start chatting';
  };

  const displayLastMessage = getLastMessageText();

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center space-x-3 p-3 transition-all duration-200 rounded-xl text-left group relative overflow-hidden ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:scale-[0.98] hover:shadow-md'
      }`}
    >
      {/* Background Gradient on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isSelected ? 'hidden' : ''}`}></div>
      
      {/* Avatar - Enhanced styling */}
      <div className="relative flex-shrink-0 z-10">
        <img
          src={getAvatarUrl(person)}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all duration-200"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=ffffff&size=64`;
          }}
        />
        {/* Online Status Indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
          person.isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
        
        {/* Unread Count Badge */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-white">
              {lastMessage.unreadCount > 9 ? '9+' : lastMessage.unreadCount}
            </span>
          </div>
        )}
      </div>

      {/* Content - Enhanced layout */}
      <div className="flex-1 min-w-0 z-10">
        <div className="flex justify-between items-center mb-1">
          <h3 className={`font-semibold truncate text-sm ${
            isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}>
            {displayName}
          </h3>
          {lastMessage?.time && (
            <span className={`text-xs flex-shrink-0 ml-2 ${
              isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formatTime(lastMessage.time)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate pr-2 ${
            isSelected 
              ? 'text-blue-100' 
              : hasUnread 
                ? 'text-gray-900 dark:text-white font-medium' 
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isDiscovery && '👋 '}
            {displayLastMessage}
          </p>
          {hasUnread && !isSelected && (
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatList;