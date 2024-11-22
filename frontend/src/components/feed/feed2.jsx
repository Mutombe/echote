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