import type { NextPage } from "next";
import styles from "./index.module.css";
import Header from "../../components/header/header";
import { GrFormEdit } from 'react-icons/gr';
import { HiChevronLeft, HiOutlineTrash } from 'react-icons/hi';
import { LiaDownloadSolid, LiaPrintSolid, LiaShareSquareSolid } from 'react-icons/lia';
import { Button, IconButton, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Textarea } from "@chakra-ui/react";
import { useState } from "react";

const FrameComponent2: NextPage = () => {

  const [ captionToggle, setCaptionToggle ] = useState(true);

  return (
    <>
      <Header />
      <div className={styles.leftrail}>
        <div className={styles.header}>
          <div className={styles.divider}>
            <div className={styles.dividerChild} />
          </div>
          <div className={styles.base1}>
            <b className={styles.title}>Patterns</b>
            <IconButton aria-label='Edit'
              variant="ghost"
              colorScheme='gray'
              icon={<GrFormEdit />} />
          </div>
        </div>
        <div className={styles.shadow} />
        <div className={styles.leftrailChild} />
        <div className={styles.chevronParent}>
          <IconButton aria-label='Back'
            variant="ghost"
            colorScheme='gray'
            icon={<HiChevronLeft />} />
          <div className={styles.back}>Back</div>
        </div>
        <div className={styles.textfieldLabelParent}>
          <div className={styles.textfieldLabel}>
            <div className={styles.label}>
              <div className={styles.stringLabel}>Keywords</div>
            </div>
            <div className={styles.textfield}>
              <Textarea
                placeholder='Hint text'
                minHeight={"180px"}
                resize="none" />
            </div>
          </div>
          {/* Number of cards */}
          <div className={styles.textfieldLabel1}>
            <div className={styles.label}>
              <div className={styles.stringLabel}>Number of cards</div>
            </div>
            <div className={styles.dropdown}>
              <NumberInput size='sm' min={1} defaultValue={1}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </div>
          </div>
          {/* Number of cards */}
          {/* Toggle */}
          <div className={styles.labelParent}>
            <div className={styles.label2}>
              <div className={styles.stringLabel}>Caption</div>
            </div>
            <Switch size='md' isChecked={captionToggle} onChange={() => setCaptionToggle(!captionToggle)}/> 
          </div>
          {/* Toggle */}
        </div>
        <div className={styles.button1}>
          <div className={styles.iconStringAutoLayout}>
            <Button colorScheme='messenger' size='sm' width='95%'>
              Generate
            </Button>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.primary}>
            <IconButton aria-label='Delete'
              variant="ghost"
              colorScheme='red'
              icon={<HiOutlineTrash />} />
          </div>
          <div className={styles.secondary}>
            <IconButton aria-label='Share'
              variant="ghost"
              colorScheme='blue'
              icon={<LiaShareSquareSolid />} />
            <IconButton aria-label='Download'
              variant="ghost"
              colorScheme='blue'
              icon={<LiaDownloadSolid />} />
            <IconButton aria-label='Print'
              variant="ghost"
              colorScheme='blue'
              icon={<LiaPrintSolid />} />
          </div>
        </div>
        {/* Grid Size */}
        <div className={styles.labelGroup}>
          <div className={styles.label3}>
            <div className={styles.stringLabel}>Grid size</div>
          </div>
          <div>
            <NumberInput size='sm' min={1} defaultValue={1}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </div>
          <img className={styles.chevronIcon} alt="" src="/dismiss.svg" />
          <div>
            <NumberInput size='sm' min={1} defaultValue={1}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </div>
        </div>
        {/* Grid Size */}
      </div>
      <img
        className={styles.freWelcomeScreenSimple}
        alt=""
        src="/fre--welcome-screen-simple.svg"
      />
      <div className={styles.label4}>Card previews appear here</div>
    </>
  );
};

export default FrameComponent2;
