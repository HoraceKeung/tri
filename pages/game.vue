<template>
	<section class="container" id="container">
		<div class="position-relative"><div class="position-absolute" style="left: -2rem;">
			<h2>K</h2>
			<h3 v-for="k in kills" :key="k" class="mb-0">{{k}}</h3>
		</div></div>
		<div class="position-relative"><div class="position-absolute" style="right: -2rem;">
			<h2>D</h2>
			<h3 v-for="d in deaths" :key="d" class="mb-0">{{d}}</h3>
		</div></div>
		<div id="gameCont"></div>
	</section>
</template>

<script>
import * as PIXI from 'pixi.js'
export default {
	computed: {
		kills () { return this.$store.state.kills.toString().split('') },
		deaths () { return this.$store.state.deaths.toString().split('') }
	},
	mounted () {
		this.$nextTick(() => {
			this.appH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
			this.appW = document.getElementById('container').getBoundingClientRect().width - 30
			this.app = new PIXI.Application(this.appW, this.appH)
			document.getElementById('gameCont').appendChild(this.app.view)
			const graphics = new PIXI.Graphics()
			this.makeFoeTexture(graphics)
			this.genFoe()
		})
	},
	methods: {
		makeFoeTexture (graphics) {
			graphics.beginFill(0xffffff)
			graphics.lineStyle(0)
			graphics.drawCircle(0, 0, this.foeR)
			graphics.endFill()
			this.foeTexture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST)
		},
		genFoe () {
			const foeSprite = new PIXI.Sprite(this.foeTexture)
			foeSprite.anchor.set(0.5)
			foeSprite.x = Math.random() * (this.appW - this.foeR * 2) + this.foeR
			foeSprite.y = this.foeR
			this.foes.push({
				sprite: foeSprite,
				alive: true
			})
			this.app.stage.addChild(foeSprite)
		}
	},
	watch: {
		foes (arr) {
			if (arr.length < this.maxFoe) {

				console.log('in here')
				this.genFoe()
			}
		}
	},
	data () {
		return {
			app: null,
			appW: 0,
			appH: 0,
			foeR: 20,
			maxFoe: 20,
			foeTexture: null,
			player: null,
			foes: []
		}
	}
}
</script>

<style scoped>
</style>
