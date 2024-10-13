<template>
  <!-- The AG Grid component -->
  <div class="table-cloth">
    <ag-grid-vue
      v-if="anyEnabledColumn"
      :rowData="rowData"
      :columnDefs="colDefs"
      class="ag-theme-quartz table"
    >
    </ag-grid-vue>
    <div
      v-else
    >
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
import { computed, ref } from 'vue';
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import formResponsesUrl from '../assets/FormResponses.txt';
import { parse as parseCsv } from 'papaparse';
import { ColDef, GridOptions } from 'ag-grid-community';
import { allColumnIds, columnIdNameMap, CSVData, TData, columnNameIdMap } from './data';

const props = defineProps<{
  enabledColumns: Record<string, boolean>;
}>();

// TODO loading indicator
const rowData = ref<TData[]>([]);

async function getData() {
  const response = await fetch(formResponsesUrl);
  const rawText = await response.text();

  // there are a lot of "blank" lines that I think were manually added. We can strip these.
  // any line that is just ",,,,,,,,,,,,,,,,,,,,,," can be removed
  const stripped = rawText
    .split('\n')
    .filter((line) => line.trim() !== ',,,,,,,,,,,,,,,,,,,,,,') // also need to trim first because of `\r\n` possibility
    .join('\n');

  const { data, errors } = parseCsv<CSVData>(stripped, {
    header: true,
    skipEmptyLines: true,
  });

  // TODO handle errors

  const rowDataValue: TData[] = [];
  for (const csvRow of data) {
    const row = {} as TData;

    // convert csv data
    for (const [csvHeaderName, csvValue] of Object.entries(csvRow)) {
      const colId = columnNameIdMap[csvHeaderName];
      if (colId) {
        if (colId !== 'daySubmitted') { // ignore calculated fields we will add in a moment.
          row[colId] = csvValue;
        }
      }
    }

    // derived fields
    row.daySubmitted = new Date(csvRow.Timestamp);

    rowDataValue.push(row);
  }
  rowData.value = rowDataValue;
}

getData().catch(console.error);

// Column Definitions: Defines the columns to be displayed.
const colDefs = computed<NonNullable<GridOptions<TData>['columnDefs']>>(() => {
  return allColumnIds.map((colId) => ({
    field: colId,
    headerName: columnIdNameMap[colId],
  })).filter((col) => props.enabledColumns[col.field!]);
});

const anyEnabledColumn = computed(() => Boolean(allColumnIds.find(colId => props.enabledColumns[colId])));
</script>
