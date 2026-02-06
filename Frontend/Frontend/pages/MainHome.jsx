import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Eye, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

const MainHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/10">
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CUNY Share</h1>
          </div>
        </motion.header>

        {/* Welcome Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl mx-auto">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            Welcome back,{" "}
            <span className="text-indigo-600">
              {user?.username || 'Student'}
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 max-w-lg mx-auto"
          >
            Discover amazing deals or list your items on CUNY Share
          </motion.p>
        </motion.section>

        {/* Action Cards */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md mx-auto space-y-4 mb-12"
        >
          {/* Create Listing Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/upload-note')}
            className="group cursor-pointer"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md">
                    <Upload size={24} />
                  </div>
                  <ChevronRight className="text-indigo-400 group-hover:text-indigo-600 transition-colors" size={20} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Create Listing
                </h3>
                <p className="text-gray-600 text-sm">
                  Sell your textbooks, furniture, electronics, and more to fellow students
                </p>
              </div>
            </div>
          </motion.div>

          {/* View Listings Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/notes')}
            className="group cursor-pointer"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                    <Eye size={24} />
                  </div>
                  <ChevronRight className="text-blue-400 group-hover:text-blue-600 transition-colors" size={20} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Browse Listings
                </h3>
                <p className="text-gray-600 text-sm">
                  Discover amazing deals from students across all campuses
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-gray-400">
          Campus Marketplace • Connect, Buy, Sell
        </p>
      </footer>
    </div>
  );
};

export default MainHome;