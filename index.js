//step1.宣告變數
const BASE_URL = 'https://webdev.alphacamp.io' //伺服器主機網址
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/' //電影圖片
const MOVIES_PER_PAGE = 12 //每頁有12部電影的參數


//step3.使用容器將電影資料裝起來
const movies = []
let filteredMovies = []

//step4. Render Movie List：選取html節點"#data-panel"
const dataPanel = document.querySelector('#data-panel')
//step11. search form 提交表單
const searchForm = document.querySelector('#search-form')
//step12. search bar 比對關鍵字搜尋
const searchInput = document.querySelector('#search-input')
//抓取分頁器節點
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''
  //step5. 使用迭代器forEach 並先看網頁抓取的item為何
  data.forEach((item) => {
    //需要title、image兩個資料
    //step6. 至.html擷取電影資料結構進行Render
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}
// 例如：80部電影 -> 80 / 12 = 6...8 ->共7頁（無條件進位） 
// 無條件進位：使用Math.ceol
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  //movies ? 1.movies 2.filterMovies -> 取決於user是否有搜尋電影，因此：
  //如果filter是有東西的，會回傳filterMovies，否則，回傳movies
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}



//step10.設定函式-綁定特定電影的 id 資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //response.data.results 
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

//step16. 設定函式addToFavorite 
function addToFavorite(id) {
  // step18.使用JSON.parse將localStorage.getItem將字串轉換為object或陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //step17.用迴圈抓取movies每一部電影，比對id後將陣列
  const movie = movies.find(movie => movie.id === id)

  // step19.檢查放進favoriteMovies的清單只能顯示一個電影，不能重複
  // some與find很相像：
  // 1. find回傳元入本身 
  // 2. some較單純為只是想要知道陣列是否含有元素，如有的話為true
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  //step18.將favorite所選取的電影推入清單裡
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


//step9.綁定監聽-->按下不同的電影more按鈕後，應對應不同的電影資料
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    //step16. 綁定監聽-->按下favorite按鈕,執行函式 addToFavorite
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

  renderMovieList(getMoviesByPage(page))

})

//step12.綁定監聽-->按下按鈕search提交表單
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //預防瀏覽器預設行為，將網頁控制權交由JavaScript控制行為
  const keyword = searchInput.value.trim().toLowerCase()  //toLowerCase：不管Input值為大小寫都能被比對搜尋到title ; trim() ：將字串前後的空白去掉

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert('cannot found movies with keyword : ' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1)) //直接顯示第一頁的搜尋結果 （不用特別按下分頁器第一頁才顯示）
})


//step2.axios抓取電影資料
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length) //呼叫renderPaginator
  renderMovieList(getMoviesByPage(1))
})
  .catch((err) => console.log(err))

