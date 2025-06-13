interface StatsSectionProps {
  totalEntries: number;
  writingStreak: number;
  wordsWritten: number;
}

export function StatsSection({ totalEntries, writingStreak, wordsWritten }: StatsSectionProps) {
  const formatWordsWritten = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-accent/10 mb-8">
      <div className="flex items-center justify-center space-x-8">
        <div className="text-center">
          <div className="text-2xl font-serif font-semibold text-primary mb-1">
            {totalEntries}
          </div>
          <div className="text-xs text-charcoal/70 font-medium">Journal Entries</div>
        </div>
        
        <div className="w-px h-8 bg-accent/20"></div>
        
        <div className="text-center">
          <div className="text-2xl font-serif font-semibold text-secondary mb-1">
            {writingStreak}
          </div>
          <div className="text-xs text-charcoal/70 font-medium">Day Writing Streak</div>
        </div>
        
        <div className="w-px h-8 bg-accent/20"></div>
        
        <div className="text-center">
          <div className="text-2xl font-serif font-semibold text-warm-pink mb-1">
            {formatWordsWritten(wordsWritten)}
          </div>
          <div className="text-xs text-charcoal/70 font-medium">Words Written</div>
        </div>
      </div>
    </div>
  );
}
