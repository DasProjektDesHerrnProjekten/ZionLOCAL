import { useState, useEffect } from 'react';
import { Tag, History, Save, AlertCircle, CheckCircle, GitBranch, Calendar } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getAppVersion, updateAppVersion } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface VersionHistory {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changes: string[];
}

const VersionManagementPage = () => {
  useDocumentTitle('Version Management');
  const { admin } = useAdminAuth();

  const [currentVersion, setCurrentVersion] = useState<string>('2.0.0');
  const [newVersion, setNewVersion] = useState<string>('2.0.0');
  const [changeNotes, setChangeNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);

  // Load current version and history
  useEffect(() => {
    const loadVersionData = async () => {
      try {
        setIsLoading(true);
        const version = await getAppVersion();
        setCurrentVersion(version);
        setNewVersion(version);

        // Mock version history - in real app, this would come from database
        setVersionHistory([
          {
            version: '2.0.0',
            updatedAt: new Date().toISOString(),
            updatedBy: admin?.name || 'System',
            changes: ['Major version update', 'Enhanced user interface', 'Improved performance', 'New features added']
          },
          {
            version: '1.5.2',
            updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedBy: 'System',
            changes: ['Bug fixes', 'Security improvements', 'Performance optimizations']
          },
          {
            version: '1.5.0',
            updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updatedBy: 'System',
            changes: ['New features added', 'UI improvements', 'Mobile responsiveness']
          },
          {
            version: '1.0.0',
            updatedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            updatedBy: 'System',
            changes: ['Initial release', 'Core functionality', 'User authentication']
          }
        ]);
      } catch (error) {
        console.error('Error loading version data:', error);
        toast.error('Failed to load version information');
      } finally {
        setIsLoading(false);
      }
    };

    loadVersionData();
  }, [admin]);

  const handleVersionUpdate = async () => {
    if (!newVersion.trim()) {
      toast.error('Version cannot be empty');
      return;
    }

    if (newVersion === currentVersion) {
      toast.error('New version must be different from current version');
      return;
    }

    // Basic version validation
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(newVersion)) {
      toast.error('Version must be in format: x.x.x (e.g., 1.0.1)');
      return;
    }

    try {
      setIsUpdating(true);
      const result = await updateAppVersion(newVersion.trim());

      if (result.success) {
        setCurrentVersion(newVersion);
        toast.success(`Version updated to ${newVersion}`);

        // Add to history
        const newHistoryEntry: VersionHistory = {
          version: newVersion,
          updatedAt: new Date().toISOString(),
          updatedBy: admin?.name || 'Unknown',
          changes: changeNotes.split('\n').filter(note => note.trim())
        };

        setVersionHistory(prev => [newHistoryEntry, ...prev]);
        setChangeNotes('');
      } else {
        toast.error(result.message || 'Failed to update version');
      }
    } catch (error) {
      console.error('Error updating version:', error);
      toast.error('Failed to update version');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading version information...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Version Management</h1>
        <p className="text-muted-foreground mt-1">Manage and update application version information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Version & Update */}
        <div className="space-y-6">
          {/* Current Version Card */}
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Current Version</h2>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-primary mb-2">{currentVersion}</div>
              <p className="text-sm text-muted-foreground">Currently active version</p>
            </div>
          </div>

          {/* Update Version Card */}
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Update Version</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="version" className="text-sm font-medium text-foreground block mb-2">
                  New Version Number
                </label>
                <input
                  id="version"
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="e.g., 1.0.1"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={isUpdating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use semantic versioning: Major.Minor.Patch (e.g., 1.0.1)
                </p>
              </div>

              <div>
                <label htmlFor="changes" className="text-sm font-medium text-foreground block mb-2">
                  Change Notes (Optional)
                </label>
                <textarea
                  id="changes"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="List the changes in this version..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  disabled={isUpdating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  One change per line (optional)
                </p>
              </div>

              <button
                onClick={handleVersionUpdate}
                disabled={isUpdating || !newVersion.trim() || newVersion === currentVersion}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Save size={18} />
                )}
                {isUpdating ? 'Updating Version...' : 'Update Version'}
              </button>
            </div>
          </div>
        </div>

        {/* Version History */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Version History</h2>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {versionHistory.map((entry, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">v{entry.version}</span>
                    {entry.version === currentVersion && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(entry.updatedAt)}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">
                    Updated by <span className="font-medium text-foreground">{entry.updatedBy}</span>
                  </p>
                </div>

                {entry.changes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Changes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {entry.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {versionHistory.length === 0 && (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No version history available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version Guidelines */}
      <div className="mt-8 bg-secondary/20 border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Version Guidelines</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Major Version (X.0.0)</h4>
            <p className="text-sm text-muted-foreground">
              Breaking changes, major new features, or significant architectural changes.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Minor Version (0.X.0)</h4>
            <p className="text-sm text-muted-foreground">
              New features that are backward compatible, or significant improvements.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Patch Version (0.0.X)</h4>
            <p className="text-sm text-muted-foreground">
              Bug fixes, security updates, and small improvements that don't change functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionManagementPage;
