import styles from "./site-logo.module.css";

export function SiteLogo() {
  return (
    <span className={styles.logo}>
      <span className={styles.mark} aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      <span className={styles.wordmark}>proteinhaltig<span>.de</span></span>
    </span>
  );
}
