<script setup lang="ts">
import Table from './components/Table.vue';
import ColumnMenu from './components/ColumnMenu.vue';
import { type TData } from './components/data';
import { useLocalStorage } from '@vueuse/core';
import { ref } from 'vue';

const enabledColumns = useLocalStorage(
  'enabledColumns',
  {} as Record<keyof TData, boolean>,
);

const file = ref<File | null>(null);

const csvText = ref<string>('');

function onFileChanged (event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    file.value = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      csvText.value = text;
    };
    reader.readAsText(files[0]);
  }
}
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'row',
    }"
  >
    <Table :csvText="csvText" style="flex: 4" class="section" :enabledColumns="enabledColumns" />
    <div
      :style="{
        flex: 1,
        minWidth: '4rem',
      }"
      class="section"
    >
      <h3>Load CSV</h3>
      <input @change="onFileChanged" type="file" accept=".csv" multiple="false" />
      <ColumnMenu :enabledColumns.sync="enabledColumns" />
    </div>
  </div>
</template>

<style scoped>
.section {
  margin: 1rem;
}
</style>
