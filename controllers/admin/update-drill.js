import { error } from '@functions';
import { Drill } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw error(404, 'Missing required params');
  }

  const { name, active } = req.body;

  if (!name && active) {
    throw error(400, 'Name or active status are required.');
  }

  const drill = await Drill.findById(id);
  if (!drill) {
    throw error(404, 'Drill not found');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (active !== undefined) updateData.active = active;

  const updatedDrill = await Drill.findByIdAndUpdate(id, updateData);

  return res.status(200).json({
    data: updatedDrill,
    message: 'Drill updated successfully',
  });
};
