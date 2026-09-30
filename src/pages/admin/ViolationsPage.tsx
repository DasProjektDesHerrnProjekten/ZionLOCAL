import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Monitor, Copy, Clipboard, Maximize, Activity, Loader2 } from 'lucide-react';
import { fetchViolations, getViolationStats, Violation } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const ViolationsPage = () => {
  useDocumentTitle('Violation Logs');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const { toast } = useToast();

  // Fetch violations and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch violations with filters
        const violationsData = await fetchViolations({
          searchQuery: searchQuery || undefined,
          severity: filterSeverity !== 'all' ? filterSeverity : undefined,
          type: filterType !== 'all' ? filterType as any : undefined,
          admin: admin ? { username: admin.username, name: admin.name } : undefined
        });
        
        // Fetch stats
        const statsData = await getViolationStats(admin ? { username: admin.username, name: admin.name } : undefined);
        
        setViolations(violationsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load violations data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce to search
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filterSeverity, filterType, toast, admin]);

  const getViolationIcon = (type: Violation['type']) => {
    switch (type) {
      case 'tab_switch':
        return Monitor;
      case 'copy_attempt':
        return Copy;
      case 'paste_attempt':
        return Clipboard;
      case 'fullscreen_exit':
        return Maximize;
      case 'suspicious_activity':
        return Activity;
      default:
        return AlertTriangle;
    }
  };

  const getViolationLabel = (type: Violation['type']) => {
    switch (type) {
      case 'tab_switch':
        return 'Tab Switch';
      case 'copy_attempt':
        return 'Copy Attempt';
      case 'paste_attempt':
        return 'Paste Attempt';
      case 'fullscreen_exit':
        return 'Fullscreen Exit';
      case 'suspicious_activity':
        return 'Suspicious Activity';
      default:
        return type;
    }
  };

  const getSeverityStyles = (severity: Violation['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const { high: highCount, medium: mediumCount, low: lowCount, total: totalCount } = stats;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Violations</h1>
        <p className="text-muted-foreground mt-1">Monitor and review detected exam violations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
          <p className="text-sm text-muted-foreground">Total Violations</p>
          <p className="text-2xl font-display font-bold text-foreground">{totalCount}</p>
        </div>
        <div className="bg-card border border-destructive/30 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-destructive">High Severity</p>
          <p className="text-2xl font-display font-bold text-destructive">{highCount}</p>
        </div>
        <div className="bg-card border border-warning/30 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-warning">Medium Severity</p>
          <p className="text-2xl font-display font-bold text-warning">{mediumCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <p className="text-sm text-muted-foreground">Low Severity</p>
          <p className="text-2xl font-display font-bold text-muted-foreground">{lowCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Types</option>
          <option value="tab_switch">Tab Switch</option>
          <option value="copy_attempt">Copy Attempt</option>
          <option value="paste_attempt">Paste Attempt</option>
          <option value="fullscreen_exit">Fullscreen Exit</option>
          <option value="suspicious_activity">Suspicious Activity</option>
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Violations List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : violations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No violations found matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Admission ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Violation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {violations.map((violation) => {
                  const ViolationIcon = getViolationIcon(violation.type);
                  return (
                    <tr key={violation.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <ViolationIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{violation.student_name}</div>
                            <div className="text-xs text-muted-foreground">{violation.exam_title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {violation.admission_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ViolationIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-foreground">{getViolationLabel(violation.type)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{violation.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {violation.exam_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityStyles(violation.severity)}`}>
                          {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(violation.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViolationsPage;
