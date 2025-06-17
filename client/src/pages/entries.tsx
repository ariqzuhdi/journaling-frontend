import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Grid, List, Heart, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { EntryCard } from '@/components/entry-card';
import { ComposeModal } from '@/components/compose-modal';
import { ReadingModal } from '@/components/reading-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, countWords } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Post } from '@shared/schema';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function Entries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [moodFilter, setMoodFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isReadingOpen, setIsReadingOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

  const {data: user} = useCurrentUser();
  
  const currentUser = user?.username ?? '';

  const loadMore = 4
  const { data, isLoading, refetch } = useQuery({
    enabled: !!user?.username,
    queryKey: ['/api/posts/user', currentUser],
    queryFn: () => api.posts.getByUsername(currentUser),
    refetchOnMount: true
  });

  useEffect(() => {
    if (user?.username) {
      refetch();
    }
  }, [user?.username]);

  const posts = Array.isArray(data) ? data : [];

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || (() => {
      const postDate = new Date(post.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return postDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return postDate > weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return postDate > monthAgo;
        default:
          return true;
      }
    })();

    const matchesMood = moodFilter === 'all' || 
      post.title.toLowerCase().includes(moodFilter.toLowerCase()) ||
      post.body.toLowerCase().includes(moodFilter.toLowerCase());

    return matchesSearch && matchesDate && matchesMood;
  });
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const handleReadMore = (post: Post) => {
    setSelectedPost(post);
    setIsReadingOpen(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsComposeOpen(true);
  };

  const handleComposeClose = () => {
    setIsComposeOpen(false);
    setEditingPost(null);
  };

  const totalWords = filteredPosts.reduce((sum, post) => sum + countWords(post.body), 0);

  return (
    <div className="min-h-screen journal-bg">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-2">
            My Journal Entries
          </h1>
          <p className="text-charcoal/70">
            {filteredPosts.length} entries · {totalWords.toLocaleString()} words written
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-accent/20 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <Input
                placeholder="Search your entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-accent/30 focus:border-primary/50"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Mood Filter */}
            {/* <Select value={moodFilter} onValueChange={setMoodFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Heart className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
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

            {/* View Mode Toggle */}
            <div className="flex bg-accent/10 rounded-lg p-1">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || dateFilter !== 'all' || moodFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-charcoal/60">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="px-3 py-1">
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="px-3 py-1">
                Date: {dateFilter}
                <button 
                  onClick={() => setDateFilter('all')}
                  className="ml-2 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
            {moodFilter !== 'all' && (
              <Badge variant="secondary" className="px-3 py-1">
                Mood: {moodFilter}
                <button 
                  onClick={() => setMoodFilter('all')}
                  className="ml-2 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchQuery('');
                setDateFilter('all');
                setMoodFilter('all');
              }}
              className="text-xs text-charcoal/60 hover:text-primary"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Entries Grid/List */}
        {isLoading ? (
          <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-accent/10">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-primary mb-2">
              {posts.length === 0 ? 'No entries yet' : 'No entries match your filters'}
            </h3>
            <p className="text-charcoal/60 max-w-md mx-auto mb-6">
              {posts.length === 0 
                ? 'Start your journaling journey by writing your first entry.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'
              }
            </p>
            {posts.length === 0 && (
              <Button
                onClick={() => setIsComposeOpen(true)}
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Write Your First Entry
              </Button>
            )}
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visiblePosts.map((post) => (
              <EntryCard
                key={post.id}
                post={post}
                onReadMore={handleReadMore}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {visiblePosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg border border-accent/10 p-5 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-primary mb-1 leading-snug">
                      {post.title}
                    </h3>
                    <p className="font-serif text-base text-charcoal/80 mb-3 leading-relaxed line-clamp-3">
                      {post.body.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-charcoal/50">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {countWords(post.body)} words
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReadMore(post)}
                      className="text-primary hover:bg-primary/10"
                    >
                      Read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="text-charcoal/60 hover:bg-charcoal/10"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && filteredPosts.length >= 5 && (
          <div className="text-center py-8">
            <Button
              variant="outline"
              className="px-8 py-3 text-primary border border-primary/30 rounded-full hover:bg-primary hover:text-white transition-all duration-200 font-medium"
              onClick={() => setVisibleCount((prev) => prev + loadMore)}
            >
              Load More Entries
            </Button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={handleComposeClose}
        editingPost={editingPost}
      />

      <ReadingModal
        isOpen={isReadingOpen}
        onClose={() => setIsReadingOpen(false)}
        post={selectedPost}
        onEdit={handleEdit}
      />
    </div>
  );
}
