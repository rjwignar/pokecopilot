import { Outlet, NavLink, Link } from "react-router-dom";

import github from "../../assets/github.svg";
import pokecopilot from "../../assets/favicon.png";
import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header} role={"banner"}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.headerTitleContainer}>
            <img
              src={pokecopilot}
              alt="Pokécopilot logo"
              aria-label="Pokécopilot logo"
              className={styles.pokecopilotLogo}
            />
            <h3 className={styles.headerTitle}>Pokécopilot</h3>
          </Link>
          {/* <h4 className={styles.headerRightText}>CosmicWorks</h4> */}
          <a
            href="https://github.com/rjwignar/pokecopilot"
            target={"_blank"}
            title="Github repository link"
          >
            <img
              src={github}
              alt="Github logo"
              aria-label="Link to github repository"
              width="20px"
              height="20px"
              className={styles.githubLogo}
            />
          </a>
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default Layout;
