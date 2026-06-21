import PropTypes from 'prop-types';
import styles from './NotificationBanner.module.css';

/**
 * @param {{ alerts: Array<{ type: string; message: string }> }} props
 */
export function NotificationBanner({ alerts = [] }) {
  if (!alerts.length) return null;

  return (
    <div className={styles.banner} role="alert">
      {alerts.map((alert) => (
        <div key={alert.type} className={`${styles.alert} ${styles[alert.type]}`}>
          {alert.message}
        </div>
      ))}
    </div>
  );
}

NotificationBanner.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    }),
  ),
};
