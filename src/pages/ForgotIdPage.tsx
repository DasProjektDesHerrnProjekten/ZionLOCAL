import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ForgotIdPage = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+251 ');
  const [isLoading, setIsLoading] = useState(false);
  const [admissionId, setAdmissionId] = useState<string | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldNavigate) {
      navigate('/');
      setShouldNavigate(false);
    }
  }, [shouldNavigate, navigate]);

  const handlePhoneChange = (value: string) => {
    // Only allow numbers and backspace
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // If it starts with 0, replace with +251
    if (numericValue.startsWith('0')) {
      setPhoneNumber('+251 ' + numericValue.substring(1));
    } 
    // If it doesn't start with 251, add +251
    else if (!numericValue.startsWith('251') && numericValue.length > 0) {
      setPhoneNumber('+251 ' + numericValue);
    }
    // If it starts with 251, format it as +251
    else if (numericValue.startsWith('251')) {
      setPhoneNumber('+251 ' + numericValue.substring(3));
    }
    // Otherwise, just update the value
    else {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the phone number - remove all non-numeric characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    // Ensure the phone number has the country code for the database query
    const searchPhone = cleanPhone.startsWith('251') ? cleanPhone : 
                       cleanPhone.startsWith('0') ? '251' + cleanPhone.substring(1) :
                       '251' + cleanPhone;

    if (!name.trim() || !searchPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both name and phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First try exact match with the full phone number including country code
      let { data: students, error } = await supabase
        .from('students')
        .select('admission_id, full_name, phone')
        .ilike('full_name', `%${name.trim()}%`)
        .eq('phone', searchPhone);

      // If no exact match, try with just the last 9 digits (without country code)
      if (!students?.length) {
        const lastNineDigits = searchPhone.slice(-9);
        
        const { data } = await supabase
          .from('students')
          .select('admission_id, full_name, phone')
          .ilike('full_name', `%${name.trim()}%`)
          .like('phone', `%${lastNineDigits}`);
        
        if (data?.length) {
          students = data;
        }
      }

      // If still no match, try a broader search
      if (!students?.length) {
        const { data: sampleData } = await supabase
          .from('students')
          .select('full_name, phone')
          .limit(5);
        
        toast({
          title: 'No Match Found',
          description: 'No student found with the provided details. Please check your name and phone number.',
          variant: 'destructive',
        });
        setAdmissionId(null);
        return;
      }

      if (error) {
        throw error;
      }

      if (!students || students.length === 0) {
        toast({
          title: 'No Match Found',
          description: 'No student found with the provided name and phone number.',
          variant: 'destructive',
        });
        setAdmissionId(null);
        return;
      }

      // If we find a match, show the admission ID
      const student = students[0];
      setAdmissionId(student.admission_id);
      
      toast({
        title: 'Admission ID Found',
        description: 'Your admission ID has been retrieved successfully.',
      });
      
    } catch (error) {
      console.error('Error retrieving admission ID:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while retrieving your admission ID. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-gold/5 via-background to-brand-gold/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 animate-scale-in">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
            </button>
            <h1 className="text-2xl font-bold mb-1">Forgot Admission ID</h1>
            <p className="text-muted-foreground text-sm">
              Enter your name and phone number to retrieve your admission ID
            </p>
          </div>

          {admissionId ? (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Your Admission ID is:</p>
                <p className="text-xl font-mono font-bold text-primary">{admissionId}</p>
              </div>
              <button
                onClick={() => setShouldNavigate(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name (as registered)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number (as registered)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="9XXXXXXXX"
                  inputMode="numeric"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Find My Admission ID'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotIdPage;
