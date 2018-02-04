<template>
	<section class="container" id="container" @>
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
			this.makeFoeTexture(new PIXI.Graphics())
			this.genFoe()
			this.foeAiInterval = setInterval(() => { this.ai() }, 500)
			this.makePlayer(new PIXI.Graphics())
			document.addEventListener('keydown', this.onKeydown)
			this.app.ticker.add(delta => {
				this.foes.forEach(f => {
					f.sprite.x += f.movement.x * delta
					f.sprite.y += f.movement.y * delta
					if ((f.sprite.x + this.foeR) > this.appW || (f.sprite.x - this.foeR) < 0) {
						f.sprite.x -= f.movement.x * delta
						f.movement.x = -1 * f.movement.x
					}
					if ((f.sprite.y + this.foeR) > this.appH || (f.sprite.y - this.foeR) < 0) {
						f.sprite.y -= f.movement.y * delta
						f.movement.y = -1 * f.movement.y
					}
				})
				this.player.sprite.x += this.player.movement.x * delta
				this.player.sprite.y += this.player.movement.y * delta
				if ((this.player.sprite.x + this.playerSize / 2) > this.appW || (this.player.sprite.x - this.playerSize / 2) < 0) {
					this.player.sprite.x -= this.player.movement.x * delta
				}
				if ((this.player.sprite.y + this.playerSize / 2) > this.appH || (this.player.sprite.y - this.playerSize / 2) < 0) {
					this.player.sprite.y -= this.player.movement.y * delta
				}
				if (this.player.movement.x > 0) { this.player.movement.x -= delta / (100 / this.playerSpeed) }
				if (this.player.movement.x < 0) { this.player.movement.x += delta / (100 / this.playerSpeed) }
				if (this.player.movement.y > 0) { this.player.movement.y -= delta / (100 / this.playerSpeed) }
				if (this.player.movement.y < 0) { this.player.movement.y += delta / (100 / this.playerSpeed) }
			})
		})
	},
	methods: {
		onKeydown (e) {
			switch (e.key) {
			case 'ArrowUp':
				this.player.movement.y = -1 * this.playerSpeed
				break
			case 'ArrowRight':
				this.player.movement.x = 1 * this.playerSpeed
				break
			case 'ArrowDown':
				this.player.movement.y = 1 * this.playerSpeed
				break
			case 'ArrowLeft':
				this.player.movement.x = -1 * this.playerSpeed
				break
			}
		},
		makeFoeTexture (graphics) {
			graphics.beginFill(0xffffff)
			graphics.lineStyle(0)
			graphics.drawCircle(0, 0, this.foeR)
			graphics.endFill()
			this.foeTexture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST)
		},
		genFoe () {
			const randomX = Math.random() * (this.appW - this.foeR * 2) + this.foeR
			const dead = this.foes.find(f => { return !f.alive })
			if (typeof dead === 'undefined') {
				const foeSprite = new PIXI.Sprite(this.foeTexture)
				foeSprite.anchor.set(0.5)
				foeSprite.x = randomX
				foeSprite.y = this.foeR
				this.foes.push({
					sprite: foeSprite,
					alive: true,
					movement: {x: 0, y: 2}
				})
				this.app.stage.addChild(foeSprite)
			} else {
				dead.sprite.x = randomX
				dead.alive = true
				dead.movement = {x: 0, y: 2}
			}
		},
		ai () {
			this.foes.forEach(f => {
				if (f.alive) {
					if (Math.random() > 0.5) { f.movement = this.directions[Math.floor(Math.random() * this.directions.length)] }
				}
			})
		},
		makePlayer (graphics) {
			graphics.beginFill(0xffffff)
			graphics.lineStyle(1, 0xffffff, 1)
			graphics.moveTo(this.playerSize / 2, 0);
			graphics.lineTo(this.playerSize, this.playerSize)
			graphics.lineTo(0, this.playerSize)
			graphics.lineTo(this.playerSize / 2, 0)
			graphics.endFill()
			this.playerTexture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST)
			const playerSprite = new PIXI.Sprite(this.playerTexture)
			playerSprite.anchor.set(0.5)
			playerSprite.x = this.appW / 2
			playerSprite.y = this.appH - (this.playerSize * 2)
			this.player = {
				sprite: playerSprite,
				invincible: false,
				movement: {x: 0, y: 0}
			}
			this.app.stage.addChild(playerSprite)
		}
	},
	watch: {
		foes (arr) {
			if (arr.filter(f => f.alive).length < this.maxFoe) {
				setTimeout(() => { this.genFoe() }, 1000)
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
			foeAiInterval: null,
			foeTexture: null,
			foes: [],
			playerSize: 30,
			playerTexture: null,
			player: null,
			playerSpeed: 3,
			directions: [
				{x: 0, y: 0},
				{x: 0, y: -1},
				{x: Math.sqrt(1), y: -1 * Math.sqrt(1)},
				{x: 1, y: 0},
				{x: Math.sqrt(1), y: Math.sqrt(1)},
				{x: 0, y: 1},
				{x: -1 * Math.sqrt(1), y: Math.sqrt(1)},
				{x: -1, y: 0},
				{x: -1 * Math.sqrt(1), y: -1 * Math.sqrt(1)}
			]
		}
	},
	beforeDestroy () {
		document.removeEventListener('keydown', this.onKeydown)
		clearInterval(this.foeAiInterval)
	}
}
</script>

<style scoped>
</style>
