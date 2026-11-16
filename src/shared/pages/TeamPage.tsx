import styles from './pages.module.css';
import team from './team.json';

export function TeamPage() {
  return (
    <div className={styles.page}>
      <h1>Equipe</h1>
      <ul className={styles.team}>
        {team.map((member) => (
          <li key={member.rm + member.name} className={styles.member}>
            <h2>{member.name}</h2>
            <p>{member.rm}</p>
            <p>{member.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
