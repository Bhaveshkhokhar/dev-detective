const cross = document.querySelector(".cross");
const entryField = document.querySelector("#entry-field");
const profileContainer = document.querySelector("[data-profile]");
const profileImage = document.querySelector("[profile-img]");
const profileName = document.querySelector(".name");
const createdDate = document.querySelector(".date");
const username = document.querySelector(".username");
const bio = document.querySelector(".info");
const repos = document.querySelector(".repo");
const followers = document.querySelector(".followers");
const following = document.querySelector(".following");
const locationPara = document.querySelector(".location-para");
const websiteLink = document.querySelector(".link-para");
const twitter = document.querySelector(".twitter-para");
const email = document.querySelector(".email-para");
const searchBtn = document.querySelector(".search-button");
const theme = document.querySelector(".theme");
let darkMode = false;
const themeName = document.querySelector(".theme-name");
const themeIcon = document.querySelector(".theme-icon");
const download = document.querySelector(".download");

download.addEventListener("click", (e) => {
  capture(profileContainer);
});

entryField.addEventListener("input", (e) => {
  if (e.target.value) {
    cross.classList.add("active");
  } else {
    cross.classList.remove("active");
    profileContainer.classList.remove("active");
  }
});

cross.addEventListener("click", () => {
  entryField.value = "";
  cross.classList.remove("active");
  profileContainer.classList.remove("active");
});

async function renderProfileInfo(data) {
  profileImage.src = data.avatar_url;
  profileName.textContent = data.name;
  createdDate.textContent = new Date(data.created_at).toDateString();
  username.textContent = `@${data.login}`;
  bio.textContent = data.bio;
  const response = await fetch(data.repos_url);
  const data2 = await response.json();
  repos.textContent = data2.length;
  followers.textContent = data.followers;
  following.textContent = data.following;
  // locationPara.textContent = data?.location || "Not Available";
  setElement(locationPara, data.location);
  websiteLink.href = data?.blog || "Not Available";
  // websiteLink.textContent = data?.blog || "Not Available";
  setElement(websiteLink, data.blog);
  // twitter.textContent = data?.twitter_username || "Not Available";
  twitter.href = data?.twitter_username || "Not Available";
  // twitter.textContent = data.twitter_username || "Not Available";
  setElement(twitter, data.twitter_username);
  email.href = data?.email || "Not Available";
  // email.textContent = data.email || "Not Available";
  setElement(email, data.email);
}

function setElement(element, text) {
  if (text) {
    element.textContent = text;
    element.classList.add("blue-color");
  } else {
    element.textContent = "Not Available";
  }
}

async function fetchDetails(github) {
  try {
    const response = await fetch(`https://api.github.com/users/${github}`);
    const data = await response.json();
    if (data.name) {
      profileContainer.classList.add("active");
      download.classList.add("active");
      renderProfileInfo(data);
    } else {
      download.classList.remove("active");
    }
  } catch (err) {
    console.log("Error in fetching data...");
  }
}

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let githubID = entryField.value;

  if (githubID === "") return;
  else fetchDetails(githubID);
});

theme.addEventListener("click", () => {
  let body = document.body;
  if (body.classList.contains("dark")) {
    body.classList.remove("dark");
    themeName.textContent = "DARK";
    themeIcon.src = "moon-fill.svg";
    download.src = "dark-download.svg";
  } else {
    body.classList.add("dark");
    themeName.textContent = "LIGHT";
    themeIcon.src = "sun.svg";
    download.src = "light-download.svg";
  }
});

// function darkModeProperties(){
//     document.body.classlist.add("dark");
//     themeName.textContent="LIGHT";
//     themeIcon.src="sun.svg";
//     darkMode=true;
//     localStorage.setItem("dark-mode", true);  console.log("setting dark mode to false");

//     console.log("setting dark mode to true");

// }
// function lightModeProperties(){
//     document.body.classlist.remove("dark");
//     themeName.textContent="DARK";
//     themeIcon.src="moon-fill.svg";
//     darkMode = false;
//     console.log("darkmode changed to " + darkMode);

//     localStorage.setItem("dark-mode", false);
//     console.log("setting dark mode to false");
// }

// function init() {
//     //initialise dark-mode variable to false;
//     //darkMode = true -> dark mode enable karna h
//     //darMode = false -> light mode enable karna h
//     darkMode = false;

//     //HW
//   // const prefersDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

//     const value = localStorage.getItem("dark-mode");

//     if(value === null) {
//       console.log("null k andar");
//       localStorage.setItem("dark-mode", darkMode);
//       lightModeProperties();
//     }
//     else if(value == "true") {
//       console.log("truer k andar");
//       darkModeProperties();
//     }
//     else if(value == "false") {
//       console.log("false k andar");
//       lightModeProperties();
//     }
//   }

//   init();

function capture(element) {
  html2canvas(element, {
    backgroundColor: null,
    useCors: true,
  }).then(function (canvas) {
    const URL = canvas.toDataURL("image/jpeg", 1);
    const a = document.createElement("a");
    a.href = URL;
    a.download = `dev_detective_${profileName.textContent}.jpeg`;
    a.click();
  });
}
