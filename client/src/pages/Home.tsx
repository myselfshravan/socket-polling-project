import React from "react";
import { Users, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { usePoll } from "../context/PollContext";

const Home: React.FC = () => {
  const { setUser } = usePoll();

  const selectRole = (role: "teacher" | "student") => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === "teacher" ? "Dr. Smith" : "Student",
      role: role,
    };
    setUser(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Real-time Interactive Polling</span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LivePoll
              </span>
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
              Create engaging polls, gather instant feedback, and make
              data-driven decisions with our modern real-time polling platform
              designed for educators and learners.
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Student Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    I'm a Student
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    Join live polls, share your opinions, and see real-time
                    results. Participate actively in your learning experience.
                  </p>
                </div>
                <button
                  onClick={() => selectRole("student")}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-5 rounded-2xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                >
                  <span>Join as Student</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    I'm a Teacher
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    Create engaging polls, manage live sessions, and analyze
                    student responses with comprehensive real-time analytics.
                  </p>
                </div>
                <button
                  onClick={() => selectRole("teacher")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                >
                  <span>Start as Teacher</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 text-center">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Real-time Results
                </h4>
                <p className="text-gray-600 text-sm">
                  See live updates as responses come in
                </p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Easy Participation
                </h4>
                <p className="text-gray-600 text-sm">
                  Simple interface for seamless interaction
                </p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Instant Insights
                </h4>
                <p className="text-gray-600 text-sm">
                  Get immediate feedback and analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
