import PropTypes from 'prop-types';
import styles from './CityComparison.module.css';

/** @param {{ cities: Array }} props */
export function CityComparison({ cities = [] }) {
  return (
    <section className={styles.section} aria-label="Şəhər müqayisəsi">
      <h3 className={styles.title}>Şəhər Müqayisəsi</h3>
      <p className={styles.placeholder}>
        {cities.length < 2
          ? 'Müqayisə üçün ən azı 2 şəhər əlavə edin'
          : `${cities.length} şəhər — müqayisə paneli tezliklə`}
      </p>
    </section>
  );
}

CityComparison.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.object),
};
