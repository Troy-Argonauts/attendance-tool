<script setup lang="ts">
import { ref } from 'vue';
import Table from './components/Table.vue';
import ColumnMenu from './components/ColumnMenu.vue';
import { type TData } from './components/data';

const enabledColumns = ref({} as Record<keyof TData, boolean>);
</script>

<template>
    <div :style="{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
    }">
        <Table
            style="flex: 4;"
            class="section"
            :enabledColumns="enabledColumns"
        />
        <ColumnMenu
            :style="{
                flex: 1,
                minWidth: '4rem',
            }"
            class="section"
            :enabledColumns.sync="enabledColumns"
        />
    </div>
</template>

<style scoped>
.section {
    margin: 1rem;
}
</style>
