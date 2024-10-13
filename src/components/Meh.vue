<template>
  <!-- The AG Grid component -->
  <ag-grid-vue
    :rowData="rowData"
    :columnDefs="colDefs"
    style="height: 500px"
    class="ag-theme-quartz"
  >
  </ag-grid-vue>
</template>

<script lang="ts">
import { ref } from "vue";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component
import formResponsesUrl from "../assets/FormResponses.txt";
import { parse as parseCsv } from "papaparse";
// import { GridOp} from "ag-grid-community";

type TData = {
  'Volunteer Hours': string;
  'Timestamp': string;
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

export default {
  name: "App",
  components: {
    AgGridVue, // Add Vue Data Grid component
  },
  setup() {
    // Row Data: The data to be displayed.
    const rowData = ref([
      { make: "Tesla", model: "Model Y", price: 64950, electric: true },
      { make: "Ford", model: "F-Series", price: 33850, electric: false },
      { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    async function getData() {
      const response = await fetch(formResponsesUrl);
      const rawText = await response.text();

      // there are a lot of "blank" lines that I think were manually added. We can strip these.
      // any line that is just ",,,,,,,,,,,,,,,,,,,,,," can be removed
      const stripped = rawText
        .split("\n")
        .filter((line) => line.trim() !== ",,,,,,,,,,,,,,,,,,,,,,")
        .join("\n");

      const { data, errors } = parseCsv<TData>(stripped, {
        header: true,
        skipEmptyLines: true,
      });

      // TODO handle errors
      console.log(data);
    }

    getData().catch(console.error);

    // Column Definitions: Defines the columns to be displayed.
    const colDefs = ref([
      { field: "make" },
      { field: "model" },
      { field: "price" },
      { field: "electric" },
    ]);

    return {
      rowData,
      colDefs,
    };
  },
};
</script>
