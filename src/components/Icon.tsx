import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5', size = 20, ...props }) => {
  // @ts-expect-error - dynamic icon indexing
  const IconComponent = LucideIcons[name] || LucideIcons.Tag;
  return <IconComponent className={className} size={size} {...props} />;
};
