import { Card, CardBody, Image, Text, Checkbox, Flex, Spacer, useDisclosure } from "@chakra-ui/react";
import SearchImageModal from "./searchModalCard";
import { FC } from "react";

interface PhotoProps {
    title: string;
    imgPath: string;
    checked: boolean;
    onSelect: (checked: boolean) => void;
}

const ResultCard: FC<PhotoProps> = ({ title, imgPath, checked, onSelect }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {isOpen ?
                <>
                    <SearchImageModal title={title} imgPath={imgPath} isOpen={isOpen} onClose={onClose} />
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
                                onChange={() => { onSelect(!checked) }}
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