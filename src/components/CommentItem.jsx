import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addArticleComment, updateArticleComment, deleteArticleComment } from '../services/articleService';
import { Reply, Edit, Trash2, Send, X, Check } from 'lucide-react';
import Avatar from './Avatar';
import UserDisplay from './UserDisplay';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';
const defaultAvatar = '/default-avatar.png'; // Place a default avatar in public folder

const CommentItem = ({ comment, articleId, depth = 0 }) => {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      await addArticleComment(articleId, { content: replyContent, parentId: comment.id });
      setReplying(false);
      setReplyContent('');
      // Do not update UI here; real-time event will update
    } catch {}
    setLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      await updateArticleComment(comment.id, { content: editContent });
      setEditing(false);
      // Do not update UI here; real-time event will update
    } catch {}
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteArticleComment(comment.id);
      // Do not update UI here; real-time event will update
    } catch {}
    setLoading(false);
  };

  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Unknown User';
  };

  // Avatar handled by Avatar component

  return (
    <div className={`flex items-start gap-4 ${depth > 0 ? 'ml-8 border-l-2 border-blue-500/30 bg-gray-100 dark:bg-gray-700/30 rounded-xl py-3 px-4' : 'py-4'} group`}>
      {/* Author Display */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <UserDisplay 
            user={comment.author} 
            size="sm"
            showUsername={true}
            showVerification={true}
            linkToProfile={true}
          />
          <span className="text-xs text-gray-600 dark:text-gray-500 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        
        {/* Content */}
        {editing ? (
          <form onSubmit={handleEdit} className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
              disabled={loading}
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              className="p-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors" 
              onClick={() => setEditing(false)} 
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="mb-3 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">{comment.content}</div>
        )}
        
        {/* Actions */}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          {user && (
            <button 
              onClick={() => setReplying(r => !r)} 
              className="flex items-center gap-1 hover:text-blue-400 transition-colors font-medium"
            >
              <Reply className="h-4 w-4" />
              Reply
            </button>
          )}
          {user && user.id === comment.authorId && !editing && (
            <>
              <button 
                onClick={() => setEditing(true)} 
                className="flex items-center gap-1 hover:text-yellow-400 transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button 
                onClick={handleDelete} 
                className="flex items-center gap-1 hover:text-red-400 transition-colors font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
        
        {/* Reply form */}
        {replying && (
          <form onSubmit={handleReply} className="flex gap-2 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <input
              type="text"
              className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              disabled={loading}
              placeholder="Write a reply..."
            />
            <button 
              type="submit" 
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
              disabled={loading}
            >
              <Send className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              className="p-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors" 
              onClick={() => setReplying(false)} 
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        )}
        
        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} articleId={articleId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem; 