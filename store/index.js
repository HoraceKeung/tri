import VuexPersist from '~/assets/js/vuexPersist'
const app = require('electron').remote.app

const persist = new VuexPersist({
	path: app.getPath('userData'),
	reducer: (state) => {
		return {
			save: state.save
		}
	}
})

export const plugins = [persist.subscribe()]

export const state = () => ({
	kills: 0,
	deaths: 0,
	save: null
})

export const mutations = {
	setKills (state, val) {
		state.kills = val
	},
	setDeaths (state, val) {
		state.deaths = val
	},
	setSave (state, save) {
		state.save = save
	}
}
