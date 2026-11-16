import React, { useState, useRef, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import friendService from '../services/friendService';

const MentionInput = ({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  className,
  rows = 6,
  maxLength = 5000,
  disabled = false,
}) => {
  const textareaRef = useRef(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimerRef = useRef(null);

  // Fetch suggested friends once when component mounts (for immediate @ suggestions)
  useEffect(() => {
    const fetchSuggestions = async () => {
      const pick = (res, keys) => {
        for (const k of keys) {
          const v = k.split('.').reduce((o, p) => (o ? o[p] : undefined), res);
          if (Array.isArray(v)) return v;
        }
        return [];
      };
      const [friendsRes, suggestedRes] = await Promise.allSettled([
        friendService.getFriends(1, 100),
        userService.getSuggestedFriends(),
      ]);
      const friends = friendsRes.status === 'fulfilled' ? pick(friendsRes.value, ['data.friends', 'data', 'friends']) : [];
      const suggested = suggestedRes.status === 'fulfilled'
        ? pick(suggestedRes.value, ['data.suggestions', 'data.users', 'suggestions', 'users', 'data'])
        : [];
      const seen = new Set();
      const merged = [...friends, ...suggested]
        .map((u) => u?.friend || u?.user || u)
        .filter((u) => u && u.id && u.username && !seen.has(u.id) && seen.add(u.id));
      setSuggestedUsers(merged);
      setSuggestionsLoaded(true);
    };
    fetchSuggestions();
  }, []);

  // Search/filter users when mention query changes
  useEffect(() => {
    if (!showMentions) {
      setMentionResults([]);
      return;
    }

    // If no query, show suggested friends
    if (mentionQuery.length === 0) {
      setMentionResults(suggestedUsers.slice(0, 8));
      setMentionIndex(0);
      return;
    }

    // 1+ chars: show local filtered results immediately, API search at 2+ chars
    const localFiltered = suggestedUsers.filter(u => {
      const name = `${u.firstName || ''} ${u.lastName || ''} ${u.username || ''}`.toLowerCase();
      return name.includes(mentionQuery.toLowerCase());
    });
    setMentionResults(localFiltered.slice(0, 8));
    setMentionIndex(0);

    // Only search API with 2+ chars (backend requires minimum 2)
    if (mentionQuery.length >= 2) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

      setLoading(true);
      searchTimerRef.current = setTimeout(async () => {
        try {
          const response = await userService.searchUsers(mentionQuery, 1, 8);
          const users = response?.data?.users || response?.users || (Array.isArray(response?.data) ? response.data : []) || [];
          if (Array.isArray(users) && users.length > 0) {
            setMentionResults((prev) => {
              const seen = new Set();
              return [...prev, ...users].filter((u) => u?.id && !seen.has(u.id) && seen.add(u.id)).slice(0, 8);
            });
          }
        } catch (e) {
          // Keep local results already set above
        } finally {
          setLoading(false);
        }
      }, 150);
    }

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [mentionQuery, showMentions, suggestedUsers]);

  useEffect(() => {
    if (!value) setTaggedUsers((prev) => (prev.length ? [] : prev));
  }, [value]);

  // Notify parent of tagged users
  useEffect(() => {
    if (onMentionsChange) {
      onMentionsChange(taggedUsers);
    }
  }, [taggedUsers, onMentionsChange]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if user is typing a mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Only trigger mention if @ is at start, after space, after newline, or after parenthesis
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
      const validPreChars = [' ', '\n', '(', '[', '{', '"', "'", '`', '>', '-'];

      if ((validPreChars.includes(charBeforeAt) || lastAtIndex === 0) &&
          !textAfterAt.includes(' ') && !textAfterAt.includes('\n') &&
          textAfterAt.length <= 30) {
        setShowMentions(true);
        setMentionQuery(textAfterAt);
        setMentionStart(lastAtIndex);
        updateDropdownPosition();
        return;
      }
    }

    setShowMentions(false);
    setMentionStart(-1);
  };

  const insertMention = (user) => {
    if (mentionStart === -1 || !textareaRef.current) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current.selectionStart);
    const mentionText = `@${user.username} `;
    const newValue = beforeMention + mentionText + afterMention;

    onChange(newValue);
    setShowMentions(false);
    setMentionStart(-1);
    setMentionQuery('');

    // Track tagged user
    setTaggedUsers((prev) => {
      if (prev.find((u) => u.id === user.id)) return prev;
      return [...prev, { id: user.id, username: user.username }];
    });

    // Focus and position cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showMentions || mentionResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex((prev) => (prev + 1) % mentionResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex((prev) => (prev - 1 + mentionResults.length) % mentionResults.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(mentionResults[mentionIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowMentions(false);
      setMentionStart(-1);
    }
  };

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPosition = () => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      // Use fixed positioning — no scrollY/scrollX needed since fixed is viewport-relative
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleFocus = () => updateDropdownPosition();

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowMentions(false), 150);
  }, []);

  // Remove tagged users that are no longer in the text
  const cleanTaggedUsers = (text) => {
    setTaggedUsers((prev) =>
      prev.filter((u) => {
        const mentionPattern = new RegExp(`@${u.username}\\b`, 'i');
        return mentionPattern.test(text);
      })
    );
  };

  const handleChangeWithCleanup = (e) => {
    handleInputChange(e);
    cleanTaggedUsers(e.target.value);
  };

  const getUserAvatar = (user) => {
    if (user.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `https://fggg.space/uploads/${user.avatar}`;
    }
    return null;
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChangeWithCleanup}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
      />

      {/* Mention Suggestions Dropdown */}
      {showMentions && (
        <div className="absolute left-0 right-0 top-full mt-1 z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span>Tag people</span>
            {loading && <span className="text-blue-500 animate-pulse">Searching...</span>}
          </div>
          {!suggestionsLoaded ? (
            <div className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500">
              Loading suggestions...
            </div>
          ) : mentionResults.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500">
              {mentionQuery.length === 0 ? 'No suggestions available' : `No users found for "${mentionQuery}"`}
            </div>
          ) : null}
          {mentionResults.map((user, idx) => {
            const avatar = getUserAvatar(user);
            return (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(user);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  idx === mentionIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(user.firstName?.charAt(0) || user.username?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}
                  </div>
                </div>
                {user.isOnline && (
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
