import { RecentOutreachActivityCardBase } from '@/components/recent-outreach-activity-card-base';
import { OutreachActivityVictoryChart } from '@/components/outreach-activity-victory-chart.native';

export function RecentOutreachActivityCard() {
  return <RecentOutreachActivityCardBase ChartComponent={OutreachActivityVictoryChart} />;
}
