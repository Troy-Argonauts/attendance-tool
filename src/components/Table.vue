<template>
  <!-- The AG Grid component -->
  <div class="table-cloth">
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
  </div>
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
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import { parse as parseCsv } from 'papaparse';
import { GridOptions } from 'ag-grid-community';
import {
  allColumnIds,
  columnIdNameMap,
  CSVData,
  TData,
  columnNameIdMap,
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
    // TODO handle errors
    // errors,
  } = parseCsv<CSVData>(stripped, {
    header: true,
    skipEmptyLines: true,
  });
  
  
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
      studentStats.volunteerHours += Number(row.hours);
      // TODO validate number
    } else if (row.regarding === 'Shop hours') {
      if (row.attendanceStatus !== 'Absent') studentStats.shopDaysPresent += 1;
      // TODO multiple submissions on the same day.
      // TODO submissions for days that aren't shop days.
    } else {
      // TODO handle!
      console.warn('Unknown value:', row.regarding);
    }
  
    rowDataValue.push(row);
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
