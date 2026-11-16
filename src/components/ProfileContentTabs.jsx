import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Repeat2,
  BookOpen,
  Award,
  Users,
  Hash,
  Crown,
  Heart,
  Eye,
  Calendar
} from 'lucide-react';
import publicProfileService from '../services/publicProfileService';
import clubService from '../services/clubService';
import badgeService from '../services/badgeService';
import LoadingSpinner from './LoadingSpinner';

const unwrap = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.articles)) return data.articles;
  if (Array.isArray(data?.friends)) return data.friends;
  if (Array.isArray(data?.clubs)) return data.clubs;
  return [];
};

const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
      active
        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
    {count !== undefined && count !== null && (
      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-1.5 py-0.5">{count}</span>
    )}
  </button>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
    <Icon className="h-10 w-10 mb-3 opacity-50" />
    <p className="text-sm">{text}</p>
  </div>
);

const PostCard = ({ post }) => {
  const likes = post._count?.likes ?? post.likes?.length ?? 0;
  const comments = post._count?.comments ?? post.comments?.length ?? 0;
  const media = post.media?.[0] || post.image || post.mediaUrl;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-400/60 transition-colors">
      {media && <img src={media.url || media} alt="" className="w-full h-40 object-cover" />}
      <div className="p-4">
        <p className="text-gray-900 dark:text-white text-sm line-clamp-3">{post.content || post.text || post.title}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{likes}</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{comments}</span>
          {post.createdAt && (
            <span className="flex items-center gap-1 ml-auto">
              <Calendar className="h-3.5 w-3.5" />{new Date(post.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const RepostCard = ({ repost }) => {
  const original = repost.post || repost.originalPost || repost;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400/60 transition-colors">
      {repost.message && <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 italic">"{repost.message}"</p>}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        <p className="text-gray-900 dark:text-white text-sm line-clamp-3">{original.content || original.text}</p>
        {original.user && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">by @{original.user.username}</p>}
      </div>
      {repost.createdAt && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(repost.createdAt).toLocaleDateString()}</p>}
    </div>
  );
};

const ArticleCard = ({ article }) => (
  <Link
    to={`/articles/${article.id}`}
    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-purple-400/60 transition-colors block"
  >
    {(article.coverImage || article.image) && (
      <img src={article.coverImage || article.image} alt="" className="w-full h-36 object-cover" />
    )}
    <div className="p-4">
      <h3 className="text-gray-900 dark:text-white font-semibold text-sm line-clamp-2">{article.title}</h3>
      {article.excerpt && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">{article.excerpt}</p>}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{article._count?.articleLikes ?? article.articleLikes?.length ?? 0}</span>
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views ?? 0}</span>
        {article.createdAt && <span className="ml-auto">{new Date(article.createdAt).toLocaleDateString()}</span>}
      </div>
    </div>
  </Link>
);

const RewardCard = ({ reward }) => (
  <div className="bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-yellow-300/50 dark:border-yellow-600/30 p-4 flex items-center gap-3">
    <div className="p-2.5 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg shrink-0">
      <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
    </div>
    <div className="min-w-0">
      <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">{reward.name || reward.title || reward.reward?.name || reward.badge?.name || 'Reward'}</p>
      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">{reward.description || reward.reward?.description || reward.badge?.description || ''}</p>
      {(reward.awardedAt || reward.createdAt) && (
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{new Date(reward.awardedAt || reward.createdAt).toLocaleDateString()}</p>
      )}
    </div>
  </div>
);

const FriendCard = ({ friend }) => {
  const person = friend.friend || friend.user || friend.receiver || friend.sender || friend;
  const username = person.username;
  const name = `${person.firstName || ''} ${person.lastName || ''}`.trim() || username;
  const inner = (
    <>
      {person.avatar ? (
        <img src={person.avatar} alt={name} className="w-16 h-16 rounded-full object-cover mb-2" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-2">
          <span className="text-white font-bold text-xl">{(person.firstName || username || 'U').charAt(0)}</span>
        </div>
      )}
      <p className="text-gray-900 dark:text-white text-sm font-medium truncate w-full">{name}</p>
      {username && <p className="text-gray-500 dark:text-gray-400 text-xs truncate w-full">@{username}</p>}
    </>
  );
  return username ? (
    <Link to={`/u/${username}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center hover:border-green-400/60 transition-colors">
      {inner}
    </Link>
  ) : (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center">{inner}</div>
  );
};

const ClubCard = ({ club, owned }) => {
  const c = club.club || club;
  return (
    <Link
      to={`/clubs/${c.id}`}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:border-blue-400/60 transition-colors"
    >
      {c.avatar || c.image ? (
        <img src={c.avatar || c.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center shrink-0">
          <Hash className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">{c.name}</p>
          {owned && <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{c._count?.members ?? c.members?.length ?? 0} members</p>
      </div>
    </Link>
  );
};

const ClubSection = ({ clubs }) => {
  const owned = clubs.filter(c => c.role === 'owner' || c.role === 'OWNER' || c.isOwner || c.club?.ownerId);
  const memberOf = clubs.filter(c => !owned.includes(c));
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" /> Owned Clubs ({owned.length})
        </h4>
        {owned.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">No owned clubs</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {owned.map((c, i) => <ClubCard key={c.id || i} club={c} owned />)}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-500" /> Member Of ({memberOf.length})
        </h4>
        {memberOf.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">Not a member of any club</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memberOf.map((c, i) => <ClubCard key={c.id || i} club={c} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileContentTabs = ({ userId, isOwnProfile = false, stats = null }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [data, setData] = useState({ posts: null, reposts: null, articles: null, rewards: null, friends: null, clubs: null });
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: 'posts', label: 'Posts', icon: MessageSquare, count: stats?.totalPosts },
    { key: 'reposts', label: 'Reposts', icon: Repeat2 },
    { key: 'articles', label: 'Articles', icon: BookOpen, count: stats?.totalArticles },
    ...(isOwnProfile ? [{ key: 'clubs', label: 'Clubs', icon: Hash, count: stats?.totalClubs }] : []),
    { key: 'rewards', label: 'Rewards', icon: Award },
    { key: 'friends', label: 'Friends', icon: Users, count: stats?.totalFriends },
  ];

  useEffect(() => {
    if (!userId || data[activeTab] !== null) return;
    const load = async () => {
      setLoading(true);
      try {
        let result;
        switch (activeTab) {
          case 'posts': result = unwrap(await publicProfileService.getUserPosts(userId)); break;
          case 'reposts': result = unwrap(await publicProfileService.getUserReposts(userId)); break;
          case 'articles': result = unwrap(await publicProfileService.getUserArticles(userId)); break;
          case 'friends': result = unwrap(await publicProfileService.getUserFriends(userId)); break;
          case 'rewards': {
            const [rewards, badges] = await Promise.allSettled([
              badgeService.getUserRewards(userId),
              badgeService.getUserBadges(userId)
            ]);
            result = [
              ...(rewards.status === 'fulfilled' ? unwrap(rewards.value) : []),
              ...(badges.status === 'fulfilled' ? unwrap(badges.value) : [])
            ];
            break;
          }
          case 'clubs': {
            const res = await clubService.getUserClubs();
            result = unwrap(res);
            break;
          }
          default: result = [];
        }
        setData(prev => ({ ...prev, [activeTab]: result }));
      } catch (e) {
        console.error(`Failed to load ${activeTab}:`, e);
        setData(prev => ({ ...prev, [activeTab]: [] }));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userId]);

  const items = data[activeTab];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-2 scrollbar-hide">
        {tabs.map(t => (
          <TabButton key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} icon={t.icon} label={t.label} count={t.count} />
        ))}
      </div>
      <div className="p-4 sm:p-6">
        {loading || items === null ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={tabs.find(t => t.key === activeTab)?.icon || MessageSquare} text={`No ${activeTab} yet`} />
        ) : activeTab === 'clubs' ? (
          <ClubSection clubs={items} />
        ) : (
          <div className={`grid gap-4 ${
            activeTab === 'friends' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : activeTab === 'rewards' ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {items.map((item, i) => {
              const key = item.id || item._id || i;
              if (activeTab === 'posts') return <PostCard key={key} post={item} />;
              if (activeTab === 'reposts') return <RepostCard key={key} repost={item} />;
              if (activeTab === 'articles') return <ArticleCard key={key} article={item} />;
              if (activeTab === 'rewards') return <RewardCard key={key} reward={item} />;
              if (activeTab === 'friends') return <FriendCard key={key} friend={item} />;
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileContentTabs;
