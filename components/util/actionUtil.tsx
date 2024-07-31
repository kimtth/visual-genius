import Cookies from 'js-cookie';

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

export const getAccessToken = () => {
    const access_token = Cookies.get('access_token');
    return access_token;
}

export const getRefreshToken = () => {
    const refresh_token = Cookies.get('refresh_token');
    return refresh_token;
}

export const setAccessToken = (access_token: string) => {
    // https://stackoverflow.com/questions/48712923/where-to-store-a-jwt-token-properly-and-safely-in-a-web-based-application
    const expiresInDays = 14; // Match the backend expiration
    const cookieOptions = {
        path: '/', // Ensure this matches backend setting
        sameSite: 'Lax' as 'Lax', // Ensure this matches backend setting
        secure: false, // Ensure this matches backend setting
        expires: expiresInDays // Set expiration (e.g., 14 day)
    };
    Cookies.set('access_token', access_token, cookieOptions);
}

export const setRefreshToken = (refresh_token: string) => {
    const expiresInDays = 14; // Match the backend expiration
    const cookieOptions = {
        path: '/', // Ensure this matches backend setting
        sameSite: 'Lax' as 'Lax', // Ensure this matches backend setting
        secure: false, // Ensure this matches backend setting
        expires: expiresInDays // Set expiration (e.g., 14 day)
    };
    Cookies.set('refresh_token', refresh_token, cookieOptions);
}

export const getSignInUserId = () => {
    const userId = Cookies.get('userId');
    return userId;
}

export const setSignInUserId = (userId: string) => {
    Cookies.set('userId', userId);
}