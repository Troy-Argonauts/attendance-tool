import { reactive, watch } from "vue";
import { getDateKey, shopDates, stats } from "./data";

export const statsTableIssues = reactive<{
  student: string;
  date: string;
  issue: string;
}[]>([]);

watch([stats, shopDates], ([statsVal, shopDatesVal]) => {
  while (statsTableIssues.length > 0) {
    statsTableIssues.splice(0, statsTableIssues.length);
  }

  for (const [mergeName, studentStats] of Object.entries(statsVal.students)) {
    const seenShopDays = new Set<string>();
    for (const entry of studentStats.shopDayEntries) {
      // check for duplicates
      if (seenShopDays.has(getDateKey(entry.trackingDate))) {
        statsTableIssues.push({
          student: mergeName,
          date: getDateKey(entry.trackingDate),
          issue: 'Duplicate entry',
        });
        console.warn('Duplicate entry', entry);
      } else {
        seenShopDays.add(getDateKey(entry.trackingDate));
      }

      // check for entries on a non-shop day
      if (!shopDatesVal[getDateKey(entry.trackingDate)]) {
        statsTableIssues.push({
          student: mergeName,
          date: getDateKey(entry.trackingDate),
          issue: 'Entry on a non-shop day',
        });
        console.warn('Entry on a non-shop day', entry);
      }

      // stop after 50 issues
      if (statsTableIssues.length > 50) {
        return;
      }
    }
  }
  console.log({ statsTableIssues });
}, { immediate: true });
