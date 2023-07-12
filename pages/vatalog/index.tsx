import type { NextPage } from "next";
import styles from "./index.module.css";
import Header from "../../components/header/header";

const FrameComponent: NextPage = () => {
  return (
    <>
    <Header />
    {/*
    //     <div className={styles.o365ShellSearchSearch}>
    //       <div className={styles.staticContainer}>
    //         <div className={styles.stringQuery}>Search</div>
    //         <div className={styles.stringIconSearch}></div>
    //       </div>
    //     </div>
    //   </div> */}
      <div className={styles.leftrail}>
        <div className={styles.header}>
          <div className={styles.divider}>
            <div className={styles.dividerChild} />
          </div>
          <div className={styles.base1}>
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
                    className={styles.iconContent}
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
                    className={styles.iconContent}
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
                    className={styles.iconContent}
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
                    className={styles.iconContent}
                    alt=""
                    src="/iconcontent3.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.divider1}>
            <div className={styles.dividerItem} />
          </div>
          <div className={styles.button}>
            <div className={styles.base6}>
              <div className={styles.vectorMinWidth} />
              <div className={styles.iconsStringLoaderStack}>
                <div className={styles.iconcontainer}>
                  <img
                    className={styles.iconContent}
                    alt=""
                    src="/iconcontent4.svg"
                  />
                </div>
                <div className={styles.string}>Label</div>
                <div className={styles.iconcontainer5}>
                  <img
                    className={styles.iconContent}
                    alt=""
                    src="/iconcontent3.svg"
                  />
                </div>
              </div>
              <div className={styles.vectorMinWidth} />
            </div>
          </div>
          <div className={styles.iconbutton4}>
            <div className={styles.base}>
              <img
                className={styles.progressIndicatorContainerIcon}
                alt=""
                src="/progressindicatorcontainer.svg"
              />
              <div className={styles.iconcontainer}>
                <img
                  className={styles.iconContent}
                  alt=""
                  src="/iconcontent5.svg"
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.shadow} />
        <div className={styles.leftrailChild} />
        <div className={styles.chevronParent}>
          <img className={styles.chevronIcon} alt="" src="/chevron.svg" />
          <div className={styles.back}>Back</div>
        </div>
        <div className={styles.textfieldLabelParent}>
          <div className={styles.textfieldLabel}>
            <div className={styles.label}>
              <div className={styles.stringLabel}>Keywords</div>
            </div>
            <div className={styles.textfield}>
              <div className={styles.string1}>Hint text</div>
            </div>
          </div>
          <div className={styles.labelParent}>
            <div className={styles.label1}>
              <div className={styles.stringLabel}>Caption</div>
            </div>
            <img className={styles.toggleIcon} alt="" src="/toggle.svg" />
            <div className={styles.string}>On</div>
          </div>
          <div className={styles.textfieldLabel1}>
            <div className={styles.label}>
              <div className={styles.stringLabel}>Number of cards</div>
            </div>
          </div>
        </div>
        <div className={styles.button1}>
          <div className={styles.iconStringAutoLayout}>
            <img
              className={styles.placeholderIcon}
              alt=""
              src="/placeholder.svg"
            />
            <div className={styles.stringLabel}>Generate result</div>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.primary}>
            <img className={styles.iconContent} alt="" src="/delete.svg" />
            <div className={styles.icon}>
              <img
                className={styles.placeholderIcon1}
                alt=""
                src="/placeholder1.svg"
              />
              <div className={styles.stringIcon5}></div>
            </div>
            <div className={styles.icon}>
              <img
                className={styles.placeholderIcon1}
                alt=""
                src="/placeholder1.svg"
              />
              <div className={styles.stringIcon5}></div>
            </div>
            <div className={styles.icon}>
              <img
                className={styles.placeholderIcon1}
                alt=""
                src="/placeholder1.svg"
              />
              <div className={styles.stringIcon5}></div>
            </div>
            <div className={styles.icon}>
              <img
                className={styles.placeholderIcon1}
                alt=""
                src="/placeholder1.svg"
              />
              <div className={styles.stringIcon5}></div>
            </div>
          </div>
          <div className={styles.secondary}>
            <img className={styles.chevronIcon} alt="" src="/share.svg" />
            <img
              className={styles.chevronIcon}
              alt=""
              src="/arrow-download.svg"
            />
            <img className={styles.frameIcon} alt="" src="/frame.svg" />
            <div className={styles.icon}>
              <img
                className={styles.placeholderIcon1}
                alt=""
                src="/placeholder1.svg"
              />
              <div className={styles.stringIcon5}></div>
            </div>
          </div>
        </div>
        <div className={styles.rectangleParent}>
          <div className={styles.frameChild} />
          <div className={styles.frameItem} />
          <div className={styles.frameInner} />
          <div className={styles.rectangleDiv} />
          <div className={styles.frameChild1} />
          <div className={styles.frameChild2} />
        </div>
        <div className={styles.rectangleGroup}>
          <div className={styles.frameChild3} />
          <div className={styles.frameChild4} />
          <div className={styles.frameChild5} />
          <div className={styles.rectangleDiv} />
          <div className={styles.frameChild1} />
          <div className={styles.frameChild2} />
        </div>
        <div className={styles.rectangleContainer}>
          <div className={styles.frameChild9} />
          <div className={styles.frameChild10} />
          <div className={styles.frameChild11} />
          <div className={styles.rectangleDiv} />
          <div className={styles.frameChild1} />
          <div className={styles.frameChild2} />
        </div>
        <div className={styles.frameDiv}>
          <div className={styles.frameChild9} />
          <div className={styles.frameChild10} />
          <div className={styles.frameChild11} />
          <div className={styles.rectangleDiv} />
          <div className={styles.frameChild1} />
          <div className={styles.frameChild2} />
        </div>
        <div className={styles.rectangleParent1}>
          <div className={styles.frameChild9} />
          <div className={styles.frameChild10} />
          <div className={styles.frameChild11} />
          <div className={styles.rectangleDiv} />
          <div className={styles.frameChild1} />
          <div className={styles.frameChild2} />
        </div>
        <div className={styles.rectangleParent2}>
          <div className={styles.frameChild9} />
          <div className={styles.frameChild10} />
          <div className={styles.frameChild11} />
          <div className={styles.rectangleDiv} />
          <div className={styles.frameChild1} />
          <div className={styles.frameChild2} />
        </div>
      </div>
      <div className={styles.frameChild33} />
      <div className={styles.frameChild34} />
      <div className={styles.frameChild35} />
      <div className={styles.frameChild36} />
      <div className={styles.frameChild37} />
      <div className={styles.frameChild38} />
    </>
  );
};

export default FrameComponent;
