// 1. render song
// 2. scroll top
// 3.play/pause/seek
// 4.CD rotate
// 5.Next / prev
// 6.Random
// 7.Next / repeat when ended
// 8. Active song
// 9.Scroll active song into view
// 10.play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MINHTHUAN_PLAYER";
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const player = $(".player");
const playbtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevSong = $(".btn-prev");
const nextSong = $(".btn-next");
const repeat = $(".btn-repeat");
const randomSong = $(".btn-random");
const playlist = $(".playlist");

const app = {
  CurrentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  // phuong thuc cau hinh de sau khi next hoac prev thi van giu nguyen cau hinh
  setconfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "dieu em khong muon nghe ",
      singer: "QNT",
      path: "./assets/music/DieuEmKhongMuonNghe-QNTDick-9641780.mp3",
      image: "https://avatar-ex-swe.nixcdn.com/song/2023/06/10/9/9/f/2/1686333363808_500.jpg",
    },
    {
      name: "anh da on hon ",
      singer: "mck",
      path: "./assets/music/AnhDaOnHon-MCK-8804113.mp3",
      image: "https://avatar-ex-swe.nixcdn.com/song/2023/03/02/2/7/5/d/1677770731533_500.jpg",
    },
    {
      name: "NeuAnhChangConThucDay",
      singer: "Nguyen",
      path: "./assets/music/NeuAnhChangConThucDay-Nguyenn-9646408.mp3",
      image: "/code_music/assets/img/1686541162419_500.jpg",
    },
    {
      name: "roi ta se ngam phao hoa cung nhau",
      singer: "Olew",
      path: "./assets/music/RoiTaSeNgamPhaoHoaCungNhau-OlewVietNam-8485329.mp3",
      image: "https://avatar-ex-swe.nixcdn.com/song/2022/12/28/a/4/7/d/1672214548521_500.jpg",
    },
    {
      name: "TinhYeuChamTreSpedUp",
      singer: "Monstart",
      path: "./assets/music/TinhYeuChamTreSpedUp-MONSTAR-9045989.mp3",
      image: "https://avatar-ex-swe.nixcdn.com/song/2023/04/11/2/0/7/7/1681199771501_500.jpg",
    },
    {
      name: "ngày em đẹp nhất ",
      singer: "TaMa",
      path: "./assets/music/NgayEmDepNhat-TamaVietNam-9037695.mp3",
      image: "https://avatar-ex-swe.nixcdn.com/song/2023/04/10/e/5/0/a/1681108357326_500.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
      <div class="song${index == this.CurrentIndex ? " active" : ""}" data-index="${index}">
          <div
            class="thumb"
            style="
              background-image: url(${song.image});
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `;
    });
    playlist.innerHTML = htmls.join("\n");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.CurrentIndex];
      },
    });
  },
  handleEvent: function () {
    const cdWidth = cd.offsetWidth;
    // xử lí cho cd rotate quay / dung
    const cdthumbAniamte = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 second
      iterations: Infinity,
    });
    cdthumbAniamte.pause();
    // xử lí khi phóng to /thu nhỏ CD
    document.onscroll = function () {
      const scrolltop = window.scrollY || document.documentElement.scrollTop;
      const newcdWidth = cdWidth - scrolltop;

      cd.style.width = newcdWidth > 0 ? newcdWidth + "px" : 0;
      cd.style.opacity = newcdWidth / cdWidth;
    };
    //  xử lí khi click play
    playbtn.onclick = function () {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // khi song được play
    audio.onplay = function () {
      app.isPlaying = true;
      player.classList.add("playing");
      cdthumbAniamte.play();
    };
    // khi song bi pause
    audio.onpause = function () {
      app.isPlaying = false;
      player.classList.remove("playing");
      cdthumbAniamte.pause();
    };
    // khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = progressPercent;
      }
    };
    // khi bài hát kết thúc
    audio.onended = function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextSong.click();
      }
    };
    // xử lí khi tua xong
    (progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    }),
      // xử lí khi click vào nút next
      (nextSong.onclick = function () {
        if (app.isRandom) {
          app.randomSong();
        } else {
          app.nextSong();
        }
        app.render();
        app.ScrollToActiveSong();
      });
    // xử lí khi click vào nút prev
    prevSong.onclick = function () {
      if (app.isRandom) {
        app.randomSong();
      } else {
        app.prevSong();
      }
      app.render();
      app.ScrollToActiveSong();
    };
    // xử lí khi click vào nút repeat
    repeat.onclick = function () {
      app.isRepeat = !app.isRepeat;
      app.setconfig("isRepeat", app.isRepeat);
      this.classList.toggle("active", app.isRepeat);
    };
    // xử lí khi click vào nút random bài hát
    randomSong.onclick = function () {
      app.isRandom = !app.isRandom;
      app.setconfig("isRandom", app.isRandom);
      this.classList.toggle("active", app.isRandom);
    };
    // play song when click
    playlist.onclick = function (e) {
      const song = e.target.closest(".song:not(.active)");
      const option = e.target.closest(".option");
      if (song || option) {
        // xử lí khi click vào song
        if (song && !option) {
          // cach su dung dataset set attribute la data-index thi co the su dung dataset
          app.CurrentIndex = song.dataset.index;
          // cach khac
          // app.CurrentIndex = song.getAttribute("data-index");
          app.loadCurrentSong();
          audio.play();
          app.render();
          app.ScrollToActiveSong();
        }
        // xử lí khi click vào nút ba chấm ra tùy chọn option
        if (option && !song) {
          console.log("chua xu li ");
        }
      }
    };
  },
  ScrollToActiveSong: function () {
    if (this.CurrentIndex <= 0 || this.CurrentIndex >= 1) {
      setTimeout(function () {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    } else {
      setTimeout(function () {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 300);
    }
  },
  nextSong: function () {
    this.CurrentIndex++;
    if (this.CurrentIndex >= this.songs.length) {
      this.CurrentIndex = 0;
    }
    this.loadCurrentSong();
    audio.play();
  },
  prevSong: function () {
    this.CurrentIndex--;
    if (this.CurrentIndex < 0) {
      this.CurrentIndex = this.songs.length;
    }
    this.loadCurrentSong();
    audio.play();
  },
  randomSong: function () {
    let temp = this.CurrentIndex;
    do {
      this.CurrentIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.CurrentIndex === temp);
    audio.currentTime = 0;
    app.loadCurrentSong();
    audio.play();
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },
  start: function () {
    // gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // định nghĩa các thuộc tính cho object
    this.defineProperties();

    // lắng nghe / xử lí  các sự kiện DOm
    this.handleEvent();

    // tải thông tin bài hát đầu tiên vào ui khi chạy ứng dungj
    this.loadCurrentSong();

    //render playlist
    this.render();
    // hiển thị trạng thái ban đầu của button repeat và random
    repeat.classList.toggle("active", app.isRepeat);
    randomSong.classList.toggle("active", app.isRandom);
  },
};

app.start();
