import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnderMaintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted text-center px-4">
      <Construction className="w-20 h-20 text-primary mb-6" />
      <h1 className="text-3xl md:text-4xl font-bold mb-4">We're Under Maintenance</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Sorry for the inconvenience. This feature is under maintenance at the moment.
        The Features will be back online shortly!
      </p>
      <Button variant="outline" onClick={() => location.reload()}>
        Try Again
      </Button>
    </div>
  );
}
