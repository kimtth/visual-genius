

export const executeShareUrl = (categoryId: string) => {
    const root = location.protocol + '//' + location.host;
    navigator.clipboard.writeText(`${root}/gen?categoryId=${categoryId}`)
}


export const downloadZip = (downloadData: any) => {
    if (downloadData) {
        try {
            const url = window.URL.createObjectURL(new Blob([downloadData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'images.zip');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error(error);
        }
    }
}

export const getToken = () => {
    const token = localStorage.getItem('token');
    const access_token = token ? JSON.parse(token)['access_token'] : null;
    return access_token;
}

export const getRefreshToken = () => {
    const token = localStorage.getItem('refresh_token');
    const refresh_token = token ? JSON.parse(token)['refresh_token'] : null;
    return refresh_token;
}

export const setToken = (token: any) => {
    // TODO
    // 1. Storing JWT tokens in localStorage is a common practice, 
    // but it can leave your application vulnerable to certain types of attacks, such as Cross-Site Scripting (XSS).
    // 2. Storing JWT tokens in the cookie to be httpOnly on the server side like this: 
    // res.cookie ("jwt", accessToken, { secure: true, httpOnly: true }). 
    // You can’t set a httpOnly cookie from client-end code.
    // 3. Session storage is a better option than local storage for storing JWT tokens. but both are vulnerable to XSS attacks.
    // 4. The best way to store JWT tokens is in-memory.
    // https://stackoverflow.com/questions/48712923/where-to-store-a-jwt-token-properly-and-safely-in-a-web-based-application
    localStorage.setItem('token', JSON.stringify(token));
}

export const getSignInUserId = () => {
    const userId = localStorage.getItem('userId');
    return userId;
}

export const setSignInUserId = (userId: string) => {
    localStorage.setItem('userId', userId);
}