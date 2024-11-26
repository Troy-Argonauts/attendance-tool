import { BasicData, knownAttendanceStatusValues, knownRegardingValues } from "./types";

export function dateValidator (value: string, colId: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return `Invalid date for ${colId}: "${value}"`;
  }
  return true;
}
  
export type ValidatorFn<T> = (value: T, colId: string, basicRowData: BasicData) => string | boolean;
  
export const rowValidations = {
  regarding (regardingValue) {
    if (!knownRegardingValues.includes(regardingValue)) {
      return `Invalid value for "This is in regards to": "${regardingValue}"`;
    }
    return true;
  },
  attendanceStatus (status, _, basicRowData) {
    if (basicRowData.regarding === 'Shop hours' && !knownAttendanceStatusValues.includes(status)) {
      return `Invalid value for "What is the status of your attendance for this date?": "${status}"`;
    }
    return true;
  },
  timestamp: dateValidator,
  selectedDate (val, colId) {
    if (val) {
      return dateValidator(val, colId);
    }
    return true;
  },
} satisfies {
    [colId in keyof BasicData]?: ValidatorFn<BasicData[colId]>;
};
  