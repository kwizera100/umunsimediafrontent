import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  Camera,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Zap,
  Database,
  FileText,
  CreditCard,
  Crown,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import settingsService from '../services/settingsService';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, loading } = useAuth();
  const { theme, setTheme, isLight, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal handlers
  const handleCreatePost = useCallback((postData) => {
    console.log('Post created:', postData);
    setIsPostModalOpen(false);
  }, []);

  const handleCreateStory = useCallback(async (storyData) => {
    try {
      setIsCreatingStory(true);
      console.log('Story created:', storyData);
      setIsStoryModalOpen(false);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsCreatingStory(false);
    }
  }, []);
  const [saveStatus, setSaveStatus] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Profile Settings
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      birthDate: user?.birthDate || ''
    },
    
    // Privacy Settings
    privacy: {
      profileVisibility: user?.profileVisibility || 'public', // public, friends, private
      showEmail: user?.showEmail || false,
      showPhone: user?.showPhone || false,
      showLocation: user?.showLocation || true,
      allowFriendRequests: user?.allowFriendRequests || true,
      allowMessages: user?.allowMessages || true,
      showOnlineStatus: user?.showOnlineStatus || true,
      searchable: user?.searchable || true
    },
    
    // Notification Settings
    notifications: {
      emailNotifications: user?.emailNotifications || true,
      pushNotifications: user?.pushNotifications || true,
      friendRequests: user?.friendRequests || true,
      messages: user?.messages || true,
      posts: user?.posts || true,
      articles: user?.articles || true,
      clubUpdates: user?.clubUpdates || true,
      marketing: user?.marketing || false,
      weeklyDigest: user?.weeklyDigest || true,
      soundEnabled: user?.soundEnabled || true
    },
    
    // Appearance Settings
    appearance: {
      theme: theme || 'system', // light, dark, system
      language: user?.language || 'en',
      timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      compactMode: user?.compactMode || false,
      animations: user?.animations !== false, // default to true
      highContrast: user?.highContrast || false
    },
    
    // Account Settings
    account: {
      twoFactorEnabled: user?.twoFactorEnabled || false,
      loginAlerts: user?.loginAlerts !== false, // default to true
      sessionTimeout: user?.sessionTimeout || 30,
      dataDownload: false,
      accountDeactivation: false
    }
  });

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
    if (user) {
        try {
          setSettingsLoading(true);
          const response = await settingsService.getSettings();
          if (response.success) {
            setSettings(response.data);
          } else {
            // Fallback to user data if settings service fails
      setSettings(prev => ({
        ...prev,
        profile: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          birthDate: user.birthDate || ''
        }
      }));
    }
        } catch (error) {
          console.error('Failed to load settings:', error);
          // Fallback to user data
          setSettings(prev => ({
            ...prev,
            profile: {
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
              bio: user.bio || '',
              location: user.location || '',
              website: user.website || '',
              birthDate: user.birthDate || ''
            }
          }));
        } finally {
          setSettingsLoading(false);
        }
      }
    };

    loadSettings();
  }, [user]);

  // Handle settings update
  const updateSetting = useCallback((category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  }, []);

  // Save settings
  const saveSettings = useCallback(async () => {
    try {
      setSaveStatus('saving');
      
      // Update profile if profile settings changed
      if (activeTab === 'profile') {
        await updateProfile(settings.profile);
      }
      
      // Save other settings to backend
      try {
        if (activeTab === 'privacy') {
          await settingsService.updatePrivacySettings(settings.privacy);
        } else if (activeTab === 'notifications') {
          await settingsService.updateNotificationSettings(settings.notifications);
        } else if (activeTab === 'appearance') {
          await settingsService.updateAppearanceSettings(settings.appearance);
          // Update theme context if theme changed
          if (settings.appearance.theme !== theme) {
            setTheme(settings.appearance.theme);
          }
        } else if (activeTab === 'account') {
          await settingsService.updateAccountSettings(settings.account);
        } else {
          // Save all settings
          await settingsService.updateSettings(settings);
        }
      } catch (settingsError) {
        console.error('Settings save error:', settingsError);
        // Don't fail the entire save if settings service fails
        toast.error('Some settings could not be saved');
      }
      
      setSaveStatus('saved');
      setUnsavedChanges(false);
      toast.success('Settings saved successfully');
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast.error('Failed to save settings');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [activeTab, settings, updateProfile, theme, setTheme]);

  // Tab configuration
  const tabs = useMemo(() => [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      description: 'Personal information and public profile'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      description: 'Control who can see your information'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      color: 'from-purple-500 to-purple-600',
      description: 'Manage how you receive updates'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: Palette,
      color: 'from-pink-500 to-pink-600',
      description: 'Theme, language, and display options'
    },
    {
      id: 'account',
      name: 'Account',
      icon: Lock,
      color: 'from-red-500 to-red-600',
      description: 'Security and account management'
    }
  ], []);

  // Toggle component
  const Toggle = ({ enabled, onChange, disabled = false }) => {
    const Icon = enabled ? ToggleRight : ToggleLeft;
    return (
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`p-1 rounded-lg transition-all duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : `hover:bg-gray-600/50 dark:hover:bg-gray-600/50 hover:scale-110`
        }`}
      >
        <Icon className={`h-6 w-6 transition-colors duration-200 ${
          enabled ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
        }`} />
      </button>
    );
  };

  // Profile Settings Tab
  const ProfileTab = () => (
    <div className="space-y-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm sm:shadow-xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={settings.profile.firstName}
              onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              placeholder="Enter your first name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={settings.profile.lastName}
              onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              placeholder="Enter your last name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateSetting('profile', 'email', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
            <textarea
              rows={4}
              value={settings.profile.bio}
              onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <input
              type="text"
              value={settings.profile.location}
              onChange={(e) => updateSetting('profile', 'location', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              placeholder="Enter your location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
            <input
              type="url"
              value={settings.profile.website}
              onChange={(e) => updateSetting('profile', 'website', e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Privacy Settings Tab
  const PrivacyTab = () => (
    <div className="space-y-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm sm:shadow-xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400" />
          Privacy Controls
        </h3>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
            <div className="flex-1 min-w-0">
              <h4 className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">Profile Visibility</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5">Who can see your profile information</p>
            </div>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
              className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full sm:w-auto flex-shrink-0"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          {[
            { key: 'showEmail', label: 'Show Email Address', desc: 'Allow others to see your email' },
            { key: 'showPhone', label: 'Show Phone Number', desc: 'Allow others to see your phone' },
            { key: 'showLocation', label: 'Show Location', desc: 'Allow others to see your location' },
            { key: 'allowFriendRequests', label: 'Allow Friend Requests', desc: 'Let people send you friend requests' },
            { key: 'allowMessages', label: 'Allow Messages', desc: 'Let people send you direct messages' },
            { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you\'re online' },
            { key: 'searchable', label: 'Searchable Profile', desc: 'Allow your profile to appear in search results' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">{item.label}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5">{item.desc}</p>
              </div>
              <div className="flex-shrink-0">
                <Toggle
                  enabled={settings.privacy[item.key]}
                  onChange={(value) => updateSetting('privacy', item.key, value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Notifications Settings Tab
  const NotificationsTab = () => (
    <div className="space-y-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm sm:shadow-xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 dark:text-purple-400" />
          Notification Preferences
        </h3>
        
        <div className="space-y-6">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications in browser', icon: Smartphone },
            { key: 'friendRequests', label: 'Friend Requests', desc: 'Get notified about new friend requests', icon: User },
            { key: 'messages', label: 'New Messages', desc: 'Get notified about new direct messages', icon: Bell },
            { key: 'posts', label: 'Post Interactions', desc: 'Likes, comments on your posts', icon: Bell },
            { key: 'articles', label: 'Article Updates', desc: 'New articles from people you follow', icon: FileText },
            { key: 'clubUpdates', label: 'Club Updates', desc: 'Updates from clubs you\'re member of', icon: Bell },
            { key: 'marketing', label: 'Marketing Emails', desc: 'Product updates and promotional content', icon: Mail },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your week\'s activity', icon: Mail },
            { key: 'soundEnabled', label: 'Sound Effects', desc: 'Play sounds for notifications', icon: Volume2 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">{item.label}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Toggle
                    enabled={settings.notifications[item.key]}
                    onChange={(value) => updateSetting('notifications', item.key, value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Appearance Settings Tab
  const AppearanceTab = () => (
    <div className="space-y-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm sm:shadow-xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 dark:text-pink-400" />
          Display & Theme
        </h3>
        
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">Theme</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5">Choose your preferred theme</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Smartphone, label: 'System' }
              ].map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => updateSetting('appearance', 'theme', themeOption.value)}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      settings.appearance.theme === themeOption.value
                        ? 'bg-pink-100 dark:bg-pink-500/20 border-pink-500/50 text-pink-600 dark:text-pink-400'
                        : 'bg-gray-100 dark:bg-gray-600/50 border-gray-300 dark:border-gray-500/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/80'
                    }`}
                    title={themeOption.label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Language</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Choose your preferred language</p>
            </div>
            <select
              value={settings.appearance.language}
              onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
              className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>
          
          {[
            { key: 'compactMode', label: 'Compact Mode', desc: 'Show more content in less space' },
            { key: 'animations', label: 'Animations', desc: 'Enable smooth animations and transitions' },
            { key: 'highContrast', label: 'High Contrast', desc: 'Increase contrast for better visibility' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <h4 className="text-gray-900 dark:text-white font-medium">{item.label}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
              <Toggle
                enabled={settings.appearance[item.key]}
                onChange={(value) => updateSetting('appearance', item.key, value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Account Settings Tab
  const AccountTab = () => (
    <div className="space-y-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm sm:shadow-xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400" />
          Security & Account
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Two-Factor Authentication</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${settings.account.twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {settings.account.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <Toggle
                enabled={settings.account.twoFactorEnabled}
                onChange={(value) => updateSetting('account', 'twoFactorEnabled', value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Login Alerts</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get notified of new login attempts</p>
            </div>
            <Toggle
              enabled={settings.account.loginAlerts}
              onChange={(value) => updateSetting('account', 'loginAlerts', value)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Session Timeout</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Automatically log out after inactivity</p>
            </div>
            <select
              value={settings.account.sessionTimeout}
              onChange={(e) => updateSetting('account', 'sessionTimeout', parseInt(e.target.value))}
              className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>
          
          {/* Dangerous Actions */}
          <div className="border-t border-gray-200 dark:border-gray-600/50 pt-6">
            <h4 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              Danger Zone
            </h4>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <div className="text-left">
                    <h5 className="text-gray-900 dark:text-white font-medium">Download Your Data</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Export all your account data</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <EyeOff className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                  <div className="text-left">
                    <h5 className="text-gray-900 dark:text-white font-medium">Deactivate Account</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Temporarily disable your account</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <div className="text-left">
                    <h5 className="text-gray-900 dark:text-white font-medium">Delete Account</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Permanently delete your account and all data</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'privacy': return <PrivacyTab />;
      case 'notifications': return <NotificationsTab />;
      case 'appearance': return <AppearanceTab />;
      case 'account': return <AccountTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      {/* Sidebar - Mobile slide-in, Desktop fixed */}
      <Sidebar 
        onCreatePost={() => setIsPostModalOpen(true)}
        onCreateStory={() => setIsStoryModalOpen(true)}
        onCreateArticle={() => setIsArticleModalOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex pt-16">
        <div className="flex-1 lg:ml-64 lg:mr-80">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <SettingsIcon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      Settings & Preferences
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base mt-1">
                      Customize your experience and manage your account
                    </p>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex items-center gap-3">
                  {saveStatus && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                      saveStatus === 'saved' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20' :
                      saveStatus === 'saving' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' :
                      'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}>
                      {saveStatus === 'saved' && <Check className="h-4 w-4" />}
                      {saveStatus === 'saving' && <RefreshCw className="h-4 w-4 animate-spin" />}
                      {saveStatus === 'error' && <X className="h-4 w-4" />}
                      {saveStatus === 'saved' ? 'Changes saved!' : 
                       saveStatus === 'saving' ? 'Saving...' : 'Save failed'}
                    </div>
                  )}
                  
                  <button
                    onClick={saveSettings}
                    disabled={!unsavedChanges || loading || saveStatus === 'saving'}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center gap-2 transition-all duration-200 text-sm sm:text-base ${
                      unsavedChanges && saveStatus !== 'saving'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saveStatus === 'saving' ? (
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-1" />
                      <span className="text-[10px] sm:text-xs leading-tight">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] sm:min-h-[600px] w-full">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
        <RightSidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleCreatePost}
      />
      <CreateStoryModal 
        isOpen={isStoryModalOpen} 
        onClose={() => setIsStoryModalOpen(false)}
        onSave={handleCreateStory}
        isLoading={isCreatingStory}
      />
      {user?.plan === 'PREMIUM' && (
        <CreateArticleModal 
          isOpen={isArticleModalOpen} 
          onClose={() => setIsArticleModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Settings;