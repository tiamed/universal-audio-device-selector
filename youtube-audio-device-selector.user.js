// ==UserScript==
// @name        Youtube Audio Device Selector
// @namespace   https://github.com/DoKM/
// @match       https://www.youtube.com/watch*
// @match       https://m.youtube.com/watch*
// @homepageURL https://github.com/DoKM/youtube-volume-selector
// @grant       none
// @version     1.0
// @author      DoKM
// @license     MIT
// @description Audio Device Selector for youtube
// ==/UserScript==

(async function () {

  let dropDownBoxOld = undefined

  async function init() {
    addGlobalStyle(`/* Dropdown Button */
        .dropbtn {
          background-color: #ffffff00;
          color: white;
          padding: 10px 16px;
          font-size: 16px;
          border: none;
          cursor: pointer;
        }
        
        /* Dropdown button on hover & focus */
        .dropbtn:hover, .dropbtn:focus {
          background-color: #ffffff13;
        }
        
        /* The container <div> - needed to position the dropdown content */
        .dropdown {
          position: relative;
          display: inline-block;
        }
        
        /* Dropdown Content (Hidden by Default) */
        .dropdown-content {
          display: none;
          position: absolute;
          background-color: #212121;
          min-width: 160px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 301;
        }
        
        /* Links inside the dropdown */
        .dropdown-content div {
          color: white;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          z-index: 301;
        }
        
        /* Change color of dropdown links on hover */
        .dropdown-content div:hover {background-color: #282828}
        
        /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
        .show {display:block;}`);

    const constrains = { audio: true, video: true }

    navigator.mediaDevices.getUserMedia(constrains)

    let gotDevices = function (deviceInfos) {
      let useableDevices = []

      for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];

        if (deviceInfo.kind === 'audiooutput' && (deviceInfo.deviceId != "default" && deviceInfo.deviceId != "communications")) {

          useableDevices.push(deviceInfo)
        }
      }
      return useableDevices;
    }



    let tempDevices = await navigator.mediaDevices.enumerateDevices()
    let outputDevices = await gotDevices(tempDevices)
    
  
    //now callback will show device names and deviceId.

    const menu = createMenu()
    const v = document.getElementsByTagName("video")[0]

    createMenuOptions(menu, outputDevices, v)
  }

  function createMenuOptions(menu, outputDevices, video) {
    outputDevices.forEach(device => {
      let box = document.createElement("div")
      box.innerText = device.label
      box.addEventListener("click", () => {
        video.setSinkId(device.deviceId)
      })
      menu.appendChild(box)
    })
  }

  function createMenu() {
    if(dropDownBoxOld != undefined){
      dropDownBoxOld.remove()
    }
    const infoBox = getInfoBox()
    const dropDownBox = document.createElement("div")
    dropDownBox.classList.add("dropdown")

    const button = document.createElement("button")
    button.classList.add("dropbtn")
    button.innerText = "Audio Devices"

    const dropDown = document.createElement("div")
    dropDown.classList.add("dropdown-content")
    button.addEventListener("click", () => {
      dropDown.classList.toggle("show");
    })

    window.onclick = function (event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }

    dropDownBox.appendChild(button)
    dropDownBox.appendChild(dropDown)
    infoBox.appendChild(dropDownBox)

  
    dropDownBoxOld = dropDownBox;
    

    return dropDown;
  }

  function getInfoBox() {
    const infoElements = document.querySelectorAll("#info");
    let validInfoBox
    infoElements.forEach(element => {
      if (element.tagName == "DIV" && element.className == 'style-scope ytd-watch-flexy') {
        validInfoBox = element
      }
    })

    return validInfoBox
  }

  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }

  window.onload = () => {
    window.addEventListener("yt-navigate-finish", () => {
        setTimeout(() => {
          init();
        }, 200)})}
})();