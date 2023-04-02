baseSlide = {
    el: '#app',
    data: {
        src: [],
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
}