import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const EMOJI_TYPES = { like: '👍', love: '❤️', laugh: '😂', sad: '😢', angry: '😡' };

const PostContent = ({ post }) => {
  switch (post.kind) {
    case 'image':
      return (
        <div>
          {post.text && <p className="mb-3 whitespace-pre-wrap">{post.text}</p>}
          <img src={post.imageUrl} alt="User post" className="mt-2 rounded-lg max-h-96 w-auto" />
        </div>
      );
    case 'code':
      return (
        <SyntaxHighlighter
          language={post.code.language}
          style={atomDark}
          customStyle={{ borderRadius: '0.5rem', margin: 0 }}
        >
          {post.code.content}
        </SyntaxHighlighter>
      );
    default:
      return <p className="whitespace-pre-wrap">{post.text}</p>;
  }
};

const PostCard = ({ post, socket, currentUser }) => {
  const [reactions, setReactions] = useState(post.reactions || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');

  useEffect(() => setReactions(post.reactions || []), [post.reactions]);
  useEffect(() => setComments(post.comments || []), [post.comments]);

  // Handle reaction
  const handleReaction = (type) => {
    if (!socket) return;

    socket.emit('post:reaction', { postId: post._id, type });

    const existing = reactions.find(r => r.userId === currentUser.userId);
    if (existing) {
      existing.type = type;
      setReactions([...reactions]);
    } else {
      setReactions([...reactions, { userId: currentUser.userId, type }]);
    }
  };

  // Handle comment
  const handleComment = () => {
    if (!socket || !commentText.trim()) return;

    socket.emit('post:comment', { postId: post._id, text: commentText });
    setCommentText('');
  };

  // Reaction counts
  const reactionCount = reactions.reduce((acc, r) => {
    const emoji = EMOJI_TYPES[r.type];
    if (!emoji) return acc;
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-[#141529] p-4 rounded-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <img src={post.user.avatarUrl} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
        </div>
      </div>

      <PostContent post={post} />

      <div className="flex gap-2 mt-4 flex-wrap">
        {Object.entries(EMOJI_TYPES).map(([type, emoji]) => {
          const count = reactionCount[emoji] || 0;
          const isActive = reactions.some(r => r.userId === currentUser.userId && r.type === type);
          return (
            <span
              key={type}
              onClick={() => handleReaction(type)}
              className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                isActive ? 'bg-purple-700' : 'bg-[#2a2d52] hover:bg-[#393d6e]'
              }`}
            >
              {emoji} <span className="text-xs font-semibold">{count}</span>
            </span>
          );
        })}
      </div>

      {/* Comments */}
      <div className="mt-4 border-t border-gray-700 pt-3">
        {comments.map((c, idx) => (
          <div key={idx} className="flex items-start gap-2 mb-2">
            <img src={c.user.avatarUrl} alt={c.user.name} className="w-6 h-6 rounded-full object-cover mt-1" />
            <div>
              <p className="text-sm font-semibold">{c.user.name}</p>
              <p className="text-sm text-gray-300">{c.text}</p>
            </div>
          </div>
        ))}

        {/* Add comment */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="flex-1 p-2 rounded-md bg-[#0D0E1A] border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Write a reply..."
          />
          <button
            onClick={handleComment}
            className="bg-purple-600 px-4 py-1 rounded-md hover:bg-purple-700"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
