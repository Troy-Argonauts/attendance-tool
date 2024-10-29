<template>
  <div class="mx-auto" style="max-width: 6in">
    <v-list v-if="mode === 'list'">
      <v-list-subheader>
        Select which dates are included in calculations
      </v-list-subheader>
      <v-list-item
        v-for="(enabled, date) in shopDates"
        :key="date"
        @click="shopDates[date]=!enabled"
      >
        {{ date }}
        <template v-slot:prepend>
          <v-icon
            :icon="enabled ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-textarea
      v-else
      :model-value="shopDatesTxtTemp"
      label="Include ALL Shop Dates, even cancelled ones"
      :error-messages="shopDatesErrors"
      @change="shopDatesTxtTemp = $event.target.value || ''"
    />
    <v-fab
      :icon="mode === 'list' ? 'mdi-pencil' : 'mdi-content-save'"
      location="top right"
      :color="mode === 'list' ? 'orange' : 'light-blue'"
      app
      @click="switchMode"
    />
  </div>
</template>

<script setup lang="ts">
import { shopDates } from './data';
import { computed, ref } from 'vue';

const shopDatesTxtTemp = ref('');

const shopDatesErrors = computed(() => {
  const dates = shopDatesTxtTemp.value.split('\n').filter(x => x.trim());
  const errors = dates.filter(date => {
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/ui);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      const dateObj = new Date(`${year}-${month}-${day}`);
      return !Number.isFinite(dateObj.getTime());
    }
    return true;
  });
  return errors.length > 0 ? `Dates must match the format YYYY-MM-DD. Invalid dates: ${errors.join(', ')}` : '';
});

const mode = ref<'list' | 'edit'>('list');
function switchMode () {
  if (mode.value === 'list') {
    shopDatesTxtTemp.value = Object.keys(shopDates.value).join('\n');
    mode.value = 'edit';
  } else if (shopDatesErrors.value === '') {
    shopDates.value = shopDatesTxtTemp.value
      .split('\n').map(x => x.trim()).filter(x => x)
      .reduce((acc, date) => {
        acc[date] = shopDates.value[date] ?? true;
        return acc;
      }, {} as Record<string, boolean>);
    mode.value = 'list';
  }
}
</script>