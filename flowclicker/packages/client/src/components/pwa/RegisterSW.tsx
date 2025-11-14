import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { RefreshCw, X } from 'lucide-react';

/**
 * RegisterSW Component
 * Handles service worker registration and auto-updates
 * Shows a toast notification when an update is available
 */
export function RegisterSW() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('[PWA] Service Worker registered:', registration);

      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hour
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration error:', error);
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline');
    },
    onNeedRefresh() {
      console.log('[PWA] New content available, please refresh');
      setShowUpdatePrompt(true);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = async () => {
    await updateServiceWorker(true);
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <Card glass className="max-w-sm p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Update Available
            </h3>
            <p className="text-xs text-gray-300 mb-3">
              A new version of FlowClicker is available. Reload to update.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="glow"
                onClick={handleUpdate}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Update Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
