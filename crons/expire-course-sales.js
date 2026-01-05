/* eslint-disable no-console */
import { createCron } from '@functions';
import { Course } from '@models';

async function task() {
  const now = new Date();

  // Find all courses with active sales that have expired
  const expiredSales = await Course.find({
    'sale.isActive': true,
    'sale.endsAt': { $lte: now },
  });

  if (expiredSales.length === 0) {
    console.log('No expired sales found');
    return;
  }

  // Remove the sale object from all courses with expired sales
  const result = await Course.updateMany(
    {
      'sale.isActive': true,
      'sale.endsAt': { $lte: now },
    },
    {
      $unset: { sale: 1 },
    }
  );

  console.log(`Expired ${result.modifiedCount} course sale(s)`);
}

// Run every 30 minutes
export default createCron({
  name: 'expire-course-sales',
  schedule: '*/30 * * * *',
  task,
  timezone: 'Europe/Bucharest',
  autostart: true,
});
