import { useEffect, useState } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { BookOpen, User, DollarSign, Calendar, Mail, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoteList = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = res.data;
      setProducts(Array.isArray(data.products) ? data.products : data.products || data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = (p) => {
    const sellerId = p.seller?._id || p.seller;
    return String(sellerId) === String(user?._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete listing?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(prev => prev.filter(x => x._id !== id));
      toast.success('Deleted');
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Delete failed');
    }
  };

  const handleEdit = (p) => {
    navigate(`/product/edit/${p._id}`, { state: { product: p } });
  };

  const openContact = (p) => {
    setSelectedProduct(p);
    setMessageText(`Hi, I'm interested in your "${p.title}" listing.`);
    setShowContact(true);
  };

  const sendContact = async () => {
    if (!selectedProduct || !messageText.trim()) return;
    setSending(true);
    try {
      const to = selectedProduct.sellerEmail || selectedProduct.seller?.email;
      if (!to) {
        const mailto = `mailto:?subject=Inquiry about ${encodeURIComponent(selectedProduct.title)}&body=${encodeURIComponent(messageText)}`;
        window.location.href = mailto;
      } else {
        // attempt backend send-email if available, else mailto
        try {
          await axios.post('/api/send-email', {
            to,
            from: user?.email,
            subject: `Inquiry about ${selectedProduct.title}`,
            text: messageText
          }, { headers: { Authorization: `Bearer ${token}` } });
          toast.success('Message sent');
        } catch (err) {
          const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(`Inquiry about ${selectedProduct.title}`)}&body=${encodeURIComponent(messageText)}`;
          window.location.href = mailto;
        }
      }
      setShowContact(false);
    } catch (err) {
      console.error('Contact error', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campus Marketplace</h1>
        <button onClick={() => navigate('/upload')} className="px-4 py-2 bg-indigo-600 text-white rounded">List Item</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div>No listings</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded shadow overflow-hidden">
              <div className="h-48 bg-gray-100">
                {p.images && p.images[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <BookOpen size={48} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <User size={14} className="mr-2" />
                    <span>{p.sellerUsername || p.seller?.username || 'Seller'}</span>
                  </div>
                  <div className="text-green-700 font-bold">
                    <DollarSign size={14} className="inline mr-1" />
                    {p.price ? `$${p.price}` : 'Free'}
                  </div>
                </div>

                <div className="mt-4 flex gap-3 items-center">
                  <button onClick={() => openContact(p)} className="text-indigo-600">Contact</button>
                  {isOwner(p) && (
                    <>
                      <button onClick={() => handleEdit(p)} className="text-yellow-600">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact modal */}
      {showContact && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Contact Seller</h3>
              <button onClick={() => setShowContact(false)}>Close</button>
            </div>
            <div className="p-4">
              <p className="mb-2">About: <strong>{selectedProduct.title}</strong></p>
              <textarea value={messageText} onChange={e => setMessageText(e.target.value)} className="w-full h-40 border p-2" />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowContact(false)} className="px-3 py-2">Cancel</button>
              <button onClick={sendContact} className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;