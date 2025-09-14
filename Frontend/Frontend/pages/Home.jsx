import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Connect with the <span className="text-indigo-600">CUNY Community</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Share resources, collaborate on projects, and build your network with students and alumni across all CUNY campuses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-indigo-700 transition-colors shadow-md"
              >
                Get Started - It's Free
              </Link>
              <Link
                to="/about"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://illustrations.popsy.co/amber/student.svg" 
              alt="Students collaborating"
              className="w-full h-auto max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Join CUNY Share?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Share Resources',
                description: 'Access and share study materials, textbooks, and course notes with students in your program.'
              },
              {
                icon: '👥',
                title: 'Build Your Network',
                description: 'Connect with students and alumni across all CUNY campuses to expand your professional network.'
              },
              {
                icon: '💡',
                title: 'Collaborate on Projects',
                description: 'Find team members for class projects or startup ideas from different CUNY schools.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to join the CUNY community?</h2>
          <p className="text-xl mb-8 opacity-90">
            Sign up now and start connecting with thousands of students and alumni across all CUNY campuses.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CUNY Share</h3>
            <p className="text-gray-400">
              Connecting CUNY students and alumni across all campuses.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} CUNY Share. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;