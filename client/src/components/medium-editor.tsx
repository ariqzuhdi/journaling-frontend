import { useState } from 'react';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Heart } from 'lucide-react';
import { countWords, calculateReadTime } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { InsertPost } from '@shared/schema';
import { useCurrentUser } from '@/hooks/use-current-user';
import { encrypt, importKeyFromBase64 } from "@/lib/crypto";

interface MediumEditorProps {
  onClose?: () => void;
}

export function MediumEditor({ onClose }: MediumEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const [mood, setMood] = useState('');


  const createMutation = useMutation({
    mutationFn: (data: InsertPost) => api.posts.create(data),
    onSuccess: () => {
      if(!user) return
      setTitle('');
      setContent('');
      setIsPublishing(false);
      queryClient.invalidateQueries({ queryKey: ['user-posts', user.username] });
      toast({
        title: "Published",
        description: "Your journal entry has been published.",
      });
      if (onClose) onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish entry. Please try again.",
        variant: "destructive",
      });
      setIsPublishing(false);
    },
  });

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add both a title and content before publishing.",
        variant: "destructive",
      });
      return;
    }

    const derivedKeyBase64 = sessionStorage.getItem("derivedKey");
    if (!derivedKeyBase64) {
      toast({
        title: "Encryption Error",
        description: "Missing encryption key. Please re-login.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Tidak perlu enkripsi manual di sini.
      createMutation.mutate({ title: title.trim(), body: content });
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "Publish Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsPublishing(false);
    }
  };

  const wordCount = countWords(content);
  const readTime = calculateReadTime(content);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-accent/10 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-accent/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold text-primary">
              How are you feeling today?
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
              {/* <div className="items-center">
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="w sm:w-20">
                    <Heart className="h-4 w-4 mr-2" />
                    {/* <SelectValue placeholder="-" /> */}
              {/* </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="grateful">Grateful</SelectItem>
                    <SelectItem value="anxious">Anxious</SelectItem>
                    <SelectItem value="peaceful">Peaceful</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="reflective">Reflective</SelectItem>
                    <SelectItem value="hopeful">Hopeful</SelectItem>
                    <SelectItem value="confused">Confused</SelectItem>
                    <SelectItem value="motivated">Motivated</SelectItem>
                  </SelectContent>
                </Select> */}
              {/* </div> */}
              <div className="text-sm text-charcoal/50">
                {wordCount} words • {readTime} min read
              </div>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !title.trim() || !content.trim()}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
        {/* Title Input */}
        <div className="px-8 py-6 border-b border-accent/10">
          <Input
            type="text"
            placeholder="Give your thoughts a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-serif font-semibold text-primary placeholder-charcoal/30 border-none outline-none bg-transparent resize-none p-0 h-auto focus:ring-0 focus:border-transparent"
            disabled={isPublishing}
          />
        </div>

        {/* Content Editor */}
        <div className="px-8 py-4">
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Share what's on your mind, your feelings, thoughts, or experiences..."
            className="min-h-[200px]"
          />
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-muted/20 border-t border-accent/10">
          <div className="flex items-center justify-between text-sm text-charcoal/60">
            <div>
              {/* This is your private space for reflection and growth */}
            </div>
            <div className="flex items-center space-x-4">
              <span>Auto-saved</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}