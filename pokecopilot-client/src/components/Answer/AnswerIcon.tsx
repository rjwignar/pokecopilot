import { Sparkle28Filled } from "@fluentui/react-icons";
import pokecopilot from "../../assets/favicon.png";
import styles from "../../pages/layout/Layout.module.css";
export const AnswerIcon = () => {
  return (
    <img
      src={pokecopilot}
      aria-hidden="true"
      aria-label="Pokécopilot logo"
      className={styles.pokecopilotLogo}
    />
  );
};
