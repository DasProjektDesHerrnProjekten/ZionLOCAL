import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { motion } from 'framer-motion';

const Header = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  // Don't render anything if there's no student
  if (!student) return null;

  return (
    <header className="bg-primary text-primary-foreground shadow-elevated animate-fade-in">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="ZionExams Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">ZioniansExams Portal</h1>
              <p className="text-xs text-primary-foreground/70">Excellence in Assessment</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-primary-foreground/70 text-xs">Student Name</span>
                <span className="font-semibold">{student.name || 'N/A'}</span>
              </div>
              <div className="w-px h-8 bg-primary-foreground/20" />
              <div className="flex flex-col items-end">
                <span className="text-primary-foreground/70 text-xs">Class & Section</span>
                <span className="font-semibold">
                  {student.class ? `${student.class} - ` : ''}{student.section || 'N/A'}
                </span>
              </div>
              <div className="w-px h-8 bg-primary-foreground/20" />
              <div className="flex flex-col items-end">
                <span className="text-primary-foreground/70 text-xs">Roll Number</span>
                <span className="font-semibold">{student.roll_number}</span>
              </div>
              <div className="w-px h-8 bg-primary-foreground/20" />
              <div className="flex flex-col items-end">
                <span className="text-primary-foreground/70 text-xs">Admission No</span>
                <span className="font-semibold">{student.admission_id}</span>
              </div>
            </div>
          </div>

          {/* Mobile Student Info */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2"
              onClick={navigateToProfile}
            >
              <User size={16} />
              <span className="text-sm font-medium">{student.name || 'Student'}</span>
            </motion.button>
          </div>

          {/* User and Logout */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-200 rounded-lg px-3 py-2"
              onClick={navigateToProfile}
            >
              <User size={18} />
              <span className="text-sm font-medium">{student.name?.split(' ')[0] || 'User'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>

        </div>

        {/* Mobile Student Details */}
        <div className="md:hidden mt-3 pt-3 border-t border-primary-foreground/20 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-primary-foreground/70">Class:</span>{' '}
            <span className="font-semibold">
              {student.class ? `${student.class} - ` : ''}{student.section || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-primary-foreground/70">Roll:</span>{' '}
            <span className="font-semibold">{student.roll_number}</span>
          </div>
          <div className="col-span-2">
            <span className="text-primary-foreground/70">Admission No:</span>{' '}
            <span className="font-semibold">{student.admission_id}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
