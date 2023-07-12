import type { NextPage } from "next";
import { Input } from "@chakra-ui/react";
import { SiMicrosoftbing } from 'react-icons/si';
import styles from "./header.module.css";

const Header: NextPage = () => {
    return (
        <header className={styles.navheader}>
            <div className={styles.headerButtonRegion}>
                <div className={styles.buttonBadgeButtonBadge}>
                    <div className={styles.persona}>
                        <img
                            className={styles.personaContainerIcon}
                            alt=""
                            src="/personacontainer.svg"
                        />
                    </div>
                </div>
            </div>
            <div className={styles.staticContainerWaffleName}>
                <div className={styles.waffleWaffle}>
                </div>
                <div className={styles.productNameStack}>
                    <SiMicrosoftbing />
                    <div className={styles.stringProductName}>ImagiGenius: Communication Assistant</div>
                </div>
            </div>
            <Input
                className={styles.o365ShellSearchSearch}
                bg='white'
                color='gray'
                variant="outline"
                placeholder="Search"
                size='sm'
            />
        </header>
    )
}

export default Header;