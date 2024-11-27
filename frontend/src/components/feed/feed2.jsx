import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Book, Heart, MessageCircle, Bookmark, Share2, Sparkles, Quote, Search, UserPlus, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'react-toastify';

// Dummy data for demonstration
const DUMMY_QUOTES = [
  {
    id: 1,
    user: "Sakura Chan",
    timestamp: "2h ago",
    bookTitle: "Norwegian Wood",
    author: "Haruki Murakami",
    quote: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.",
    tags: ["literature", "thinking", "inspiration"],
    likes: 128,
    comments: 23,
    page: 45,
    userAvatar: "/assets/user.jpg"
  },
  {
    id: 2,
    user: "Min-Ji Kim",
    timestamp: "4h ago",
    bookTitle: "The Girl Who Played with Fire",
    author: "Stieg Larsson",
    quote: "What she had realized was that love was that moment when your heart was about to burst.",
    tags: ["romance", "realization", "life"],
    likes: 256,
    comments: 42,
    page: 89,
    userAvatar: "/api/placeholder/150/150"
  }
];

const EchoteFeed2 = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState({});
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', username: '', password: '' });
  
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    // Search implementation
    toast.info("Search functionality coming soon!");
  };

  const toggleBookmark = (id) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    setBookmarks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    toast.success(bookmarks[id] ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-4 border-0 shadow-lg bg-gradient-to-b from-pink-50 to-white">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Quote className="w-6 h-6 text-pink-500" />
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-teal-400">
                Echote
              </CardTitle>
            </div>
            <div className="flex space-x-2">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignUpDialog(true)}
                    className="border-pink-500 text-pink-500 hover:bg-pink-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    className="bg-pink-500 text-white hover:bg-pink-600"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'auth/logout' })}
                  className="border-pink-500 text-pink-500 hover:bg-pink-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search quotes or books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-pink-100 focus:border-pink-500"
            />
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="trending" className="mb-4">
        <TabsList className="grid w-full grid-cols-3 bg-pink-50">
          <TabsTrigger value="trending" className="data-[state=active]:bg-white data-[state=active]:text-pink-500">
            Trending
          </TabsTrigger>
          <TabsTrigger value="latest" className="data-[state=active]:bg-white data-[state=active]:text-pink-500">
            Latest
          </TabsTrigger>
          <TabsTrigger value="bookshelf" className="data-[state=active]:bg-white data-[state=active]:text-pink-500">
            Bookshelf
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed */}
      <div className="space-y-4">
        {DUMMY_QUOTES.map(quote => (
          <Card key={quote.id} className="overflow-hidden border border-pink-100 hover:border-pink-200 transition-all">
            <CardContent className="p-6">
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="border-2 border-pink-200">
                    <AvatarImage src={quote.userAvatar} />
                    <AvatarFallback>{quote.user[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-sm">✨ {quote.user}</h3>
                    <p className="text-xs text-gray-500">{quote.timestamp}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Book className="w-4 h-4" />
                  <span>Page {quote.page}</span>
                </Badge>
              </div>

              {/* Book Info */}
              <div className="mb-4 p-3 rounded-lg bg-pink-50">
                <h4 className="font-bold text-gray-700">{quote.bookTitle}</h4>
                <p className="text-sm text-gray-500">by {quote.author}</p>
              </div>

              {/* Quote */}
              <div className="relative mb-4">
                <Quote className="w-8 h-8 text-pink-200 absolute -left-2 -top-2" />
                <p className="text-gray-800 leading-relaxed pl-6">{quote.quote}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quote.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-gradient-to-r from-pink-50 to-teal-50 border-pink-200">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pink-500">
                    <Heart className="w-4 h-4 mr-1" />
                    {quote.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pink-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {quote.comments}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(quote.id)}
                    className={bookmarks[quote.id] ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}
                  >
                    <Bookmark className="w-4 h-4" fill={bookmarks[quote.id] ? 'currentColor' : 'none'} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pink-500">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Login to Echote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-pink-500 hover:bg-pink-600">Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            />
            <Input
              placeholder="Username"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignUpDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-pink-500 hover:bg-pink-600">Sign Up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EchoteFeed2;


import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, MessageCircle, Bookmark, Share2, 
  Book, Quote, Search, Sparkles 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import LoginButton from "../authentication/login/loginButton";
import LogoutButton from "../authentication/logout/logout";
import SignUpButton from "../authentication/signup/signup";
import CreateQuoteDialog from "../quote/createQuote";
import { fetchQuotes } from "@/redux/slices/quotesSlice";
import { ToastContainer, toast } from "react-toastify";

const EchoteFeed = () => {
  const dispatch = useDispatch();
  const quotes = useSelector((state) => state.quotes.items);
  const status = useSelector((state) => state.quotes.status);
  const error = useSelector((state) => state.quotes.error);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkStates, setBookmarkStates] = useState({});

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuotes());
    }
  }, [status, dispatch]);

  const toggleBookmark = (id) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to bookmark quotes");
      return;
    }
    setBookmarkStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    toast.success(bookmarkStates[id] ? "Removed from bookmarks" : "Added to bookmarks!");
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <ToastContainer />
      
      {/* Gradient header bar */}
      <div className="h-2 bg-gradient-to-r from-[#FF8370] via-[#92E5D7] to-[#FF8370]" />

      {/* App header */}
      <div className="bg-gradient-to-b from-[#92E5D7]/20 to-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Quote className="w-6 h-6 text-[#FF8370]" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8370] to-[#92E5D7]">
              Echote
            </h1>
          </div>
          <Sparkles className="w-5 h-5 text-[#FF8370]" />
          <div className="flex space-x-2">
            {!isAuthenticated ? (
              <>
                <SignUpButton />
                <LoginButton />
              </>
            ) : (
              <LogoutButton />
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotes..."
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92E5D7]"
          />
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 bg-gray-50/80 p-1 rounded-lg">
          {["trending", "latest", "bookshelf"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white shadow-md text-[#FF8370] transform scale-105"
                  : "text-gray-500 hover:bg-white/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes feed */}
      <div className="space-y-4 p-4">
        {status === 'loading' && <p className="text-center text-gray-500">Loading quotes...</p>}
        
        {status === 'failed' && <p className="text-center text-red-500">{error}</p>}
        
        {status === 'succeeded' && quotes.map((quote) => (
          <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-[#92E5D7]/30 p-4 hover:shadow-md transition-shadow">
            {/* User Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF8370] to-[#92E5D7] p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <img 
                      src={quote.user.avatar || "/api/placeholder/100/100"}
                      alt={quote.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm">✨ {quote.user.username}</h3>
                  <p className="text-xs text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {quote.context && (
                <button className="text-xs text-[#FF8370] font-medium flex items-center space-x-1">
                  <Book className="w-4 h-4" />
                  <span>{quote.context}</span>
                </button>
              )}
            </div>

            {/* Book Info */}
            <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-[#92E5D7]/10">
              {quote.book.cover_image && (
                <img 
                  src={quote.book.cover_image} 
                  alt={quote.book.title}
                  className="w-12 h-16 object-cover rounded"
                />
              )}
              <div>
                <h4 className="text-sm font-bold text-gray-700">{quote.book.title}</h4>
                <p className="text-xs text-gray-500">
                  by {quote.book.authors?.join(', ') || 'Unknown Author'}
                </p>
              </div>
            </div>

            {/* Quote Content */}
            <div className="relative mb-3">
              <Quote className="w-8 h-8 text-[#FF8370]/10 absolute -left-2 -top-2" />
              <p className="text-gray-800 leading-relaxed pl-4">
                "{quote.text}"
              </p>
            </div>

            {/* Tags */}
            {quote.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {quote.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#92E5D7]/10 to-[#FF8370]/10 text-[#FF8370] border border-[#FF8370]/20"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Interaction buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#92E5D7]/20">
              <div className="flex space-x-4">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-[#FF8370] transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-xs font-medium">{quote.reactions?.length || 0}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-[#92E5D7] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs font-medium">{quote.comments?.length || 0}</span>
                </button>
              </div>
              <div className="flex space-x-3">
                <button 
                  className={`transition-colors ${
                    bookmarkStates[quote.id] ? 'text-[#FF8370]' : 'text-gray-500 hover:text-[#FF8370]'
                  }`}
                  onClick={() => toggleBookmark(quote.id)}
                >
                  <Bookmark className="w-5 h-5" fill={bookmarkStates[quote.id] ? '#FF8370' : 'none'} />
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