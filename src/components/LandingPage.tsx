import { Button } from './ui/button';
import { Leaf, TrendingDown, Award, BarChart3, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const teamMembers = [
    { name: 'Vanita Bhoj', role: 'Project Lead' },
    { name: 'Pankaj Singh Bora', role: 'Frontend Developer' },
    { name: 'Ajay Singh', role: 'Database' },
    { name: 'Saksham Bartwal', role: 'Machine Learning Models' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-2xl shadow-xl">
                <Leaf className="size-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-blue-900 mb-4">
              Green Supply Chain & Carbon Footprint Tracker
            </h1>
            <p className="text-blue-700 max-w-2xl mx-auto mb-8">
              Monitor, measure, and reduce the environmental impact of your supply chains with real-time tracking, 
              CO₂ emission calculations, and actionable sustainability insights.
            </p>

            {/* CTA Button */}
            <Button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-center text-blue-900 mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <TrendingDown className="size-6 text-blue-700" />
              </div>
              <h3 className="text-blue-900 mb-2">CO₂ Tracking</h3>
              <p className="text-blue-600">
                Automatic emission calculations based on vehicle type, fuel, and distance
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MapPin className="size-6 text-blue-700" />
              </div>
              <h3 className="text-blue-900 mb-2">Live Tracking</h3>
              <p className="text-blue-600">
                Real-time shipment tracking on interactive maps with location updates
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="size-6 text-blue-700" />
              </div>
              <h3 className="text-blue-900 mb-2">Analytics</h3>
              <p className="text-blue-600">
                Comprehensive insights into emission trends and supplier performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Award className="size-6 text-blue-700" />
              </div>
              <h3 className="text-blue-900 mb-2">Gamification</h3>
              <p className="text-blue-600">
                EcoPoints and leaderboards to encourage sustainable shipping choices
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="size-8" />
            </div>
            <h2 className="text-white mb-2">Our Team</h2>
            <p className="text-blue-100">Meet the brilliant minds behind this project</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="bg-white/20 size-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-white mb-1">{member.name}</h3>
                  <p className="text-blue-200">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-600">
            © 2024 Green Supply Chain Tracker. Building a sustainable future, one shipment at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}