<template>
	<section class="container" id="container">
		<div class="position-relative"><div class="position-absolute" style="left: -2rem;">
			<h2>K</h2>
			<h3 v-for="(k,index) in kills" :key="k+index" class="mb-0">{{k}}</h3>
		</div></div>
		<div class="position-relative"><div class="position-absolute" style="right: -2rem;">
			<h2>D</h2>
			<h3 v-for="(d,index) in deaths" :key="d+index" class="mb-0">{{d}}</h3>
		</div></div>
		<div id="gameCont"></div>
	</section>
</template>

<script>
import * as PIXI from 'pixi.js'
import collide from 'triangle-circle-collision'
import cryptoJSON from '~/assets/js/cryptoJson'
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
			this.foeGenInterval = setInterval(() => { this.genFoe() }, 1000 / this.foeGenRate)
			this.foeAiInterval = setInterval(() => { this.ai() }, 500)
			this.makePlayer(new PIXI.Graphics())
			this.FireInterval = setInterval(() => { this.fire() }, 1000 / this.fireRate)
			document.addEventListener('keydown', this.onKeydown)
			this.app.ticker.add(delta => {
				// Update player
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
				// Update player bullets
				this.playerBullets.forEach(b => {
					if (!b.dead) {
						b.sprite.y -= delta * this.bulletSpeed
						if (b.sprite.y + this.playerSize < 0) { b.dead = true }
					}
				})
				// Update foes
				this.foes.forEach(f => {
					if (f.alive) {
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
						if (!this.player.invincible && collide(this.computeTri(this.player.sprite, this.playerSize), [f.sprite.x, f.sprite.y], this.foeR)) { this.playerGetHit() }
						this.playerBullets.forEach(b => {
							if (!b.dead && collide(this.computeTri(b.sprite, this.playerSize / 2), [f.sprite.x, f.sprite.y], this.foeR)) {
								b.sprite.y = -1 * this.playerSize
								b.dead = true
								f.alive = false
								f.sprite.y = this.foeR
								f.sprite.x = -2 * this.foeR
								this.$store.commit('setKills', this.$store.state.kills + 1)
								this.saveGame()
							}
						})
					}
				})
				// Update foe bullets
				this.foeBullets.forEach(fb => {
					if (!fb.dead) {
						fb.sprite.x += fb.movement.x * delta * this.bulletSpeed / 2
						fb.sprite.y += fb.movement.y * delta * this.bulletSpeed / 2
						if ((fb.sprite.x - this.foeR / 2) > this.appW || (fb.sprite.x + this.foeR / 2) < 0 || (fb.sprite.y - this.foeR / 2) > this.appH || (fb.sprite.y + this.foeR / 2) < 0) { fb.dead = true }
						if (!this.player.invincible && collide(this.computeTri(this.player.sprite, this.playerSize), [fb.sprite.x, fb.sprite.y], this.foeR / 2)) { this.playerGetHit() }
					}
				})
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
			if (this.foes.filter(f => f.alive).length < this.maxFoe) {
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
			}
		},
		ai () {
			this.foes.forEach(f => {
				if (f.alive) {
					if (Math.random() > 0.5) { f.movement = JSON.parse(JSON.stringify(this.directions[Math.floor(Math.random() * this.directions.length)])) }
					if (Math.random() > 0.5) {
						const dead = this.foeBullets.find(b => { return b.dead })
						if (typeof dead === 'undefined') {
							const foeBulletSprite = new PIXI.Sprite(this.foeTexture)
							foeBulletSprite.anchor.set(0.5)
							foeBulletSprite.scale.x *= 0.5
							foeBulletSprite.scale.y *= 0.5
							foeBulletSprite.x = f.sprite.x
							foeBulletSprite.y = f.sprite.y
							this.foeBullets.push({
								sprite: foeBulletSprite,
								dead: false,
								movement: this.directions[Math.floor((Math.random() * 8) + 1)]
							})
							this.app.stage.addChild(foeBulletSprite)
						} else {
							dead.sprite.x = f.sprite.x
							dead.sprite.y = f.sprite.y
							dead.dead = false
							dead.movement = this.directions[Math.floor((Math.random() * 8) + 1)]
						}
					}
				}
			})
		},
		makePlayer (graphics) {
			graphics.beginFill(0xffffff)
			graphics.lineStyle(1, 0xffffff, 1)
			graphics.moveTo(this.playerSize / 2, 0)
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
		},
		computeTri (sprite, triSize) {
			return [
				[sprite.x, sprite.y - triSize / 2],
				[sprite.x + triSize / 2, sprite.y + triSize / 2],
				[sprite.x - triSize / 2, sprite.y + triSize / 2]
			]
		},
		playerGetHit () {
			this.$store.commit('setDeaths', this.$store.state.deaths + 1)
			this.saveGame()
			this.player.invincible = true
			const invincibleInterval = setInterval(() => {
				this.player.sprite.alpha = this.player.sprite.alpha === 0.5 ? 1 : 0.5
			}, 50)
			setTimeout(() => {
				this.player.sprite.alpha = 1
				this.player.invincible = false
				clearInterval(invincibleInterval)
			}, 2000)
		},
		fire () {
			if (!this.player.invincible) {
				const dead = this.playerBullets.find(b => { return b.dead })
				if (typeof dead === 'undefined') {
					const bulletSprite = new PIXI.Sprite(this.playerTexture)
					bulletSprite.anchor.set(0.5)
					bulletSprite.scale.x *= 0.5
		    		bulletSprite.scale.y *= 0.5
					bulletSprite.x = this.player.sprite.x
					bulletSprite.y = this.player.sprite.y - this.playerSize / 2
					this.playerBullets.push({
						sprite: bulletSprite,
						dead: false
					})
					this.app.stage.addChild(bulletSprite)
				} else {
					dead.dead = false
					dead.sprite.x = this.player.sprite.x
					dead.sprite.y = this.player.sprite.y - this.playerSize / 2
				}
			}
		},
		saveGame () {
			this.$store.commit('setSave', cryptoJSON.encrypt({
				kills: this.$store.state.kills,
				deaths: this.$store.state.deaths
			}, this.$store.state.key))
		}
	},
	data () {
		return {
			app: null,
			appW: 0,
			appH: 0,
			foeR: 20,
			maxFoe: 20,
			foeGenRate: 2,
			foeGenInterval: null,
			foeAiInterval: null,
			foeTexture: null,
			foes: [],
			foeBullets: [],
			playerSize: 30,
			playerTexture: null,
			player: null,
			playerSpeed: 5,
			fireRate: 3,
			playerBullets: [],
			bulletSpeed: 10,
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
		clearInterval(this.foeGenInterval)
		clearInterval(this.foeAiInterval)
		clearInterval(this.FireInterval)
	}
}
</script>
