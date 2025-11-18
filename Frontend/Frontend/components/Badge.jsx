const Badge = ({ badge, size = 'sm' }) => {
  if (!badge || badge === 'none') return null;

  const badgeConfig = {
    bronze: { color: 'bg-amber-600', text: 'Bronze', icon: '🥉' },
    silver: { color: 'bg-gray-400', text: 'Silver', icon: '🥈' },
    gold: { color: 'bg-yellow-500', text: 'Gold', icon: '🥇' },
    platinum: { color: 'bg-purple-500', text: 'Platinum', icon: '💎' }
  };

  const config = badgeConfig[badge] || badgeConfig.bronze;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.color} text-white rounded-full font-semibold ${sizeClasses[size]}`}
      title={`${config.text} Seller`}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};

export default Badge;

