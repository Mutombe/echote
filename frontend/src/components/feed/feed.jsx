import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Book, Heart, MessageCircle, Bookmark, Share2, Sparkles, Quote, ChevronDown, Search } from 'lucide-react';
import { fetchBooks, selectSearchResults, selectBooksStatus, selectBooksError } from '@/redux/slices/booksSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EchoteFeed = () => {
  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchResults) || [];
  const status = useSelector(selectBooksStatus);
  const error = useSelector(selectBooksError);
  
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkStates, setBookmarkStates] = useState({});

  useEffect(() => {
    if (status === 'failed') {
      toast.error(error || 'An error occurred while fetching books.');
    }
  }, [status, error]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning('Please enter a search term');
      return;
    }
    try {
      await dispatch(fetchBooks(searchQuery)).unwrap();
    } catch (err) {
      toast.error(err.message || 'Failed to search books');
    }
  };

  const toggleBookmark = (id) => {
    setBookmarkStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    toast.success(bookmarkStates[id] ? 'Removed from bookmarks' : 'Bookmarked!');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Gradient Top Bar - Using Echote colors */}
      <div className="h-2 bg-gradient-to-r from-[#FF8370] via-[#92E5D7] to-[#FF8370]" />

      {/* Header with Echote branding */}
      <div className="p-4 bg-gradient-to-b from-[#92E5D7]/20 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Quote className="w-6 h-6 text-[#FF8370]" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8370] to-[#92E5D7]">
              Echote
            </h1>
          </div>
          <Sparkles className="w-5 h-5 text-[#FF8370]" />
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="p-4 flex items-center space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quotes or books..."
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92E5D7]"
        />
        <button type="submit" className="p-2 bg-[#FF8370] text-white rounded-md shadow-sm hover:bg-[#FF8370]/90">
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 bg-gray-50/80 p-1 rounded-lg">
          {['trending', 'latest', 'bookshelf'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white shadow-md text-[#FF8370] transform scale-105'
                  : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards */}
      <div className="space-y-4 p-4">
        {status === 'loading' && <p className="text-center text-gray-500">Loading...</p>}
        {status === 'succeeded' && searchResults.length === 0 && (
          <p className="text-center text-gray-500">No results found.</p>
        )}

      {Array.isArray(searchResults) && searchResults.map((item) => (
          <div key={item.google_books_id || item.id} className="bg-white rounded-xl shadow-sm border border-[#92E5D7]/30 p-4 hover:shadow-md transition-shadow">
            {/* User Info with book details */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF8370] to-[#92E5D7] p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <img 
                      src="/api/placeholder/100/100"
                      alt="profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm">✨ {item.user}</h3>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
              </div>
              <button className="text-xs text-[#FF8370] font-medium flex items-center space-x-1">
                <Book className="w-4 h-4" />
                <span>{item.page ? `Page ${item.page}` : 'Page Unknown'}</span>
              </button>
            </div>

            {/* Book Info */}
            <div className="mb-3 p-2 rounded-lg bg-[#92E5D7]/10">
              <h4 className="text-sm font-bold text-gray-700">{item.bookTitle}</h4>
              <p className="text-xs text-gray-500">by {item.author}</p>
            </div>

            {/* Quote Content */}
            <div className="relative mb-3">
              <Quote className="w-8 h-8 text-[#FF8370]/10 absolute -left-2 -top-2" />
              <p className="text-gray-800 leading-relaxed pl-4">{item.quote}</p>
            </div>

            {/* Tags with gradient backgrounds */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#92E5D7]/10 to-[#FF8370]/10 text-[#FF8370] border border-[#FF8370]/20"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Interaction buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#92E5D7]/20">
              <div className="flex space-x-4">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-[#FF8370] transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-[#92E5D7] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.comments}</span>
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  className={`transition-colors ${
                    bookmarkStates[item.id] ? 'text-[#FF8370]' : 'text-gray-500 hover:text-[#FF8370]'
                  }`}
                  onClick={() => toggleBookmark(item.id)}
                >
                  <Bookmark className="w-5 h-5" fill={bookmarkStates[item.id] ? '#FF8370' : 'none'} />
                </button>
                <button className="text-gray-500 hover:text-[#92E5D7] transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EchoteFeed;
