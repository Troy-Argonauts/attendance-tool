export type CSVData = {
  'Volunteer Hours': string;
  Timestamp: string;
  'First Name': string;
  'Last Name': string;
  'Merge Name': string;
  'Full Name': string;
  'Which sector are you apart of?': string;
  'I have already reviewed the student handbook. ': string;
  'This is in regards to:': string;
  'What team hosted  (TRF, FTC, or FLL)  event / outreach is this for?': string;
  'How many hours did you clock?': string;
  'How did You help with this event / outreach?': string;
  'What competition is this for?': string;
  'What is the status of your attendance today?': string;
  'Upload picture with two other Argo students or mentors': string;
  'I have posted in the attendance channel (tagging One mentor and One Captain from my department):': string;
  'Which of these categories does your situation fall under?': string;
  'How do we prevent this from happening again? ': string;
  'Is there anything the team can do to help you?': string;
  'How was this donation given:': string;
  'Who was the name of the donor (First and Last name or Company Name):': string;
  'How much did they donate?': string;
  'Column 20': string;
};

export type TData = {
  volunteerHours: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  mergeName: string;
  fullName: string;
  sector: string;
  reviewedHandbook: string;
  regarding: string;
  teamHosted: string;
  hours: string;
  helpDesc: string;
  competition: string;
  attendanceStatus: string;
  picture: string;
  postedInChannel: string;
  situationCategory: string;
  preventionDesc: string;
  teamHelpDesc: string;
  donationMethod: string;
  donorName: string;
  donationAmount: string;
  column20: string;

  daySubmitted: Date;
};

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
  attendanceStatus: 'What is the status of your attendance today?',
  picture: 'Upload picture with two other Argo students or mentors',
  postedInChannel: 'I have posted in the attendance channel (tagging One mentor and One Captain from my department):',
  situationCategory: 'Which of these categories does your situation fall under?',
  preventionDesc: 'How do we prevent this from happening again? ',
  teamHelpDesc: 'Is there anything the team can do to help you?',
  donationMethod: 'How was this donation given:',
  donorName: 'Who was the name of the donor (First and Last name or Company Name):',
  donationAmount: 'How much did they donate?',
  column20: 'Column 20',
} as const satisfies Record<keyof TData, string>;

export const columnNameIdMap = Object.fromEntries(Object.entries(columnIdNameMap).map(([key, value]) => [value, key])) as Record<string, keyof TData>;

export const allColumnIds = Object.keys(columnIdNameMap) as (keyof TData)[];
