import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoginButton from "../authentication/login/loginButton";
import LogoutButton from "../authentication/logout/logout";
import SignUpButton from "../authentication/signup/signup";
import { Button } from "@/components/ui/button";
import CreateQuoteDialog from "../quote/createQuote";
import { Bookmark, Sparkles, Quote, ChevronDown, Search } from "lucide-react";
import {
  fetchBooks,
  selectSearchResults,
  selectBooksStatus,
  selectBooksError,
} from "@/redux/slices/booksSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EchoteFeed = () => {
  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchResults);
  const status = useSelector(selectBooksStatus);
  const error = useSelector(selectBooksError);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkStates, setBookmarkStates] = useState({});
  const [expandedBook, setExpandedBook] = useState(null);

  useEffect(() => {
    if (status === "failed") {
      toast.error(error || "An error occurred while fetching books.");
    }
  }, [status, error]);

  useEffect(() => {
    console.log("Search Results:", searchResults);
  }, [searchResults]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning("Please enter a search term");
      return;
    }
    try {
      await dispatch(fetchBooks(searchQuery)).unwrap();
    } catch (err) {
      toast.error(err.message || "Failed to search books");
    }
  };

  const toggleBookmark = (id) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to bookmark books");
      return;
    }
    setBookmarkStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    toast.success(
      bookmarkStates[id] ? "Removed from bookmarks" : "Bookmarked!"
    );
  };

  // Helper function to safely get search results
  const getSearchResultsList = () => {
    if (!searchResults || !searchResults.results) return [];
    return searchResults.results;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <ToastContainer />

      <div className="h-2 bg-gradient-to-r from-[#FF8370] via-[#92E5D7] to-[#FF8370]" />

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

      <form onSubmit={handleSearch} className="p-4 flex items-center space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quotes or books..."
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92E5D7]"
        />
        <button
          type="submit"
          className="p-2 bg-[#FF8370] text-white rounded-md shadow-sm hover:bg-[#FF8370]/90"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

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

      <div className="space-y-4 p-4">
        {status === "loading" && (
          <p className="text-center text-gray-500">Loading...</p>
        )}

        {status === "succeeded" && getSearchResultsList().length === 0 && (
          <p className="text-center text-gray-500">No results found.</p>
        )}

        {getSearchResultsList().map((book) => (
          <div
            key={book.google_books_id}
            className="bg-white rounded-xl shadow-sm border border-[#92E5D7]/30 p-4 hover:shadow-md transition-shadow"
          >
            <div className="mb-3 p-2 rounded-lg bg-[#92E5D7]/10">
              <h4 className="text-sm font-bold text-gray-700">{book.title}</h4>
              <p className="text-xs text-gray-500">
                {book.authors?.length > 0
                  ? `by ${book.authors[0]}`
                  : "Unknown Author"}
              </p>
            </div>

            {book.thumbnail_url && (
              <img
                src={book.thumbnail_url}
                alt={book.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}

            {book.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {book.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#92E5D7]/10 to-[#FF8370]/10 text-[#FF8370] border border-[#FF8370]/20"
                  >
                    {genre || "Unknown"}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-[#FF8370]"
                  onClick={() => toggleBookmark(book.google_books_id)}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarkStates[book.google_books_id]
                        ? "fill-current text-[#FF8370]"
                        : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-[#FF8370]"
                  onClick={() =>
                    setExpandedBook(
                      expandedBook === book.google_books_id
                        ? null
                        : book.google_books_id
                    )
                  }
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedBook === book.google_books_id ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>
              {isAuthenticated && <CreateQuoteDialog book={book} />}
            </div>
            {expandedBook === book.google_books_id && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">{book.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EchoteFeed;
