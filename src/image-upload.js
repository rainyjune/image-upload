class YuanImageUpload {
  constructor(fileControl, options) {
    let previewContainerId = fileControl.getAttribute('data-preview'),
        inputControlId = fileControl.getAttribute('data-input');
        
    this.fileControl = fileControl;
    // The div output where the content will be displayed.
    this.previewContainer = document.getElementById(previewContainerId);
    this.inputControl = document.getElementById(inputControlId);
    this.options = {
      allowedExtensions: ["gif", "png", "jpg", "jpeg", "bmp"]
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
        this.handleRemoveImage(target.parentElement);
      } else if (targetClassList.contains("imgContainer")) {
        this.previewImg(target.id);
      }
    });
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
    removeIcon.src = "../images/del.png";
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
    
    let responseTypeAware = 'responseType' in xhr;
    xhr.open("POST", this.options.uploadURL, true);
    if (responseTypeAware) {
      xhr.responseType = 'json';
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let responseJSON = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
        this.handleUploadResponse(responseJSON, fileLocalId);// Handle response.
      }
    };
    let fieldName = this.fileControl.getAttribute('name') || 'myFile';
    fd.append(fieldName, file);
    
    xhr.send(fd);// Initiate a multipart/form-data upload
  }
  
  handleUploadResponse(responseJSON, fileLocalId) {
    if (this.options.onUploadSuccess) {
      let imgId = this.options.onUploadSuccess.call(this, responseJSON);
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
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
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