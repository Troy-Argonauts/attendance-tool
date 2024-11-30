<template>
  <v-card rounded class="table-cloth">
    <ag-grid-vue
      :rowData="studentsRowData"
      :columnDefs="colDefs"
      :gridOptions="gridOptions"
      class="ag-theme-quartz table"
    >
    </ag-grid-vue>
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
.cell-cancelled {
  background-color: lightgray;
}
.cell-absent {
  background-color: lightcoral;
}
.cell-present {
  background-color: lightgreen;
}
</style>

<script lang="ts" setup>
import {
  computed,
} from 'vue';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import { CellClassParams, GridOptions, ValueGetterParams } from 'ag-grid-community';
import {
  stats,
  shopDates,
  getDateKey,
} from '../data';
import {
  TData,
} from '../types';

type StudentStatsRowData = {
  student: string;
  shopDaysPresent: number;
  totalVolunteerHours: number;
  shopDayEntries: TData[];
};

const studentsRowData = computed<StudentStatsRowData[]>(() => {
  return Object.entries(stats.students).map(([mergeName, studentStats]) => ({
    student: mergeName,
    shopDaysPresent: studentStats.shopDaysPresent,
    totalVolunteerHours: studentStats.volunteerHours,
    shopDayEntries: studentStats.shopDayEntries,
  }));
});

// Column Definitions: Defines the columns to be displayed.
const colDefs = computed<NonNullable<GridOptions['columnDefs']>>(() => [
    {
      field: 'student',
      headerName: 'Student',
    },
    {
      field: 'shopDaysPresent',
      headerName: 'Shop Days Present',
    },
    {
      field: 'totalVolunteerHours',
      headerName: 'Total Volunteer Hours',
    },
    ...Object.entries(shopDates.value).map(([dateKey, enabled]) => ({
      field: dateKey,
      headerName: dateKey,
      valueGetter: (params: ValueGetterParams<StudentStatsRowData>) => {
        if (!enabled) {
          return 'Cancelled Shop Day';
        }

        if (params.data) {
          const foundEntry = params.data.shopDayEntries.find(entry => getDateKey(entry.daySubmitted) === dateKey);
          return foundEntry ? foundEntry['attendanceStatus'] : 'Absent (no entry)';
        } else {
          return 'Absent (no entry)';
        }
      },
      cellStyle: (params: CellClassParams<StudentStatsRowData, TData['attendanceStatus']>) => {
        if (params.value === 'Cancelled Shop Day') {
          return { backgroundColor: 'lightgray' };
        } else if (params.value === 'Absent (no entry)' || params.value === 'Absent') {
          return { backgroundColor: 'lightcoral' };
        } else if (params.value === 'Present') {
          return { backgroundColor: 'lightgreen' };
        } else {
          return null;
        }
      },
    })),
]);

const gridOptions: GridOptions<TData> = {
  defaultColDef: {
    sortable: true,
    filter: true,
  },
};
</script>