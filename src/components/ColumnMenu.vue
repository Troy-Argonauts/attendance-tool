<template>
  <v-list density="compact">
    <v-list-subheader>Column Menu</v-list-subheader>
    <v-btn @click="selectAll" density="compact" class="ma-2" block text="Select All" />
    <v-btn @click="selectNone" density="compact" class="ma-2" block text="Select None" />
    <v-list-item
      v-for="colId of allColumnIds"
      :key="colId"
      @click="localEnabledColumns[colId] = !localEnabledColumns[colId]"
    >
      <template v-slot:prepend>
        <input
          type="checkbox"
          v-model="localEnabledColumns[colId]"
          :id="'column-menu:' + colId"
          class="ma-2"
        />
      </template>
      <template v-slot:title>
        <v-list-item-title v-text="columnIdNameMap[colId]" :title="columnIdNameMap[colId]"/>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { allColumnIds, type TData, columnIdNameMap } from './data';

const props = defineProps<{
  enabledColumns: Record<keyof TData, boolean>;
}>();

const emit = defineEmits(['update:enabledColumns']);

const localEnabledColumns = computed({
  get: () => props.enabledColumns,
  set: (value) => emit('update:enabledColumns', value),
});

watch(
  () => props.enabledColumns,
  (newVal) => {
    localEnabledColumns.value = newVal;
  },
);

function selectAll() {
  for (const colId of allColumnIds) {
    localEnabledColumns.value[colId] = true;
  }
}

function selectNone() {
  for (const colId of allColumnIds) {
    localEnabledColumns.value[colId] = false;
  }
}
</script>
