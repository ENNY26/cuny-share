import React, { useState, useRef, useEffect } from 'react';

const SwipeCard = ({ item, onSwipe }) => {
  const ref = useRef();
  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0, isDragging: false });
  const pointerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `translate(0px,0px) rotate(0deg)`;
  }, [item]);

  const onPointerDown = (e) => {
    e.preventDefault();
    pointerRef.current = e.pointerId;
    e.target.setPointerCapture(pointerRef.current);
    startRef.current = { x: e.clientX, y: e.clientY };
    setPos(p => ({ ...p, isDragging: true }));
  };

  const onPointerMove = (e) => {
    if (!pointerRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const rot = Math.max(-20, Math.min(20, dx / 10));
    setPos({ x: dx, y: dy, rot, isDragging: true });
  };

  const endDrag = (e) => {
    if (!pointerRef.current) return;
    const dx = pos.x;
    const threshold = 120;
    const dir = dx > threshold ? 'right' : dx < -threshold ? 'left' : 'reset';

    if (dir === 'right') {
      // animate off-screen to right
      setPos(p => ({ ...p, x: window.innerWidth * 1.2, rot: 30, isDragging: false }));
      setTimeout(() => onSwipe('right', item), 200);
    } else if (dir === 'left') {
      setPos(p => ({ ...p, x: -window.innerWidth * 1.2, rot: -30, isDragging: false }));
      setTimeout(() => onSwipe('left', item), 200);
    } else {
      // reset
      setPos({ x: 0, y: 0, rot: 0, isDragging: false });
    }

    try { e.target.releasePointerCapture(pointerRef.current); } catch (err) {}
    pointerRef.current = null;
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{
        touchAction: 'none',
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg)`,
        transition: pos.isDragging ? 'none' : 'transform 180ms ease',
        willChange: 'transform',
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden border">
        {item.images && item.images[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-72 object-cover" />
        ) : (
          <div className="w-full h-72 flex items-center justify-center bg-gray-100">No image</div>
        )}

        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
            </div>
            <div className="text-green-700 font-bold">${item.price || 0}</div>
          </div>

          <div className="mt-3 text-xs text-gray-500 flex justify-between">
            <div>{item.sellerUsername || item.seller?.username || 'Seller'}</div>
            <div>{new Date(item.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SwipeDeck = ({ items = [], onSwipeAction }) => {
  const [stack, setStack] = useState(items);

  useEffect(() => setStack(items), [items]);

  const handleSwipe = (dir, item) => {
    // remove top item
    setStack(prev => prev.filter(i => i._id !== item._id));
    if (onSwipeAction) onSwipeAction(dir, item);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-md h-[80vh]">
        {stack.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">No more listings</div>
          </div>
        )}

        {stack.slice(0).reverse().map((item, idx) => (
          <div
            key={item._id}
            style={{ zIndex: 100 + idx }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <SwipeCard item={item} onSwipe={handleSwipe} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeDeck;