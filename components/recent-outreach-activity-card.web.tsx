import { RecentOutreachActivityCardBase } from '@/components/recent-outreach-activity-card-base';
import { OutreachActivityVictoryChart } from '@/components/outreach-activity-victory-chart.web';

export function RecentOutreachActivityCard() {
  return <RecentOutreachActivityCardBase ChartComponent={OutreachActivityVictoryChart} />;
}
