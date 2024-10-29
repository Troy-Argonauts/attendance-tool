<script setup lang="ts">
import Table from './components/Table.vue';
import ColumnMenu from './components/ColumnMenu.vue';
import { type TData } from './components/data';
import { useLocalStorage } from '@vueuse/core';
import { ref , watch, computed } from 'vue';

const enabledColumns = useLocalStorage(
  'enabledColumns',
  {} as Record<keyof TData, boolean>,
);

const storedFile = useLocalStorage<{ content: string; date: string } | null>('storedCSV', null, {
    serializer: {
        read: JSON.parse,
        write: JSON.stringify,
    },
});

const csvText = computed({
    get: () => storedFile.value?.content || '',
    set: (value: string) => {
        storedFile.value = { content: value, date: new Date().toISOString() };
    },
});
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
    csvText.value = '';
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
        >
            <v-icon>mdi-table</v-icon>
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
        variant="outlined"
      />
    </v-app-bar>
    <v-main class="d-flex">
      <v-card class="flex-grow-1 ma-2 d-flex">
        <v-layout v-if="tab === 0">
          <v-navigation-drawer
            location="right"
            permanent
          >
            <ColumnMenu :enabledColumns.sync="enabledColumns" />
          </v-navigation-drawer>
          <v-main class="d-flex">
            <Table :csvText="csvText" class="flex-grow-1" :enabledColumns="enabledColumns" />
          </v-main>
        </v-layout>
        <v-layout v-else-if="tab === 1">
          Shop Days?
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
