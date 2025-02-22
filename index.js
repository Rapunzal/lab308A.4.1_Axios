import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_YiAHNqSkzkNraXr9G9DyhfdK7Mxo4AFKe37TyJElvL7rx1txZPecsvqA3vIfciCl";

//Setting Default headers

axios.defaults.baseURL = "https://api.thecatapi.com/";
axios.defaults.headers.common["x-api-key"] = API_KEY;
axios.defaults.headers.post["Content-Type"] = "application/json";
/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

//5.Using Interceptors to get the time
axios.interceptors.request.use((request) => {
  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  //7.Cursor style
  document.body.style.cursor = "progress";
  return request;
});

axios.interceptors.response.use(
  (response) => {
    //7.Cursor style
    document.body.style.cursor = "default";
    response.config.metadata.endTime = new Date().getTime();
    response.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;
    throw error;
  }
);

async function initialLoad() {
  let startTime = new Date().getTime();
  const { data, durationInMS } = await axios(`/v1/breeds`);
  console.log(`Request took ${durationInMS} milliseconds.`);
  const endTime = new Date().getTime();
  console.log(endTime - startTime, " naive way of getting time");
  const breedList = data;
  //setBreedList(response.data)
  console.log("breedlist ", breedList);
  //console.log(breedSelect);
  breedList.forEach((breed) => {
    const option = document.createElement("option");
    option.innerHTML = breed.name;
    option.value = breed.id;
    breedSelect.append(option);
  });
  getBreedData();
}
initialLoad();
/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

breedSelect.addEventListener("change", getBreedData);

async function getBreedData() {
  progressBar.style.width = 0 + "%";
  Carousel.clear();
  infoDump.textContent = "";
  console.log(breedSelect.value);
  const breed_id = breedSelect.value;
  const { data, durationInMS } = await axios(
    `/v1/images/search?limit=10&breed_ids=${breed_id}&api_key=${API_KEY}`,
    {
      //6. Progress bar
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.floor(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        progressBar.style.width = percentCompleted + "%";
      },
    }
  ).catch((err) => console.err("Error occured"));
  console.log(`Request took ${durationInMS} milliseconds.`);
  if (data.length > 0) {
    carousle(data);
    let h1 = document.createElement("h1");
    let temprament = document.createElement("h3");
    let p = document.createElement("p");
    let str = data[0].breeds[0].temperament;
    str = str.split(",");
    const h4 = document.createElement("h2");
    h4.textContent = "Temperament :";
    const ul = document.createElement("ul");
    str = str.map((ele) => {
      const li = document.createElement("li");
      li.append(ele);
      ul.append(li);
    });

    temprament.textContent = str;
    h1.textContent = "Breed Name : " + data[0].breeds[0].name;
    p.textContent = data[0].breeds[0].description;
    infoDump.append(h1);
    infoDump.append(p);
    infoDump.append(h4);
    infoDump.append(ul);
  } else {
    infoDump.innerHTML = "<h1>Data does not exists</h1>";
  }
}

function carousle(data) {
  Carousel.clear();
  data.forEach((d) => {
    const x = Carousel.createCarouselItem(d.url, d.breeds[0].alt_names, d.id);
    Carousel.appendCarousel(x);
  });
  Carousel.start();
}
/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

export async function favourite(imgId) {
  //https://api.thecatapi.com/v1/favourites/favourite_id

  console.log(imgId, " image id");
  const response = await axios(`/v1/favourites`, {
    method: "get",
  });
  const getFavouritesList = await response.data;
  console.log(getFavouritesList);
  const favId = getFavouritesList
    .map((fav) => {
      if (fav.image_id === imgId) {
        console.log(fav.id);
        return fav.id;
      }
    })
    .filter((ele) => ele !== undefined);
  console.log(favId, " ===== favId");
  if (favId.length > 0) {
    favId.map(async (ele) => {
      if (ele !== undefined) {
        console.log(ele, " ele ");
        await axios(`/v1/favourites/${ele}`, {
          method: "delete",
        })
          .then((response) => {
            getFavourites();
            console.log(response, " deleting");
          })
          .catch((err) => console.error(err));
      }
    });
  } else {
    axios(`/v1/favourites`, {
      method: "post",
      data: {
        image_id: imgId,
      },
    })
      .then((res) => {
        const x = document.querySelector(".favourite-button");
        console.log(res, " posted successfully");
      })
      .catch((err) => console.error(err));
  }
}
// your code here

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

getFavouritesBtn.addEventListener("click", getFavourites);

async function getFavourites() {
  const response = await axios(`/v1/favourites?limit=10`);
  const favouriteCatList = await response.data;
  console.log(favouriteCatList, " favouriteCatList");
  carousle2(favouriteCatList);
}

function carousle2(data) {
  infoDump.textContent = "";
  Carousel.clear();
  data.forEach((d) => {
    const x = Carousel.createCarouselItem(d.image.url, d.image.id, d.image.id);
    Carousel.appendCarousel(x);
  });
  Carousel.start();
}
/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
