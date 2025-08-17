import axios from 'axios';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '50117384-0c3e90572e841b6f3be625418';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
let lightbox;


document.addEventListener('DOMContentLoaded', () => {
  hideLoader();
  hideLoadMore();
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  currentQuery = e.target.searchQuery.value.trim();
  if (!currentQuery) return;

  currentPage = 1;
  gallery.innerHTML = '';
  hideLoadMore();
  showLoader();

  await fetchImages();
  hideLoader();
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  showLoader();

  const prevHeight = gallery.scrollHeight;

  await fetchImages();
  hideLoader();

  const newHeight = gallery.scrollHeight;
  const scrollOffset = newHeight - prevHeight - 100; 
  window.scrollBy({
    top: scrollOffset,
    behavior: 'smooth',
  });
});

async function fetchImages() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: PER_PAGE,
      },
    });

    const hits = response.data.hits;
    totalHits = response.data.totalHits;

    if (hits.length === 0 && currentPage === 1) {
      iziToast.error({
        title: 'Oops',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    const markup = hits.map(createImageCard).join('');
    gallery.insertAdjacentHTML('beforeend', markup);

    if (lightbox) {
      lightbox.refresh();
    } else {
      lightbox = new SimpleLightbox('.gallery a');
    }

    const totalPages = Math.ceil(totalHits / PER_PAGE);
    if (currentPage >= totalPages) {
      hideLoadMore();
      iziToast.info({
        title: 'End of Results',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMore();
    }

  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

function createImageCard(image) {
  return `
    <a class="gallery-item" href="${image.largeImageURL}">
      <img src="${image.webformatURL}" alt="${image.tags}" />
      <div class="info">
        <p><b>Likes:</b> ${image.likes}</p>
        <p><b>Views:</b> ${image.views}</p>
        <p><b>Comments:</b> ${image.comments}</p>
        <p><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </a>
  `;
}

function showLoader() {
  loader.classList.remove('is-hidden');
}

function hideLoader() {
  loader.classList.add('is-hidden');
}

function showLoadMore() {
  loadMoreBtn.classList.remove('is-hidden');
}

function hideLoadMore() {
  loadMoreBtn.classList.add('is-hidden');
}