import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  User,
  Users,
  Bell,
  Shield,
  Settings,
  Zap,
  Star,
  Heart,
  PlayCircle,
  FileText,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  Globe,
  Headphones,
  Video,
  Download,
  Bookmark,
  Hash,
  Camera,
  Share2,
  Lock,
  Eye,
  Volume2,
  Smartphone,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import helpService from '../services/helpService';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';

const Help = () => {
  const { isLight, isDark } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState(null);
  const [supportStatus, setSupportStatus] = useState({ online: true, responseTime: '~2 minutes' });
  
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

  // Load support status on component mount
  useEffect(() => {
    const loadSupportStatus = async () => {
      try {
        const status = await helpService.getSupportStatus();
        setSupportStatus(status);
      } catch (error) {
        console.log('Support status API not available, using default');
        // Keep default values
      }
    };
    
    loadSupportStatus();
  }, []);

  // FAQ Categories
  const categories = useMemo(() => [
    { id: 'all', name: 'All Topics', icon: Book, count: 0 },
    { id: 'account', name: 'Account & Profile', icon: User, count: 8 },
    { id: 'friends', name: 'Friends & Social', icon: Users, count: 6 },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield, count: 7 },
    { id: 'notifications', name: 'Notifications', icon: Bell, count: 5 },
    { id: 'clubs', name: 'Clubs & Groups', icon: Hash, count: 4 },
    { id: 'content', name: 'Posts & Articles', icon: FileText, count: 6 },
    { id: 'settings', name: 'Settings', icon: Settings, count: 5 },
    { id: 'technical', name: 'Technical Issues', icon: Zap, count: 9 }
  ], []);

  // FAQ Data
  const faqData = useMemo(() => [
    // Account & Profile
    {
      id: 1,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to Settings > Profile and update your personal information, bio, and profile picture. Changes are saved automatically.',
      tags: ['profile', 'update', 'settings']
    },
    {
      id: 2,
      category: 'account',
      question: 'How can I change my password?',
      answer: 'Navigate to Settings > Account > Security. Click "Change Password" and follow the instructions to set a new password.',
      tags: ['password', 'security', 'account']
    },
    {
      id: 3,
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account by going to Settings > Account > Danger Zone. This action is permanent and cannot be undone.',
      tags: ['delete', 'account', 'permanent']
    },
    {
      id: 4,
      category: 'account',
      question: 'How do I verify my email address?',
      answer: 'Check your email for a verification link after signing up. If you didn\'t receive it, go to Settings > Profile and click "Resend verification email".',
      tags: ['email', 'verification', 'confirm']
    },

    // Friends & Social
    {
      id: 5,
      category: 'friends',
      question: 'How do I send a friend request?',
      answer: 'Visit the person\'s profile or use the Friends > Find People feature. Click the "Add Friend" button next to their name.',
      tags: ['friends', 'request', 'social']
    },
    {
      id: 6,
      category: 'friends',
      question: 'Why can\'t I find someone when searching?',
      answer: 'They might have privacy settings that make them unsearchable, or they may have deactivated their account.',
      tags: ['search', 'friends', 'privacy']
    },
    {
      id: 7,
      category: 'friends',
      question: 'How do I block or unblock someone?',
      answer: 'Go to their profile and click the "Block" button. To unblock, go to Settings > Privacy > Blocked Users and click "Unblock".',
      tags: ['block', 'unblock', 'privacy']
    },

    // Privacy & Security
    {
      id: 8,
      category: 'privacy',
      question: 'How do I make my profile private?',
      answer: 'Go to Settings > Privacy and change your "Profile Visibility" to "Private". Only approved friends will be able to see your content.',
      tags: ['privacy', 'profile', 'visibility']
    },
    {
      id: 9,
      category: 'privacy',
      question: 'What is two-factor authentication?',
      answer: '2FA adds an extra security layer to your account. Enable it in Settings > Account > Security to require a code from your phone when logging in.',
      tags: ['2fa', 'security', 'authentication']
    },
    {
      id: 10,
      category: 'privacy',
      question: 'Can I control who sees my posts?',
      answer: 'Yes! When creating a post, use the audience selector to choose between Public, Friends, or Custom audiences.',
      tags: ['posts', 'privacy', 'audience']
    },

    // Notifications
    {
      id: 11,
      category: 'notifications',
      question: 'How do I turn off email notifications?',
      answer: 'Go to Settings > Notifications and toggle off "Email Notifications". You can also customize which types of emails you receive.',
      tags: ['notifications', 'email', 'settings']
    },
    {
      id: 12,
      category: 'notifications',
      question: 'Why am I not receiving notifications?',
      answer: 'Check your notification settings and ensure they\'re enabled. Also verify that our emails aren\'t going to your spam folder.',
      tags: ['notifications', 'troubleshoot', 'settings']
    },

    // Clubs & Groups
    {
      id: 13,
      category: 'clubs',
      question: 'How do I create a club?',
      answer: 'Go to the Clubs section and click "Create Club". Fill in the details, choose privacy settings, and invite members.',
      tags: ['clubs', 'create', 'groups']
    },
    {
      id: 14,
      category: 'clubs',
      question: 'How do I leave a club?',
      answer: 'Visit the club page and click the "Leave Club" button. You can rejoin later if the club is public or if you\'re re-invited.',
      tags: ['clubs', 'leave', 'groups']
    },

    // Content
    {
      id: 15,
      category: 'content',
      question: 'How do I edit or delete a post?',
      answer: 'Click the three-dot menu on your post and select "Edit" or "Delete". Note that deleted posts cannot be recovered.',
      tags: ['posts', 'edit', 'delete']
    },
    {
      id: 16,
      category: 'content',
      question: 'What file types can I upload?',
      answer: 'You can upload images (JPG, PNG, GIF), videos (MP4, MOV), and documents (PDF, DOC, DOCX) up to 50MB each.',
      tags: ['upload', 'files', 'media']
    },

    // Technical Issues
    {
      id: 17,
      category: 'technical',
      question: 'The app is loading slowly. What can I do?',
      answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If issues persist, contact support.',
      tags: ['performance', 'slow', 'troubleshoot']
    },
    {
      id: 18,
      category: 'technical',
      question: 'I can\'t upload images. What\'s wrong?',
      answer: 'Check your file size (max 50MB) and format (JPG, PNG, GIF). Also ensure you have a stable internet connection.',
      tags: ['upload', 'images', 'troubleshoot']
    },
    {
      id: 19,
      category: 'technical',
      question: 'Why can\'t I access the app on mobile?',
      answer: 'Ensure you\'re using a supported browser and have JavaScript enabled. Clear your mobile browser cache if needed.',
      tags: ['mobile', 'browser', 'access']
    }
  ], []);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [faqData, selectedCategory, searchQuery]);

  const toggleFAQ = useCallback((id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  }, [expandedFAQ]);

  const handleContactFormChange = useCallback((field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Try to submit via API, fallback to simulation if API not available
      try {
        const response = await helpService.submitContactForm(contactForm);
        alert('Thank you for your message! We\'ll get back to you soon.');
      } catch (apiError) {
        // Fallback to simulation if API is not available
        console.log('API not available, using simulation:', apiError);
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Thank you for your message! We\'ll get back to you soon.');
      }
      
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [contactForm]);

  // Quick Actions
  const quickActions = useMemo(() => [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of using our platform',
      icon: PlayCircle,
      color: 'from-blue-500 to-blue-600',
      action: () => {
        // TODO: Implement getting started guide
        alert('Getting Started Guide will open in a new window');
        // window.open('/getting-started', '_blank');
      }
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      color: 'from-purple-500 to-purple-600',
      action: () => {
        // TODO: Implement video tutorials
        alert('Video Tutorials will open in a new window');
        // window.open('/tutorials', '_blank');
      }
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: Users,
      color: 'from-green-500 to-green-600',
      action: () => {
        // TODO: Implement community forum
        alert('Community Forum will open in a new window');
        // window.open('/community', '_blank');
      }
    },
    {
      title: 'Download Mobile App',
      description: 'Get our mobile application',
      icon: Smartphone,
      color: 'from-orange-500 to-orange-600',
      action: () => {
        // TODO: Implement mobile app download
        alert('Mobile App download will start');
        // window.open('/download', '_blank');
      }
    }
  ], []);

  // Contact Options
  const contactOptions = useMemo(() => [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      color: 'from-blue-500 to-blue-600',
      available: true,
      response: '~2 minutes'
    },
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: Mail,
      color: 'from-green-500 to-green-600',
      available: true,
      response: '~24 hours'
    },
    {
      title: 'Phone Support',
      description: 'Call our helpline',
      icon: Phone,
      color: 'from-purple-500 to-purple-600',
      available: false,
      response: 'Business hours only'
    },
    {
      title: 'Help Center',
      description: 'Browse our knowledge base',
      icon: Book,
      color: 'from-orange-500 to-orange-600',
      available: true,
      response: 'Instant'
    }
  ], []);

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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <HelpCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-2xl lg:text-4xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Help & Support
                    </h1>
                    <p className={`text-sm lg:text-base mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      🆘 Get answers to your questions and find helpful resources
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 ${isLight ? 'bg-gray-100' : 'bg-gray-700'} rounded-xl border ${isLight ? 'border-gray-200' : 'border-gray-600'}`}>
                    <span className={`text-xs lg:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Support Status:</span>
                    <span className="text-xs lg:text-sm text-green-500 font-bold ml-2 flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${supportStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {supportStatus.online ? 'Online' : 'Offline'}
                    </span>
                    {supportStatus.responseTime && (
                      <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} ml-2`}>
                        {supportStatus.responseTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`group relative ${isLight ? 'bg-white' : 'bg-gray-800'} rounded-xl lg:rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-4 lg:p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl text-left`}
                  >
                    <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl shadow-lg mb-4 w-fit group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <h3 className={`font-bold text-sm lg:text-base mb-2 group-hover:text-blue-500 transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {action.title}
                    </h3>
                    <p className={`text-xs lg:text-sm group-hover:text-gray-600 transition-colors ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {action.description}
                    </p>
                    <ArrowRight className={`absolute top-4 right-4 h-4 w-4 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-6 shadow-xl`}>
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isLight ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search for help topics, questions, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 ${isLight ? 'bg-gray-50' : 'bg-gray-700'} border ${isLight ? 'border-gray-300' : 'border-gray-600'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 ${isLight ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'} font-medium text-base lg:text-lg transition-all duration-200`}
                />
              </div>
            </div>

            {/* Categories and FAQ Section */}
            <div className="grid lg:grid-cols-4 gap-6">
              
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-6 shadow-xl`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    <Book className="h-5 w-5 text-blue-500" />
                    Categories
                  </h3>
                  
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = selectedCategory === category.id;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : `${isLight ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'} border border-transparent`
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                          {category.count > 0 && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isActive ? 'bg-blue-500/30' : isLight ? 'bg-gray-200' : 'bg-gray-600/50'
                            }`}>
                              {category.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-6 shadow-xl`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Frequently Asked Questions
                    </h3>
                    <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {filteredFAQs.length > 0 ? (
                    <div className="space-y-4">
                      {filteredFAQs.map((faq) => (
                        <div
                          key={faq.id}
                          className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/50'} rounded-xl border ${isLight ? 'border-gray-200' : 'border-gray-600/50'} overflow-hidden hover:border-blue-500/50 transition-colors duration-200`}
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors duration-200`}
                          >
                            <span className={`font-medium pr-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>{faq.question}</span>
                            {expandedFAQ === faq.id ? (
                              <ChevronUp className={`h-5 w-5 flex-shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                            ) : (
                              <ChevronDown className={`h-5 w-5 flex-shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                            )}
                          </button>
                          
                          {expandedFAQ === faq.id && (
                            <div className="px-4 pb-4">
                              <div className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-600/50'} pt-4`}>
                                <p className={`leading-relaxed mb-3 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{faq.answer}</p>
                                <div className="flex flex-wrap gap-2">
                                  {faq.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h4 className={`text-lg font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>No results found</h4>
                      <p className={`mb-4 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                        {searchQuery ? `No FAQs match "${searchQuery}"` : 'No FAQs in this category'}
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/20"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Support Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Contact Options */}
              <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-6 shadow-xl`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <Headphones className="h-5 w-5 text-green-500" />
                  Contact Support
                </h3>
                
                <div className="space-y-4">
                  {contactOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={index}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                          option.available
                            ? `${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-700/50 hover:bg-gray-600/50'} border-gray-300 dark:border-gray-600 hover:border-blue-500/50 hover:scale-[1.02]`
                            : `${isLight ? 'bg-gray-100' : 'bg-gray-700/30'} border-gray-200 dark:border-gray-600/30 opacity-60 cursor-not-allowed`
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 bg-gradient-to-r ${option.color} rounded-xl shadow-lg ${!option.available && 'opacity-50'}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{option.title}</h4>
                            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{option.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center gap-1 ${option.available ? 'text-green-500' : isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{option.response}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Form */}
              <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-6 shadow-xl`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <Mail className="h-5 w-5 text-blue-500" />
                  Send us a Message
                </h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => handleContactFormChange('name', e.target.value)}
                        className={`w-full ${isLight ? 'bg-gray-50' : 'bg-gray-700'} border ${isLight ? 'border-gray-300' : 'border-gray-600'} rounded-xl px-4 py-3 ${isLight ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200`}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleContactFormChange('email', e.target.value)}
                        className={`w-full ${isLight ? 'bg-gray-50' : 'bg-gray-700'} border ${isLight ? 'border-gray-300' : 'border-gray-600'} rounded-xl px-4 py-3 ${isLight ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200`}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Subject</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => handleContactFormChange('subject', e.target.value)}
                        className={`w-full ${isLight ? 'bg-gray-50' : 'bg-gray-700'} border ${isLight ? 'border-gray-300' : 'border-gray-600'} rounded-xl px-4 py-3 ${isLight ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200`}
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Priority</label>
                      <select
                        value={contactForm.priority}
                        onChange={(e) => handleContactFormChange('priority', e.target.value)}
                        className={`w-full ${isLight ? 'bg-gray-50' : 'bg-gray-700'} border ${isLight ? 'border-gray-300' : 'border-gray-600'} rounded-xl px-4 py-3 ${isLight ? 'text-gray-900' : 'text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200`}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Message</label>
                    <textarea
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => handleContactFormChange('message', e.target.value)}
                      className={`w-full ${isLight ? 'bg-gray-50' : 'bg-gray-700'} border ${isLight ? 'border-gray-300' : 'border-gray-600'} rounded-xl px-4 py-3 ${isLight ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none`}
                      placeholder="Describe your issue or question in detail..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                    <Mail className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            {/* Additional Resources */}
            <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl border ${isLight ? 'border-gray-200' : 'border-gray-700'} p-6 shadow-xl`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                <Star className="h-5 w-5 text-yellow-500" />
                Additional Resources
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Status Page', desc: 'Check system status', icon: Globe, link: '#' },
                  { title: 'API Documentation', desc: 'Developer resources', icon: FileText, link: '#' },
                  { title: 'Privacy Policy', desc: 'How we protect your data', icon: Shield, link: '#' },
                  { title: 'Terms of Service', desc: 'Our terms and conditions', icon: FileText, link: '#' },
                  { title: 'Community Guidelines', desc: 'Rules and best practices', icon: Users, link: '#' },
                  { title: 'Release Notes', desc: 'Latest updates and features', icon: RefreshCw, link: '#' }
                ].map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <a
                      key={index}
                      href={resource.link}
                      className={`group flex items-center gap-3 p-4 ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-700/50 hover:bg-gray-600/50'} rounded-xl transition-colors duration-200 border ${isLight ? 'border-gray-200 hover:border-blue-500/50' : 'border-gray-600/50 hover:border-gray-500/50'}`}
                    >
                      <div className={`p-2 ${isLight ? 'bg-gray-200' : 'bg-gray-600/50'} rounded-lg group-hover:bg-blue-500/20 transition-colors duration-200`}>
                        <Icon className={`h-4 w-4 group-hover:text-blue-500 transition-colors duration-200 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className={`font-medium group-hover:text-blue-500 transition-colors duration-200 ${isLight ? 'text-gray-900' : 'text-white'}`}>{resource.title}</h4>
                        <p className={`text-sm group-hover:text-gray-600 transition-colors duration-200 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{resource.desc}</p>
                      </div>
                      <ExternalLink className={`h-4 w-4 group-hover:text-blue-500 ml-auto transition-colors duration-200 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                    </a>
                  );
                })}
              </div>
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
    </div>
  );
};

 export default Help;