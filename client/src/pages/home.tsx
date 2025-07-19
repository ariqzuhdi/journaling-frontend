import { useState } from "react";
import { Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { StatsSection } from "@/components/stats-section";
import { EntryCard } from "@/components/entry-card";
import { ComposeModal } from "@/components/compose-modal";
import { ReadingModal } from "@/components/reading-modal";
import { MediumEditor } from "@/components/medium-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { countWords, calculateWritingStreak } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Post } from "@shared/schema";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect } from "react";
import { decrypt, importKeyFromBase64 } from "@/lib/crypto";
import { useQueryClient } from '@tanstack/react-query';


export default function Home() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isReadingOpen, setIsReadingOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const queryClient = useQueryClient()
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  // State to save derive key from import result
  const [key, setKey] = useState<CryptoKey | null>(null);

  // Grab from sessionStorage when component mounted
  useEffect(() => {
    const derivedKeyBase64 = typeof window !== "undefined"
      ? sessionStorage.getItem("derivedKey")
      : null;

    if (!derivedKeyBase64) return;

    importKeyFromBase64(derivedKeyBase64).then(setKey);
  }, []);

  const { data, isLoading } = useQuery({
    enabled: !!user?.username && !!key,
    queryKey: ["user-posts", user?.username],
    queryFn: async () => {
      if (!user?.username) return [];
      const rawPosts = await api.posts.getByUsername(user.username!);
      return rawPosts;
    },
  });

  const posts = Array.isArray(data) ? data : [];

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

  const totalEntries = posts.length;
  const totalWords = posts.reduce(
    (sum, post) => sum + countWords(post.body),
    0
  );
  const writingStreak = calculateWritingStreak(posts);

  useEffect(() => {
    if (!user && !isUserLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [user, isUserLoading]);

  return (
    <div className="min-h-screen journal-bg">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-4">
            Your Personal Sanctuary
          </h2>
          <p className="text-lg text-charcoal/80 max-w-2xl mx-auto leading-relaxed">
            A private space for your thoughts, reflections, and journey of
            self-discovery. Write freely, explore deeply, and find clarity in
            your words.
          </p>
        </section>

        <StatsSection
          totalEntries={totalEntries}
          writingStreak={writingStreak}
          wordsWritten={totalWords}
        />

        <section className="mb-12">
          <MediumEditor />
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-serif font-semibold text-primary">
              Recent Reflections
            </h3>
            <div className="flex space-x-2">
              {/* <Button
                variant="outline"
                size="sm"
                className="px-4 py-2 text-sm font-medium text-charcoal hover:text-primary transition-colors duration-200 border border-accent/20 rounded-full hover:border-primary/30"
              >
                <Heart className="h-4 w-4 mr-2" />
                All Moods
              </Button> */}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-8 shadow-sm border border-accent/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <div className="space-y-2 mb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-serif font-semibold text-primary mb-2">
                  Start Your Journey
                </h4>
                <p className="text-charcoal/60 max-w-md mx-auto">
                  Your personal sanctuary awaits. Write your first journal entry
                  and begin exploring your thoughts and feelings.
                </p>
              </div>
              <Button
                onClick={() => setIsComposeOpen(true)}
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Write Your First Entry
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {posts.slice(0, visibleCount).map((post) => (
                  <EntryCard
                    key={post.id}
                    post={post}
                    onReadMore={handleReadMore}
                    onEdit={handleEdit}
                  />
                ))}
              </div>

              {visibleCount < posts.length && (
                <div className="text-center py-8">
                  <Button
                    variant="outline"
                    className="px-8 py-3 text-primary border border-primary/30 rounded-full hover:bg-primary hover:text-white transition-all duration-200 font-medium"
                    onClick={() => setVisibleCount((prev) => prev + 4)}
                  >
                    Load More Reflections
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Button
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={handleComposeClose}
        editingPost={editingPost}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['user-posts', user?.username],
          });
        }}
      />

      <ReadingModal
        isOpen={isReadingOpen}
        onClose={() => setIsReadingOpen(false)}
        post={selectedPost}
        onEdit={handleEdit}
      />

      <footer className="mt-24 border-t border-accent/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h4 className="text-xl font-serif text-primary">
              Your Journey Continues
            </h4>
            <p className="text-charcoal/60 max-w-2xl mx-auto">
              Every entry is a step forward in your story. Keep writing, keep
              growing, keep discovering the beautiful complexity of being human.
            </p>
            <div className="flex justify-center space-x-6 pt-6">
              <a href="https://saweria.co/ariqzhd" target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-charcoal/50 hover:text-primary transition-colors duration-200"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </footer>
      {!user && !isUserLoading && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-4">
            Welcome, Guest 👋
          </h2>
          <p className="text-charcoal/70 max-w-md mb-6">
            Please log in to start writing your thoughts and explore your
            personal sanctuary.
          </p>
          <Button
            className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium"
            onClick={() => (window.location.href = "/login")}
          >
            Login to Continue
          </Button>
        </div>
      )}
    </div>
  );
}
