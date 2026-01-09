import React from 'react';
import { motion, Variants } from 'framer-motion';

interface QueueAnimProps {
  children?: React.ReactNode;
  type?: 'left' | 'right' | 'top' | 'bottom' | 'scale' | 'alpha' | string[] | string;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  component?: any;
  [key: string]: any;
}

const getVariants = (type: string): Variants => {
  const distance = 100;
  switch (type) {
    case 'top':
      return {
        hidden: { opacity: 0, y: -distance },
        visible: { opacity: 1, y: 0 },
      };
    case 'bottom':
      return {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0 },
      };
    case 'left':
      return {
        hidden: { opacity: 0, x: -distance },
        visible: { opacity: 1, x: 0 },
      };
    case 'right':
      return {
        hidden: { opacity: 0, x: distance },
        visible: { opacity: 1, x: 0 },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
      };
    case 'alpha':
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
  }
};

const QueueAnim: React.FC<QueueAnimProps> = ({
  children,
  type = 'right',
  delay = 0,
  duration = 500,
  className,
  style,
  component: Component = 'div',
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);
  const animType = Array.isArray(type) ? type[0] : type;
  const baseVariants = getVariants(animType);

  // Determine the motion component
  // If Component is a string (e.g., 'div'), motion.div is safer if motion[Component] exists.
  // Otherwise use motion(Component).
  const MotionComponent = (motion as any)[Component] || motion(Component);

  return (
    <MotionComponent
      className={className}
      style={style}
      {...props}
    >
      {childrenArray.map((child, index) => {
        const itemDelay = (delay + index * 100) / 1000;
        const itemDuration = duration / 1000;

        return (
          <motion.div
            key={(child as any).key || index}
            initial={baseVariants.hidden as any}
            animate={baseVariants.visible as any}
            transition={{
              delay: itemDelay,
              duration: itemDuration,
              ease: 'backOut',
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </MotionComponent>
  );
};

export default QueueAnim;
