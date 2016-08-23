class YuanImageUpload {
  constructor(fileControl, options) {
    let previewContainerId = fileControl.getAttribute('data-preview'),
        inputControlId = fileControl.getAttribute('data-input');
        
    this.fileControl = fileControl;
    // The div output where the content will be displayed.
    this.previewContainer = document.getElementById(previewContainerId);
    this.inputControl = document.getElementById(inputControlId);
    this.options = {
      allowedExtensions: ["gif", "png", "jpg", "jpeg", "bmp"],
      removeIconUrl: "../images/del.png",
      parser: function() {} // Tell the library how to parse the Ajax response. A valid URL should be returned in this function.
    };
    this.parseOptions(options);
    this.setInputControlPredefinedValue();
    this.createPrefinedImgContainers();
    this.addEventListeners();
  }
  
  parseOptions(options) {
    if (!options) return false;
    YuanImageUpload.extend(this.options, options);
  }
  
  setInputControlPredefinedValue() {
    if (this.options.imgIds) {
      this.inputControl.value = this.options.imgIds.join(';');
    }
  }
  
  createPrefinedImgContainers() {
    if (this.options.imgURLs) {
      for (let i = 0, len = this.options.imgURLs.length; i < len; i++) {
        let fileLocalId = YuanImageUpload.generateUUID();
        this.createImgContainer(this.options.imgURLs[i], fileLocalId);
        document.getElementById(fileLocalId).setAttribute('data-imgid', this.options.imgIds[i]);
      }
    }
  }
  
  addEventListeners() {
    
    this.fileControl.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleFiles();
    }, false);
    
    this.previewContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      let target = e.target,
          targetClassList = target.classList;
      if (targetClassList.contains("removeIcon")) {
        this.handleRemoveImage(target.parentElement || target.parentNode);
      } else if (targetClassList.contains("imgContainer")) {
        this.previewImg(target.id);
      }
    });
  }
  
  addEventListener(eventName, callback) {
    // 'uploaded'
    // 'errorupload'
    this.fileControl.addEventListener(eventName, callback, false);
  }
  
  removeEventListener(eventName, callback) {
    this.fileControl.removeEventListener(eventName, callback, false);
  }
  
  trigger(eventName, customData) {
    let event = new CustomEvent(eventName, {
      detail: customData || null
    });
    this.fileControl.dispatchEvent(event);
  }
  
  // TODO
  previewImg(imgContainerId) {
    if (this.options.onPreview) {
      this.options.onPreview.call(this, imgContainerId);
    }
  }
  
  handleRemoveImage(imgContainer) {
    let imgid = imgContainer.getAttribute('data-imgid');
    imgContainer.parentNode.removeChild(imgContainer);
    
    let inputControlVal = this.inputControl.value.trim();
    if (inputControlVal) {
      let inputControlValArr = inputControlVal.split(";");
      let index = inputControlValArr.indexOf(imgid);
      if (index > -1) {
        inputControlValArr.splice(index, 1);
      }
      this.inputControl.value = inputControlValArr.join(";");
    }
  }
  
  handleFiles() {
    let files = this.fileControl.files,
        fileLength = files.length;
        
    for (let i = 0; i < fileLength; i++) {
      let file = files[i];
      let imageType = /^image\//;
      
      if (this.options.maxSizeEachFile && (file.size > this.options.maxSizeEachFile) ) {
        continue;
      }
      
      if (!imageType.test(file.type)) {
        continue;
      }
      let extension = file.name.split('.').pop();
      if ( this.options.allowedExtensions.indexOf(extension) === -1 ) {
        continue;
      }
      
      let fileLocalId = YuanImageUpload.generateUUID();
      this.createImgContainer(file, fileLocalId);
      this.sendFile(file, fileLocalId);
    }
  }
  
  createImgContainer(file, fileLocalId) {
    let container = document.createElement("div");
    container.classList.add('imgContainer');
    container.id = fileLocalId;
    
    let removeIcon = document.createElement("img");
    removeIcon.src = this.options.removeIconUrl;
    removeIcon.classList.add('removeIcon');
    
    if (typeof file === "string") {
      container.style.backgroundImage = "url(" + file + ")";
    } else {
      let reader = new FileReader();
      reader.onload = function(e) { 
        container.style.backgroundImage = "url(" + e.target.result + ")";
      };
      reader.readAsDataURL(file);
    }    
    
    container.appendChild(removeIcon);
    this.previewContainer.appendChild(container); 
  }
  
  sendFile(file, fileLocalId) {
    let xhr = new XMLHttpRequest();
    let fd = new FormData();
    
    xhr.open("POST", this.options.uploadURL, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          let responseJSON = JSON.parse(xhr.responseText);
          this.handleUploadResponse(responseJSON, fileLocalId);
          this.trigger('uploaded', {responseJSON, fileLocalId });
        } else {
          this.trigger('errorupload', { xhr, fileLocalId });
        }
      }
    };
    let fieldName = this.fileControl.getAttribute('name') || 'myFile';
    fd.append(fieldName, file);
    
    xhr.send(fd);// Initiate a multipart/form-data upload
  }
  
  handleUploadResponse(responseJSON, fileLocalId) {
    if (this.options.parser) {
      let imgId = this.options.parser.call(this, responseJSON);
      this._handleUploadSuccess(imgId, fileLocalId);
    }
  }
  
  _handleUploadSuccess(imgId, fileLocalId) {
    if (this.inputControl.value) {
      this.inputControl.value += ';' + imgId;
    } else {
      this.inputControl.value = imgId;
    }
    document.getElementById(fileLocalId).setAttribute('data-imgid', imgId);
  }
  
  static generateUUID() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  }
  
  static extend(){
    for(let i = 1; i < arguments.length; i++) {
      for(let key in arguments[i]) {
        if(arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  }
}

(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: true, cancelable: true, detail: undefined };
    if (typeof params.bubbles === "undefined") {
      params.bubbles = true;
    }
    if (typeof params.cancelable === "undefined") {
      params.cancelable = true;
    }
    var evt;
    try{
      // DOM Level 3 Events support custom event.
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    }catch(e) {
      // DOM Level 2 Events does not support custom event.
      evt = document.createEvent('Event');
      evt.initEvent(event, params.bubbles, params.cancelable);
      evt.detail = params.detail;
    }
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;  
})();