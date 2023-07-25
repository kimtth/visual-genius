import { createAction, handleActions } from 'redux-actions';
import { dataFromBackend } from '../data/ImgCardData';

const TITLE = 'settings/TITLE ';
const TEXT_VISIBLE = 'settings/TEXTVISIBLE ';
const DATA_PAYLOAD = 'settings/DATAPAYLOAD';

export const optTitle = createAction(TITLE, (string: any) => string);
export const setTextVisible = createAction(TEXT_VISIBLE);
export const setDataPayload = createAction(DATA_PAYLOAD, (any: any) => any);

const initialState = {
    titleStr: 'Our feelings',
    textvisible: true,
    dottedvisible: false,
    dataPayload: dataFromBackend
}

export const settings = handleActions(
    {
        [TITLE]: (state: any, { payload }: any) => ({ ...state, titleStr: payload }),
        [TEXT_VISIBLE]: (state: { textvisible: any; }) => ({ ...state, textvisible: !state.textvisible }),
        [DATA_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, dataPayload: payload })
    },
    initialState,
)

export default settings;