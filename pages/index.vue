<template>
	<section class="d-flex position-absolute w-100" style="top: 0px; bottom: 0px;">
		<div class="m-auto text-center">
			<h1 class="mb-5">TRI</h1>
			<nuxt-link to="/game" class="btn btn-tri">Start</nuxt-link>
		</div>
	</section>
</template>

<script>
import cryptoJSON from '~/assets/js/cryptoJson'
export default {
	created () {
		if (this.$store.state.save) {
			const save = cryptoJSON.decrypt(this.$store.state.save, this.$store.state.key)
			this.$store.commit('setKills', save.kills)
			this.$store.commit('setDeaths', save.deaths)
		}
	}
}
</script>
