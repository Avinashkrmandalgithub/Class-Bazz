import React, { useState } from 'react';
import { FaFont, FaCode, FaImage } from 'react-icons/fa';

const API_URL = 'https://class-bazz.onrender.com/';

const CreatePost = ({ user, socket }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [codeLang, setCodeLang] = useState('javascript');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if ((activeTab === 'text' && !text.trim()) ||
        (activeTab === 'code' && !codeContent.trim()) ||
        (activeTab === 'image' && !imageFile)) {
      return; // Don't post if empty
    }
    
    setIsLoading(true);
    let postData = { user };

    try {
      if (activeTab === 'text') {
        postData = { ...postData, kind: 'text', text: text };
      } else if (activeTab === 'code') {
        postData = { ...postData, kind: 'code', code: { language: codeLang, content: codeContent } };
      } else if (activeTab === 'image') {
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Image upload failed');
        const { secure_url } = await res.json();
        postData = { ...postData, kind: 'image', imageUrl: secure_url, text: text }; // Allow optional text with image
      }

      socket.emit('post:create', postData);
      
      // Reset state
      setText('');
      setCodeContent('');
      setCodeLang('javascript');
      setImageFile(null);
      setImagePreview('');

    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Error: Could not create post.');
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton = ({ type, icon, label }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
        activeTab === type ? 'bg-[#0D0E1A] text-white' : 'bg-transparent text-gray-400 hover:bg-[#1f2240]'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className='bg-[#141529] p-4 rounded-lg mb-6'>
      <div className='flex border-b border-purple-800'>
        <TabButton type="text" icon={<FaFont />} label="Text" />
        <TabButton type="code" icon={<FaCode />} label="Code" />
        <TabButton type="image" icon={<FaImage />} label="Image" />
      </div>
      <div className='pt-4'>
        {/* Text Input */}
        {activeTab === 'text' && (
          <textarea
            placeholder="What's on your mind? Share with the community..."
            className='w-full p-2 rounded-md bg-[#0D0E1A] border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="4"
            maxLength="500"
          />
        )}
        {/* Code Input */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="w-full p-2 rounded-md bg-[#0D0E1A] border border-purple-500">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="python">C</option>
              <option value="python">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="java">Java</option>
              <option value="bash">Bash/Shell</option>
            </select>
            <textarea
              placeholder="Enter your code snippet here..."
              className='w-full p-2 rounded-md bg-[#0D0E1A] border border-purple-500 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400'
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              rows="8"
            />
          </div>
        )}
        {/* Image Input */}
        {activeTab === 'image' && (
           <div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg max-h-60" />}
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Optional: Add a caption..." className="w-full p-2 mt-3 rounded-md bg-[#0D0E1A] border border-purple-500" rows="2" maxLength="500" />
           </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-gray-400">Posting as <span className="font-bold text-white">{user.name}</span></p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{activeTab !== 'code' ? `${text.length}/500` : ''}</span>
          <button onClick={handleSubmit} disabled={isLoading} className='bg-purple-600 px-5 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed'>
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;