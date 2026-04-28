import { OutreachActivityVictoryChart } from '@/components/outreach-activity-victory-chart.web';
import { RecentJobApplicationActivityCardBase } from '@/components/recent-job-application-activity-card-base';

export function RecentJobApplicationActivityCard() {
  return <RecentJobApplicationActivityCardBase ChartComponent={OutreachActivityVictoryChart} />;
}
