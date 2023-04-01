Vue.config.productionTip = false

new Vue({
    el: '#app',
    data: {
        src: ['./img/幻灯片7.jpg', './img/幻灯片8.jpg', './img/幻灯片9.jpg', './img/幻灯片10.jpg',
              './img/幻灯片11.jpg','./img/幻灯片12.jpg','./img/幻灯片13.jpg','./img/幻灯片14.jpg',
              './img/幻灯片15.jpg','./img/幻灯片16.jpg','./img/幻灯片17.jpg','./img/幻灯片18.jpg',
              './img/幻灯片19.jpg','./img/幻灯片20.jpg','./img/幻灯片21.jpg'
        ],
        translateX: 0,
        tsion: true
    },
    methods: {
        // 上一张
        last() {
            this.translateX--
            this.tsion = true
            if (this.translateX < 0) {
                setTimeout(() => {
                    this.tsion = false
                    this.translateX = this.src.length - 1
                }, 500)
            }
        },
        // 下一张
        next() {
            this.translateX++
            this.tsion = true
            if (this.translateX > this.src.length - 1) {
                this.tsion = false
                this.translateX = 0
                // setTimeout(() => {
                //     this.tsion = false
                //     this.translateX = 0
                // }, 500)
            }
            console.log(this.translateX)
            console.log(this.src[this.translateX])
        },
        swiper(i){
            this.translateX = i
        }
    },
    mounted() {
        //setInterval(()=>{
        //    this.next()
        //},3000)
    },
    computed: {
        translate() {
            return -(this.translateX + 1) * 650
        }
    },
    watch: {
        translateX: {
            handler(val) {
                let a = this.$refs.swiper.querySelectorAll('span')
                a.forEach(element => {
                    element.style.width = '12px'
                });

                if (this.translateX < 0) {
                    val = this.src.length - 1
                }
                if (this.translateX > this.src.length - 1) {
                    val = 0
                }
                a[val].style.width = '100px'
            },
        }
    }
})