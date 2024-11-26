
export const knownCsvColumns = [
  'Volunteer Hours',
  'Timestamp',
  'First Name',
  'Last Name',
  'Merge Name',
  'Full Name',
  'Which sector are you apart of?',
  'I have already reviewed the student handbook. ',
  'This is in regards to:',
  'What team hosted  (TRF, FTC, or FLL)  event / outreach is this for?',
  'How many hours did you clock?',
  'How did You help with this event / outreach?',
  'What competition is this for?',
  'What is the status of your attendance for this date?',
  'Upload picture with two other Argo students or mentors',
  'I have posted in the attendance channel (tagging One mentor and One Captain from my department):',
  'Which of these categories does your situation fall under?',
  'How do we prevent this from happening again? ',
  'Is there anything the team can do to help you?',
  'How was this donation given:',
  'Who was the name of the donor (First and Last name or Company Name):',
  'How much did they donate?',
  'Column 20',
  'Which day is this for?',
] as const;
  
/**
 * Raw CSV data from google sheets
 */
export type CSVData = Record<typeof knownCsvColumns[number], string>;
  
export const knownAttendanceStatusValues = [
  'Absent',
  'Present',
  'APPROVED',
] as const;
  
export const knownRegardingValues = [
  'Volunteer hours (team hosted event including Helping at Competition / outreach)',
  'Shop hours',
  'Sponsor/Fundraising',
] as const;

/**
 * non-calculated / derived fields
 */
export type BasicData = {
  volunteerHours: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  mergeName: string;
  fullName: string;
  sector: string;
  reviewedHandbook: string;
  regarding: typeof knownRegardingValues[number];
  teamHosted: string;
  hours: string;
  helpDesc: string;
  competition: string;
  attendanceStatus: typeof knownAttendanceStatusValues[number];
  picture: string;
  postedInChannel: string;
  situationCategory: string;
  preventionDesc: string;
  teamHelpDesc: string;
  donationMethod: string;
  donorName: string;
  donationAmount: string;
  column20: string;
  /**
   * the student-selected date
   *
   * it is nullable because it wasn't always defined
   */
  selectedDate: string | null;
};


export type DerivedData = {
//   /** the student-selected date */
//   selectedDate: Date | null;
  daySubmitted: Date;
  attendanceStatus: BasicData['attendanceStatus'] | 'Absent (no entry)';
};

/** Normalized columns + derived values */
export type TData = Omit<BasicData, keyof DerivedData> & DerivedData;

/**
 * maps columns from their IDs to their names.
 * 
 * Includes columns from google sheets and derived columns.
 *
 * If the column in the google sheet changes, this must update to match
 */
export const columnIdNameMap = {
  volunteerHours: 'Volunteer Hours',
  timestamp: 'Timestamp',
  daySubmitted: 'Day Submitted',
  firstName: 'First Name',
  lastName: 'Last Name',
  mergeName: 'Merge Name',
  fullName: 'Full Name',
  sector: 'Which sector are you apart of?',
  reviewedHandbook: 'I have already reviewed the student handbook. ',
  regarding: 'This is in regards to:',
  teamHosted: 'What team hosted  (TRF, FTC, or FLL)  event / outreach is this for?',
  hours: 'How many hours did you clock?',
  helpDesc: 'How did You help with this event / outreach?',
  competition: 'What competition is this for?',
  attendanceStatus: 'What is the status of your attendance for this date?',
  picture: 'Upload picture with two other Argo students or mentors',
  postedInChannel: 'I have posted in the attendance channel (tagging One mentor and One Captain from my department):',
  situationCategory: 'Which of these categories does your situation fall under?',
  preventionDesc: 'How do we prevent this from happening again? ',
  teamHelpDesc: 'Is there anything the team can do to help you?',
  donationMethod: 'How was this donation given:',
  donorName: 'Who was the name of the donor (First and Last name or Company Name):',
  donationAmount: 'How much did they donate?',
  column20: 'Column 20',
  selectedDate: 'Which day is this for?',
} as const satisfies Record<keyof TData, string>;

/**
 * maps columns from their names to their IDs
 */
export const columnNameIdMap = Object.fromEntries(Object.entries(columnIdNameMap).map(([id, name]) => [name, id])) as Record<string, keyof TData>;

export const allColumnIds = Object.keys(columnIdNameMap) as (keyof TData)[];
