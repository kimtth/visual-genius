import type { NextPage } from "next";
import { Card, CardBody, Image, Text, Checkbox, Flex, Spacer, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import BasicImageModal from "./modalCard";

interface PhotoProps {
    title: string;
    imgPath: string;
    selectAll: boolean;
}

const ResultCard: NextPage<PhotoProps> = ({ title, imgPath, selectAll }) => {
    const [checked, setChecked] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        setChecked(selectAll);
    }, [selectAll])

    return (
        <>
            {isOpen ?
                <>
                    <BasicImageModal title={title} imgPath={imgPath} isOpen={isOpen} onClose={onClose} />
                </>
                : null}
            <div>
                <Card>
                    <CardBody alignContent={"center"}>
                        <Flex minWidth='max-content' alignItems='center'>

                            <Spacer />
                            <Image
                                src={imgPath ? imgPath : ""}
                                borderRadius='lg'
                                marginLeft={"2px"}
                                objectFit='cover'
                                maxW={{ sm: '10vw' }}
                                onClick={onOpen}
                            />
                        </Flex>
                        <Spacer />
                        <Flex>
                            <Checkbox
                                size='sm'
                                colorScheme='green'
                                margin={"5px"}
                                isChecked={checked}
                                onChange={() => { setChecked(!checked) }}
                            />
                            <Text fontSize='sm' as="b" isTruncated>{title}</Text>
                        </Flex>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

export default ResultCard;