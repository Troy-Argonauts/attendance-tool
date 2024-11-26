<script setup lang="ts">
import Table from './components/Table.vue';
import ColumnMenu from './components/ColumnMenu.vue';
import { csvText, storedFile, tableIssues } from './data';
import { type TData } from './types';
import { useLocalStorage } from '@vueuse/core';
import { ref , watch, computed } from 'vue';
import ShopDates from './components/ShopDates.vue';

const enabledColumns = useLocalStorage(
  'enabledColumns',
  {} as Record<keyof TData, boolean>,
);

const fileSelectedDate = computed(() => storedFile.value?.date ? new Date(storedFile.value.date) : null);

const file = ref<File | null>(null);
watch(file, fileVal => {
  if (fileVal) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      csvText.value = text;
    };
    reader.readAsText(fileVal);
  } else {
    csvText.value = null;
  }
});

const tab = ref(0);

const fileInputLabel = computed(() => {
    if (file.value) {
        return 'Loaded CSV';
    } else if (storedFile.value) {
        return 'Loaded CSV from memory';
    } else {
        return 'Load CSV';
    }
})

function clearFiles () {
  file.value = null;
  csvText.value = null;

}

</script>

<template>
  <v-layout>
    <v-app-bar :elevation="2" height="90">
      <v-tabs
        v-model="tab"
        align-tabs="center"
        height="90"
        stacked
      >
        <v-tab
          :value="0"
          :color="tableIssues.length > 0 ? 'red' : ''"
        >
            <v-icon>{{ tableIssues.length > 0 ? 'mdi-alert' : 'mdi-table' }}</v-icon>
            <span>Table</span>
        </v-tab>
        <v-tab :value="1">
            <v-icon>mdi-calendar</v-icon>
            <span>Shop Days</span>
        </v-tab>
        <v-tab
          text="Students"
          :value="2"
        >
            <v-icon>mdi-scale-unbalanced</v-icon>
            <span>Students</span>
        </v-tab>
      </v-tabs>
      <v-file-input
        v-model="file"
        :label="fileInputLabel"
        accept=".csv"
        density="compact"
        :multiple="false"
        :hint="fileSelectedDate ? `Selected at ${fileSelectedDate.toLocaleTimeString()}` : ''"
        persistent-hint
        class="mr-4"
        :clearable="false"
        variant="outlined"
      >
        <template #append-inner>
          <v-btn
            v-if="Boolean(csvText)"
            icon="mdi-close-circle"
            @click.stop="clearFiles()"
          />
        </template>
      </v-file-input>
    </v-app-bar>
    <v-main class="d-flex">
      <v-card class="flex-grow-1 ma-2 d-flex">
        <v-layout v-if="tab === 0">
          <v-navigation-drawer
            location="right"
            permanent
            app
          >
            <ColumnMenu :enabledColumns.sync="enabledColumns" />
          </v-navigation-drawer>
          <v-main class="d-flex flex-column" app>
            <div>
              <v-alert
                v-for="(issue, idx) in tableIssues"
                class="mb-2"
                type="error"
                closable
                :text="issue"
                @click:close="tableIssues.splice(idx, 1)"
              />
            </div>
            <Table :csvText="csvText" class="flex-grow-1" :enabledColumns="enabledColumns" />
          </v-main>
        </v-layout>
        <v-layout v-else-if="tab === 1">
          <v-main app>
            <ShopDates class="mx-auto" style="max-width: 6in" />
          </v-main>
        </v-layout>
        <v-layout v-else-if="tab === 2">
          Students
        </v-layout>
      </v-card>
    </v-main>
  </v-layout>
</template>

<style scoped>
.v-card > .v-layout {
  flex-grow: 1;
}
</style>
