import React, { useState } from 'react';
import axios from '../src/api/axios';
import { X } from 'lucide-react';

const ChatModal = ({ product, user, token, onClose }) => {
  const [text, setText] = useState(`Hi, I'm interested in your "${product.title}". Is it still available?`);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const payload = {
        recipient: product.seller || (product.seller?._id),
        text,
        // backend messageController expects 'textbook' field for context — send product id
        textbook: product._id
      };
      await axios.post('/api/messages', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // optionally open conversation view, for now close and inform user
      onClose();
      alert('Message sent — check Messages');
    } catch (err) {
      console.error('Send message error', err);
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <div className="font-semibold">{product.sellerUsername || product.seller?.username || 'Seller'}</div>
            <div className="text-xs text-gray-500">Message about: {product.title}</div>
          </div>
          <button onClick={onClose} className="text-gray-600"><X /></button>
        </div>

        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full border rounded p-2 resize-none"
          />
        </div>

        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
          <button onClick={handleSend} disabled={sending} className="px-4 py-2 bg-indigo-600 text-white rounded">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;