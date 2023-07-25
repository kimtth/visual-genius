import axios from "axios";

const baseURL = "http://127.0.0.1:8000";

export const getCategory = async (id: string) => {
    try {
        const res = await axios.get(`${baseURL}/category`, {
            params: {
                id: id
            }
        });
        const category = res.data;

        return category;
    } catch (err: any) {
        alert('Unable to get categories')
        throw new Error('Unable to get categories', err)
    }
}

export const getCategories = async () => {
    try {
        const res = await axios.get(`${baseURL}/categories`);
        const categories = res.data;
        return categories;
    } catch (err: any) {
        alert('Unable to get categories')
        throw new Error('Unable to get categories', err)
    }
}

export const getPhotos = async (keywords: any) => {
    try {
        const res = await axios.get(`${baseURL}/bulk_search`, {
            params: {
                keywords: keywords
            }
        });
        const photos = res.data;
        return photos;
    } catch (err: any) {
        alert('Unable to get photos')
        throw new Error('Unable to get photos', err)
    }
}

export const getCarouselPhotos = async (keyword: any) => {
    try {
        const res = await axios.get(`${baseURL}/carousel_search`, {
            params: {
                keyword: keyword
            }
        });
        const photos = res.data;
        return photos;
    } catch (err: any) {
        alert('Unable to get carousel photos')
        throw new Error('Unable to get carousel photos', err)
    }
}


export const postCategory = async (params: any) => {
    try {
        const json = JSON.stringify(params);
        // params == { key: value }
        const res = await axios.post(`${baseURL}/category`, json, {
            headers: {
                // If you pass a string to axios.post(), Axios treats that as a form-encoded request body.
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (err: any) {
        alert('Unable to send a category')
        throw new Error('Unable to send a category', err)
    }
}
