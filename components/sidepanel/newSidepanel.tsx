import type { NextPage } from "next";
import { Input, Button, InputGroup, InputRightElement } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import styles from "./header.module.css";

const newSidePanel: NextPage = () => {
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
                    {/* <div className={styles.stringIcon}></div> */}
                </div>
                <div className={styles.productNameStack}>
                    <div className={styles.stringProductName}>Product name</div>
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

export default newSidePanel;