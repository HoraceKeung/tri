<template>
	<section class="container">
		<div class="position-relative"><div class="position-absolute" style="left: -2rem;">
			<h2>K</h2>
			<h3 v-for="k in kills" :key="k" class="mb-0">{{k}}</h3>
		</div></div>
		<div class="position-relative"><div class="position-absolute" style="right: -2rem;">
			<h2>D</h2>
			<h3 v-for="d in deaths" :key="d" class="mb-0">{{d}}</h3>
		</div></div>
		<div class="w-100">GAME</div>
	</section>
</template>

<script>
export default {
	computed: {
		kills () { return this.$store.state.kills.toString().split('') },
		deaths () { return this.$store.state.deaths.toString().split('') }
	}
}
</script>

<style scoped>
</style>
