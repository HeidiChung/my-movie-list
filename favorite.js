//step1.宣告變數
const BASE_URL = 'https://webdev.alphacamp.io' //伺服器主機網址
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/' //電影圖片

//step3.使用容器將電影資料裝起來
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))//收藏清單

//step4. Render Movie List：選取html節點"#data-panel"
const dataPanel = document.querySelector('#data-panel')

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
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
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

//step9.綁定監聽--->至原本index.js複製原本：function addToFavorite(id) 
function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //優化：點選刪除網頁不需按下重新整理，即可刷新畫面
  renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    //step16. 綁定監聽-->按下favorite按鈕,執行函式 addToFavorite
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
