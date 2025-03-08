<template>
	<AccountsForm />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AccountsForm from './components/AccountsForm.vue'

export default defineComponent({
  name: 'App',
  components: {
    AccountsForm
  }
})
</script>
