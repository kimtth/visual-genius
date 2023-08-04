import { v4 as uuidv4 } from 'uuid';

export const data_1 = [
  {
    id: '1',
    title: 'Smile',
    imgPath: 'rectangle-3469579@2x.png',
  },
  {
    id: '2',
    title: 'Happy',
    imgPath: 'rectangle-3469579@2x.png',
  }
];

export const data_2 = [
  {
    id: '3',
    title: 'Confidence',
    imgPath: 'rectangle-3469579@2x.png',
  },
  {
    id: '5',
    title: 'Positive',
    imgPath: 'rectangle-3469580@2x.png',
  },
  {
    id: '6',
    title: 'Surprise',
    imgPath: 'rectangle-3469580@2x.png',
  }
];

export const data_3 = [
  {
    id: '4',
    title: 'Little smile',
    imgPath: 'rectangle-3469581@2x.png',
  },
  {
    id: '7',
    title: 'Sad',
    imgPath: 'rectangle-3469579@2x.png',
  },
];

export const data_4 = [
  {
    id: '8',
    title: 'Smile',
    imgPath: 'rectangle-3469579@2x.png',
  },
  {
    id: '9',
    title: 'Happy',
    imgPath: 'rectangle-3469579@2x.png',
  },
  {
    id: '10',
    title: 'Little smile',
    imgPath: 'rectangle-3469581@2x.png',
  },
  {
    id: '11',
    title: 'Sad',
    imgPath: 'rectangle-3469579@2x.png',
  },
];

export const dataFromBackend = {
  [uuidv4()]: {
    items: data_1,
  },
  [uuidv4()]: {
    items: data_2,
  },
  [uuidv4()]: {
    items: data_3,
  },
  [uuidv4()]: {
    items: data_4,
  }
};
