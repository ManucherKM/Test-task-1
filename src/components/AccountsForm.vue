<template>
	<div class="accounts-form">
		<div class="header">
			<h1>Управление учетными записями</h1>
			<a-button type="primary" shape="circle" @click="handleAddAccount"
				>+</a-button
			>
		</div>
		<a-card
			v-for="account in localAccounts"
			:key="account.id"
			style="margin-bottom: 20px"
		>
			<a-form layout="vertical">
				<a-form-item
					label="Метка (не более 50 символов, разделяются знаком ';')"
					:validate-status="account.errors.label ? 'error' : ''"
					help="При превышении 50 символов поле будет выделено"
				>
					<a-input
						v-model:value="account.labelInput"
						@blur="handleLabelBlur(account)"
					/>
				</a-form-item>
				<a-form-item label="Тип записи">
					<a-select
						v-model:value="account.type"
						@change="handleTypeChange(account)"
					>
						<a-select-option value="LDAP">LDAP</a-select-option>
						<a-select-option value="Локальная">Локальная</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item
					label="Логин (обязательно, не более 100 символов)"
					:validate-status="account.errors.login ? 'error' : ''"
					help="Обязательное поле"
				>
					<a-input
						v-model:value="account.login"
						@blur="validateAccount(account)"
					/>
				</a-form-item>
				<a-form-item
					v-if="account.type === 'Локальная'"
					label="Пароль (обязательно, не более 100 символов)"
					:validate-status="account.errors.password ? 'error' : ''"
					help="Обязательное поле"
				>
					<a-input-password
						v-model:value="account.password"
						@blur="validateAccount(account)"
					/>
				</a-form-item>
				<a-button type="danger" @click="handleDeleteAccount(account.id)"
					>Удалить</a-button
				>
			</a-form>
		</a-card>
	</div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useAccountsStore } from "../store/accounts";
import type { Account, LabelItem } from "../store/accounts";

interface LocalAccount extends Account {
  labelInput: string; // строка для ввода меток
  errors: {
    label: boolean;
    login: boolean;
    password: boolean;
  };
}

export default defineComponent({
  name: "AccountsForm",
  setup() {
    const accountsStore = useAccountsStore();
    const localAccounts = reactive<LocalAccount[]>([]);

    // Инициализируем локальное состояние на основе store
    accountsStore.accounts.forEach((acc) => {
      localAccounts.push({
        ...acc,
        labelInput: acc.label.map((item) => item.text).join("; "),
        errors: {
          label: false,
          login: false,
          password: false,
        },
      });
    });

    function handleAddAccount() {
      accountsStore.addAccount();
      const newAcc = accountsStore.accounts[accountsStore.accounts.length - 1];
      localAccounts.push({
        ...newAcc,
        labelInput: "",
        errors: {
          label: false,
          login: false,
          password: false,
        },
      });
    }

    function handleDeleteAccount(id: number) {
      accountsStore.deleteAccount(id);
      const index = localAccounts.findIndex((acc) => acc.id === id);
      if (index !== -1) {
        localAccounts.splice(index, 1);
      }
    }

    function handleLabelBlur(account: LocalAccount) {
      if (account.labelInput.length > 50) {
        account.errors.label = true;
      } else {
        account.errors.label = false;
      }
      // Преобразуем строку в массив меток
      const labels: LabelItem[] = account.labelInput
        .split(";")
        .map((item) => item.trim())
        .filter((item) => item)
        .map((item) => ({ text: item }));
      account.label = labels;
      updateAccount(account);
    }

    function handleTypeChange(account: LocalAccount) {
      if (account.type === "LDAP") {
        account.password = null;
        account.errors.password = false;
      }
      validateAccount(account);
    }

    function validateAccount(account: LocalAccount) {
      if (!account.login || account.login.length > 100) {
        account.errors.login = true;
      } else {
        account.errors.login = false;
      }
      if (account.type === "Локальная") {
        if (!account.password || (account.password as string).length > 100) {
          account.errors.password = true;
        } else {
          account.errors.password = false;
        }
      }
      if (
        !account.errors.login &&
        !account.errors.password &&
        !account.errors.label
      ) {
        updateAccount(account);
      }
    }

    function updateAccount(account: LocalAccount) {
      const updatedAccount: Account = {
        id: account.id,
        label: account.label,
        type: account.type,
        login: account.login,
        password:
          account.type === "Локальная" ? (account.password as string) : null,
      };
      accountsStore.updateAccount(updatedAccount);
    }

    return {
      localAccounts,
      handleAddAccount,
      handleDeleteAccount,
      handleLabelBlur,
      handleTypeChange,
      validateAccount,
    };
  },
});
</script>

<style scoped>
.accounts-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header h1 {
  margin: 0;
}
</style>
