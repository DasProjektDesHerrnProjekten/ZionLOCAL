import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const GradesPage = () => {
  const navigate = useNavigate();
  const { student } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!student) {
      navigate('/login');
    }
  }, [student, navigate]);

  // Sample grade data - in a real app this would come from an API
  const subjects = [
    {
      name: 'Mathematics',
      grades: {
        'C/W': 95,
        'H/W': 88,
        'G/W': 92,
        'P': 96,
        'PR': 85,
        'AS': 94,
        'PRO': 91,
        'F/T': 87
      }
    },
    {
      name: 'English',
      grades: {
        'C/W': 92,
        'H/W': 96,
        'G/W': 89,
        'P': 94,
        'PR': 91,
        'AS': 95,
        'PRO': 97,
        'F/T': 93
      }
    },
    {
      name: 'Physics',
      grades: {
        'C/W': 87,
        'H/W': 92,
        'G/W': 95,
        'P': 89,
        'PR': 84,
        'AS': 91,
        'PRO': 96,
        'F/T': 94
      }
    },
    {
      name: 'Chemistry',
      grades: {
        'C/W': 96,
        'H/W': 88,
        'G/W': 93,
        'P': 97,
        'PR': 95,
        'AS': 89,
        'PRO': 92,
        'F/T': 86
      }
    },
    {
      name: 'Biology',
      grades: {
        'C/W': 93,
        'H/W': 97,
        'G/W': 88,
        'P': 91,
        'PR': 96,
        'AS': 94,
        'PRO': 89,
        'F/T': 95
      }
    },
    {
      name: 'History',
      grades: {
        'C/W': 89,
        'H/W': 92,
        'G/W': 96,
        'P': 85,
        'PR': 91,
        'AS': 94,
        'PRO': 97,
        'F/T': 88
      }
    }
  ];

  // Calculate overall percentage
  const calculateOverallPercentage = () => {
    let totalScore = 0;
    let totalComponents = 0;

    subjects.forEach(subject => {
      Object.values(subject.grades).forEach(score => {
        totalScore += score;
        totalComponents++;
      });
    });

    return (totalScore / totalComponents).toFixed(1);
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Grades</h1>
            <div className="w-24"></div> {/* For balance */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* GPA Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Overall Percentage</h2>
                <p className="text-blue-100">Semester Performance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{calculateOverallPercentage()}%</div>
              <div className="text-blue-100">Out of 100</div>
            </div>
          </div>
        </div>

        {/* Grade Components Legend */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Components</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">C/W:</span>
              <span className="text-gray-600">Class Work</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">H/W:</span>
              <span className="text-gray-600">Home Work</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">G/W:</span>
              <span className="text-gray-600">Group Work</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">P:</span>
              <span className="text-gray-600">Class Participation</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">PR:</span>
              <span className="text-gray-600">Practice</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">AS:</span>
              <span className="text-gray-600">Assignment</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">PRO:</span>
              <span className="text-gray-600">Project Work</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-12">F/T:</span>
              <span className="text-gray-600">Field Trip</span>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Subject Grades</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    C/W
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    H/W
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    G/W
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AS
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRO
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F/T
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject, index) => {
                  const average = Object.values(subject.grades).reduce((sum, score) => {
                    return sum + score;
                  }, 0) / Object.values(subject.grades).length;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        </div>
                      </td>
                      {Object.entries(subject.grades).map(([key, score]) => (
                        <td key={key} className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {score}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {average.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 mr-3" />
            <h3 className="text-lg font-semibold">Performance Insights</h3>
          </div>
          <p className="text-green-100 leading-relaxed">
            Your academic performance shows consistent improvement across all subjects. Focus on maintaining strong performance
            in Group Work and Assignments to achieve even higher grades. Keep up the excellent work!
          </p>
        </div>
      </main>
    </div>
  );
};

export default GradesPage;
