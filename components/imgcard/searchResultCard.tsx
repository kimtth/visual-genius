import type { NextPage } from "next";
import { Card, CardBody, Image, Checkbox, Flex, Spacer } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface PhotoProps {
    imgPath: string;
    selectAll: boolean;
}

const ResultCard: NextPage<PhotoProps> = ({ imgPath, selectAll }) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        setChecked(selectAll);
    }, [selectAll])

    return (
        <div>
            <Card maxW='sm' >
                <CardBody>
                    <Flex>
                        <Checkbox
                            size='sm'
                            colorScheme='green'
                            isChecked={checked}
                            onChange={() => { setChecked(!checked) }}
                        />
                        <Spacer />
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