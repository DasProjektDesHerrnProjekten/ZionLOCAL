import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { fetchStudents, queryWithRetry, deleteStudentViolations, deleteStudentExamResult, deleteStudent } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';

interface StudentRecord {
  id: string;
  admissionId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  examsTaken: number;
  averageScore: number;
  password?: string;
  age?: number;
  gender?: string;
  school?: string;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const StudentsPage = () => {
  useDocumentTitle('Manage Students');
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchData = async () => {
          const data = await fetchStudents();
          if (!data || data.length === 0) {
            throw new Error('No students found');
          }
          return data;
        };

        const studentsData = await queryWithRetry(fetchData);
        setStudents(studentsData);
      } catch (err) {
        console.error('Failed to load students:', err);
        setError('Failed to load students. Using sample data.');
        
        // Set sample data
        setStudents([
          {
            id: '1',
            admissionId: 'STD001',
            name: 'John Doe',
            class: '10A',
            section: 'A',
            rollNumber: '23',
            email: 'john.doe@example.com',
            status: 'active',
            examsTaken: 3,
            averageScore: 85
          },
          // Add more sample data as needed
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleForgiveStudent = async (student: StudentRecord) => {
    if (!confirm(`Are you sure you want to forgive ${student.name}? This will delete all their violation records and allow them to retake exams.`)) {
      return;
    }

    try {
      // Delete all violations for this student
      await deleteStudentViolations(student.admissionId);
      
      // Delete exam results to allow retaking
      const examId = student.class.toLowerCase().includes('natural') ? 'chemistry-2018-natural' : 'english-euee-2018';
      await deleteStudentExamResult(student.admissionId, examId);
      
      toast({
        title: 'Student Forgiven',
        description: `${student.name} has been forgiven and can now retake exams.`,
      });
      
      // Refresh the students list
      const fetchData = async () => {
        const data = await fetchStudents();
        return data || [];
      };
      const studentsData = await queryWithRetry(fetchData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error forgiving student:', error);
      toast({
        title: 'Error',
        description: 'Failed to forgive student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStudent = async (student: StudentRecord) => {
    if (!confirm(`⚠️ WARNING: You are about to permanently delete ${student.name} (Admission ID: ${student.admissionId}) from the database. This action cannot be undone and will remove all student data, exam results, and violation records. Are you absolutely sure?`)) {
      return;
    }

    try {
      await deleteStudent(student.admissionId);
      
      toast({
        title: 'Student Deleted',
        description: `${student.name} has been permanently deleted from the database.`,
        variant: 'destructive',
      });
      
      // Refresh the students list
      const fetchData = async () => {
        const data = await fetchStudents();
        return data || [];
      };
      const studentsData = await queryWithRetry(fetchData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No students found in the database.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add students through the Supabase dashboard or import them from a file.
        </p>
      </div>
    );
  }

  const getStatusStyles = (status: StudentRecord['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'suspended':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'inactive':
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage all registered students</p>
          
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Admission ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Class</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Exams</th>
                {admin.role === 'superadmin' && (
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Password</th>
                )}
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr 
                  key={student.id} 
                  className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-secondary px-2 py-1 rounded text-sm text-foreground">{student.admissionId}</code>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {student.class} - {student.section}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {student.class.toLowerCase().includes('natural') ? 'chemistry-2018-natural' : 'english-euee-2018'}
                  </td>
                  {admin.role === 'superadmin' && (
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <span className="font-mono text-sm bg-secondary/50 px-2 py-1 rounded">
                          {student.password ? '••••••••' : 'N/A'}
                        </span>
                        <div className="absolute z-10 hidden group-hover:block bg-card border border-border p-2 rounded shadow-lg text-sm">
                          {student.password || 'No password set'}
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusStyles(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <MoreVertical size={16} className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye size={14} className="mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        {admin.role === 'superadmin' && (
                          <DropdownMenuItem 
                            className="cursor-pointer text-blue-600"
                            onClick={() => handleForgiveStudent(student)}
                          >
                            <UserCheck size={14} className="mr-2" /> Forgive Student
                          </DropdownMenuItem>
                        )}
                        {admin.role === 'superadmin' && (
                          <DropdownMenuItem 
                            className="cursor-pointer text-destructive"
                            onClick={() => handleDeleteStudent(student)}
                          >
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
