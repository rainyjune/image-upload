class YuanImageUpload {
  constructor(fileControl, options) {
    let previewContainerId = fileControl.getAttribute('data-preview'),
        inputControlId = fileControl.getAttribute('data-input');
        
    this.fileControl = fileControl;
    // The div output where the content will be displayed.
    this.previewContainer = document.getElementById(previewContainerId);
    this.inputControl = document.getElementById(inputControlId);
    
    this.parseOptions(options);
    this.addEventListeners();
  }
  
  parseOptions(options) {
    if (!options) return false;
    if (options.uploadURL) {
      this.uploadURL = options.uploadURL;
    }
    if (options.onPreview) {
      this.onPreview = options.onPreview;
    }
    if (options.onUploadSuccess) {
      this.onUploadSuccess = options.onUploadSuccess;
    }
  }
  
  addEventListeners() {
    
    this.fileControl.addEventListener('change', (e) => {
      this.handleFiles();
      e.preventDefault();
      e.stopPropagation();
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
    if (this.onPreview) {
      this.onPreview.call(this, imgContainerId);
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
    
    let reader = new FileReader();
    reader.onload = function(e) { 
      container.style.backgroundImage = "url(" + e.target.result + ")";
    };
    reader.readAsDataURL(file);
    
    container.appendChild(removeIcon);
    this.previewContainer.appendChild(container); 
  }
  
  sendFile(file, fileLocalId) {
    let xhr = new XMLHttpRequest();
    let fd = new FormData();
    
    let responseTypeAware = 'responseType' in xhr;
    xhr.open("POST", this.uploadURL, true);
    if (responseTypeAware) {
      xhr.responseType = 'json';
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let responseJSON = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
        this.handleUploadResponse(responseJSON, fileLocalId);// Handle response.
      }
    };
    fd.append('myFile', file);
    
    xhr.send(fd);// Initiate a multipart/form-data upload
  }
  
  handleUploadResponse(responseJSON, fileLocalId) {
    if (this.onUploadSuccess) {
      let imgId = this.onUploadSuccess.call(this, responseJSON);
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
}