import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Crown, Calendar, UserPlus, UserCheck, Rss } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileContentTabs from '../components/ProfileContentTabs';
import publicProfileService from '../services/publicProfileService';

const PublicProfile = () => {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null);

  const isOwn = me?.username === username || me?.id === profile?.id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await publicProfileService.getUserByUsername(username);
        const u = data?.user || data;
        if (!u?.id) { setNotFound(true); return; }
        setProfile(u);
        publicProfileService.getUserStats(u.id)
          .then(setStats)
          .catch(() => setStats(null));
        if (me?.id && me.id !== u.id) {
          publicProfileService.checkFollowingStatus(u.id)
            .then(r => setIsFollowing(!!(r?.following ?? r?.isFollowing)))
            .catch(() => {});
          publicProfileService.checkFriendshipStatus(u.id)
            .then(r => setFriendStatus(r?.status ?? r))
            .catch(() => {});
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, me?.id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await publicProfileService.unfollowUser(profile.id);
        setIsFollowing(false);
      } else {
        await publicProfileService.followUser(profile.id);
        setIsFollowing(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleFriendRequest = async () => {
    try {
      await publicProfileService.sendFriendRequest(profile.id);
      setFriendStatus('pending');
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner size="xl" text="Loading profile..." />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">User not found</p>
            <Link to="/" className="text-blue-400 hover:underline">Back to home</Link>
          </div>
        </main>
      </div>
    );
  }

  const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || profile?.username;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex">
        <div className="hidden lg:block w-64 fixed left-0 top-0 h-full overflow-y-auto">
          <Sidebar />
        </div>
        <main className="flex-1 lg:ml-64 px-3 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6 bg-gray-900 min-h-screen">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header card — view only */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
              <div className="relative h-36 sm:h-48 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                {profile?.coverImage && (
                  <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute -bottom-12 sm:-bottom-14 left-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-900 rounded-full p-1 shadow-2xl border-4 border-gray-800">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">{(name || 'U').charAt(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-14 sm:pt-16 pb-5 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-white">{name}</h1>
                      {profile?.plan && profile.plan !== 'FREE' && (
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Crown className="h-3 w-3" />{profile.plan}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">@{profile?.username}</p>
                  </div>

                  {!isOwn && me?.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFollow}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                          isFollowing
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Rss className="h-4 w-4" />{isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={handleFriendRequest}
                        disabled={friendStatus === 'friends' || friendStatus === 'pending'}
                        className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-60 transition-colors"
                      >
                        {friendStatus === 'friends'
                          ? <><UserCheck className="h-4 w-4" />Friends</>
                          : friendStatus === 'pending'
                            ? <><UserCheck className="h-4 w-4" />Requested</>
                            : <><UserPlus className="h-4 w-4" />Add Friend</>}
                      </button>
                    </div>
                  )}
                  {isOwn && (
                    <Link to="/profile" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm font-medium">
                      View my profile
                    </Link>
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-gray-200 mt-4 text-sm sm:text-base leading-relaxed">{profile.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                  {profile?.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  {stats?.totalFriends !== undefined && <span>{stats.totalFriends} friends</span>}
                  {stats?.totalFollowers !== undefined && <span>{stats.totalFollowers} followers</span>}
                </div>
              </div>
            </div>

            {/* Public tabs: Posts / Reposts / Articles / Rewards / Friends */}
            <ProfileContentTabs userId={profile?.id} isOwnProfile={false} stats={stats} />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default PublicProfile;
