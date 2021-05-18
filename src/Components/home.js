const os = require('os');
const path = require('path');
const { Drives } = require('./drives.js');
const Favorites = require('./favorites.js');
const changeContent = require("../Functions/DOM/changeContent");
const updateTheme = require('../Functions/Theme/updateTheme');
const { getFilesAndDir } = require('../Functions/Files/get');
const hideFiles = require('../Functions/Filter/hideFiles.js');
const OptionMenu = require("../Functions/DOM/optionMenu");
const Translate = require('../Components/multilingual');
const nativeDrag = require('../Functions/DOM/drag.js');
const getPreview = require('../Functions/preview/preview.js');
const { listenOpen } = require('../Functions/Files/open');

// Home files for linux
const homeFiles = (callback) => {
    getFilesAndDir(os.homedir(), async files => {
        let result = `<section class='home-section'><h1 class="section-title">Files</h1>`;
        for (const file of files) {
            const preview = await getPreview(path.join(os.homedir(), file.filename), category = file.isDir ? "folder" : "file")
            result += `<div class="file-grid" draggable="true" data-isdir=${file.isDir} data-path = ${path.join(os.homedir(), file.filename)}>
            ${preview}
            <span class="file-grid-filename" id="file-filename">${file.filename}</span>
            </div>`
        }
        Translate(result + "</section>", navigator.language, translated => callback(translated))
    })
}
// Content for home page
const Home = () => {
    // Create a new main element
    const newMainElement = document.createElement("div");

    let previousDrive; // Previous drive tags (used to detect USB Drive changes)
    let globalFavorites; // Global variable to store favorites
    let globalDrives; // Global variable to store drives

    // Hide files shorcut
    const hideFilesShortcut = e => {
        if (e.ctrlKey && e.key === "h") {
            hideFiles(os.homedir(), () => {
                homeFiles(files => {
                    // Add home files into home page
                    newMainElement.innerHTML = globalFavorites + globalDrives + files
                    changeContent(newMainElement)
                    updateTheme() // Update the theme
                    nativeDrag(document.querySelectorAll('.file-grid'), os.homedir()) // Listen to native drag
                    listenOpen(document.querySelectorAll(".file-grid")) // Listen to open the file
                })
            })
        }
    }
    OptionMenu(process.platform === "win32", os.homedir(), response => {
        if (response.type === "hide") {
            hideFiles(os.homedir(), () => {
                homeFiles(files => {
                    // Add home files into home page
                    newMainElement.innerHTML = globalFavorites + globalDrives + files
                    changeContent(newMainElement)
                    updateTheme() // Update the theme
                    nativeDrag(document.querySelectorAll('.file-grid'), os.homedir()) // Listen to native drag
                    listenOpen(document.querySelectorAll(".file-grid")) // Listen to open the file
                })
            })
        }
    })

    Drives(drives => {
        globalDrives = drives // Save drives into global variable
        Favorites(favorites => {
            globalFavorites = favorites; // Save favorites into global variable
            if (process.platform === "linux") {
                homeFiles(files => {
                    // Update the content in the main page ...
                    newMainElement.innerHTML = favorites + drives + files
                    changeContent(newMainElement)
                    // And also the theme :)
                    updateTheme()
                    document.addEventListener("keyup", hideFilesShortcut, false)
                    nativeDrag(document.querySelectorAll('.file-grid'), os.homedir()) // Listen to native drag
                    listenOpen(document.querySelectorAll(".file-grid")) // Listen to open the file
                })
            }
            else {
                // Update the content in the main page ...
                newMainElement.innerHTML = favorites + drives
                changeContent(newMainElement)
                // And also the theme :)
                updateTheme()
            }
        })
    })
}

module.exports = Home