import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  GraduationCap,
  Shield,
  Heart
} from 'lucide-react';

const Home = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const FeatureCard = ({ icon, title, description, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/60 hover:border-indigo-300/50 hover:shadow-2xl transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
        
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight className="text-indigo-600" size={20} />
        </div>
      </div>
    </motion.div>
  );

  const features = [
    {
      icon: <BookOpen size={28} />,
      title: 'Share Academic Resources',
      description: 'Access and contribute to a vast library of study materials, textbooks, and course notes curated by CUNY students.'
    },
    {
      icon: <Lightbulb size={28} />,
      title: 'Easy to Use',
      description: 'The easiest way for CUNY students to swap notes, resources, and support.'
    },
    {
      icon: <Users size={28} />,
      title: 'Collaborate & Innovate',
      description: 'Don’t study alone — join the CUNY Share community that’s built for students, by students'
    }
  ];

  const stats = [
    { number: '25+', label: 'CUNY Campuses' },
    { number: '50K+', label: 'Active Members' },
    { number: '100K+', label: 'Resources Shared' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      {/* Hero Section */}
      <section className="relative py-28 px-4 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16"
        >
          <motion.div variants={fadeInUp} className="lg:w-1/2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white" size={20} />
              </div>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                CUNY Official Platform
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connect with the{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CUNY Community
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of students and alumni across all CUNY campuses to share resources, 
              collaborate on projects, and build your professional network in one unified platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:shadow-lg border border-gray-200/60 transition-all duration-300"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-200/60"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:w-1/2 relative"
          >
          
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Join <span className="text-indigo-600">CUNY Share</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the power of connected learning.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.2}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Join?
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
            Become part of the largest connected academic community in New York City. 
          </p>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 shadow-lg"
            >
              Create Your Free Account
              <ArrowRight size={20} />
            </Link>
          </motion.div>
          
          
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <span className="text-xl font-bold">CUNY Share</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting CUNY students and alumni across all campuses for a brighter academic future.
              </p>
            </div>
            
            {[
              {
                title: 'Navigation',
                links: ['Home', 'About', 'Contact', 'Resources']
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Code of Conduct']
              },
              {
                title: 'Support',
                links: ['Help Center', 'Campus Resources', 'Contact Support']
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={`/${link.toLowerCase().replace(' ', '-')}`}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} CUNY Share. Made with <Heart size={14} className="inline text-red-400" /> for CUNY students.
            </p>
            <div className="flex items-center gap-6 text-gray-400">
              <span>Follow us:</span>
              <div className="flex gap-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="hover:text-white transition-colors duration-200"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;