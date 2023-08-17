import { combineReducers } from 'redux';
import { settings } from './settings';
import { datas } from './datas';

const rootReducer = combineReducers({
    settings,
    datas
});

export default rootReducer;