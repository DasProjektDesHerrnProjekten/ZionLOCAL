import { useEffect, useState } from 'react';
import { fetchStudents } from '@/lib/supabase';
import { Loader2, User } from 'lucide-react';

// Define the Student type based on the data structure from Supabase
type Student = {
  id: string;
  admissionId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  email?: string;
  phone?: string;
  status?: string;
  examsTaken?: number;
  averageScore?: number;
};

export const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();
        console.log('Fetched students:', data); // Debug log
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    (student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (student.admissionId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (student.rollNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {filteredStudents.length > 0 ? (
          <ul className="space-y-1 px-2">
            {filteredStudents.map((student) => (
              <li 
                key={student.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                title={`${student.name} (${student.admissionId})`}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{student.name || 'Unnamed Student'}</p>
                    {student.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.class || 'N/A'} - {student.section || 'N/A'} • {student.rollNumber || 'N/A'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No students found
          </div>
        )}
      </div>
    </div>
  );
};
