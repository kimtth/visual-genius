import type { NextPage } from "next";
import { Input, Button } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import styles from "./index.module.css";
import Header from "../../components/header/header";

const CatalogPage: NextPage = () => {
  return (
    <>
      <Header />
      <div className={styles.cardVertical}>
        <div className={styles.cardPlaceholderVertical}>
          <div className={styles.personaContainer}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <img
            className={styles.avatarImageIcon}
            alt=""
            src="/avatarimage@2x.png"
          />
          <img
            className={styles.avatarImageIcon1}
            alt=""
            src="/avatarimage1@2x.png"
          />
          <img
            className={styles.avatarImageIcon2}
            alt=""
            src="/avatarimage2@2x.png"
          />
          <div className={styles.ellipseParent}>
            <div className={styles.frameChild} />
            <div className={styles.stringTag}>+9</div>
          </div>
          <div className={styles.bodyContainer}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Different animals</div>
              <div className={styles.stringSubtitle}>
                9 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>2 days ago</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame1.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar}>
              <div className={styles.base1}>
                <div className={styles.base3}>
                  <div className={styles.divider} />
                  <div className={styles.avatarImageContainer} />
                  <img
                    className={styles.avatarImageContainerIcon}
                    alt=""
                    src="/avatarimagecontainer@2x.png"
                  />
                </div>
                <div className={styles.avatarImageContainer1} />
                <img
                  className={styles.initialsContainerIcon}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
              </div>
              <div className={styles.presence}>
                <div className={styles.stringIcon10}></div>
              </div>
              <img
                className={styles.treeEvergreenIcon}
                alt=""
                src="/tree-evergreen.svg"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cardVertical1}>
        <div className={styles.cardPlaceholderVertical}>
          <div className={styles.personaContainer}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <img
            className={styles.avatarImageIcon}
            alt=""
            src="/avatarimage@2x.png"
          />
          <img
            className={styles.avatarImageIcon1}
            alt=""
            src="/avatarimage1@2x.png"
          />
          <img
            className={styles.avatarImageIcon2}
            alt=""
            src="/avatarimage2@2x.png"
          />
          <div className={styles.ellipseParent}>
            <div className={styles.frameChild} />
            <div className={styles.stringTag}>+9</div>
          </div>
          <div className={styles.bodyContainer}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Different animals</div>
              <div className={styles.stringSubtitle}>
                9 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>2 days ago</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame1.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar}>
              <div className={styles.base1}>
                <div className={styles.base3}>
                  <div className={styles.divider} />
                  <div className={styles.avatarImageContainer} />
                  <img
                    className={styles.avatarImageContainerIcon}
                    alt=""
                    src="/avatarimagecontainer@2x.png"
                  />
                </div>
                <div className={styles.avatarImageContainer1} />
                <img
                  className={styles.initialsContainerIcon}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
              </div>
              <div className={styles.presence}>
                <div className={styles.stringIcon10}></div>
              </div>
              <img
                className={styles.treeEvergreenIcon}
                alt=""
                src="/tree-evergreen.svg"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cardVertical2}>
        <div className={styles.cardPlaceholderVertical2}>
          <div className={styles.personaContainer4}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent2}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <div className={styles.bodyContainer2}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Trees</div>
              <div className={styles.stringSubtitle}>
                6 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>Yesterday</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame1.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar}>
              <div className={styles.base1}>
                <div className={styles.base3}>
                  <div className={styles.divider} />
                  <div className={styles.avatarImageContainer} />
                  <img
                    className={styles.avatarImageContainerIcon}
                    alt=""
                    src="/avatarimagecontainer@2x.png"
                  />
                </div>
                <div className={styles.avatarImageContainer5} />
                <img
                  className={styles.initialsContainerIcon}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
              </div>
              <div className={styles.presence}>
                <div className={styles.stringIcon10}></div>
              </div>
              <img
                className={styles.treeEvergreenIcon}
                alt=""
                src="/tree-evergreen1.svg"
              />
            </div>
          </div>
        </div>
        <img
          className={styles.avatarImageIcon6}
          alt=""
          src="/avatarimage3@2x.png"
        />
        <img
          className={styles.avatarImageIcon7}
          alt=""
          src="/avatarimage4@2x.png"
        />
        <img
          className={styles.avatarImageIcon8}
          alt=""
          src="/avatarimage5@2x.png"
        />
        <div className={styles.ellipseContainer}>
          <div className={styles.frameChild} />
          <div className={styles.stringTag}>+3</div>
        </div>
      </div>
      <div className={styles.cardVertical3}>
        <div className={styles.cardPlaceholderVertical2}>
          <div className={styles.personaContainer4}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent2}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <div className={styles.bodyContainer2}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Trees</div>
              <div className={styles.stringSubtitle}>
                6 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>Yesterday</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame1.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar}>
              <div className={styles.base1}>
                <div className={styles.base3}>
                  <div className={styles.divider} />
                  <div className={styles.avatarImageContainer} />
                  <img
                    className={styles.avatarImageContainerIcon}
                    alt=""
                    src="/avatarimagecontainer@2x.png"
                  />
                </div>
                <div className={styles.avatarImageContainer5} />
                <img
                  className={styles.initialsContainerIcon}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
              </div>
              <div className={styles.presence}>
                <div className={styles.stringIcon10}></div>
              </div>
              <img
                className={styles.treeEvergreenIcon}
                alt=""
                src="/tree-evergreen1.svg"
              />
            </div>
          </div>
        </div>
        <img
          className={styles.avatarImageIcon6}
          alt=""
          src="/avatarimage3@2x.png"
        />
        <img
          className={styles.avatarImageIcon7}
          alt=""
          src="/avatarimage4@2x.png"
        />
        <img
          className={styles.avatarImageIcon8}
          alt=""
          src="/avatarimage5@2x.png"
        />
        <div className={styles.ellipseContainer}>
          <div className={styles.frameChild} />
          <div className={styles.stringTag}>+3</div>
        </div>
      </div>
      <article className={styles.cardVertical4}>
        <div className={styles.cardPlaceholderVertical}>
          <div className={styles.personaContainer}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <div className={styles.bodyContainer}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Our feelings</div>
              <div className={styles.stringSubtitle}>
                6 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>Today</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <Button
                  className={styles.delete}
                  variant="ghost"
                  w="20px"
                  colorScheme="teal"
                  rightIcon={<ArrowForwardIcon />}
                >
                  Button
                </Button>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <Button
                  className={styles.delete}
                  variant="ghost"
                  w="16px"
                  colorScheme="teal"
                  rightIcon={<ArrowForwardIcon />}
                >
                  Button
                </Button>
                <Button
                  className={styles.delete}
                  variant="ghost"
                  w="16px"
                  colorScheme="teal"
                  rightIcon={<ArrowForwardIcon />}
                >
                  Button
                </Button>
                <Button
                  className={styles.delete}
                  variant="ghost"
                  w="14px"
                  colorScheme="teal"
                  rightIcon={<ArrowForwardIcon />}
                >
                  Button
                </Button>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar4}>
              <div className={styles.base14}>
                <img
                  className={styles.initialsContainerIcon4}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
                <img
                  className={styles.emojiMultipleIcon}
                  alt=""
                  src="/emoji-multiple.svg"
                />
                <div className={styles.frame1}>
                  <div className={styles.base3}>
                    <div className={styles.divider} />
                    <div className={styles.avatarImageContainer} />
                    <img
                      className={styles.avatarImageContainerIcon}
                      alt=""
                      src="/avatarimagecontainer@2x.png"
                    />
                  </div>
                  <div className={styles.avatarImageContainer9} />
                </div>
              </div>
              <div className={styles.presence4}>
                <div className={styles.stringIcon10}></div>
              </div>
            </div>
          </div>
          <img
            className={styles.avatarImageIcon12}
            alt=""
            src="/avatarimage6@2x.png"
          />
          <img
            className={styles.avatarImageIcon13}
            alt=""
            src="/avatarimage7@2x.png"
          />
          <img
            className={styles.avatarImageIcon14}
            alt=""
            src="/avatarimage8@2x.png"
          />
          <div className={styles.ellipseParent2}>
            <div className={styles.frameChild} />
            <div className={styles.stringTag}>+3</div>
          </div>
        </div>
      </article>
      <div className={styles.cardVertical5}>
        <div className={styles.cardPlaceholderVertical}>
          <div className={styles.personaContainer}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <div className={styles.bodyContainer}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Our feelings</div>
              <div className={styles.stringSubtitle}>
                6 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>Today</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame2.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar4}>
              <div className={styles.base14}>
                <img
                  className={styles.initialsContainerIcon4}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
                <img
                  className={styles.emojiMultipleIcon}
                  alt=""
                  src="/emoji-multiple.svg"
                />
                <div className={styles.frame1}>
                  <div className={styles.base3}>
                    <div className={styles.divider} />
                    <div className={styles.avatarImageContainer} />
                    <img
                      className={styles.avatarImageContainerIcon}
                      alt=""
                      src="/avatarimagecontainer@2x.png"
                    />
                  </div>
                  <div className={styles.avatarImageContainer9} />
                </div>
              </div>
              <div className={styles.presence4}>
                <div className={styles.stringIcon10}></div>
              </div>
            </div>
          </div>
          <img
            className={styles.avatarImageIcon12}
            alt=""
            src="/avatarimage6@2x.png"
          />
          <img
            className={styles.avatarImageIcon13}
            alt=""
            src="/avatarimage7@2x.png"
          />
          <img
            className={styles.avatarImageIcon14}
            alt=""
            src="/avatarimage8@2x.png"
          />
          <div className={styles.ellipseParent2}>
            <div className={styles.frameChild} />
            <div className={styles.stringTag}>+3</div>
          </div>
        </div>
      </div>
      <div className={styles.cardVertical6}>
        <div className={styles.cardPlaceholderVertical}>
          <div className={styles.personaContainer}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <img
            className={styles.avatarImageIcon}
            alt=""
            src="/avatarimage9@2x.png"
          />
          <img
            className={styles.avatarImageIcon1}
            alt=""
            src="/avatarimage10@2x.png"
          />
          <img
            className={styles.avatarImageIcon2}
            alt=""
            src="/avatarimage11@2x.png"
          />
          <div className={styles.ellipseParent}>
            <div className={styles.frameChild} />
            <div className={styles.stringTag}>+9</div>
          </div>
          <div className={styles.bodyContainer}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Different animals</div>
              <div className={styles.stringSubtitle}>
                9 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>2 days ago</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame1.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatarParent}>
              <div className={styles.avatar6}>
                <div className={styles.base16}>
                  <div className={styles.base3}>
                    <div className={styles.divider} />
                    <div className={styles.avatarImageContainer} />
                    <img
                      className={styles.avatarImageContainerIcon}
                      alt=""
                      src="/avatarimagecontainer@2x.png"
                    />
                  </div>
                  <div className={styles.avatarImageContainer13} />
                  <img
                    className={styles.initialsContainerIcon}
                    alt=""
                    src="/initialscontainer@2x.png"
                  />
                </div>
                <div className={styles.presence4}>
                  <div className={styles.stringIcon10}></div>
                </div>
              </div>
              <div className={styles.base17}>
                <img
                  className={styles.initialsContainerIcon4}
                  alt=""
                  src="/initialscontainer1@2x.png"
                />
                <img
                  className={styles.emojiLaughIcon}
                  alt=""
                  src="/emoji-laugh.svg"
                />
                <div className={styles.frame3}>
                  <div className={styles.base37}>
                    <div className={styles.divider} />
                    <img
                      className={styles.avatarImageContainerIcon7}
                      alt=""
                      src="/avatarimagecontainer1@2x.png"
                    />
                    <img
                      className={styles.avatarImageContainerIcon}
                      alt=""
                      src="/avatarimagecontainer2@2x.png"
                    />
                  </div>
                  <div className={styles.avatarImageContainer14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cardVertical7}>
        <div className={styles.cardPlaceholderVertical}>
          <div className={styles.personaContainer}>
            <div className={styles.persona1}>
              <div className={styles.persona2}>
                <div className={styles.buttonBadgeButtonBadge}>
                  <div className={styles.personaPresence}>
                    <div className={styles.backgroundColor} />
                    <div className={styles.stringValue}></div>
                  </div>
                </div>
              </div>
              <div className={styles.detailsContainer}>
                <div className={styles.stringName}>Mona Kane</div>
                <div className={styles.stringSecondary}>Software Engineer</div>
                <div className={styles.stringTertiary}>Online</div>
              </div>
            </div>
          </div>
          <div className={styles.swapContent}>
            <div className={styles.stringSwapPlaceholder}>
              SWAP WITH CONTENT COMPONENT
            </div>
          </div>
          <img
            className={styles.avatarImageIcon}
            alt=""
            src="/avatarimage9@2x.png"
          />
          <img
            className={styles.avatarImageIcon1}
            alt=""
            src="/avatarimage10@2x.png"
          />
          <img
            className={styles.avatarImageIcon2}
            alt=""
            src="/avatarimage11@2x.png"
          />
          <div className={styles.ellipseParent}>
            <div className={styles.frameChild} />
            <div className={styles.stringTag}>+9</div>
          </div>
          <div className={styles.bodyContainer}>
            <div className={styles.stringTitleParent}>
              <div className={styles.stringTitle}>Different animals</div>
              <div className={styles.stringSubtitle}>
                9 images | Difficulty 3
              </div>
            </div>
            <div className={styles.stringTag1}>2 days ago</div>
            <div className={styles.border} />
            <div className={styles.actions}>
              <div className={styles.primary}>
                <img className={styles.deleteIcon} alt="" src="/delete.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
              <div className={styles.secondary}>
                <img className={styles.shareIcon} alt="" src="/share.svg" />
                <img
                  className={styles.shareIcon}
                  alt=""
                  src="/arrow-download.svg"
                />
                <img className={styles.frameIcon} alt="" src="/frame1.svg" />
                <div className={styles.icon}>
                  <img
                    className={styles.placeholderIcon}
                    alt=""
                    src="/placeholder1.svg"
                  />
                  <div className={styles.stringIcon5}></div>
                </div>
              </div>
            </div>
            <div className={styles.avatar}>
              <div className={styles.base1}>
                <div className={styles.base3}>
                  <div className={styles.divider} />
                  <div className={styles.avatarImageContainer} />
                  <img
                    className={styles.avatarImageContainerIcon}
                    alt=""
                    src="/avatarimagecontainer@2x.png"
                  />
                </div>
                <div className={styles.avatarImageContainer1} />
                <img
                  className={styles.initialsContainerIcon}
                  alt=""
                  src="/initialscontainer@2x.png"
                />
              </div>
              <div className={styles.presence}>
                <div className={styles.stringIcon10}></div>
              </div>
              <img
                className={styles.treeEvergreenIcon}
                alt=""
                src="/tree-evergreen.svg"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.pivot}>
        <div className={styles.paddingTop} />
        <div className={styles.stringAutoLayout}>
          <div className={styles.string}>Recents</div>
        </div>
        <div className={styles.vectorSelected} />
      </div>
      <ol className={styles.leftrail}>
        <div className={styles.header}>
          <div className={styles.divider9}>
            <div className={styles.dividerChild} />
          </div>
          <div className={styles.base19}>
            <div className={styles.typingIndicator} />
            <b className={styles.title}>Patterns</b>
            <div className={styles.iconbutton}>
              <div className={styles.base}>
                <img
                  className={styles.progressIndicatorContainerIcon}
                  alt=""
                  src="/progressindicatorcontainer.svg"
                />
                <div className={styles.iconcontainer}>
                  <img
                    className={styles.deleteIcon}
                    alt=""
                    src="/iconcontent.svg"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.base2}>
            <div className={styles.iconbutton1}>
              <div className={styles.base}>
                <img
                  className={styles.progressIndicatorContainerIcon}
                  alt=""
                  src="/progressindicatorcontainer.svg"
                />
                <div className={styles.iconcontainer}>
                  <img
                    className={styles.deleteIcon}
                    alt=""
                    src="/iconcontent1.svg"
                  />
                </div>
              </div>
            </div>
            <div className={styles.iconbutton1}>
              <div className={styles.base}>
                <img
                  className={styles.progressIndicatorContainerIcon}
                  alt=""
                  src="/progressindicatorcontainer.svg"
                />
                <div className={styles.iconcontainer}>
                  <img
                    className={styles.deleteIcon}
                    alt=""
                    src="/iconcontent2.svg"
                  />
                </div>
              </div>
            </div>
            <div className={styles.iconbutton1}>
              <div className={styles.base}>
                <img
                  className={styles.progressIndicatorContainerIcon}
                  alt=""
                  src="/progressindicatorcontainer.svg"
                />
                <div className={styles.iconcontainer}>
                  <img
                    className={styles.deleteIcon}
                    alt=""
                    src="/iconcontent3.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.listSection}>
          <div className={styles.frameParent}>
            <div className={styles.frameParent}>
              <div className={styles.listitemcontacts}>
                <div className={styles.listContainer}>
                  <div className={styles.frameGroup}>
                    <div className={styles.avatarGroup}>
                      <div className={styles.avatar8}>
                        <div className={styles.base110}>
                          <div className={styles.base39}>
                            <div className={styles.divider} />
                            <div className={styles.avatarImageContainer} />
                            <img
                              className={styles.avatarImageContainerIcon}
                              alt=""
                              src="/avatarimagecontainer2@2x.png"
                            />
                          </div>
                          <div className={styles.avatarImageContainer18} />
                          <img
                            className={styles.initialsContainerIcon4}
                            alt=""
                            src="/initialscontainer1@2x.png"
                          />
                        </div>
                        <div className={styles.presence}>
                          <div className={styles.stringIcon10}></div>
                        </div>
                      </div>
                      <img
                        className={styles.clockIcon}
                        alt=""
                        src="/clock.svg"
                      />
                    </div>
                    <div className={styles.stringBody}>Recents</div>
                  </div>
                </div>
              </div>
              <div className={styles.lineDiv} />
            </div>
            <div className={styles.listitemcontactsGroup}>
              <div className={styles.listitemcontacts}>
                <div className={styles.listContainer}>
                  <div className={styles.frameGroup}>
                    <div className={styles.avatarGroup}>
                      <div className={styles.avatar8}>
                        <div className={styles.base110}>
                          <div className={styles.base39}>
                            <div className={styles.divider} />
                            <div className={styles.avatarImageContainer} />
                            <img
                              className={styles.avatarImageContainerIcon}
                              alt=""
                              src="/avatarimagecontainer2@2x.png"
                            />
                          </div>
                          <div className={styles.avatarImageContainer20} />
                          <img
                            className={styles.initialsContainerIcon4}
                            alt=""
                            src="/initialscontainer1@2x.png"
                          />
                        </div>
                        <div className={styles.presence}>
                          <div className={styles.stringIcon10}></div>
                        </div>
                      </div>
                      <img
                        className={styles.emojiMultipleIcon2}
                        alt=""
                        src="/emoji-multiple1.svg"
                      />
                    </div>
                    <div className={styles.stringBody1}>Our feelings</div>
                  </div>
                </div>
              </div>
              <div className={styles.listitemcontacts2}>
                <div className={styles.listContainer2}>
                  <div className={styles.avatar8}>
                    <div className={styles.base110}>
                      <div className={styles.base39}>
                        <div className={styles.divider} />
                        <img
                          className={styles.avatarImageContainerIcon7}
                          alt=""
                          src="/avatarimagecontainer1@2x.png"
                        />
                        <img
                          className={styles.avatarImageContainerIcon}
                          alt=""
                          src="/avatarimagecontainer2@2x.png"
                        />
                      </div>
                      <div className={styles.avatarImageContainer21} />
                      <img
                        className={styles.initialsContainerIcon4}
                        alt=""
                        src="/initialscontainer1@2x.png"
                      />
                    </div>
                    <div className={styles.presence}>
                      <div className={styles.stringIcon10}></div>
                    </div>
                    <img
                      className={styles.treeEvergreenIcon5}
                      alt=""
                      src="/tree-evergreen2.svg"
                    />
                  </div>
                  <div className={styles.stringBody2}>Trees</div>
                </div>
              </div>
              <div className={styles.listitemcontacts2}>
                <div className={styles.listContainer2}>
                  <div className={styles.avatar11}>
                    <div className={styles.avatar8}>
                      <img
                        className={styles.initialsContainerIcon4}
                        alt=""
                        src="/initialscontainer1@2x.png"
                      />
                      <img
                        className={styles.teddyIcon}
                        alt=""
                        src="/teddy.svg"
                      />
                      <div className={styles.frame3}>
                        <div className={styles.base37}>
                          <div className={styles.divider} />
                          <img
                            className={styles.avatarImageContainerIcon7}
                            alt=""
                            src="/avatarimagecontainer1@2x.png"
                          />
                          <img
                            className={styles.avatarImageContainerIcon}
                            alt=""
                            src="/avatarimagecontainer2@2x.png"
                          />
                        </div>
                        <div className={styles.avatarImageContainer22} />
                      </div>
                    </div>
                    <div className={styles.presence4}>
                      <div className={styles.stringIcon10}></div>
                    </div>
                  </div>
                  <div className={styles.stringBody2}>Different animals</div>
                </div>
              </div>
              <div className={styles.listitemcontacts2}>
                <div className={styles.listContainer2}>
                  <div className={styles.avatar11}>
                    <div className={styles.avatar8}>
                      <img
                        className={styles.initialsContainerIcon4}
                        alt=""
                        src="/initialscontainer1@2x.png"
                      />
                      <img
                        className={styles.teddyIcon}
                        alt=""
                        src="/emoji-laugh1.svg"
                      />
                      <div className={styles.frame3}>
                        <div className={styles.base37}>
                          <div className={styles.divider} />
                          <img
                            className={styles.avatarImageContainerIcon7}
                            alt=""
                            src="/avatarimagecontainer1@2x.png"
                          />
                          <img
                            className={styles.avatarImageContainerIcon}
                            alt=""
                            src="/avatarimagecontainer2@2x.png"
                          />
                        </div>
                        <div className={styles.avatarImageContainer14} />
                      </div>
                    </div>
                    <div className={styles.presence4}>
                      <div className={styles.stringIcon10}></div>
                    </div>
                  </div>
                  <div className={styles.stringBody2}>The smiles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.divider15}>
            <div className={styles.dividerItem} />
          </div>
          <Button
            className={styles.button}
            variant="ghost"
            colorScheme="teal"
            rightIcon={<ArrowForwardIcon />}
          >
            Label
          </Button>
          <Button
            className={styles.iconbutton4}
            variant="ghost"
            colorScheme="teal"
            rightIcon={<ArrowForwardIcon />}
          >
            Button
          </Button>
        </div>
        <div className={styles.shadow} />
        <div className={styles.button1}>
          <div className={styles.iconStringAutoLayout}>
            <img
              className={styles.deleteIcon}
              alt=""
              src="/add-square-multiple.svg"
            />
            <img
              className={styles.placeholderIcon40}
              alt=""
              src="/placeholder.svg"
            />
            <div className={styles.string}>Create new</div>
          </div>
        </div>
      </ol>
    </>
  );
};

export default CatalogPage;
