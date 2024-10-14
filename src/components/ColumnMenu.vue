<template>
  <div style="display: flex; flex-direction: column">
    <h3>Column Menu</h3>
    <p>
      <button @click="selectAll">All</button>
      &nbsp;
      <button @click="selectNone">None</button>
    </p>
    <ul :style="{
      flex: '1 0 0',
    }">
      <li v-for="colId of allColumnIds">
        <input
          type="checkbox"
          v-model="localEnabledColumns[colId]"
          :id="'column-menu:' + colId"
        />
        <label :for="'column-menu:' + colId">{{ columnIdNameMap[colId] }}</label>
      </li>
    </ul>
    <div>
      <!-- EXAMPLE -->
      <label for="preset">Presets:</label>
      <select name="preset">
        <option>Shop Hours</option>
        <option>Volunteer Hours</option>
      </select>
      <button>Apply</button>
      <br />
      <button>Save</button>
      <button>Save As</button>
      <button>Delete</button>
    </div>
  </div>
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
