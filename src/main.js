import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import axios from 'axios';




const form = document.querySelector("#search-form");
const gallery = document.querySelector(".gallery");
const loader = document.querySelector(".loader");
const loadMoreBtn = document.querySelector(".load-more-btn");

const key = "53317222-33ad4c1be86b2938ae2a211ff";

let per_page = 40;
let currentPage = 1;
let currentQuery = "";
let totalImageCount = 0;

async function fetchImages(searchTerm, page) {
    const BASE_URL = 'https://pixabay.com/api/';
    // https://pixabay.com/api/?key=${key}&q=${searchTerm}&image_type=photo&orientation=horizontal&safesearch=true%&per_page=${per_page}
    const params = new URLSearchParams ({
        key: `${key}`,
        q: searchTerm,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: per_page
    });

    try {
        const response = await axios.get(BASE_URL, { params });
        const data = response.data;

        if (data.hits.length === 0) {
            throw new Error("No images found");
        }

        return data;
        
    } catch (error) {
        throw error;
    }
    
}

form.addEventListener("submit", onSearch);

function onSearch(event) {
    event.preventDefault();
    currentPage = 1;

    currentQuery = event.currentTarget.elements.searchQuery.value.trim();

    if (currentQuery === "") {
        iziToast.error({
            title: 'Error',
            message: 'Please enter a search query.',
            position: 'topRight'
        });
        return;
    }

    gallery.innerHTML = "";
    loader.style.display = "block";
    
    fetchImages(currentQuery, currentPage)
    .then(data => {
        const markup = data.hits.map(createImageCardMarkup).join("");
        totalImageCount = data.totalHits;

        loadMoreBtn.style.display = "block";


        gallery.insertAdjacentHTML("beforeend", markup)
        lightbox.refresh();

        const totalImg = per_page * currentPage;
        if (totalImg >= totalImageCount) {
            loadMoreBtn.style.display = "none";
            iziToast.info({
                message: "We're sorry, but you've reached the end of search results.",
                position: 'bottomCenter'
            });
        }

    })
    .catch((error) => {

        if (error.message == "No images found") {
            iziToast.error({
                title: 'Error',
                message: "Sorry, there are no images matching your search query. Please, try again!",
                position: 'topRight'
            });
        } else {
            iziToast.error({
                title: 'Error',
                message: `An API error occurred: ${error.message}`,
                position: 'topRight'
            });
        }
    })
    .finally(() => {
        loader.style.display = "none";
    });


    event.currentTarget.reset();
}

function onLoadMore() {
    currentPage += 1;
    loader.style.display = "block";
    loadMoreBtn.style.display = "none";

    fetchImages(currentQuery, currentPage)
    .then(data => {
        const markup = data.hits.map(createImageCardMarkup).join("");
        gallery.insertAdjacentHTML("beforeend", markup)

        lightbox.refresh();

        const firstItem = document.querySelector('.gallery-item');
        if (firstItem) {
            const cardHeight = firstItem.getBoundingClientRect().height;
            window.scrollBy({
                top: cardHeight * 2,
                behavior: 'smooth',
            });
        }


        const loadedCount = per_page * currentPage;
        if (loadedCount < totalImageCount) {

            loadMoreBtn.style.display = "block";
        } else {
            loadMoreBtn.style.display = "none";
            iziToast.info({
                message: "We're sorry, but you've reached the end of search results.",
                position: 'bottomCenter'
            });
        }
    })
    .catch((error) => {
        iziToast.error({
            title: 'Error',
            message: "Failed to load more images. Please check your network connection.",
            position: 'topRight'
        });
    })
    .finally(() => {
        loader.style.display = "none";
    });
}


function createImageCardMarkup(image) {
    const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads
    } = image;

    return `
    <li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
            <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
            <div class="info-box">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
        </a>
    </li>
    `;
}

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

loadMoreBtn.addEventListener("click", onLoadMore);

