export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)", offset: "UTC+05:30" },
  { value: "Asia/Dubai", label: "Dubai / Gulf Time (GST)", offset: "UTC+04:00" },
  { value: "Asia/Singapore", label: "Singapore / Malaysia (SGT)", offset: "UTC+08:00" },
  { value: "Asia/Bangkok", label: "Bangkok / Indochina (ICT)", offset: "UTC+07:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)", offset: "UTC+09:00" },
  { value: "Europe/London", label: "London / UK (GMT/BST)", offset: "UTC+00:00" },
  { value: "Europe/Paris", label: "Paris / Berlin / Central Europe (CET)", offset: "UTC+01:00" },
  { value: "America/New_York", label: "US Eastern Time (EST/EDT)", offset: "UTC-05:00" },
  { value: "America/Chicago", label: "US Central Time (CST/CDT)", offset: "UTC-06:00" },
  { value: "America/Denver", label: "US Mountain Time (MST/MDT)", offset: "UTC-07:00" },
  { value: "America/Los_Angeles", label: "US Pacific Time (PST/PDT)", offset: "UTC-08:00" },
  { value: "America/Toronto", label: "Toronto / Canada Eastern", offset: "UTC-05:00" },
  { value: "Australia/Sydney", label: "Sydney / Melbourne (AEST)", offset: "UTC+10:00" },
  { value: "Pacific/Auckland", label: "Auckland / New Zealand (NZST)", offset: "UTC+12:00" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)", offset: "UTC+00:00" },
];
