import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // defaults to localStorage for web
import { settings } from './settings';
import { datas } from './datas';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
    settings,
    datas
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;