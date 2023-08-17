import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showImgDescription } from './settings';
import { setTitle } from './datas';
import { DataState, SettingState } from './type';

function TestComponent() {
  // 'state' is of type 'unknown'.
  const title = useSelector((state: DataState) => state.title);
  const showImgDesc = useSelector((state: SettingState) => state.showImgDesc);
  const dispatch = useDispatch();

  const handleTitleChange = (event: any) => {
    dispatch(setTitle(event.target.value));
  }

  const handleShowImgDescChange = () => {
    dispatch(showImgDescription());
  }

  return (
    <div>
      <h1>{title}</h1>
      <input type="text" value={title} onChange={handleTitleChange} />
      <button onClick={handleShowImgDescChange}>
        {showImgDesc ? 'Hide' : 'Show'} Image Description
      </button>
    </div>
  );
}
