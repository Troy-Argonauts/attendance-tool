<template>
  <!-- The AG Grid component -->
  <v-card rounded class="table-cloth">
    <ag-grid-vue
      v-if="anyEnabledColumn"
      :rowData="rowData"
      :columnDefs="colDefs"
      :gridOptions="gridOptions"
      class="ag-theme-quartz table"
    >
    </ag-grid-vue>
    <div v-else>
      <p>No columns are enabled.</p>
    </div>
  </v-card>
</template>

<style scoped>
.table-cloth {
  position: relative;
}
.table {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
</style>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import { parse as parseCsv } from 'papaparse';
import { GridOptions } from 'ag-grid-community';
import {
  allColumnIds,
  columnIdNameMap,
  CSVData,
  TData,
  columnNameIdMap,
  tableIssues,
} from './data';

const props = defineProps<{
  enabledColumns: Record<string, boolean>;
  csvText: string;
}>();

// TODO loading indicator
const rowData = ref<TData[]>([]);
const stats = reactive({
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

watch(() => props.csvText, processCsvText, { immediate: true });

// Column Definitions: Defines the columns to be displayed.
const colDefs = computed<NonNullable<GridOptions<TData>['columnDefs']>>(() => [
  ...allColumnIds
    .map((colId) => ({
      field: colId,
      headerName: columnIdNameMap[colId],
    }))
    .filter((col) => props.enabledColumns[col.field!]),
  
  // calculated columns
  {
    field: 'totalVolunteerHours',
    headerName: columnIdNameMap['totalVolunteerHours'],
    valueGetter: params => {
      if (params.data) {
        const studentStats = stats.students[params.data.mergeName];
        return studentStats?.volunteerHours;
      } else {
        return 0;
      }
    },
  },
  {
    field: 'shopDaysPresent',
    headerName: columnIdNameMap['shopDaysPresent'],
    valueGetter: params => {
      if (params.data) {
        const studentStats = stats.students[params.data.mergeName];
        return studentStats?.shopDaysPresent;
      } else {
        return 0;
      }
    },
  },
]);

const anyEnabledColumn = computed(() =>
  Boolean(allColumnIds.find((colId) => props.enabledColumns[colId])),
);

const gridOptions: GridOptions<TData> = {
  defaultColDef: {
    sortable: true,
    filter: true,
  },
};
</script>
