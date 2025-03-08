import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LabelItem {
	text: string
}

export interface Account {
	id: number
	label: LabelItem[]
	type: 'LDAP' | 'Локальная'
	login: string
	password: string | null
}

export const useAccountsStore = defineStore('accounts', () => {
	const accounts = ref<Account[]>([])

	// Загружаем данные из localStorage, если они есть
	const stored = localStorage.getItem('accounts')
	if (stored) {
		try {
			accounts.value = JSON.parse(stored)
		} catch (e) {
			console.error('Ошибка загрузки аккаунтов из localStorage', e)
		}
	}

	function saveAccounts() {
		localStorage.setItem('accounts', JSON.stringify(accounts.value))
	}

	function addAccount() {
		const newAccount: Account = {
			id: Date.now(),
			label: [],
			type: 'Локальная', // по умолчанию тип – Локальная
			login: '',
			password: '',
		}
		accounts.value.push(newAccount)
		saveAccounts()
	}

	function updateAccount(updatedAccount: Account) {
		const index = accounts.value.findIndex(acc => acc.id === updatedAccount.id)
		if (index !== -1) {
			accounts.value[index] = updatedAccount
			saveAccounts()
		}
	}

	function deleteAccount(id: number) {
		accounts.value = accounts.value.filter(acc => acc.id !== id)
		saveAccounts()
	}

	return { accounts, addAccount, updateAccount, deleteAccount }
})
