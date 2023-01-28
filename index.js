//宣告變數
const BASE_URL = "https://webdev.alphacamp.io"; //伺服器主機網址
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/"; //電影圖片

//使用容器將電影資料裝起來
const movies = []; //電影總清單
let filteredMovies = []; //搜尋清單

const MOVIES_PER_PAGE = 12; //每頁有12部電影的參數
let currentPage = 1; // 宣告currentPage去紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤

//Render Movie List：選取html節點"#data-panel"
const dataPanel = document.querySelector("#data-panel");
//search form 提交表單
const searchForm = document.querySelector("#search-form");
//search bar 比對關鍵字搜尋
const searchInput = document.querySelector("#search-input");
//抓取分頁器節點
const paginator = document.querySelector("#paginator");
//切換模式
const modeChangeSwitch = document.querySelector("#change-mode");

//函式一：渲染movies主頁

function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    //使用迭代器forEach 並先看網頁抓取的item為何
    data.forEach((item) => {
      //至.html擷取電影資料結構進行Render
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${
            item.id
          }">+</button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = `<ul class="list-group col-sm-12 mb-2">`;
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`;
    });
    rawHTML += "</ul>";
    dataPanel.innerHTML = rawHTML;
  }
}

// 函式二：依 data-mode 切換不同的顯示方式

function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

//函式三：渲染＆綁定電影 id 資訊

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  //response.data.results
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date:" + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

//函式四：加入最愛

function addToFavorite(id) {
  //使用JSON.parse將localStorage.getItem將字串轉換為object或陣列
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  //用迴圈抓取movies每一部電影，比對id後將陣列
  const movie = movies.find((movie) => movie.id === id);

  // 檢查放進favoriteMovies的清單只能顯示一個電影，不能重複
  // some與find很相像：
  // 1. find回傳元入本身
  // 2. some較單純為只是想要知道陣列是否含有元素，如有的話為true
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  //將favorite所選取的電影推入清單裡
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 函式五： 資料分頁
function getMoviesByPage(page) {
  //movies ? 1.movies 2.filterMovies -> 取決於user是否有搜尋電影，因此：
  //如果filter是有東西的，會回傳filterMovies，否則，回傳movies
  const data = filteredMovies.length ? filteredMovies : movies;

  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 函式六：分頁渲染
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//監聽事件一：按下電影more按鈕後對應不同的電影資料 ＆加入我的最愛
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//監聽事件二：切換模式 Card or List
modeChangeSwitch.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.matches("#card-mode-button")) {
    changeDisplayMode("card-mode");
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-mode-button")) {
    changeDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(currentPage));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);

  renderMovieList(getMoviesByPage(page));
});

//監聽事件三：按下按鈕search提交表單

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault(); //預防瀏覽器預設行為，將網頁控制權交由JavaScript控制行為
  const keyword = searchInput.value.trim().toLowerCase(); //toLowerCase：不管Input值為大小寫都能被比對搜尋到title ; trim() ：將字串前後的空白去掉

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert("cannot found movies with keyword : " + keyword);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1)); //直接顯示第一頁的搜尋結果 （不用特別按下分頁器第一頁才顯示）
});

//axios抓取電影資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length); //呼叫renderPaginator
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));