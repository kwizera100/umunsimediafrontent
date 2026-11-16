import React, { useState } from "react";
import { Zap, TrendingUp, Star, Crown, Sparkles } from "lucide-react";
import BoostPostModal from "./BoostPostModal";
import boostService from "../services/boostService";
import toast from "react-hot-toast";

const BoostButton = ({ post, onBoostSuccess, className = "" }) => {
  const [showBoostModal, setShowBoostModal] = useState(false);

  const getBoostIcon = (level) => {
    switch (level) {
      case 1:
        return <Zap className="h-4 w-4" />;
      case 2:
        return <TrendingUp className="h-4 w-4" />;
      case 3:
        return <Star className="h-4 w-4" />;
      case 4:
        return <Crown className="h-4 w-4" />;
      case 5:
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getBoostColor = (level) => {
    switch (level) {
      case 1:
        return "text-blue-500 hover:text-blue-600";
      case 2:
        return "text-green-500 hover:text-green-600";
      case 3:
        return "text-yellow-500 hover:text-yellow-600";
      case 4:
        return "text-purple-500 hover:text-purple-600";
      case 5:
        return "text-pink-500 hover:text-pink-600";
      default:
        return "text-gray-500 hover:text-gray-600";
    }
  };

  const handleBoostClick = () => {
    setShowBoostModal(true);
  };

  const handleBoostSuccess = (boostData) => {
    onBoostSuccess?.(boostData);
    setShowBoostModal(false);
  };

  // If post is already boosted, show boost status
  if (post.isBoosted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          disabled
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium text-sm cursor-not-allowed`}
        >
          {getBoostIcon(post.boostLevel)}
          <span>Boosted Level {post.boostLevel}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleBoostClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors ${className}`}
      >
        <Zap className="h-4 w-4" />
        <span>Boost</span>
      </button>

      <BoostPostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        postId={post.id}
        onBoostSuccess={handleBoostSuccess}
      />
    </>
  );
};

export default BoostButton;
