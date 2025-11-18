import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  BookOpen, 
  BookText, 
  MessageSquare,
  LogOut,
  Settings,
  Bell,
  Sparkles,
  Share,
  Share2Icon
} from 'lucide-react';
import ProfileIcon from '../components/ProfileIcon';

const MainHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  };

  const FeatureCard = ({ icon, title, description, onClick, badge, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl cursor-pointer transition-all duration-300 backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            {icon}
          </div>
          {badge && (
            <span className="inline-flex items-center rounded-full border border-transparent bg-gradient-to-r from-blue-500 to-purple-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              {badge}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>
    </motion.div>
  );

  const featureCards = [
    {
      icon: <Upload size={24} />,
      title: "Upload Notes",
      description: "Share your study materials with classmates and build your academic reputation",
      path: '/upload-note',
      delay: 0.1
    },
    {
      icon: <BookOpen size={24} />,
      title: "View Notes",
      description: "Access comprehensive study materials curated by top students in your courses",
      path: '/notes',
      delay: 0.2
    },
    {
      icon: <BookText size={24} />,
      title: "Textbook Exchange",
      description: "Buy, sell, or trade textbooks with verified students in your institution",
      path: '/textbooks',
      delay: 0.3
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Study Forum",
      description: "Engage in academic discussions, ask questions, and collaborate with peers",
      path: '/forum',
      delay: 0.4
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">CUNY Share</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/upload-note')}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + List Item
            </button>
            <ProfileIcon />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Share size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  CunyShare
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Your academic companion
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-xl h-10 w-10 text-sm font-medium transition-colors bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <Settings size={20} />
              </button>
              <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 text-sm font-medium transition-colors bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
              </button>
            </div>
          </motion.header>

          {/* Welcome Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="relative inline-block mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-4">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg" />
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user?.username || 'Scholar'}
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-black-300 max-w-2xl mx-auto leading-relaxed"
            >
              Ready to elevate your academic journey? Explore resources, connect with peers, and achieve excellence.
            </motion.p>
          </motion.section>

          {/* Features Grid */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <AnimatePresence>
              {featureCards.map((card, index) => (
                <FeatureCard
                  key={card.title}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  badge={card.badge}
                  delay={card.delay}
                  onClick={() => navigate(card.path)}
                />
              ))}
            </AnimatePresence>
          </motion.section>

          {/* Stats Section 
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-sm mb-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Notes Shared", value: "1.2K+" },
                { label: "Active Users", value: "5.7K+" },
                { label: "Courses", value: "240+" },
                { label: "Satisfaction", value: "98%" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="p-4"
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
*/}
          {/* Footer Action */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </button>
          </motion.footer>
        </div>
      </main>
    </div>
  );
};

export default MainHome;