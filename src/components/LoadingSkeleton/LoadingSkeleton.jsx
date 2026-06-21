import PropTypes from 'prop-types';
import styles from './LoadingSkeleton.module.css';

/**
 * Placeholder skeleton for loading states.
 * @param {{ variant?: 'card' | 'chart' | 'detail' | 'text' }} props
 */
export function LoadingSkeleton({ variant = 'card' }) {
  return <div className={`${styles.skeleton} ${styles[variant]}`} aria-hidden="true" />;
}

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(['card', 'chart', 'detail', 'text']),
};
