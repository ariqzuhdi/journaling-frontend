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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-accent/10">
        <div className="text-center">
          <div className="text-3xl font-serif font-semibold text-primary mb-2">
            {totalEntries}
          </div>
          <div className="text-sm text-charcoal/70 font-medium">Journal Entries</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-accent/10">
        <div className="text-center">
          <div className="text-3xl font-serif font-semibold text-secondary mb-2">
            {writingStreak}
          </div>
          <div className="text-sm text-charcoal/70 font-medium">Day Writing Streak</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-accent/10">
        <div className="text-center">
          <div className="text-3xl font-serif font-semibold text-warm-pink mb-2">
            {formatWordsWritten(wordsWritten)}
          </div>
          <div className="text-sm text-charcoal/70 font-medium">Words Written</div>
        </div>
      </div>
    </div>
  );
}
