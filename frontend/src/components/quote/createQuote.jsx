import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createQuote } from '@/redux/slices/quoteSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Quote, Book, Tag } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateQuoteDialog = ({ book }) => {
  const dispatch = useDispatch();
  const [quoteText, setQuoteText] = useState('');
  const [context, setContext] = useState('');
  const [tags, setTags] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quoteText.trim()) {
      toast.error('Please enter a quote');
      return;
    }

    try {
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await dispatch(createQuote({
        text: quoteText,
        context,
        tags: tagArray,
        book: book.google_books_id
      })).unwrap();

      toast.success('Quote created successfully!');
      setIsOpen(false);
      setQuoteText('');
      setContext('');
      setTags('');
    } catch (error) {
      console.error('Quote creation error:', error);
      toast.error(error.message || 'Failed to create quote');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 bg-gradient-to-r from-[#92E5D7]/10 to-[#FF8370]/10 hover:from-[#92E5D7]/20 hover:to-[#FF8370]/20"
        >
          <Quote className="w-4 h-4" />
          Create Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-[#FF8370]" />
            Create Quote from {book.title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quote Text</label>
            <Textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="Enter the quote text..."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Context (Optional)</label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Chapter or additional context..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (Optional)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#FF8370] hover:bg-[#FF8370]/90"
            >
              Create Quote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuoteDialog;