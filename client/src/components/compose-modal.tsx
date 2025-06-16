import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { countWords, calculateReadTime } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Post, InsertPost } from '@shared/schema';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPost?: Post | null;
  onSuccess?: () => void;
}

export function ComposeModal({ isOpen, onClose, editingPost, onSuccess }: ComposeModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.body);
    } else {
      setTitle('');
      setContent('');
    }
  }, [editingPost, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: InsertPost) => api.posts.create(data),
    onSuccess: () => {
      if(!user) return;
      queryClient.invalidateQueries({ queryKey: ['user-posts', user.username] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/user', user.username] });
      toast({
        title: "Success",
        description: "Your journal entry has been published.",
      });
      onClose();
      setTitle('');
      setContent('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPost> }) => 
      api.posts.update(id, data),
     onSuccess: () => {
    if (user?.username) {
      queryClient.invalidateQueries({ queryKey: ['user-posts', user.username] });
    }
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });

      toast({
        title: "Success",
        description: "Your journal entry has been updated.",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    const postData = { title: title.trim(), body: content };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const wordCount = countWords(content);
  const readTime = calculateReadTime(content);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="flex items-center justify-between p-6 border-b border-accent/10">
          <DialogTitle className="text-xl font-serif font-semibold text-primary">
            {editingPost ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-charcoal/50 hover:text-charcoal transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button> */}
        </DialogHeader>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="What's on your mind today?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-serif font-semibold text-primary placeholder-charcoal/40 border-none outline-none bg-transparent resize-none p-0 h-auto"
                disabled={isPending}
              />
            </div>

            <div>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Let your thoughts flow freely..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-accent/10">
              <div className="flex items-center space-x-4 text-sm text-charcoal/50">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readTime} min read</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-6 py-2 text-charcoal border border-accent/20 rounded-full hover:border-primary/30 transition-colors duration-200 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium"
                >
                  {isPending ? 'Publishing...' : editingPost ? 'Update' : 'Publish'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
