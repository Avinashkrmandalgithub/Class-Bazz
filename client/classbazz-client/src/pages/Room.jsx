import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { UserContext } from '../context/UserContext';
import PostCard from '../components/PostCard';
import NavBar from '../components/NavBar';
import CreatePost from '../components/CreatePost';
import { FiMessageSquare, FiCode, FiImage, FiBarChart2 } from 'react-icons/fi';

const API_URL = 'https://class-bazz.onrender.com/';

const Room = () => {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    onlineCount: 0,
    postCount: 0,
    textPostCount: 0,
    codePostCount: 0,
    imagePostCount: 0,
  });
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const feedEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Redirect if no user
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Initialize socket
  useEffect(() => {
    if (!user) return;
    const newSocket = io(API_URL, { auth: { token: user.token } });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user]);

  // Fetch posts & listen to socket events
  useEffect(() => {
    if (!socket) return;

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();

    // Socket listeners
    socket.on('post:new', (newPost) => setPosts(prev => [newPost, ...prev]));
    socket.on('stats:update', (newStats) => setStats(prev => ({ ...prev, ...newStats })));
    socket.on('post:reaction', (updatedPost) => {
      setPosts(prev => prev.map(p => (p._id === updatedPost._id ? updatedPost : p)));
    });
    socket.on('post:comment', (updatedPost) => {
      setPosts(prev => prev.map(p => (p._id === updatedPost._id ? updatedPost : p)));
    });

    return () => {
      socket.off('post:new');
      socket.off('stats:update');
      socket.off('post:reaction');
      socket.off('post:comment');
    };
  }, [socket, user]);

  // Auto scroll
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  const handleLogout = () => {
    sessionStorage.removeItem('classbazz-user');
    setUser(null);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className='min-h-screen bg-[#0D0E1A] text-white flex flex-col'>
      <NavBar
        user={user}
        onLogout={handleLogout}
        onlineCount={stats.onlineCount}
        postCount={stats.postCount}
      />

      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar (desktop) */}
        <aside className='w-64 bg-[#141529] p-4 space-y-6 hidden md:block'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>Community Stats</h2>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div className='bg-purple-900/50 p-4 rounded-lg'>
              <p className='text-3xl font-bold'>{stats.onlineCount}</p>
              <p className='text-sm text-purple-200'>Online</p>
            </div>
            <div className='bg-purple-900/50 p-4 rounded-lg'>
              <p className='text-3xl font-bold'>{stats.postCount}</p>
              <p className='text-sm text-purple-200'>Posts</p>
            </div>
          </div>
          <ul className='space-y-2 text-purple-200 font-medium'>
            <li className="flex items-center gap-2"><FiMessageSquare className="text-green-400" /> Text Posts ({stats.textPostCount})</li>
            <li className="flex items-center gap-2"><FiCode className="text-green-400" /> Code Posts ({stats.codePostCount})</li>
            <li className="flex items-center gap-2"><FiImage className="text-green-400" /> Image Posts ({stats.imagePostCount})</li>
          </ul>
        </aside>

        {/* Main feed */}
        <main className='flex-1 p-4 sm:p-6 flex flex-col'>
          {socket && <CreatePost user={user} socket={socket} />}
          <div className='flex-1 space-y-4 overflow-y-auto pr-1 sm:pr-2'>
            {posts.map(p => (
              <PostCard key={p._id} post={p} socket={socket} currentUser={user} />
            ))}
            <div ref={feedEndRef} />
          </div>
        </main>
      </div>

      {/* Mobile stats toggle */}
      <button
        className="md:hidden fixed bottom-4 right-4 bg-purple-600 p-3 rounded-full shadow-lg z-50"
        onClick={() => setShowStats(!showStats)}
      >
        <FiBarChart2 size={20} />
      </button>

      {showStats && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-end md:hidden z-40">
          <div className="bg-[#141529] w-full rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>Community Stats</h2>
            <div className='grid grid-cols-2 gap-4 text-center'>
              <div className='bg-purple-900/50 p-4 rounded-lg'>
                <p className='text-3xl font-bold'>{stats.onlineCount}</p>
                <p className='text-sm text-purple-200'>Online</p>
              </div>
              <div className='bg-purple-900/50 p-4 rounded-lg'>
                <p className='text-3xl font-bold'>{stats.postCount}</p>
                <p className='text-sm text-purple-200'>Posts</p>
              </div>
            </div>
            <ul className='space-y-2 text-purple-200 font-medium'>
              <li className="flex items-center gap-2"><FiMessageSquare className="text-green-400" /> Text Posts ({stats.textPostCount})</li>
              <li className="flex items-center gap-2"><FiCode className="text-green-400" /> Code Posts ({stats.codePostCount})</li>
              <li className="flex items-center gap-2"><FiImage className="text-green-400" /> Image Posts ({stats.imagePostCount})</li>
            </ul>
            <button
              className="w-full mt-4 py-2 bg-purple-600 rounded-lg font-medium"
              onClick={() => setShowStats(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
