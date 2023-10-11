import { Button, Flex, Heading, Input, } from "@chakra-ui/react";
import axios from "axios";
import { API_ENDPOINT } from "../components/state/const";
import { useEffect, useState } from "react";
import { setSignInUserId, setToken } from "../components/util/actionUtil";
import { pathes } from "../components/state/pathes";

export default function LoginPage() {
    const [userId, setUserId] = useState("");
    const [userPassword, setUserPassword] = useState("");

    {/* Autofill does not trigger onChange -> Polling */ }
    // Polling function
    const checkInput = () => {
        const input = document.querySelector('input[name="userId"]') as HTMLInputElement;
        const password = document.querySelector('input[name="password"]') as HTMLInputElement;
        if (input && input.value !== userId) {
            setUserId(input.value);
        }
        if (password && password.value !== userPassword) {
            setUserPassword(password.value);
        }
    };

    // Set up polling
    useEffect(() => {
        const interval = setInterval(checkInput, 100); // Check every 100ms
        return () => clearInterval(interval); // Clean up on unmount
    }, []);

    const logingGetToken = () => {
        if (userId == "" || userPassword == "") {
            alert("User Id or Password cannot be empty!");
            return;
        }

        axios.post(`${API_ENDPOINT}/login`, {
            user_id: userId,
            user_password: userPassword
        })
            .then((result: any) => {
                const access_token = result.data.access_token;
                //check if token is undefined or null
                if (!access_token) {
                    alert("Login Failed!");
                    return;
                } else {
                    const token = result.data;
                    setToken(token);
                    setSignInUserId(userId);
                    window.location.href = `${pathes.home}`;
                }
            }).catch((error: any) => {
                //console.log(error);
            });
    }

    return (
        <Flex width="100vw" height="100vh" alignItems="center" background="blue.300" justifyContent="center">
            <Flex direction="column" minWidth={"400px"} background="gray.100" padding={6} rounded={6}>
                +        <Heading mb={6}>Visual Genius!</Heading>
                +        <Input name="userId" placeholder="User Id" variant="outline" value={userId} mb={3}
                    type="email" background="white" onChange={(e) => setUserId(e.target.value)} />
                +        <Input name="password" placeholder="********" variant="outline" value={userPassword} mb={6}
                    type="password" background="white" onChange={(e) => setUserPassword(e.target.value)} />
                <Button mb={6} colorScheme="blue" onClick={logingGetToken}>Sign-in</Button>
            </Flex>
        </Flex>
    )
}