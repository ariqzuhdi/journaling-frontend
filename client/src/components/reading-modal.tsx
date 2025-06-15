import { ArrowLeft, Edit, Trash2, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatReadTime, calculateReadTime, countWords, formatDate } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Post } from '@shared/schema';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface ReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onEdit: (post: Post) => void;
}

export function ReadingModal({ isOpen, onClose, post, onEdit }: ReadingModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();

const deleteMutation = useMutation({
  mutationFn: (id: number) => api.posts.delete(id),
  onSuccess: () => {
    if (user?.username) {
      queryClient.invalidateQueries({ queryKey: ['user-posts', user.username] });
    }
    toast({
      title: "Success",
      description: "Your journal entry has been deleted.",
    });
    onClose();
  },
  onError: () => {
    toast({
      title: "Error",
      description: "Failed to delete journal entry. Please try again.",
      variant: "destructive",
    });
  },
});


  if (!post) return null;

  const wordCount = countWords(post.body);
  const readTime = calculateReadTime(post.body);

  const handleEdit = () => {
    onEdit(post);
    onClose();
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 bg-warm-white journal-bg overflow-y-auto">
        <ScrollArea className="max-h-[80vh]">
        <div className="overflow-y-auto h-full">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex items-center space-x-2 text-charcoal/60 hover:text-primary transition-colors duration-200 mb-6 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Journal</span>
              </Button>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <time className="text-charcoal/60 font-medium">
                    {formatReadTime(post.createdAt)}
                  </time>
                  <div className="flex items-center space-x-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="p-2 text-charcoal/50 hover:text-primary transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-charcoal/50 hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this journal entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-semibold text-primary leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center space-x-6 text-charcoal/60 text-sm border-b border-accent/10 pb-6">
                  <span>{wordCount} words</span>
                  <span>{readTime} min read</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            <article className="prose prose-lg max-w-none">
              <div 
                className="prose-journal"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            </article>

            <div className="mt-12 pt-8 border-t border-accent/10">
              <div className="flex items-center justify-between">
                <div className="text-charcoal/60 text-sm">
                  {/* <p>Written with 💝 in your personal sanctuary</p> */}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-4 py-2 text-charcoal/60 hover:text-primary transition-colors duration-200 border border-accent/20 rounded-full hover:border-primary/30"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
