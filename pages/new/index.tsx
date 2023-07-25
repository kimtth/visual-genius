import type { NextPage } from "next";
import styles from "./index.module.css";
import Header from "../../components/header/header";
import NewSidePanel from "../../components/sidepanel/newsidepanel";

const NewPage: NextPage = () => {

  return (
    <>
      <Header />
      <NewSidePanel />
      <img
        className={styles.freWelcomeScreenSimple}
        alt=""
        src="/fre--welcome-screen-simple.svg"
      />
      <div className={styles.label4}>Card previews appear here</div>
    </>
  );
};

export default NewPage;
