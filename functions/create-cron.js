/* eslint-disable no-console */
import { CronJob } from 'cron';

export default function createCron({
  name,
  schedule,
  task,
  timezone = 'Europe/Bucharest',
  autostart = true,
}) {
  const onTick = async () => {
    const startedAt = new Date();
    try {
      await task();
      const finishedAt = new Date();
      console.log(
        `[${name}] Completed successfully in ${
          finishedAt - startedAt
        }ms at ${finishedAt.toISOString()}`
      );
    } catch (err) {
      const finishedAt = new Date();
      console.error(
        `[${name}] Failed after ${finishedAt - startedAt}ms at ${finishedAt.toISOString()}`,
        err?.message
      );
    }
  };

  return new CronJob(schedule, onTick, null, autostart, timezone);
}
