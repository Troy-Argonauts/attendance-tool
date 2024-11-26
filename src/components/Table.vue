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
import { computed } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import { GridOptions } from 'ag-grid-community';
import {
  rowData,
} from '../data';
import {
  allColumnIds,
  columnIdNameMap,
  TData,
} from '../types';

const props = defineProps<{
  enabledColumns: Record<string, boolean>;
  csvText: string | null;
}>();

// Column Definitions: Defines the columns to be displayed.
const colDefs = computed<NonNullable<GridOptions<TData>['columnDefs']>>(() => {
  // // calculated columns
  // const totalVolunteerHoursColDef: ColDef<TData> = {
  //   field: 'totalVolunteerHours',
  //   headerName: columnIdNameMap['totalVolunteerHours'],
  //   valueGetter: params => {
  //     if (params.data) {
  //       const studentStats = stats.students[params.data.mergeName];
  //       return studentStats?.volunteerHours;
  //     } else {
  //       return 0;
  //     }
  //   },
  // };

  return [
    ...allColumnIds
      .map((colId) => ({
        field: colId,
        headerName: columnIdNameMap[colId],
      }))
      .filter((col) => props.enabledColumns[col.field!]),
    
    // {
    //   field: 'shopDaysPresent',
    //   headerName: columnIdNameMap['shopDaysPresent'],
    //   valueGetter: params => {
    //     if (params.data) {
    //       const studentStats = stats.students[params.data.mergeName];
    //       return studentStats?.shopDaysPresent;
    //     } else {
    //       return 0;
    //     }
    //   },
    // },
  ]
});

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
