import { useLocalStorage } from "@vueuse/core";
import { computed, reactive, ref, watch } from "vue";
import { parse as parseCsv } from 'papaparse';

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

export type TRawData = {
  volunteerHours: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  mergeName: string;
  fullName: string;
  sector: string;
  reviewedHandbook: string;
  regarding: 'Volunteer hours (team hosted event including Helping at Competition / outreach)' | 'Shop hours' | 'Sponsor/Fundraising';
  teamHosted: string;
  hours: string;
  helpDesc: string;
  competition: string;
  attendanceStatus: 'Absent' | 'Present' | 'Approved';
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

export type TData = TRawData & {
  totalVolunteerHours: number;
  shopDaysPresent: number;
}

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
  totalVolunteerHours: 'Volunteer Hours To Date',
  shopDaysPresent: 'Shop Days Present',
} as const satisfies Record<keyof TData, string>;

export const columnNameIdMap = Object.fromEntries(Object.entries(columnIdNameMap).map(([key, value]) => [value, key])) as Record<string, keyof TData>;

export const allColumnIds = Object.keys(columnIdNameMap) as (keyof TData)[];

export const tableIssues: string[] = reactive([]);

export const storedFile = useLocalStorage<{ content: string; date: string } | null>('storedCSV', null, {
    serializer: {
        read: JSON.parse,
        write: JSON.stringify,
    },
});

export const csvText = computed({
    get: () => storedFile.value?.content || '',
    set: (value: string) => {
        storedFile.value = { content: value, date: new Date().toISOString() };
    },
});

export const rowData = ref<TData[]>([]);
export const stats = reactive({
  students: {} as Record<
    string,
    {
      volunteerHours: number;
      shopDaysPresent: number;
    }
  >,
});

function processCsvText (rawCsvText: string) {
  // reset previous stats
  stats.students = {};
  
  // there are a lot of "blank" lines that I think were manually added. We can strip these.
  // any line that is just ",,,,,,,,,,,,,,,,,,,,,," can be removed
  const stripped = rawCsvText
    .split('\n')
    .filter((line) => !line.trim().match(/^,+$/mug)) // also need to trim first because of `\r\n` possibility
    .join('\n');
  
  const {
    data,
    errors,
  } = parseCsv<CSVData>(stripped, {
    header: true,
    skipEmptyLines: true,
  });
  if (errors.length > 0) {
    alert('Error parsing CSV');
    tableIssues.push(...errors.map(err => `[${err.type}](${err.index}): ${err.message}`))
  }
  
  const processErrors = {
    unknownRegards: new Set<string>(),
    invalidHours: new Set<string>(),
  };
  const rowDataValue: TData[] = [];
  for (const csvRow of data) {
    const row = {} as TData;
  
    // convert csv data
    for (const [csvHeaderName, csvValue] of Object.entries(csvRow)) {
      const colId = columnNameIdMap[csvHeaderName];
      if (colId) {
        (row as Record<string, TData[keyof TData]>)[colId] = csvValue;
  
        // TODO validate that the values given for selection questions match the known list of possible values
        // otherwise, the calculations might mess up
      }
    }
  
    // derived fields
    row.daySubmitted = new Date(csvRow.Timestamp);
    row.mergeName = `${(row.firstName || '').trim().toLowerCase()} ${(row.lastName || '').trim().toLowerCase()}`;
  
    // calculated fields
    const studentStats = stats.students[row.mergeName] || {
      volunteerHours: 0,
      shopDaysPresent: 0,
    };
    stats.students[row.mergeName] = studentStats;
    if (row.regarding === 'Volunteer hours (team hosted event including Helping at Competition / outreach)') {
      const hours = Number(row.hours);
      if (Number.isFinite(hours)) {
        studentStats.volunteerHours += hours;
      } else {
        processErrors.invalidHours.add(`${row.mergeName} entered an invalid value of '${row.hours}' for their hours`);
      }
    } else if (row.regarding === 'Shop hours') {
      if (row.attendanceStatus !== 'Absent') studentStats.shopDaysPresent += 1;
      // TODO multiple submissions on the same day.
      // TODO submissions for days that aren't shop days.
    } else {
      processErrors.unknownRegards.add(row.regarding);
    }
  
    rowDataValue.push(row);
  }
  if (processErrors.unknownRegards.size > 0) {
    tableIssues.push(`Unknown value(s) for "This is in regards to": ${Array.from(processErrors.unknownRegards).map(x => `'${x}'`).join(', ')}`);
  }
  if (processErrors.invalidHours.size > 0) {
    tableIssues.push(...processErrors.invalidHours);
  }
  rowData.value = rowDataValue;
  console.log({ stats });
}

watch(csvText, processCsvText, { immediate: true });

export const shopDates = useLocalStorage<Record<string, boolean>>('shopDates', {
    '10/1': true,
    '10/8': true,
    '10/15': true,
});
