const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs : [
        {
            name: 'Anh tự do nhưng cô đơn',
            singer: 'Dat G',
            path: './assets/music/Anh_tu_do_nhung_co_don.mp3',
            image: './assets/images/Anhtudonhungcodon.jpg'
        },
        {
            name: 'Chuyện đôi ta hợp tan',
            singer: 'WinD',
            path: './assets/music/Chuyen_doi_ta_hop_tan.mp3',
            image: './assets/images/Chuyendoitahoptan.jpg'

        },
        {
            name: 'Ánh sao và bầu trời',
            singer: 'T.R.I x Cá',
            path: './assets/music/Anh_sao_va_bau_troi.mp3',
            image: './assets/images/Anhsaovabautroi.jpg'
        },
        {
            name: 'Ôm em lần cuối',
            singer: 'NIT x Sing',
            path: './assets/music/Om_em_lan_cuoi.mp3',
            image: './assets/images/Omemlancuoi.jpg'
        },
        {
            name: 'Suýt nữa thì',
            singer: 'Andiez',
            path: './assets/music/Suyt_nua_thi.mp3',
            image: './assets/images/suytnuathi.jpg'
        },
        {
            name: 'Waiting for you',
            singer: 'Mono',
            path: './assets/music/waiting_for_you.mp3',
            image: './assets/images/waitingforyou.jpg'
        },
        {
            name: 'Ngủ một mình',
            singer: 'Hieuthuhai',
            path: './assets/music/ngu_mot_minh.mp3',
            image: './assets/images/ngumotminh.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url(${song.image})"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('\n')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvent: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý CD quay / dừng
       const cdThumAnimate =  cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })

        cdThumAnimate.pause()

        //Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCWidth = cdWidth - scrollTop

            cd.style.width = newCWidth > 0 ? newCWidth + 'px' : 0
            cd.style.opacity = newCWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        //Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumAnimate.play()
        }

        //Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }


        //Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Khi next song
        nextBtn.onclick = function(){
            console.log(_this.isRandom)
            if(_this.isRandom) {
                console.log(123)
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi prev song
        prevBtn.onclick = function(){
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }

        //Xử lý bật / tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //Xử lý lặp lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play()
            }
            nextBtn.click()
        }

        // lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            //Xử lý khi click vào song
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                //Xử lý click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //Xử lý khi click vào song option
                if(e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 500)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = "url('https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg')"
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        //Định nghĩa các thuộc tính cho object
        this.defineProperties()

        //Lắng nghe / xử lý các sự kiện (DOM Events)
        this.handleEvent()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()

        //Hiển thị trạng thái ban đầu của button repeat& random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()