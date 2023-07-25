import type { NextPage } from "next";
import { Card, CardBody, Image, Checkbox, Flex, Spacer } from "@chakra-ui/react";

interface PhotoProps {
    imgPath: string;
}

const ResultCard: NextPage<PhotoProps> = ({ imgPath }) => {

    return (
        <div>
            <Card maxW='sm' >
                <CardBody>
                    <Flex>
                        <Checkbox size='sm' colorScheme='green' />
                        <Spacer/>
                        <Image
                            src={imgPath ? imgPath : "-"}
                            borderRadius='lg'
                            objectFit='cover'
                            maxW={{ sm: '10vw' }}
                        />
                    </Flex>
                </CardBody>
            </Card>
        </div>
    )
}

export default ResultCard;