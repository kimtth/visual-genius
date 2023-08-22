import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

type Category = {
  id: string;
  category: string;
  title: string;
  difficulty: string;
  imgNum: number;
  contentUrl: string[];
};

const BACKEND_URL = '<URL>';

export async function Categoryhandler(req: NextApiRequest, res: NextApiResponse) {
  let items: Category[] = [];

  try {
    switch (req.method) {
      case "GET":
        const categoryId = req.query.id as string;
        if (categoryId) {
          const response = await axios.get<Category>(`${BACKEND_URL}/category/${categoryId}`);
          const item = response.data;
          res.status(200).json(item);
          break;
        } else {
          const response = await axios.get<Category[]>(`${BACKEND_URL}/categories`);
          items = response.data;
          res.status(200).json(items);
          break;
        }

      case "POST":
        const newItem = req.body as Category;
        await axios.post<Category>(`${BACKEND_URL}/category`, newItem);
        res.status(201).json(newItem);
        break;

      case "PUT":
        const updatedItem = req.body as Category;
        await axios.put<Category>(`${BACKEND_URL}/category/${updatedItem.id}`, updatedItem);
        res.status(200).json(updatedItem);
        break;

      case "DELETE":
        const deletedId = req.query.id as string;
        await axios.delete(`${BACKEND_URL}/category/${deletedId}`);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch items from backend' });
    return;
  }
}

interface Image {
  categoryId: string;
  id: string;
  title: string;
  imgPath: string;
}

export default async function ImageHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const categoryId = req.query.id as string;
      if (categoryId) {
        const response = await axios.get<Image>(`${BACKEND_URL}/images/${categoryId}`);
        const item = response.data;
        res.status(200).json(item);
        break;
      } else {
        const response = await axios.get<Image[]>(`${BACKEND_URL}/images`);
        const items = response.data;
        res.status(200).json(items);
        break;
      }
    case 'POST':
      if (!req.body) {
        res.status(400).json({ message: 'No file uploaded' });
        break;
      }
      const form = new FormData();
      form.append('file', req.body);
      form.append('categoryId', req.body.categoryId);
      form.append('title', req.body.title);
      form.append('imgPath', req.body.imgPath);
      const response = await axios.post(`${BACKEND_URL}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      res.status(201).json(response.data);
      break;
    case 'PUT':
      const id = req.query.id as string;
      await axios.put(`${BACKEND_URL}/${id}`, req.body);
      res.status(200).json(req.body);
      break;
    case 'DELETE':
      const deleteId = req.query.id as string;
      await axios.delete(`${BACKEND_URL}/${deleteId}`);
      res.status(200).json({ message: 'Data deleted' });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export async function SearchHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const response = await axios.get<Image[]>(`${BACKEND_URL}/search`);
      const items = response.data;
      res.status(200).json(items);
      break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
  }
}
