<template>
  <v-dialog
    v-model="dialog"
    max-width="50vw"
  >
    <v-card>
      <v-card-title>
        Student names have changed. Please verify they are correct.
      </v-card-title>
      <v-card-text class="pa-16">
        <ul>
          <li v-for="name in studentNames" :key="name">
            <pre>{{ name }}</pre>
          </li>
        </ul>
      </v-card-text>
      <v-card-actions>
        <v-btn
          block
          @click="dialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import {
  stats,
} from '../data';
import { useLocalStorage } from "@vueuse/core";

const dialog = ref(false);

const storedNamesChecksum = useLocalStorage('name-checksum', '');

const studentNames = computed(() => Object.keys(stats.students).sort());

async function generateChecksum(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

watch(studentNames, async studentNamesVal => {
  if (studentNamesVal.length > 0) {
    const newChecksum = await generateChecksum(studentNamesVal.join(','));
    if (storedNamesChecksum.value !== newChecksum) {
      storedNamesChecksum.value = newChecksum;
      dialog.value = true;
    }
  }
}, { immediate: true});

</script>