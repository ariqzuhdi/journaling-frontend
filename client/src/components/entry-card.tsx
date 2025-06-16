import { ArrowRight, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatReadTime, calculateReadTime, countWords, getExcerpt } from '@/lib/utils';
import type { Post } from '@shared/schema';

interface EntryCardProps {
  post: Post;
  onReadMore: (post: Post) => void;
  onEdit: (post: Post) => void;
}

export function EntryCard({ post, onReadMore, onEdit }: EntryCardProps) {
  const wordCount = countWords(post.body);
  const readTime = calculateReadTime(post.body);
  const excerpt = getExcerpt(post.body, 200);

  // Remove HTML tags for excerpt display
  const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '');

  const getMoodColor = () => {
    // Simple mood indicator based on content sentiment (basic implementation)
    const colors = ['bg-secondary', 'bg-warm-pink', 'bg-primary'];
    return colors[post.id % colors.length];
  };

  return (
    <article className="bg-white rounded-xl p-8 shadow-sm border border-accent/10 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getMoodColor()} opacity-60`}></div>
          <time className="text-sm text-charcoal/60 font-medium">
            {formatReadTime(post.createdAt)}
          </time>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(post)}
            className="p-2 text-charcoal/50 hover:text-primary transition-colors duration-200"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h4 className="text-xl font-serif font-semibold text-primary mb-3 leading-relaxed">
        {post.title}
      </h4>

      <div className="font-serif text-charcoal/80 leading-relaxed mb-6 text-lg">
        <p>{cleanExcerpt}</p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => onReadMore(post)}
          className="text-primary font-medium hover:text-primary/80 transition-colors duration-200 flex items-center space-x-2 p-0"
        >
          <span>Continue reading</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-4 text-charcoal/50">
          <span className="text-sm">{wordCount} words</span>
          <span className="text-sm">{readTime} min read</span>
        </div>
      </div>
    </article>
  );
}
