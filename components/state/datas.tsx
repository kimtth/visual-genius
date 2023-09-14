import { createAction, handleActions } from 'redux-actions';
import { DataState } from './type';

const TITLE = 'datas/TITLE';
const CATEGORY_DATA = 'datas/CATEGORY_DATA';
const CATEGORIES_PAYLOAD = 'datas/CATEGORIES_PAYLOAD';
const IMAGE_PAYLOAD = 'datas/IMAGE_PAYLOAD';
const SEARCH_RESULT_PAYLOAD = 'datas/SEARCH_RESULT_PAYLOAD';
const IMAGE_UPLOADED = 'datas/IMAGE_UPLOADED';

export const setTitle = createAction(TITLE, (title: string) => title);
export const setCategoryData = createAction(CATEGORY_DATA);
export const setCategoriesDataPayload = createAction(CATEGORIES_PAYLOAD, (payload: any) => payload);
export const setImageDataPayload = createAction(IMAGE_PAYLOAD, (payload: any) => payload);
export const setSearchResultPayload = createAction(SEARCH_RESULT_PAYLOAD, (payload: any) => payload);
export const setImageUploadedPayload = createAction(IMAGE_UPLOADED, (payload: any) => payload);

const initialDataState: DataState = {
    title: 'Our feelings',
    CategoryData: {},
    CategoriesDataPayload: [],
    ImageDataPayload: [],
    SearchResultPayload: [],
    ImageUploadedPayload: []
}

export const datas = handleActions<DataState>(
    {
        [TITLE]: (state: any, { payload }: any) => ({ ...state, title: payload }),
        [CATEGORY_DATA]: (state: any, { payload }: any) => ({ ...state, CategoryData: payload }),
        [CATEGORIES_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, CategoriesDataPayload: payload }),
        [IMAGE_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, ImageDataPayload: payload }),
        [SEARCH_RESULT_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, SearchResultPayload: payload }),
        [IMAGE_UPLOADED]: (state: any, { payload }: any) => ({ ...state, ImageUploadedPayload: payload }),
    },
    initialDataState,
)


