import { useState, useEffect } from 'react';
import axios from '../src/api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import Note from '../src/assets/note.png';
import {
  Heart,
  Bookmark,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  Search,
  X,
  BookOpen,
  GraduationCap,
  User,
  Clock,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const FilePreviewModal = ({ note, isOpen, onClose }) => {
  if (!isOpen || !note) return null;

  const docs = [
    {
      uri: note.fileUrl,
      fileType: note.fileUrl.split('.').pop().toLowerCase()
    }
  ];

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-[90vw] max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold truncate">{note.subject}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
            aria-label="Close preview"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: false,
                disableFileName: false,
                retainURLParams: false
              }
            }}
            style={{ height: '80vh', width: '100%' }}
          />
        </div>

        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-600">
            {note.fileUrl.split('.').pop().toUpperCase()} file
          </p>
        </div>
      </div>
    </div>
  );
};

const NoteCard = ({ note, onSave, onLike, onDelete, onEdit, onView, isOwner, isSaved, isLiked, index }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    onView(note);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(note._id, isSaved);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(note._id);
  };

  const fileExtension = note.fileUrl?.split('.').pop()?.toLowerCase() || 'file';
  const supportedPreview = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];
  const canPreview = supportedPreview.includes(fileExtension);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 relative cursor-pointer group"
        onClick={() => setPreviewOpen(true)}
      >
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all ${
            isSaved 
              ? 'bg-indigo-500 text-white shadow-md' 
              : 'bg-white text-gray-400 shadow-sm hover:bg-gray-100'
          }`}
        >
          <Bookmark className={isSaved ? "fill-current" : ""} size={16} />
        </motion.button>

        {isOwner && (
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 bg-white text-gray-400 rounded-full shadow-sm hover:bg-gray-100 border border-gray-300"
            >
              <MoreVertical size={16} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(note);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="h-48 overflow-hidden bg-gray-100 relative">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <img src={Note} size={48} className="text-gray-400" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <p className="text-white text-sm line-clamp-2">
              {note.description || 'No description available'}
            </p>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-2">
            {note.subject}
          </h2>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-3 flex items-center">
              <User className="mr-1" size={14} /> {note.professor || 'Unknown'}
            </span>
            <span className="flex items-center">
              <BookOpen className="mr-1" size={14} /> {note.level}
            </span>
            <span className="flex items-center">
              <GraduationCap className="mr-1" size={14} /> {note.courseNumber || 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              {note.uploaderUsername || 'Anonymous'}
            </span>
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                note.likes?.length > 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-100'
              } hover:bg-red-100 transition-colors`}
            >
              <Heart className={isLiked ? "fill-current text-red-500" : ""} size={14} />
              <span>{note.likes?.length || 0}</span>
            </motion.button>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <Eye size={14} className="mr-1" />
              <span>{note.views || 0}</span>
            </div>
            
            <div className="flex space-x-2">
              {canPreview && (
                <button
                  onClick={handleView}
                  className="flex items-center text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  <Eye size={12} className="mr-1" />
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <FilePreviewModal
        note={note}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
};

const NoteList = () => {
    const navigate = useNavigate();
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    subjects: [],
    professors: [],
    schools: [],
    levels: []
  });

  const [filters, setFilters] = useState({
    sortBy: 'recent',
    search: '',
    subject: '',
    professor: '',
    school: '',
    level: ''
  });

  useEffect(() => {
    fetchNotes();
    if (token) {
      fetchSavedNotes();
    }
  }, [selectedTab, token]);

  useEffect(() => {
    filterNotes();
  }, [notes, filters, selectedTab, savedNotes]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = '/api/notes';
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Handle both response formats
      const notesData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setNotes(notesData);
      
      // Extract available filter options from notes
      extractFilterOptions(notesData);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Failed to load notes. Please try again.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (notesData) => {
    const subjects = new Set();
    const professors = new Set();
    const schools = new Set();
    const levels = new Set();

    notesData.forEach(note => {
      if (note.subject) subjects.add(note.subject);
      if (note.professor) professors.add(note.professor);
      if (note.school) schools.add(note.school);
      if (note.level) levels.add(note.level);
    });

    setAvailableFilters({
      subjects: Array.from(subjects).sort(),
      professors: Array.from(professors).sort(),
      schools: Array.from(schools).sort(),
      levels: Array.from(levels).sort()
    });
  };

  const fetchSavedNotes = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/notes/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle both response formats
      const savedNotesData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setSavedNotes(savedNotesData.map(note => note._id) || []);
    } catch (err) {
      console.error('Error fetching saved notes:', err);
    }
  };

  const handleSave = async (noteId, isCurrentlySaved) => {
    if (!token) {
      toast('Please login to save notes', {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        }
      });
      return;
    }

    try {
      const res = await axios.post(
        `/api/notes/${noteId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (isCurrentlySaved) {
        setSavedNotes(prev => prev.filter(id => id !== noteId));
      } else {
        setSavedNotes(prev => [...prev, noteId]);
      }

      toast.success(isCurrentlySaved ? 'Note unsaved' : 'Note saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
    }
  };

  const handleLike = async (noteId) => {
    if (!token) {
      toast('Please login to like notes', {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        }
      });
      return;
    }

    try {
      const res = await axios.post(
        `/api/notes/${noteId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(prevNotes =>
        prevNotes.map(note =>
          note._id === noteId
            ? {
                ...note,
                likes: res.data.likes,
                isLiked: res.data.likes.includes(user?.id),
              }
            : note
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to like note');
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      setSavedNotes(prev => prev.filter(id => id !== noteId));
      
      toast.success('Note deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleView = async (note) => {
    try {
      const fileKey = note.fileKey || extractKeyFromUrl(note.fileUrl);
      const res = await axios.get(`/api/s3/presigned/${fileKey}`);
      const presignedUrl = res.data.url;

      setSelectedNote({ ...note, fileUrl: presignedUrl });
      setPreviewOpen(true);

      await axios.get(`/api/notes/${note._id}/view`);
      setNotes(prev =>
        prev.map(n => (n._id === note._id ? { ...n, views: (n.views || 0) + 1 } : n))
      );
    } catch (err) {
      toast.error('Could not preview file');
    }
  };

  const handleEdit = (note) => {
    toast.info('Edit functionality would open here');
  };

  const extractKeyFromUrl = (url) => {
    try {
      const parts = url.split('/');
      return parts.slice(3).join('/');
    } catch (err) {
      console.error('Failed to extract key from URL');
      return '';
    }
  };

  const filterNotes = () => {
    let result = [...notes];

    if (selectedTab === 'my-uploads') {
      result = result.filter(note => {
        let uploaderId = note.uploader?._id || note.uploader;
        return String(uploaderId) === String(user?._id);
      });
    } else if (selectedTab === 'saved') {
      result = result.filter(note => savedNotes.includes(note._id));
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(note => 
        note.subject?.toLowerCase().includes(searchTerm) ||
        note.professor?.toLowerCase().includes(searchTerm) ||
        note.school?.toLowerCase().includes(searchTerm) ||
        note.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply field filters
    if (filters.subject) {
      result = result.filter(note => note.subject === filters.subject);
    }
    if (filters.professor) {
      result = result.filter(note => note.professor === filters.professor);
    }
    if (filters.school) {
      result = result.filter(note => note.school === filters.school);
    }
    if (filters.level) {
      result = result.filter(note => note.level === filters.level);
    }

    // Apply sorting
    if (filters.sortBy === 'popular') {
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (filters.sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredNotes(result);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'recent',
      search: '',
      subject: '',
      professor: '',
      school: '',
      level: ''
    });
  };

  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden h-80 animate-pulse"
            >
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Study Notes</h1>
          <p className="text-gray-600">Find and share notes with your classmates</p>
        </div>

     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  <motion.div 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white p-4 rounded-xl shadow-sm flex items-center cursor-pointer hover:shadow-md transition-all"
    onClick={() => navigate('/upload-note')}
  >
    <div className="p-3 bg-blue-100 rounded-lg mr-4 text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </div>
    <div>
      <p className="text-gray-500 text-sm">Upload Materials</p>
      <p className="text-lg font-semibold">Share Notes</p>
    </div>
  </motion.div>

  <motion.div 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white p-4 rounded-xl shadow-sm flex items-center cursor-pointer hover:shadow-md transition-all"
    onClick={() => navigate('/textbooks')}
  >
    <div className="p-3 bg-purple-100 rounded-lg mr-4 text-purple-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div>
      <p className="text-gray-500 text-sm">Find Textbooks</p>
      <p className="text-lg font-semibold">Get Books</p>
    </div>
  </motion.div>

  <motion.div 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white p-4 rounded-xl shadow-sm flex items-center cursor-pointer hover:shadow-md transition-all"
    onClick={() => navigate('/textbooks/upload')}
  >
    <div className="p-3 bg-green-100 rounded-lg mr-4 text-green-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <p className="text-gray-500 text-sm">Upload Textbooks</p>
      <p className="text-lg font-semibold">Sell Books</p>
    </div>
  </motion.div>

  <motion.div 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white p-4 rounded-xl shadow-sm flex items-center cursor-pointer hover:shadow-md transition-all"
    onClick={() => navigate('/textbooks')}
  >
    <div className="p-3 bg-amber-100 rounded-lg mr-4 text-amber-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
    <div>
      <p className="text-gray-500 text-sm">Textbook Listings</p>
      <p className="text-lg font-semibold">Browse</p>
    </div>
  </motion.div>
</div>

        <div className="flex border-b border-gray-200 mb-6">
          {['all', 'saved', 'my-uploads'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-4 font-medium ${selectedTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'all' ? 'All Notes' : tab === 'saved' ? 'Saved Notes' : 'My Uploads'}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes by subject, professor, school..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter size={18} />
              Filters
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Views</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          </div>

          {/* Expanded filters section */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => updateFilter('subject', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Subjects</option>
                  {availableFilters.subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <select
                  value={filters.professor}
                  onChange={(e) => updateFilter('professor', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Professors</option>
                  {availableFilters.professors.map(professor => (
                    <option key={professor} value={professor}>{professor}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <select
                  value={filters.school}
                  onChange={(e) => updateFilter('school', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Schools</option>
                  {availableFilters.schools.map(school => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => updateFilter('level', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Levels</option>
                  {availableFilters.levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* Display active filters */}
        {(filters.subject || filters.professor || filters.school || filters.level) && (
          <div className="bg-blue-50 p-3 rounded-lg mb-6 flex items-center flex-wrap gap-2">
            <span className="text-sm text-blue-800 font-medium">Active filters:</span>
            
            {filters.subject && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Subject: {filters.subject}
                <button 
                  onClick={() => updateFilter('subject', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            
            {filters.professor && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Professor: {filters.professor}
                <button 
                  onClick={() => updateFilter('professor', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            
            {filters.school && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                School: {filters.school}
                <button 
                  onClick={() => updateFilter('school', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            
            {filters.level && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Level: {filters.level}
                <button 
                  onClick={() => updateFilter('level', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <motion.button
              onClick={fetchNotes}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-md transition-all"
            >
              Retry
            </motion.button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <img src={Note} size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">
              {selectedTab === 'saved'
                ? "You haven't saved any notes yet"
                : selectedTab === 'my-uploads'
                ? "You haven't uploaded any notes yet"
                : 'No notes available yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNotes.map((note, index) => {
              const uploaderId = note.uploader?._id || note.uploader;
              const isOwner = String(uploaderId) === String(user?._id);

              return (
                <NoteCard
                  key={note._id}
                  note={note}
                  onSave={handleSave}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onView={handleView}
                  isOwner={isOwner}
                  isSaved={savedNotes.includes(note._id)}
                  isLiked={note.likes?.includes(user?._id)}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </div>

      <FilePreviewModal
        note={selectedNote}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default NoteList;