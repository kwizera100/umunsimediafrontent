import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Star, Users, BookOpen, Calendar, 
  Plus, Edit, Trash2, Eye, Filter, Search,
  TrendingUp, Target, CheckCircle, AlertCircle,
  X, Save, FileText, Download, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRewardsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [articles, setArticles] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [awardedUsers, setAwardedUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  // Modal states
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [awardType, setAwardType] = useState('reward'); // 'reward', 'badge', 'certificate'
  const [awardTarget, setAwardTarget] = useState('user'); // 'user', 'article', 'club'
  
  // Form states
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'MONETARY',
    value: '',
    icon: '',
    badgeColor: '#FFD700'
  });
  
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6'
  });
  
  const [certificateForm, setCertificateForm] = useState({
    title: '',
    description: '',
    template: 'default'
  });
  
  const [awardForm, setAwardForm] = useState({
    userId: '',
    articleId: '',
    clubId: '',
    rewardId: '',
    badgeId: '',
    certificateId: '',
    notes: ''
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      if (!token) {
        toast.error('No authentication token found. Please log in again.');
        return;
      }

      const [
        statsRes, articlesRes, rewardsRes, badgesRes, certificatesRes,
        categoriesRes, usersRes, awardedUsersRes, clubsRes
      ] = await Promise.allSettled([
        fetch(`${API_URL}/rewards/evaluation-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/articles`),
        fetch(`${API_URL}/rewards/rewards`),
        fetch(`${API_URL}/rewards/badges`),
        fetch(`${API_URL}/rewards/certificates`),
        fetch(`${API_URL}/rewards/categories`),
        fetch(`${API_URL}/admin/users/dropdown`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/admin/users/awarded`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/clubs`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [statsData, articlesData, rewardsData, badgesData, certificatesData,
             categoriesData, usersData, awardedUsersData, clubsData] = await Promise.all([
        statsRes.status === 'fulfilled' ? statsRes.value.json() : Promise.resolve({}),
        articlesRes.status === 'fulfilled' ? articlesRes.value.json() : Promise.resolve([]),
        rewardsRes.status === 'fulfilled' ? rewardsRes.value.json() : Promise.resolve([]),
        badgesRes.status === 'fulfilled' ? badgesRes.value.json() : Promise.resolve([]),
        certificatesRes.status === 'fulfilled' ? certificatesRes.value.json() : Promise.resolve([]),
        categoriesRes.status === 'fulfilled' ? categoriesRes.value.json() : Promise.resolve([]),
        usersRes.status === 'fulfilled' ? usersRes.value.json() : Promise.resolve([]),
        awardedUsersRes.status === 'fulfilled' ? awardedUsersRes.value.json() : Promise.resolve([]),
        clubsRes.status === 'fulfilled' ? clubsRes.value.json() : Promise.resolve([])
      ]);

      console.log('Dashboard data received:', {
        statsData,
        articlesData,
        rewardsData,
        badgesData,
        certificatesData,
        categoriesData,
        usersData,
        awardedUsersData
      });

      setStats(statsData || {});
      setArticles(Array.isArray(articlesData) ? articlesData : []);
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setBadges(Array.isArray(badgesData) ? badgesData : []);
      setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAwardedUsers(Array.isArray(awardedUsersData?.data?.users) ? awardedUsersData.data.users : []);
      setClubs(Array.isArray(clubsData?.data?.clubs) ? clubsData.data.clubs : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

      await Promise.all([
        fetch(`${API_URL}/rewards/categories/initialize`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/rewards/rewards/initialize`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/rewards/badges/initialize`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/rewards/certificates/initialize`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      fetchDashboardData();
    } catch (error) {
      console.error('Error initializing defaults:', error);
    }
  };

  const evaluateAllArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      await fetch(`${API_URL}/rewards/evaluate/all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchDashboardData();
      toast.success('All articles evaluated successfully');
    } catch (error) {
      console.error('Error evaluating articles:', error);
      toast.error('Failed to evaluate articles');
    }
  };

  // Reward CRUD operations
  const handleCreateReward = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/rewards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rewardForm)
      });

      if (response.ok) {
        toast.success('Reward created successfully');
        setShowRewardModal(false);
        resetRewardForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create reward');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      toast.error('Failed to create reward');
    }
  };

  const handleUpdateReward = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/rewards/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rewardForm)
      });

      if (response.ok) {
        toast.success('Reward updated successfully');
        setShowRewardModal(false);
        setEditingItem(null);
        resetRewardForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update reward');
      }
    } catch (error) {
      console.error('Error updating reward:', error);
      toast.error('Failed to update reward');
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/rewards/${rewardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Reward deleted successfully');
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  // Badge CRUD operations
  const handleCreateBadge = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(badgeForm)
      });

      if (response.ok) {
        toast.success('Badge created successfully');
        setShowBadgeModal(false);
        resetBadgeForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create badge');
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      toast.error('Failed to create badge');
    }
  };

  const handleUpdateBadge = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/badges/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(badgeForm)
      });

      if (response.ok) {
        toast.success('Badge updated successfully');
        setShowBadgeModal(false);
        setEditingItem(null);
        resetBadgeForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update badge');
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      toast.error('Failed to update badge');
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/badges/${badgeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Badge deleted successfully');
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast.error('Failed to delete badge');
    }
  };

  // Award operations
  const handleAwardReward = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      // Validate required fields
      if (awardTarget === 'user' && (!awardForm.userId || !awardForm.rewardId)) {
        toast.error('Please select both a user and a reward');
        return;
      }
      if (awardTarget === 'article' && (!awardForm.articleId || !awardForm.rewardId)) {
        toast.error('Please select both an article and a reward');
        return;
      }
      
      console.log('Awarding reward:', { awardTarget, awardForm });
      
      let response;
      if (awardTarget === 'user') {
        const url = `${API_URL}/rewards/rewards/user/${awardForm.userId}/${awardForm.rewardId}`;
        console.log('Making request to:', url);
        
        response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: awardForm.notes })
      });
      } else if (awardTarget === 'article') {
        const url = `${API_URL}/rewards/rewards/article/${awardForm.articleId}/${awardForm.rewardId}`;
        console.log('Making request to:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notes: awardForm.notes })
        });
      } else if (awardTarget === 'club') {
        const url = `${API_URL}/rewards/rewards/club/${awardForm.clubId}/${awardForm.rewardId}`;
        console.log('Making request to:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notes: awardForm.notes })
        });
      }

      console.log('Response status:', response?.status);
      
      if (response && response.ok) {
        const result = await response.json();
        console.log('Reward awarded successfully:', result);
        toast.success('Reward awarded successfully');
        setShowAwardModal(false);
        resetAwardForm();
        fetchDashboardData();
      } else if (response) {
        const error = await response.json();
        console.error('Reward award error:', error);
        toast.error(error.message || 'Failed to award reward');
      }
    } catch (error) {
      console.error('Error awarding reward:', error);
      toast.error('Failed to award reward: ' + error.message);
    }
  };

  const handleAwardBadge = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      // Validate required fields
      if (awardTarget === 'user' && (!awardForm.userId || !awardForm.badgeId)) {
        toast.error('Please select both a user and a badge');
        return;
      }
      
      console.log('Awarding badge:', { awardTarget, awardForm });
      
      let response;
      if (awardTarget === 'user') {
        const url = `${API_URL}/rewards/badges/award/${awardForm.userId}/${awardForm.badgeId}`;
        console.log('Making request to:', url);
        
        response = await fetch(url, {
        method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (awardTarget === 'article') {
        const url = `${API_URL}/rewards/badges/article/${awardForm.articleId}/${awardForm.badgeId}`;
        console.log('Making request to:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: awardForm.notes })
        });
      } else if (awardTarget === 'club') {
        const url = `${API_URL}/rewards/badges/club/${awardForm.clubId}/${awardForm.badgeId}`;
        console.log('Making request to:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: awardForm.notes })
        });
      }

      console.log('Response status:', response?.status);
      
      if (response && response.ok) {
        const result = await response.json();
        console.log('Badge awarded successfully:', result);
        toast.success('Badge awarded successfully');
        setShowAwardModal(false);
        resetAwardForm();
        fetchDashboardData();
      } else if (response) {
        const error = await response.json();
        console.error('Badge award error:', error);
        toast.error(error.message || 'Failed to award badge');
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
      toast.error('Failed to award badge: ' + error.message);
    }
  };

  // Certificate CRUD operations
  const handleCreateCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(certificateForm)
      });

      if (response.ok) {
        toast.success('Certificate created successfully');
        setShowCertificateModal(false);
        resetCertificateForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create certificate');
      }
    } catch (error) {
      console.error('Error creating certificate:', error);
      toast.error('Failed to create certificate');
    }
  };

  const handleUpdateCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/certificates/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(certificateForm)
      });

      if (response.ok) {
        toast.success('Certificate updated successfully');
        setShowCertificateModal(false);
        setEditingItem(null);
        resetCertificateForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update certificate');
      }
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast.error('Failed to update certificate');
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/certificates/${certificateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Certificate deleted successfully');
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const handleIssueCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      
      const response = await fetch(`${API_URL}/rewards/certificates/issue/${awardForm.userId}/${awardForm.certificateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId: awardForm.articleId })
      });

      if (response.ok) {
        toast.success('Certificate issued successfully');
        setShowAwardModal(false);
        resetAwardForm();
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate');
    }
  };

  // Form reset functions
  const resetRewardForm = () => {
    setRewardForm({
      name: '',
      description: '',
      type: 'MONETARY',
      value: '',
      icon: '',
      badgeColor: '#FFD700'
    });
  };

  const resetBadgeForm = () => {
    setBadgeForm({
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6'
    });
  };

  const resetCertificateForm = () => {
    setCertificateForm({
      title: '',
      description: '',
      template: 'default'
    });
  };

  const resetAwardForm = () => {
    setAwardForm({
      userId: '',
      articleId: '',
      clubId: '',
      rewardId: '',
      badgeId: '',
      certificateId: '',
      notes: ''
    });
  };

  // Modal handlers
  const openRewardModal = (reward = null) => {
    setEditingItem(reward);
    if (reward) {
      setRewardForm({
        name: reward.name,
        description: reward.description,
        type: reward.type,
        value: reward.value || '',
        icon: reward.icon || '',
        badgeColor: reward.badgeColor || '#FFD700'
      });
    } else {
      resetRewardForm();
    }
    setShowRewardModal(true);
  };

  const openBadgeModal = (badge = null) => {
    setEditingItem(badge);
    if (badge) {
      setBadgeForm({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color
      });
    } else {
      resetBadgeForm();
    }
    setShowBadgeModal(true);
  };

  const openCertificateModal = (certificate = null) => {
    setEditingItem(certificate);
    if (certificate) {
      setCertificateForm({
        title: certificate.title,
        description: certificate.description,
        template: certificate.template
      });
    } else {
      resetCertificateForm();
    }
    setShowCertificateModal(true);
  };

  const openAwardModal = (type, target = 'user') => {
    setAwardType(type);
    setAwardTarget(target);
    resetAwardForm();
    setShowAwardModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ensure all data arrays are properly initialized
  const safeUsers = Array.isArray(users) ? users : [];
  const safeAwardedUsers = Array.isArray(awardedUsers) ? awardedUsers : [];
  const safeRewards = Array.isArray(rewards) ? rewards : [];
  const safeBadges = Array.isArray(badges) ? badges : [];
  const safeCertificates = Array.isArray(certificates) ? certificates : [];
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeClubs = Array.isArray(clubs) ? clubs : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Rewards & Recognition Admin
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage rewards, badges, and winner announcements
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          {/* <button
            onClick={initializeDefaults}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Initialize Defaults
          </button> */}
          {/* <button
            onClick={evaluateAllArticles}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Evaluate All Articles
          </button> */}
          <button
            onClick={() => openRewardModal()}
            className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Create Reward
          </button>
          <button
            onClick={() => openBadgeModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Award className="h-4 w-4 mr-2" />
            Create Badge
          </button>
          <button
            onClick={() => openAwardModal('reward')}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Star className="h-4 w-4 mr-2" />
            Award Reward
          </button>
          <button
            onClick={() => openAwardModal('badge')}
            className="flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
          >
            <Award className="h-4 w-4 mr-2" />
            Award Badge
          </button>
          <button
            onClick={() => openAwardModal('reward', 'article')}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Award to Article
          </button>
          <button
            onClick={() => openAwardModal('badge', 'article')}
            className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            <Award className="h-4 w-4 mr-2" />
            Badge to Article
          </button>
          <button
            onClick={() => openAwardModal('reward', 'club')}
            className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Award to Club
          </button>
          <button
            onClick={() => openAwardModal('badge', 'club')}
            className="flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            <Award className="h-4 w-4 mr-2" />
            Badge to Club
          </button>
          <button
            onClick={() => openCertificateModal()}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Create Certificate
          </button>
          <button
            onClick={() => openAwardModal('certificate')}
            className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Issue Certificate
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalArticles || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Evaluated</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.evaluatedArticles || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Quality Score</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.averageQualityScore ? stats.averageQualityScore.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Engagement</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.averageEngagementScore ? stats.averageEngagementScore.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'articles', label: 'Articles', icon: BookOpen },
              { id: 'rewards', label: 'Rewards', icon: Trophy },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'certificates', label: 'Certificates', icon: FileText },
              { id: 'awarded-users', label: 'Awarded Users', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Articles */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Top Performing Articles
                  </h3>
                  <div className="space-y-3">
                    {safeArticles
                      .filter(article => article.totalScore > 0)
                      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                      .slice(0, 5)
                      .map((article, index) => (
                        <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              by {article.author.firstName} {article.author.lastName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {article.totalScore ? article.totalScore.toFixed(1) : '0.0'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Score
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  All Articles
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {safeCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {selectedCategoryId && (
                    <button
                      onClick={() => setSelectedCategoryId('')}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {safeArticles
                      .filter(a => !selectedCategoryId || a.category?.id === selectedCategoryId)
                      .map((article) => (
                      <tr key={article.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {article.views || 0} views
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {article.author.firstName} {article.author.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{article.author.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {article.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                              <Award className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Rewards Management
                </h3>
                <button 
                  onClick={() => openRewardModal()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeRewards.map((reward) => (
                  <div key={reward.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg mr-3">
                          <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {reward.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {reward.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openRewardModal(reward)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Reward"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReward(reward.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Reward"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {reward.description}
                    </p>
                    {reward.value && (
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {reward.value.toLocaleString()} RWF
                      </div>
                    )}
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => openAwardModal('reward')}
                        className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        Award to User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Badges Management
                </h3>
                <button 
                  onClick={() => openBadgeModal()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Badge
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {safeBadges.map((badge) => (
                  <div key={badge.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                          <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {badge.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {badge.icon}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openBadgeModal(badge)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Badge"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Badge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {badge.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Color: <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: badge.color }}></span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => openAwardModal('badge')}
                        className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        Award to User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Certificates Management
                </h3>
                <button 
                  onClick={() => openCertificateModal()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {safeCertificates.map((certificate) => (
                  <div key={certificate.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg mr-3">
                          <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {certificate.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {certificate.template}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openCertificateModal(certificate)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Certificate"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCertificate(certificate.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Certificate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {certificate.description}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => openAwardModal('certificate')}
                        className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        Issue to User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'awarded-users' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Awarded Users
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option value="">All Awards</option>
                    <option value="rewards">Rewards Only</option>
                    <option value="badges">Badges Only</option>
                    <option value="certificates">Certificates Only</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                    <Download className="h-4 w-4 mr-2 inline" />
                    Export
                  </button>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {safeAwardedUsers.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Phone:</strong> {user.telephone || 'No phone'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Total Value:</strong> 
                        <span className="font-semibold text-green-600 dark:text-green-400 ml-1">
                          {user.totalRewardValue ? `${user.totalRewardValue.toLocaleString()} RWF` : '0 RWF'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Last Awarded:</strong> {user.lastAwarded ? new Date(user.lastAwarded).toLocaleDateString() : 'Never'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.rewardCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Trophy className="h-3 w-3 mr-1" />
                          {user.rewardCount} Reward{user.rewardCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {user.badgeCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Award className="h-3 w-3 mr-1" />
                          {user.badgeCount} Badge{user.badgeCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {user.certificateCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          <FileText className="h-3 w-3 mr-1" />
                          {user.certificateCount} Certificate{user.certificateCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {user.rewardCount === 0 && user.badgeCount === 0 && user.certificateCount === 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No awards yet</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          // Open user profile or detailed view
                          console.log('View details for user:', user.id);
                          // You can implement a modal or navigation here
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => openAwardModal('reward')}
                        className="flex-1 px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        Award More
                      </button>
                    </div>
                  </div>
                ))}
                {safeAwardedUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No awarded users found
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Awards Received
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Awarded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {safeAwardedUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.telephone || 'No phone'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-1">
                              {user.rewardCount > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {user.rewardCount} Reward{user.rewardCount > 1 ? 's' : ''}
                                </span>
                              )}
                              {user.badgeCount > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  <Award className="h-3 w-3 mr-1" />
                                  {user.badgeCount} Badge{user.badgeCount > 1 ? 's' : ''}
                                </span>
                              )}
                              {user.certificateCount > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {user.certificateCount} Certificate{user.certificateCount > 1 ? 's' : ''}
                                </span>
                              )}
                              {user.rewardCount === 0 && user.badgeCount === 0 && user.certificateCount === 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">No awards yet</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {user.totalRewardValue ? `${user.totalRewardValue.toLocaleString()} RWF` : '0 RWF'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.lastAwarded ? new Date(user.lastAwarded).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => {
                                // Open user profile or detailed view
                                console.log('View details for user:', user.id);
                                // You can implement a modal or navigation here
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => openAwardModal('reward')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Award More
                            </button>
                          </td>
                        </tr>
                      ))}
                      {safeAwardedUsers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No awarded users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Reward' : 'Create New Reward'}
                </h3>
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter reward name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Enter reward description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={rewardForm.type}
                    onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="MONETARY">Monetary</option>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="BADGE">Badge</option>
                    <option value="FEATURE">Feature</option>
                  </select>
                </div>
                
                {rewardForm.type === 'MONETARY' && (
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value (RWF)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rewardForm.value}
                    onChange={(e) => setRewardForm({...rewardForm, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={rewardForm.icon}
                    onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="🏆"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Badge Color
                  </label>
                  <input
                    type="color"
                    value={rewardForm.badgeColor}
                    onChange={(e) => setRewardForm({...rewardForm, badgeColor: e.target.value})}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdateReward : handleCreateReward}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Badge' : 'Create New Badge'}
                </h3>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter badge name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Enter badge description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={badgeForm.icon}
                    onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="🏆"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={badgeForm.color}
                    onChange={(e) => setBadgeForm({...badgeForm, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                
                
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdateBadge : handleCreateBadge}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Certificate' : 'Create New Certificate'}
                </h3>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={certificateForm.title}
                    onChange={(e) => setCertificateForm({...certificateForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter certificate title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={certificateForm.description}
                    onChange={(e) => setCertificateForm({...certificateForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Enter certificate description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template
                  </label>
                  <select
                    value={certificateForm.template}
                    onChange={(e) => setCertificateForm({...certificateForm, template: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="default">Default</option>
                    <option value="academic-excellence">Academic Excellence</option>
                    <option value="creative-writing">Creative Writing</option>
                    <option value="community-service">Community Service</option>
                    <option value="leadership">Leadership</option>
                    <option value="school-life">School Life</option>
                  </select>
                </div>
                
                
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdateCertificate : handleCreateCertificate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Award {awardType === 'reward' ? 'Reward' : awardType === 'badge' ? 'Badge' : 'Certificate'} to {awardTarget === 'user' ? 'User' : awardTarget === 'article' ? 'Article' : 'Club'}
                </h3>
                <button
                  onClick={() => setShowAwardModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {awardTarget === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select User
                  </label>
                  <select
                    value={awardForm.userId}
                    onChange={(e) => setAwardForm({...awardForm, userId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a user...</option>
                    {safeUsers.length > 0 ? (
                      safeUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} (@{user.username}) - {user.telephone || 'No phone'}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No users found</option>
                    )}
                  </select>
                </div>
                )}

                {awardTarget === 'article' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Article
                    </label>
                    <select
                      value={awardForm.articleId}
                      onChange={(e) => setAwardForm({...awardForm, articleId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose an article...</option>
                      {safeArticles.map(article => (
                        <option key={article.id} value={article.id}>
                          {article.title} - by {article.author?.firstName} {article.author?.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {awardTarget === 'club' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Club
                    </label>
                    <select
                      value={awardForm.clubId}
                      onChange={(e) => setAwardForm({...awardForm, clubId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose a club...</option>
                      {safeClubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name} - {club._count?.members || 0} members
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {awardType === 'reward' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Reward
                    </label>
                    <select
                      value={awardForm.rewardId}
                      onChange={(e) => setAwardForm({...awardForm, rewardId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose a reward...</option>
                      {safeRewards.map(reward => (
                        <option key={reward.id} value={reward.id}>
                          {reward.name} {reward.value && `(${reward.value.toLocaleString()} RWF)`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {awardType === 'badge' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Badge
                    </label>
                    <select
                      value={awardForm.badgeId}
                      onChange={(e) => setAwardForm({...awardForm, badgeId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose a badge...</option>
                      {safeBadges.map(badge => (
                        <option key={badge.id} value={badge.id}>
                          {badge.icon} {badge.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {awardType === 'certificate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Certificate
                    </label>
                    <select
                      value={awardForm.certificateId}
                      onChange={(e) => setAwardForm({...awardForm, certificateId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose a certificate...</option>
                      {safeCertificates.map(certificate => (
                        <option key={certificate.id} value={certificate.id}>
                          {certificate.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={awardForm.notes}
                    onChange={(e) => setAwardForm({...awardForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Add any notes about this award..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={awardType === 'reward' ? handleAwardReward : awardType === 'badge' ? handleAwardBadge : handleIssueCertificate}
                  disabled={
                    (awardTarget === 'user' && !awardForm.userId) ||
                    (awardTarget === 'article' && !awardForm.articleId) ||
                    (awardTarget === 'club' && !awardForm.clubId) ||
                    (awardType === 'reward' ? !awardForm.rewardId : awardType === 'badge' ? !awardForm.badgeId : !awardForm.certificateId)
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Award className="h-4 w-4 mr-2 inline" />
                  {awardType === 'reward' ? 'Award Reward' : awardType === 'badge' ? 'Award Badge' : 'Issue Certificate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRewardsDashboard;
