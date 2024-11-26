import { useLocalStorage } from "@vueuse/core";
import { computed, reactive, ref, watch } from "vue";
import { parse as parseCsv } from 'papaparse';
import { BasicData, CSVData, DerivedData, knownAttendanceStatusValues, knownCsvColumns, knownRegardingValues, TData } from "./types";
import { rowValidations, ValidatorFn } from "./validation";

/**
 * all the issues encountered when processing the CSV data
 */
export const tableIssues = ref<string[]>([]);

export const storedFile = useLocalStorage<{ content: string; date: string } | null>('storedCSV', null, {
  serializer: {
    read: JSON.parse,
    write: JSON.stringify,
  },
});

export const csvText = computed({
  get: () => storedFile.value?.content || null,
  set: (value: string | null) => {
    if (value === null) {
      storedFile.value = null;
    } else {
      storedFile.value = { content: value, date: new Date().toISOString() };
    }
  },
});

export const rowData = ref<TData[]>([]);

/** per student information */
export const stats = reactive({
  students: {} as Record<
    string,
    {
      volunteerHours: number;
      shopDaysPresent: number;
      shopDayEntries: TData[];
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
    meta,
  } = parseCsv<CSVData>(stripped, {
    header: true,
    skipEmptyLines: true,
  });
  if (errors.length > 0) {
    tableIssues.value.push(...errors.map(err => `[${err.type}](${err.index}): ${err.message}`))
  }

  const parsedFields = meta.fields;
  if (parsedFields) {
    // validate the parsed fields match what is expected
    const missingFields = knownCsvColumns.filter(col => !parsedFields.includes(col));
    if (missingFields.length > 0) {
      tableIssues.value.push(`Missing fields: ${missingFields.map(f => `"${f}"`).join(', ')}`);
    }
    const unknownFields = parsedFields.filter(col => !(knownCsvColumns as readonly string[]).includes(col));
    if (unknownFields.length > 0) {
      tableIssues.value.push(`Unknown fields: ${unknownFields.map(f => `"${f}"`).join(', ')}`);
    }
  } else {
    tableIssues.value.push('Unable to validate data. No fields found in CSV data');
  }

  const rowDataValue: TData[] = [];
  for (const csvRow of data) {
    const row: BasicData = {
      attendanceStatus: csvRow['What is the status of your attendance for this date?'] as typeof knownAttendanceStatusValues[number],
      column20: csvRow['Column 20'],
      competition: csvRow['What competition is this for?'],
      donationAmount: csvRow['How much did they donate?'],
      donationMethod: csvRow['How was this donation given:'],
      donorName: csvRow['Who was the name of the donor (First and Last name or Company Name):'],
      firstName: csvRow['First Name'],
      fullName: csvRow['Full Name'],
      helpDesc: csvRow['How did You help with this event / outreach?'],
      hours: csvRow['How many hours did you clock?'],
      lastName: csvRow['Last Name'],
      mergeName: csvRow['Merge Name'],
      picture: csvRow['Upload picture with two other Argo students or mentors'],
      postedInChannel: csvRow['I have posted in the attendance channel (tagging One mentor and One Captain from my department):'],
      preventionDesc: csvRow['How do we prevent this from happening again? '],
      regarding: csvRow['This is in regards to:'] as typeof knownRegardingValues[number],
      reviewedHandbook: csvRow['I have already reviewed the student handbook. '],
      sector: csvRow['Which sector are you apart of?'],
      teamHelpDesc: csvRow['Is there anything the team can do to help you?'],
      teamHosted: csvRow['What team hosted  (TRF, FTC, or FLL)  event / outreach is this for?'],
      timestamp: csvRow['Timestamp'],
      situationCategory: csvRow['Which of these categories does your situation fall under?'],
      volunteerHours: csvRow['Volunteer Hours'],
      selectedDate: csvRow['Which day is this for?'] || null,
    };
  
    // validate mapped fields
    for (const [colId, validator] of Object.entries(rowValidations)) {
      const wideValidator = validator as ValidatorFn<string | null>;
      const validationResult = wideValidator(row[colId as keyof BasicData], colId, row);
      if (validationResult !== true) {
        console.log('Invalid row data', row);
      }
      if (typeof validationResult === 'string') {
        tableIssues.value.push(validationResult);
      } else if (validationResult === false) {
        tableIssues.value.push(`Invalid value for column "${colId}": ${validationResult}`);
      }
    }
  
    const derivedData: DerivedData = {
      daySubmitted: new Date(row.timestamp),
    };

    // google sheet has a calculation for mergeName, but we can do it better here.
    row.mergeName = `${(row.firstName || '').trim().toLowerCase()} ${(row.lastName || '').trim().toLowerCase()}`;

    // calculated fields
    // get or create student stats object
    const studentStats = stats.students[row.mergeName] || {
      volunteerHours: 0,
      shopDaysPresent: 0,
      shopDayEntries: [],
    };
    stats.students[row.mergeName] = studentStats; // save it back to the stats object, in case we created it just now.

    const completeRow = {
      ...row,
      ...derivedData,
    };

    
    if (row.regarding === 'Shop hours') {
      studentStats.shopDaysPresent++;
      studentStats.shopDayEntries.push(completeRow);
    } else if (row.regarding === 'Volunteer hours (team hosted event including Helping at Competition / outreach)') {
      studentStats.volunteerHours += Number(row.hours);
    }
  
    rowDataValue.push(completeRow);
  }
  rowData.value = rowDataValue;
  console.log({ stats });
}

watch(csvText, () => {
  tableIssues.value = [];
  rowData.value = [];
  stats.students = {};
  if (csvText.value) {
    processCsvText(csvText.value);
  } else if (storedFile.value) {
    tableIssues.value.push('No CSV data found in file');
  }
}, { immediate: true });

export const shopDates = useLocalStorage<Record<string, boolean>>('shopDates', {
  '2024-10-01': true,
  '2024-10-02': true,
  '2024-10-03': true,
});

export function getDateKey (date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
