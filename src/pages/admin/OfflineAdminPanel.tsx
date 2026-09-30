// Offline Admin Panel for managing exam availability and student access
// Works without internet connection using local storage
// Includes exam provisioning workflow for offline deployment

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getOfflineDatabase, OfflineExamResult, OfflineStudent } from '@/lib/offline-db';
import { getOfflineExamLoader } from '@/lib/offline-exam-loader';
import { Exam } from '@/data/exams';
import { exams as allExams } from '@/data/exams';

// Simple hash function for offline password verification
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

interface OfflineAdminPanelProps {
  onClose?: () => void;
}

export default function OfflineAdminPanel({ onClose }: OfflineAdminPanelProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<OfflineStudent[]>([]);
  const [examAccess, setExamAccess] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'students' | 'results' | 'provision' | 'settings'>('exams');
  const [results, setResults] = useState<OfflineExamResult[]>([]);
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [provisioningStatus, setProvisioningStatus] = useState('');
  const [passwordResetStudent, setPasswordResetStudent] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load exams from local cache first
      const examLoader = await getOfflineExamLoader();
      const loadedExams = await examLoader.loadAllExams();
      setExams(loadedExams);

      // Load students
      const db = await getOfflineDatabase();
      const loadedStudents = await db.getAllStudents();

      // Automatically set default password for students without one
      for (const student of loadedStudents) {
        const studentWithHash = await db.getStudent(student.student_id);
        if (studentWithHash && !(studentWithHash as any).password_hash) {
          console.log(`🔧 Setting default password for student ${student.student_id}`);
          const defaultPassword = 'password123';
          const passwordHash = await hashPassword(defaultPassword);
          await db.updateStudentPassword(student.student_id, passwordHash);
          console.log(`✅ Default password set for ${student.name} (ID: ${student.student_id})`);
        }
      }

      // Reload students after setting passwords
      const updatedStudents = await db.getAllStudents();
      setStudents(updatedStudents);

      // Load exam access
      const accessMap: Record<string, Record<string, boolean>> = {};
      for (const student of updatedStudents) {
        const accessibleExams = await db.getStudentAccessibleExams(student.student_id);
        accessMap[student.student_id] = {};
        for (const examId of accessibleExams) {
          accessMap[student.student_id][examId] = true;
        }
      }
      setExamAccess(accessMap);

      // Load results
      const loadedResults = await db.getAllExamResults();
      setResults(loadedResults);

    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExamStatus = async (examId: string, currentStatus: string) => {
    try {
      const db = await getOfflineDatabase();
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      
      // Update exam metadata in database
      const exam = exams.find(e => e.id === examId);
      if (exam) {
        await db.cacheExamMetadata(examId, {
          ...exam,
          status: newStatus
        });
      }
      
      // Update local state
      setExams(exams.map(e => 
        e.id === examId ? { ...e, status: newStatus } : e
      ));
      
      console.log(`✅ Exam ${examId} status changed to ${newStatus}`);
    } catch (error) {
      console.error('Failed to toggle exam status:', error);
    }
  };

  const grantAccess = async (studentId: string, examId: string) => {
    try {
      const db = await getOfflineDatabase();
      await db.grantExamAccess(studentId, examId);
      
      setExamAccess(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [examId]: true
        }
      }));
      
      console.log(`✅ Granted access to ${examId} for student ${studentId}`);
    } catch (error) {
      console.error('Failed to grant access:', error);
    }
  };

  const revokeAccess = async (studentId: string, examId: string) => {
    try {
      const db = await getOfflineDatabase();
      await db.revokeExamAccess(studentId, examId);
      
      setExamAccess(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [examId]: false
        }
      }));
      
      console.log(`✅ Revoked access to ${examId} for student ${studentId}`);
    } catch (error) {
      console.error('Failed to revoke access:', error);
    }
  };

  const addStudent = async (studentData: Omit<OfflineStudent, 'id' | 'created_at'>, password: string) => {
    try {
      const db = await getOfflineDatabase();

      // Hash the password before storing
      const passwordHash = await hashPassword(password);

      await db.addStudent({
        ...studentData,
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      } as any);

      await loadData();
      console.log(`✅ Added student ${studentData.name} with hashed password`);
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const cacheExamForOffline = async (exam: Exam) => {
    try {
      const loader = await getOfflineExamLoader();
      await loader.cacheExam(exam);
      
      const db = await getOfflineDatabase();
      await db.cacheExamMetadata(exam.id, {
        ...exam,
        status: exam.status || 'active',
        version: '1.0',
        exam_data: JSON.stringify(exam)
      });
      
      console.log(`✅ Cached exam ${exam.id} for offline use`);
    } catch (error) {
      console.error('Failed to cache exam:', error);
      throw error;
    }
  };

  const provisionExamPackage = async () => {
    try {
      setProvisioningStatus('Provisioning exam package...');
      
      const db = await getOfflineDatabase();
      const loader = await getOfflineExamLoader();
      
      // Cache selected exams
      for (const examId of selectedExams) {
        const exam = allExams.find(e => e.id === examId);
        if (exam) {
          await cacheExamForOffline(exam);
          setProvisioningStatus(`Caching exam: ${exam.title}...`);
        }
      }
      
      // Grant access to selected students
      for (const studentId of selectedStudents) {
        for (const examId of selectedExams) {
          await db.grantExamAccess(studentId, examId);
        }
        setProvisioningStatus(`Granting access to student ${studentId}...`);
      }
      
      // Reload data
      await loadData();
      
      setProvisioningStatus('✅ Exam package provisioned successfully!');
      setTimeout(() => setProvisioningStatus(''), 3000);
      
      // Clear selections
      setSelectedExams(new Set());
      setSelectedStudents(new Set());
      
    } catch (error) {
      console.error('Failed to provision exam package:', error);
      setProvisioningStatus('❌ Failed to provision exam package');
      setTimeout(() => setProvisioningStatus(''), 3000);
    }
  };

  const exportResults = async () => {
    try {
      const db = await getOfflineDatabase();
      const data = db.exportDatabase();
      
      // Create download
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-results-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Results exported successfully');
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  };

  const importResults = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const db = await getOfflineDatabase();
      await db.importDatabase(uint8Array);

      await loadData();
      console.log('✅ Results imported successfully');
    } catch (error) {
      console.error('Failed to import results:', error);
    }
  };

  const resetStudentPassword = async (studentId: string, password: string) => {
    try {
      if (!password || password.length < 1) {
        console.error('❌ Password cannot be empty');
        return;
      }

      const db = await getOfflineDatabase();
      const passwordHash = await hashPassword(password);
      console.log(`🔐 Setting password for student ${studentId}, hash: ${passwordHash.substring(0, 10)}...`);

      await db.updateStudentPassword(studentId, passwordHash);

      // Verify the update
      const student = await db.getStudent(studentId);
      console.log(`🔍 Student after update:`, student);

      setPasswordResetStudent(null);
      setNewPassword('');
      console.log(`✅ Password reset for student ${studentId}`);
      await loadData(); // Reload data to refresh the list
    } catch (error) {
      console.error('❌ Failed to reset password:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Offline Admin Panel</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded ${activeTab === 'exams' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Exams ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded ${activeTab === 'students' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded ${activeTab === 'results' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('provision')}
            className={`px-4 py-2 rounded ${activeTab === 'provision' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Provision
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'exams' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Availability</h2>
            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-gray-600">
                      {exam.subject} • {exam.duration} min • {exam.totalQuestions} questions
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {exam.status || 'active'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleExamStatus(exam.id, exam.status || 'active')}
                    className={`px-4 py-2 rounded ${
                      exam.status === 'active' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}
                  >
                    {exam.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Student Access Management</h2>
            
            {/* Add Student Form */}
            <div className="mb-6 p-4 border rounded">
              <h3 className="font-semibold mb-2">Add New Student</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addStudent({
                  student_id: formData.get('student_id') as string,
                  name: formData.get('name') as string,
                  stream: formData.get('stream') as 'natural' | 'social' | 'both',
                  grade: formData.get('grade') as string
                }, formData.get('password') as string);
                e.currentTarget.reset();
              }} className="grid grid-cols-2 gap-4">
                <input
                  name="student_id"
                  placeholder="Student ID"
                  required
                  className="px-3 py-2 border rounded"
                />
                <input
                  name="name"
                  placeholder="Full Name"
                  required
                  className="px-3 py-2 border rounded"
                />
                <select
                  name="stream"
                  required
                  className="px-3 py-2 border rounded"
                >
                  <option value="natural">Natural Science</option>
                  <option value="social">Social Science</option>
                  <option value="both">Both Streams</option>
                </select>
                <input
                  name="grade"
                  placeholder="Grade (e.g., 12)"
                  required
                  className="px-3 py-2 border rounded"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="col-span-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Student
                </button>
              </form>
            </div>

            {/* Student List with Access Control */}
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.id} className="p-4 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">
                        ID: {student.student_id} • {student.stream} • Grade {student.grade}
                      </p>
                    </div>
                    <button
                      onClick={() => setPasswordResetStudent(student.student_id)}
                      className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Set Password
                    </button>
                  </div>

                  {passwordResetStudent === student.student_id && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-sm font-medium mb-2">Set new password for {student.name}:</p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded"
                        />
                        <button
                          onClick={() => resetStudentPassword(student.student_id, newPassword)}
                          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setPasswordResetStudent(null);
                            setNewPassword('');
                          }}
                          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Exam Access:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {exams.map(exam => (
                        <div key={exam.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{exam.title}</span>
                          <button
                            onClick={() => {
                              const hasAccess = examAccess[student.student_id]?.[exam.id];
                              if (hasAccess) {
                                revokeAccess(student.student_id, exam.id);
                              } else {
                                grantAccess(student.student_id, exam.id);
                              }
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              examAccess[student.student_id]?.[exam.id]
                                ? 'bg-red-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}
                          >
                            {examAccess[student.student_id]?.[exam.id] ? 'Revoke' : 'Grant'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Exam Results</h2>
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export Results
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Import Results:</label>
              <input
                type="file"
                accept=".db"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importResults(file);
                }}
                className="px-3 py-2 border rounded"
              />
            </div>

            <div className="space-y-4">
              {results.map(result => (
                <div key={result.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{result.student_name}</h3>
                      <p className="text-sm text-gray-600">
                        {result.exam_title} • {result.completed_at ? new Date(result.completed_at).toLocaleString() : 'In progress'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{result.percentage.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">
                        {result.score}/{result.total_marks}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'provision' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Provisioning</h2>
            <p className="text-sm text-gray-600 mb-6">
              Select exams and students to provision for offline use. This will cache exam data locally and grant access to selected students.
            </p>

            {provisioningStatus && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">{provisioningStatus}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Exam Selection */}
              <div>
                <h3 className="font-semibold mb-3">Select Exams</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allExams.map(exam => (
                    <div key={exam.id} className="flex items-center p-2 border rounded">
                      <input
                        type="checkbox"
                        id={`exam-${exam.id}`}
                        checked={selectedExams.has(exam.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedExams);
                          if (e.target.checked) {
                            newSelected.add(exam.id);
                          } else {
                            newSelected.delete(exam.id);
                          }
                          setSelectedExams(newSelected);
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`exam-${exam.id}`} className="text-sm">
                        {exam.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <h3 className="font-semibold mb-3">Select Students</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center p-2 border rounded">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.has(student.student_id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedStudents);
                          if (e.target.checked) {
                            newSelected.add(student.student_id);
                          } else {
                            newSelected.delete(student.student_id);
                          }
                          setSelectedStudents(newSelected);
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`student-${student.id}`} className="text-sm">
                        {student.name} ({student.student_id})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={provisionExamPackage}
                disabled={selectedExams.size === 0 || selectedStudents.size === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Provision Exam Package ({selectedExams.size} exams, {selectedStudents.size} students)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            
            <div className="space-y-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">Database Management</h3>
                <div className="space-x-2">
                  <button
                    onClick={async () => {
                      const db = await getOfflineDatabase();
                      await db.clearDatabase();
                      await loadData();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Clear All Data
                  </button>
                  <button
                    onClick={exportResults}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Backup Database
                  </button>
                </div>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">Exam Cache</h3>
                <button
                  onClick={async () => {
                    const loader = await getOfflineExamLoader();
                    await loader.clearCache();
                    await loadData();
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Clear Exam Cache
                </button>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">System Information</h3>
                <div className="text-sm space-y-1">
                  <p>Exams loaded: {exams.length}</p>
                  <p>Students registered: {students.length}</p>
                  <p>Results recorded: {results.length}</p>
                  <p>Mode: Offline</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}