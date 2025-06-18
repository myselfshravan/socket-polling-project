import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const Home: React.FC = () => {
  const { setUser, currentUser } = useUser();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return;
    }

    const user = {
      id: uuidv4(),
      name: trimmedName,
      role
    };

    // setUser will handle saving to localStorage
    setUser(user);
    toast({
      title: 'Welcome!',
      description: `Logged in as ${role === 'teacher' ? 'a teacher' : 'a student'}`,
    });

    // Redirect to appropriate dashboard
    navigate(role === 'teacher' ? '/teacher' : '/student');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Live Polling Platform</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as 'teacher' | 'student')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="cursor-pointer">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="cursor-pointer">Teacher</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
