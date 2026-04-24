# Reach

Reach is a simple Expo + Supabase CRM app for logging client outreach, managing contacts and companies, and tracking daily outreach momentum.

## What It Does

- Log outreach activity against an existing contact
- Create people and companies inline from the main logging flow
- Browse the app through an animated drawer with:
  - `Outreach Log`
  - `Initiative Dashboard`
- Track daily momentum with a signal-style card based on unique contacts reached that day

## Stack

- Expo
- React Native
- Expo Router
- Supabase
- TypeScript

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your local env file:

   Create `.env.local` and include:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the SQL in Supabase:

   - `sql/001_create_reach_schema.sql`
   - `sql/002_daily_unique_outreach_signal.sql`
   - `sql/003_add_person_title_and_outreach_message.sql`
   - `sql/004_add_person_location.sql`
   - `sql/005_recent_daily_unique_outreach_activity.sql`
   - `sql/006_recent_daily_outreach_elapsed_hours.sql`

4. Start the app:

   ```bash
   npx expo start -c
   ```

## Database Notes

- `001_create_reach_schema.sql` creates:
  - `reach_companies`
  - `reach_people`
  - `reach_outreach_log`
- RLS is enabled on all three tables
- Temporary open policies are included for `anon` and `authenticated` while the app is being prototyped
- `002_daily_unique_outreach_signal.sql` adds an RPC function used by the dashboard to count distinct contacts reached within the device's local day
- `005_recent_daily_unique_outreach_activity.sql` adds the 10-day unique-contact activity RPC used by the dashboard bar chart
- `006_recent_daily_outreach_elapsed_hours.sql` adds the 10-day first-to-last log span RPC used by the dashboard span chart

## Project Structure

```text
app/
  _layout.tsx
  index.tsx
  initiative-dashboard.tsx
components/
hooks/
lib/
sql/
types/
```

## Current Product Shape

- Main screen focused on fast outreach logging
- Add-person modal with inline company creation flow
- Initiative dashboard with:
  - recent unique-contact activity chart
  - daily outreach span chart with elapsed hours and unique contacts on two y axes
  - people count
  - company count
  - daily outreach signal card

## Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Next Good Steps

- Replace open RLS policies with authenticated user policies
- Add initiative-level entities if outreach should be grouped by campaign or project
- Add edit and delete flows for people, companies, and logs
- Add filtering and history views for outreach records
