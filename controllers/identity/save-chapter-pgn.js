import { error } from '@functions';
import { Chapter } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { id } = req.params;
  const { pgn } = req.body;

  const chapter = await Chapter.findByIdAndUpdate(id, { pgn });

  // Return empty message to prevent toaster popup on frontend
  return res.status(200).json({
    data: chapter,
    message: '',
  });
};
